import Database from 'better-sqlite3';
import { drizzle } from 'drizzle-orm/better-sqlite3';
import * as schema from './schema';
import fs from 'fs';
import path from 'path';

// Create a persistent SQLite database (ephemeral in Cloud Run unless mounted, but fine for AI Studio prototype)
const sqlite = new Database('mylab.sqlite');

// Step 1 Requirement: تفعيل خاصية WAL Mode
sqlite.pragma('journal_mode = WAL');
sqlite.pragma('synchronous = NORMAL');

// DDL for initialization (simplifies starting up without running push manually)
sqlite.exec(`
  CREATE TABLE IF NOT EXISTS patients (
    id TEXT PRIMARY KEY,
    national_id TEXT NOT NULL,
    full_name_encrypted TEXT NOT NULL,
    date_of_birth TEXT NOT NULL,
    gender TEXT NOT NULL,
    phone_number_encrypted TEXT,
    version INTEGER NOT NULL DEFAULT 1,
    updated_at INTEGER NOT NULL
  );

  CREATE TABLE IF NOT EXISTS samples (
    id TEXT PRIMARY KEY,
    patient_id TEXT NOT NULL,
    barcode_gs1 TEXT NOT NULL,
    sample_type TEXT NOT NULL,
    status TEXT NOT NULL,
    collected_at INTEGER NOT NULL,
    version INTEGER NOT NULL DEFAULT 1,
    updated_at INTEGER NOT NULL,
    FOREIGN KEY(patient_id) REFERENCES patients(id)
  );

  CREATE TABLE IF NOT EXISTS test_results (
    id TEXT PRIMARY KEY,
    sample_id TEXT NOT NULL,
    test_name TEXT NOT NULL,
    result_value TEXT,
    reference_range TEXT,
    unit TEXT,
    status TEXT NOT NULL,
    result_sha256_hash TEXT,
    verified_at INTEGER,
    version INTEGER NOT NULL DEFAULT 1,
    updated_at INTEGER NOT NULL,
    FOREIGN KEY(sample_id) REFERENCES samples(id)
  );

  CREATE TABLE IF NOT EXISTS sample_logs (
    id TEXT PRIMARY KEY,
    sample_id TEXT NOT NULL,
    status TEXT NOT NULL,
    status_label_text TEXT NOT NULL,
    timestamp INTEGER NOT NULL,
    assigned_operator TEXT NOT NULL,
    FOREIGN KEY(sample_id) REFERENCES samples(id)
  );

  CREATE TABLE IF NOT EXISTS notification_logs (
    id TEXT PRIMARY KEY,
    sample_id TEXT NOT NULL,
    recipient TEXT NOT NULL,
    message TEXT NOT NULL,
    status TEXT NOT NULL,
    attempts INTEGER NOT NULL,
    timestamp INTEGER NOT NULL,
    FOREIGN KEY(sample_id) REFERENCES samples(id)
  );

  CREATE TABLE IF NOT EXISTS clinician_users (
    email TEXT PRIMARY KEY,
    full_name TEXT NOT NULL,
    role TEXT NOT NULL,
    status TEXT NOT NULL,
    created_at INTEGER NOT NULL
  );

  CREATE TABLE IF NOT EXISTS keep_notes (
    id TEXT PRIMARY KEY,
    clinician_email TEXT NOT NULL,
    title TEXT NOT NULL,
    content TEXT NOT NULL,
    note_type TEXT NOT NULL DEFAULT 'text',
    created_at INTEGER NOT NULL
  );

  INSERT OR IGNORE INTO clinician_users (email, full_name, role, status, created_at)
  VALUES ('mhm763517@gmail.com', 'mhm763517 (متحكم ومالك المشروع)', 'owner', 'approved', 1700000000000);

  -- Seed some default templates/notes for MyLab clinicians
  INSERT OR IGNORE INTO keep_notes (id, clinician_email, title, content, note_type, created_at)
  VALUES (
    'keep-note-1',
    'mhm763517@gmail.com',
    'مصل عينات السكر وإجراءات المعايرة 🧪',
    '1. تشغيل المحلل الكيميائي ومعايرة الحزم الكهرومغناطيسية.\n2. سحب العينة الأساسية والتحقق من رقم الهوية الوطني للمريض.\n3. رصد النتائج ومقارنتها مع مستويات الإنذار الحرجة بمجال (70-110 mg/dL).\n4. توقيع النتيجة رقمياً وإسناد الهاش SHA-256 للمصادقة.',
    'text',
    1700000000000
  );

  INSERT OR IGNORE INTO keep_notes (id, clinician_email, title, content, note_type, created_at)
  VALUES (
    'keep-note-2',
    'mhm763517@gmail.com',
    'قائمة فحص السلامة والبيانات الحساسة 🔐',
    '[{"text":"التحقق من تعمية الأسماء لغير المصرح لهم","checked":true},{"text":"مطابقة الباركود الثنائي GS1 مع نظام الدفتر المالي","checked":true},{"text":"تأمين خادم قاعدة البيانات وتفعيل وضع WAL للمستودع","checked":false}]',
    'list',
    1700000002000
  );
`);

export const db = drizzle(sqlite, { schema });
