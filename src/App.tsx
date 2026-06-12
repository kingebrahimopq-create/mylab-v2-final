/**
 * Main Application Component
 * مكون التطبيق الرئيسي
 */

import { useEffect, useState } from 'react';
import { Routes, Route, Navigate } from 'react-router';
import { AuthService } from './services/auth.service';
import { GoogleAuthButton } from './components/GoogleAuthButton';
import { GoogleAuthCallback } from './pages/GoogleAuthCallback';
import { OwnerSettings } from './components/OwnerSettings';
import './App.css';

function LoginPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-600 to-blue-800 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-2xl p-8 max-w-md w-full">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">MyLab V2</h1>
          <p className="text-gray-600">منصة معملية حديثة</p>
        </div>

        <div className="space-y-4">
          <GoogleAuthButton />

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-300"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-white text-gray-500">أو</span>
            </div>
          </div>

          <form className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                البريد الإلكتروني
              </label>
              <input
                type="email"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent"
                placeholder="example@example.com"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                كلمة المرور
              </label>
              <input
                type="password"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent"
                placeholder="••••••••"
              />
            </div>
            <button
              type="submit"
              className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-semibold transition"
            >
              تسجيل الدخول
            </button>
          </form>
        </div>

        <p className="text-center text-sm text-gray-600 mt-6">
          ليس لديك حساب؟{' '}
          <a href="#" className="text-blue-600 hover:underline font-semibold">
            إنشاء حساب
          </a>
        </p>
      </div>
    </div>
  );
}

function Dashboard() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Load user data if token exists
    const token = AuthService.getAccessToken();
    if (token) {
      // TODO: Fetch user data from API
      setLoading(false);
    } else {
      setLoading(false);
    }
  }, []);

  const handleLogout = () => {
    AuthService.logout();
    window.location.href = '/';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">جاري التحميل...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Navigation Bar */}
      <nav className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <h1 className="text-2xl font-bold text-blue-600">MyLab V2</h1>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-gray-700">مرحباً، {user?.fullName || 'مستخدم'}</span>
              <button
                onClick={handleLogout}
                className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition"
              >
                تسجيل الخروج
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Welcome Card */}
          <div className="md:col-span-2 bg-white rounded-lg shadow p-6">
            <h2 className="text-2xl font-bold mb-4">مرحباً في MyLab V2</h2>
            <p className="text-gray-600 mb-4">
              منصة معملية متكاملة توفر حلولاً حديثة للتعليم والتدريب
            </p>
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-blue-50 p-4 rounded">
                <h3 className="font-semibold text-blue-900 mb-2">📚 المختبرات</h3>
                <p className="text-sm text-blue-700">إنشاء وإدارة المختبرات</p>
              </div>
              <div className="bg-green-50 p-4 rounded">
                <h3 className="font-semibold text-green-900 mb-2">👥 الفريق</h3>
                <p className="text-sm text-green-700">إدارة أعضاء الفريق</p>
              </div>
              <div className="bg-purple-50 p-4 rounded">
                <h3 className="font-semibold text-purple-900 mb-2">📁 Google Drive</h3>
                <p className="text-sm text-purple-700">تكامل Google Drive</p>
              </div>
              <div className="bg-yellow-50 p-4 rounded">
                <h3 className="font-semibold text-yellow-900 mb-2">🔐 الأمان</h3>
                <p className="text-sm text-yellow-700">مصادقة آمنة وموثوقة</p>
              </div>
            </div>
          </div>

          {/* Quick Stats */}
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-bold mb-4">الإحصائيات</h3>
            <div className="space-y-4">
              <div>
                <p className="text-gray-600 text-sm">المختبرات</p>
                <p className="text-3xl font-bold text-blue-600">0</p>
              </div>
              <div>
                <p className="text-gray-600 text-sm">أعضاء الفريق</p>
                <p className="text-3xl font-bold text-green-600">0</p>
              </div>
              <div>
                <p className="text-gray-600 text-sm">المشاركات</p>
                <p className="text-3xl font-bold text-purple-600">0</p>
              </div>
            </div>
          </div>
        </div>

        {/* Owner Settings */}
        <div className="mt-6">
          <OwnerSettings />
        </div>
      </div>
    </div>
  );
}

export default function App() {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);

  useEffect(() => {
    // Check if user is authenticated
    const token = AuthService.getAccessToken();
    const isExpired = AuthService.isTokenExpired();

    if (token && !isExpired) {
      setIsAuthenticated(true);
    } else {
      setIsAuthenticated(false);
      AuthService.logout();
    }
  }, []);

  if (isAuthenticated === null) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <Routes>
      <Route path="/" element={isAuthenticated ? <Navigate to="/dashboard" /> : <LoginPage />} />
      <Route path="/dashboard" element={isAuthenticated ? <Dashboard /> : <Navigate to="/" />} />
      <Route path="/auth/google/callback" element={<GoogleAuthCallback />} />
      <Route path="*" element={<Navigate to="/" />} />
    </Routes>
  );
}
