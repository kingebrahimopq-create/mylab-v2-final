# ⚙️ دليل الإعداد السريع

## 🎯 الهدف

إعداد منصة MyLab V2 Final بسهولة في 5 دقائق.

---

## ✅ المرحلة 1: التثبيت (2 دقيقة)

```bash
# 1. استنسخ المستودع
git clone https://github.com/kingebrahimopq-create/mylab-v2-final.git
cd mylab-v2-final

# 2. ثبّت الحزم
npm install

# 3. أنشئ ملف البيئة
cp .env.example .env
```

---

## ✅ المرحلة 2: Google OAuth (2 دقيقة)

### الخطوات:

1. اذهب إلى: https://console.cloud.google.com
2. أنشئ مشروع جديد
3. فعّل: Google+ API, Google Drive API
4. أنشئ OAuth 2.0 Credentials
5. أضف:
   ```
   Authorized JavaScript origins:
   - http://localhost:3000
   - http://localhost:3001
   
   Authorized redirect URIs:
   - http://localhost:3001/api/auth/google/callback
   ```
6. انسخ Client ID و Secret

### أضفها إلى `.env`:

```env
GOOGLE_CLIENT_ID=your_id
GOOGLE_CLIENT_SECRET=your_secret
```

---

## ✅ المرحلة 3: قاعدة البيانات (1 دقيقة)

### خيار أ: استخدام Docker (الأسهل)

```bash
docker-compose up -d
```

### خيار ب: MySQL محلي

```bash
mysql -u root -p
```

```sql
CREATE DATABASE mylab_v2;
CREATE USER 'mylab_user'@'localhost' IDENTIFIED BY 'mylab_password';
GRANT ALL PRIVILEGES ON mylab_v2.* TO 'mylab_user'@'localhost';
EXIT;
```

### تطبيق المهاجرة:

```bash
npm run db:push
```

---

## ✅ المرحلة 4: التشغيل (الآن!)

```bash
npm run dev
```

### الوصول:

- **Frontend**: http://localhost:3000
- **Backend**: http://localhost:3001
- **Health**: http://localhost:3001/health

---

## 🎉 تم!

تطبيقك جاهز الآن! 

### اختبر:

1. افتح http://localhost:3000
2. اضغط "تسجيل الدخول عبر Google"
3. أكمل عملية التسجيل

---

## 📝 ملاحظات مهمة

```env
# اجعل هذه الأساسية دائماً:
ADMIN_EMAIL=mhm763517@gmail.com
JWT_SECRET=your_strong_secret_key_change_this
NODE_ENV=development
```

---

## 🆘 مشاكل شائعة

### "Cannot find module 'googleapis'"
```bash
npm install googleapis
```

### "Connection refused to database"
```bash
# تأكد من تشغيل MySQL أو Docker
docker-compose up -d
```

### "Port 3000 already in use"
```bash
PORT=3002 npm run dev
```

---

## 📚 الخطوات التالية

1. ✅ اقرأ [README.md](./README.md)
2. ✅ اقرأ [BUILD_GUIDE.md](./BUILD_GUIDE.md)
3. ✅ استكشف [الكود المصدري](./src)
4. ✅ اختبر [API Endpoints](http://localhost:3001/api)

---

**استمتع بالتطوير! 🚀**
