# 🚀 دليل البناء والتطوير

## المتطلبات

- **Node.js**: `>=18.0.0`
- **npm**: `>=9.0.0`
- **MySQL**: `>=5.7`
- **Google Account**: لـ OAuth و Drive

---

## 1️⃣ الخطوة الأولى: الإعداد الأساسي

### أ) استنساخ المستودع

```bash
git clone https://github.com/kingebrahimopq-create/mylab-v2-final.git
cd mylab-v2-final
```

### ب) تثبيت الحزم

```bash
npm install
```

### ج) إعداد متغيرات البيئة

```bash
cp .env.example .env
```

ثم عدّل ملف `.env` بالقيم المناسبة.

---

## 2️⃣ إعداد Google OAuth

### أ) الذهاب إلى Google Cloud Console

1. انتقل إلى: https://console.cloud.google.com
2. سجّل الدخول بحسابك على Google

### ب) إنشاء مشروع جديد

```
1. اضغط على "Select a Project"
2. اضغط على "NEW PROJECT"
3. أدخل اسم المشروع: "MyLab V2 Final"
4. اضغط "CREATE"
```

### ج) تفعيل APIs

```
1. في صفحة البحث، ابحث عن "Google+ API" وفعّلها
2. ابحث عن "Google Drive API" وفعّلها
3. ابحث عن "Google People API" وفعّلها
```

### د) إنشاء بيانات الاعتماد

```
1. انتقل إلى "Credentials" في الشريط الجانبي
2. اضغط "+ CREATE CREDENTIALS"
3. اختر "OAuth client ID"
4. اختر "Web application"
5. أضف URLs:
   - Authorized JavaScript origins:
     * http://localhost:3000
     * http://localhost:3001
     * https://yourdomain.com (للإنتاج)
   
   - Authorized redirect URIs:
     * http://localhost:3001/api/auth/google/callback
     * https://yourdomain.com/api/auth/google/callback (للإنتاج)
6. اضغط "CREATE"
7. انسخ Client ID و Client Secret
```

### هـ) إضافة البيانات إلى `.env`

```env
GOOGLE_CLIENT_ID=your_client_id_here
GOOGLE_CLIENT_SECRET=your_client_secret_here
GOOGLE_REDIRECT_URI=http://localhost:3001/api/auth/google/callback
```

---

## 3️⃣ إعداد Google Drive

### أ) إنشاء مجلد مشترك

```
1. افتح Google Drive: https://drive.google.com
2. أنشئ مجلد جديد باسم "MyLab"
3. انقر بزر الفأرة الأيمن > "Share"
4. شارك مع: mhm763517@gmail.com
5. امنح صلاحيات: "Editor"
```

### ب) الحصول على معرّف المجلد

```
1. افتح المجلد
2. انسخ الـ URL من عنوان المتصفح
3. المعرّف يكون بعد: /folders/
مثال: https://drive.google.com/drive/folders/[FOLDER_ID]
```

### ج) إضافة المعرّف إلى `.env`

```env
GOOGLE_DRIVE_FOLDER_ID=your_folder_id_here
```

---

## 4️⃣ إعداد قاعدة البيانات

### أ) تثبيت MySQL (اختياري إذا لم يكن مثبتاً)

**على Windows:**
```bash
choco install mysql
```

**على macOS:**
```bash
brew install mysql
```

**على Linux:**
```bash
sudo apt-get install mysql-server
```

### ب) إنشاء قاعدة البيانات

```bash
mysql -u root -p
```

ثم في MySQL Shell:
```sql
CREATE DATABASE mylab_v2;
CREATE USER 'mylab_user'@'localhost' IDENTIFIED BY 'mylab_password';
GRANT ALL PRIVILEGES ON mylab_v2.* TO 'mylab_user'@'localhost';
FLUSH PRIVILEGES;
EXIT;
```

### ج) تحديث `.env` بـ بيانات قاعدة البيانات

```env
DATABASE_URL=mysql://mylab_user:mylab_password@localhost:3306/mylab_v2
```

### د) تطبيق المهاجرة

```bash
# توليد المهاجرة
npm run db:generate

# تنفيذ المهاجرة
npm run db:migrate

# أو دفع المخطط مباشرة
npm run db:push
```

---

## 5️⃣ استخدام Docker (اختياري)

```bash
# بناء وتشغيل مع Docker Compose
docker-compose up -d

# سيتم تشغيل:
# - MySQL: localhost:3306
# - phpMyAdmin: localhost:8080
```

---

## 6️⃣ تشغيل التطبيق

