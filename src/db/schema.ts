import { sqliteTable, text, integer } from 'drizzle-orm/sqlite-core';

export const patients = sqliteTable('patients', {
  id: text('id').primaryKey(),
  nationalId: text('national_id').notNull(),
  fullNameEncrypted: text('full_name_encrypted').notNull(),
  dateOfBirth: text('date_of_birth').notNull(),
  gender: text('gender').notNull(),
  phoneNumberEncrypted: text('phone_number_encrypted'),
  // Vector clock / Sync concept
  version: integer('version').default(1).notNull(),
  updatedAt: integer('updated_at').notNull(), // stored as unix timestamp ms
});

export const samples = sqliteTable('samples', {
  id: text('id').primaryKey(),
  patientId: text('patient_id').references(() => patients.id).notNull(),
  barcodeGs1: text('barcode_gs1').notNull(),
  sampleType: text('sample_type').notNull(), // e.g. blood, urine
  status: text('status').notNull(), // registered, received, processing, completed
  collectedAt: integer('collected_at').notNull(),
  version: integer('version').default(1).notNull(),
  updatedAt: integer('updated_at').notNull(),
});

export const testResults = sqliteTable('test_results', {
  id: text('id').primaryKey(),
  sampleId: text('sample_id').references(() => samples.id).notNull(),
  testName: text('test_name').notNull(),
  resultValue: text('result_value'),
  referenceRange: text('reference_range'),
  unit: text('unit'),
  status: text('status').notNull(), // pending, verified
  resultSha256Hash: text('result_sha256_hash'), // Security fingerprint
  verifiedAt: integer('verified_at'),
  version: integer('version').default(1).notNull(),
  updatedAt: integer('updated_at').notNull(),
});

export const sampleLogs = sqliteTable('sample_logs', {
  id: text('id').primaryKey(),
  sampleId: text('sample_id').references(() => samples.id).notNull(),
  status: text('status').notNull(),
  statusLabelText: text('status_label_text').notNull(),
  timestamp: integer('timestamp').notNull(),
  assignedOperator: text('assigned_operator').notNull(),
});

export const notificationLogs = sqliteTable('notification_logs', {
  id: text('id').primaryKey(),
  sampleId: text('sample_id').references(() => samples.id).notNull(),
  recipient: text('recipient').notNull(),
  message: text('message').notNull(),
  status: text('status').notNull(),
  attempts: integer('attempts').notNull(),
  timestamp: integer('timestamp').notNull(),
});

export const clinicianUsers = sqliteTable('clinician_users', {
  email: text('email').primaryKey(),
  fullName: text('full_name').notNull(),
  role: text('role').notNull(), // 'owner', 'doctor', 'accountant'
  status: text('status').notNull(), // 'approved', 'pending', 'rejected'
  createdAt: integer('created_at').notNull(),
});

export const keepNotes = sqliteTable('keep_notes', {
  id: text('id').primaryKey(),
  clinicianEmail: text('clinician_email').notNull(),
  title: text('title').notNull(),
  content: text('content').notNull(), // stores Note's raw body text or a JSON string of checklist items
  noteType: text('note_type').default('text').notNull(), // 'text' or 'list'
  createdAt: integer('created_at').notNull(),
});



