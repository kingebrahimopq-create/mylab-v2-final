/**
 * Server Boot File
 * ملف بدء تشغيل الخادم
 */

import 'dotenv/config';
import { Hono } from 'hono';
import { serveStatic } from '@hono/node-server/serve-static';
import { serve } from '@hono/node-server';
import { cors } from 'hono/cors';
import { logger } from './utils/logger';
import { initializeDatabase } from './db';
import { PermissionService } from './services/permission.service';
import authRoutes from './routes/auth.routes';

const app = new Hono();

// ==================== MIDDLEWARE ====================

// CORS Configuration
app.use(
  cors({
    origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
    credentials: true,
  }),
);

// Request Logging
app.use(async (c, next) => {
  const start = Date.now();
  await next();
  const end = Date.now();
  logger.info(`${c.req.method} ${c.req.path} - ${end - start}ms`);
});

// ==================== ROUTES ====================

// Health Check
app.get('/health', (c) => {
  return c.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV,
  });
});

// API Routes
app.route('/api/auth', authRoutes);

// Root API
app.get('/api', (c) => {
  return c.json({
    name: 'MyLab V2 Final API',
    version: '1.0.0',
    description: 'منصة معملية حديثة مبنية بـ TypeScript',
    endpoints: {
      auth: '/api/auth',
      health: '/health',
    },
  });
});

// Serve static files
app.use('/*', serveStatic({ root: './dist' }));

// 404 Handler
app.notFound((c) => {
  return c.json(
    {
      success: false,
      error: 'Not Found',
      message: `Endpoint ${c.req.path} not found`,
    },
    404,
  );
});

// ==================== ERROR HANDLING ====================

app.onError((err, c) => {
  logger.error('Unhandled error', err);
  return c.json(
    {
      success: false,
      error: 'Internal Server Error',
      message: process.env.NODE_ENV === 'development' ? err.message : 'An error occurred',
    },
    500,
  );
});

// ==================== INITIALIZATION ====================

async function startServer() {
  try {
    // Initialize Database
    logger.info('Initializing database...');
    await initializeDatabase();
    logger.info('✅ Database initialized');

    // Initialize Permissions
    logger.info('Initializing permissions...');
    await PermissionService.initializeDefaultPermissions();
    logger.info('✅ Permissions initialized');

    // Start Server
    const port = parseInt(process.env.PORT || '3001', 10);
    const nodeEnv = process.env.NODE_ENV || 'development';

    logger.info(`🚀 Starting server in ${nodeEnv} mode on port ${port}...`);

    serve(
      {
        fetch: app.fetch,
        port,
      },
      (info) => {
        logger.info(`✅ Server running at http://localhost:${port}`);
        logger.info(`📝 API Documentation: http://localhost:${port}/api`);
        logger.info(`🏥 Health Check: http://localhost:${port}/health`);
      },
    );
  } catch (error) {
    logger.error('Failed to start server', error);
    process.exit(1);
  }
}

// Handle graceful shutdown
process.on('SIGTERM', () => {
  logger.info('SIGTERM received, shutting down gracefully...');
  process.exit(0);
});

process.on('SIGINT', () => {
  logger.info('SIGINT received, shutting down gracefully...');
  process.exit(0);
});

startServer();