### تشغيل في وضع التطوير

```bash
# تشغيل Frontend و Backend معاً
npm run dev

# أو تشغيل كل واحد في نافذة منفصلة:

# Terminal 1 - Frontend
npm run dev

# Terminal 2 - Backend
node api/boot.ts
```

### الوصول للتطبيق

```
Frontend: http://localhost:3000
Backend:  http://localhost:3001
API Docs: http://localhost:3001/api
Health:   http://localhost:3001/health
```

---

## 7️⃣ بناء للإنتاج

```bash
# البناء
npm run build

# التحقق من عدم وجود أخطاء
npm run check

# تشغيل الاختبارات
npm run test

# عرض المعاين
npm run preview
```

---

## 8️⃣ النشر في الإنتاج

### أ) نشر مع Docker

```bash
# بناء الصورة
docker build -t mylab-v2-final .

# تشغيل الحاوية
docker run -d \
  --name mylab \
  -p 3001:3001 \
  -e NODE_ENV=production \
  -e DATABASE_URL=mysql://user:pass@db:3306/mylab_v2 \
  -e GOOGLE_CLIENT_ID=... \
  -e GOOGLE_CLIENT_SECRET=... \
  mylab-v2-final
```

### ب) نشر على Vercel (Frontend)

```bash
# 1. ادفع المشروع إلى GitHub
git push origin main

# 2. انتقل إلى vercel.com
# 3. اضغط "New Project"
# 4. اختر المستودع
# 5. أضف متغيرات البيئة
# 6. اضغط "Deploy"
```

### ج) نشر على Heroku (Backend)

```bash
# 1. ثبّت Heroku CLI
# 2. سجّل الدخول
heroku login

# 3. أنشئ تطبيق
heroku create mylab-v2-api

# 4. أضف متغيرات البيئة
heroku config:set NODE_ENV=production
heroku config:set DATABASE_URL=...
heroku config:set GOOGLE_CLIENT_ID=...

# 5. ادفع الكود
git push heroku main
```

---

## 9️⃣ استكشاف الأخطاء

### المشكلة: `ECONNREFUSED` لقاعدة البيانات

```
الحل:
1. تأكد من تشغيل MySQL
2. تحقق من بيانات اتصال قاعدة البيانات في .env
3. تأكد من وجود قاعدة البيانات
```

### المشكلة: خطأ Google OAuth

```
الحل:
1. تحقق من Client ID و Secret في Google Cloud Console
2. تأكد من إضافة Redirect URI الصحيح
3. تحقق من تفعيل Google+ API
```

### المشكلة: المنفذ مشغول

```bash
# العثور على العملية المستخدمة للمنفذ
lsof -i :3001

# قتل العملية
kill -9 <PID>

# أو استخدام منفذ مختلف
PORT=3002 npm run dev
```

---

## 🔟 أوامر مفيدة

```bash
# فحص الأنواع
npm run check

# فحص الكود
npm run lint

# إصلاح مشاكل الكود
npm run lint:fix

# تنسيق الكود
npm run format

# تشغيل الاختبارات
npm run test

# عرض Drizzle Studio
npm run db:studio

# بناء المشروع
npm run build

# تشغيل الخادم
npm start
```

---

## 📚 موارد إضافية

- [React Documentation](https://react.dev)
- [TypeScript Documentation](https://www.typescriptlang.org)
- [Hono Documentation](https://hono.dev)
- [Drizzle ORM](https://orm.drizzle.team)
- [Tailwind CSS](https://tailwindcss.com)
- [Google OAuth Documentation](https://developers.google.com/identity/protocols/oauth2)
- [Google Drive API](https://developers.google.com/drive/api)

---

## ✅ قائمة التحقق قبل النشر

- [ ] تثبيت جميع الحزم: `npm install`
- [ ] إعداد `.env` بجميع المتغيرات المطلوبة
- [ ] إعداد Google OAuth
- [ ] إعداد Google Drive
- [ ] إعداد قاعدة البيانات
- [ ] تطبيق المهاجرة: `npm run db:push`
- [ ] اختبار المشروع: `npm run test`
- [ ] فحص الأنواع: `npm run check`
- [ ] البناء: `npm run build`
- [ ] المراجعة النهائية

---

## 📞 الدعم

إذا واجهت أي مشاكل، يرجى:

1. فحص [GitHub Issues](https://github.com/kingebrahimopq-create/mylab-v2-final/issues)
2. قراءة [README.md](./README.md)
3. فتح Issue جديد مع وصف المشكلة

---

**آخر تحديث**: 2026-06-12
