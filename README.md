# CampuSupport - Kampüs Destek & Ticket Yönetim Sistemi

## 📋 Proje Açıklaması

**CampuSupport**, kampüs içinde yaşanan sorunları (Wi-Fi kopması, LMS erişim sorunları, yapı onarımları vb.) yönetmek için geliştirilmiş kapsamlı bir **Ticket Yönetim Sistemi**'dir.

### Bölüm 1 - Temel Özellikler
- ✅ Kullanıcı kaydı ve girişi
- ✅ Ticket oluşturma, listeleme, güncelleme
- ✅ Rol tabanlı erişim kontrolü (Student, Support, Department, Admin)
- ✅ Yorum sistemi (Comment Thread)
- ✅ Departman yönetimi
- ✅ Basit filtreleme ve sıralama

### Bölüm 2 - AI & API Entegrasyonu
- 🤖 **AI Destekli Kategori/Öncelik Önerisi** - OpenAI API ile otomatik sınıflandırma
- 📧 **Harici Bildirim API'leri** - Email, Slack entegrasyonu
- 🔄 **GitHub Workflow** - main, dev, feature branch'ları
- 🚀 **CI Pipeline** - GitHub Actions ile otomatik test
- 📊 **Logging Sistemi** - Tüm işlemlerin kaydedilmesi
- 📈 **Departman Analitikleri** - İstatistikler ve raporlar

---

## 🚀 Hızlı Başlangıç

### Gereksinimler
- **Node.js** 16.x veya üzeri
- **npm** 8.x veya üzeri
- **Git** (opsiyonel, version control için)

### Kurulum

1. **Projeyi klonla veya indir**
```bash
git clone https://github.com/yourusername/CampuSupport.git
cd CampuSupport
```

2. **Bağımlılıkları yükle**
```bash
npm install
```

3. **.env dosyası oluştur**
```bash
cp .env.example .env
```

4. **.env dosyasını düzenle** (API anahtarlarını ekle)
```
PORT=3000
NODE_ENV=development
OPENAI_API_KEY=your_openai_key_here
EMAIL_USER=your_email@gmail.com
EMAIL_PASSWORD=your_password
```

5. **Sunucuyu başlat**
```bash
npm start
```

Sunucu `http://localhost:3000` adresinde çalışacaktır.

---

## 📝 Çalıştırma Komutları

### Temel Komutlar

```bash
# Sunucuyu başlat (Production)
npm start

# Sunucuyu başlat (Development)
npm run dev

# Testleri çalıştır
npm test

# Unit testleri çalıştır
npm run test:unit

# Integration testleri çalıştır
npm run test:integration

# Kodu lint'le
npm run lint

# Linting hatalarını otomatik düzelt
npm run lint:fix
```

### Veritabanı

Veritabanı otomatik olarak `database.db` dosyasında oluşturulur. İlk çalıştırmada tablolar otomatik olarak oluşturulacaktır.

**Veritabanını sıfırlamak için:**
```bash
rm database.db
npm start
```

### Loglar

Tüm işlemler `./logs/app.log` dosyasına kaydedilir:
```bash
# Logları gerçek zamanda izle
tail -f logs/app.log

# Son 50 satırı göster
tail -50 logs/app.log

# Belirli bir kelimeyi ara
grep "error" logs/app.log
```

---

##Proje Yapısı

```
CampuSupport/
├── server.js                 # Ana sunucu dosyası
├── package.json              # Bağımlılıklar
├── .env.example              # Ortam değişkenleri şablonu
├── .gitignore                # Git ignore dosyası
├── database.db               # SQLite veritabanı (otomatik oluşturulur)
│
├── public/                   # Frontend dosyaları
│   ├── index.html
│   ├── app.js
│   └── styles.css
│
├── utils/                    # Yardımcı modüller
│   ├── logger.js             # Logging sistemi
│   ├── aiService.js          # AI entegrasyonu
│   └── notificationService.js # Bildirim servisi
│
├── tests/                    # Test dosyaları
│   └── api.test.js           # API testleri
│
├── .github/
│   └── workflows/
│       └── ci.yml            # GitHub Actions CI Pipeline
│
├── README.md                 # Bu dosya
├── API_DOCUMENTATION.md      # Detaylı API dokümantasyonu
└── WINDOWS_SETUP.md          # Windows kurulum rehberi
```

---

## 🔌 API Endpoints

### Authentication
- `POST /api/auth/register` - Kullanıcı kaydı
- `POST /api/auth/login` - Kullanıcı girişi

### Tickets
- `GET /api/tickets` - Tüm ticket'ları getir (filtreleme destekli)
- `POST /api/tickets` - Yeni ticket oluştur (AI önerileri ile)
- `GET /api/tickets/:id` - Ticket detayı
- `PUT /api/tickets/:id` - Ticket durumunu güncelle (bildirim gönderilir)
- `POST /api/tickets/:id/ai-suggestions` - AI önerileri getir

### Comments
- `POST /api/tickets/:id/comments` - Yorum ekle
- `GET /api/tickets/:id/comments` - Yorumları getir

### Departments
- `GET /api/departments` - Tüm departmanları getir
- `POST /api/departments` - Yeni departman oluştur
- `GET /api/departments/:id/tickets` - Departman ticket'larını getir
- `GET /api/departments/:id/analytics` - Departman analitikleri

**Detaylı API dokümantasyonu için:** `API_DOCUMENTATION.md` dosyasını inceleyin.

---

## 🤖 AI Özellikleri (Hafta 2)

### Kategori Önerisi
Yeni ticket açılırken, sistem otomatik olarak açıklamadan kategori önerir:
```
Giriş: "Yurt odasında Wi-Fi süreklı kopuyor"
Çıkış: Kategori = "İnternet", Güven = 0.9
```

### Öncelik Önerisi
Sistem otomatik olarak aciliyet derecesini belirler:
```
Giriş: "Acil! Bilgisayarım çalışmıyor"
Çıkış: Öncelik = "Yüksek", Güven = 0.85
```

### Özet Oluşturma
Ticket açıklamasından otomatik özet çıkarılır.

### Cevap Taslağı
Support personeli için AI tarafından oluşturulmuş cevap taslağı sunulur.

---

## 📧 Bildirim Sistemi (Hafta 2)

### Desteklenen Kanallar
- 📧 Email
- 💬 Slack Webhook
- 📱 SMS (genişletilebilir)

### Bildirim Türleri
1. **Ticket Çözüldü** - Ticket sahibine bildirim
2. **Yorum Eklendi** - Ticket sahibine bildirim
3. **Durum Değişti** - İlgili kişilere bildirim

---

## 📊 Logging Sistemi (Hafta 2)

Tüm önemli işlemler `./logs/app.log` dosyasına kaydedilir:

```
[2024-12-08T10:30:00.000Z] [INFO] Ticket Created | {"ticketId":1,"userId":1,"title":"Wi-Fi Sorunu"}
[2024-12-08T10:30:05.000Z] [INFO] AI API Call | {"type":"category_suggestion","success":true,"details":{"suggestedCategory":"İnternet","confidence":0.9}}
[2024-12-08T10:35:00.000Z] [INFO] Notification Sent | {"ticketId":1,"method":"email","success":true,"details":{"userId":1}}
```

---

## 🔄 Git Workflow (Hafta 2)

### Branch Yapısı
```
main (stabil, production)
  ↑
  └─ dev (geliştirme)
      ↑
      ├─ feature/ai-suggestion
      ├─ feature/notification-api
      └─ feature/analytics
```

### Commit Mesajları
```
feat: add AI category suggestion
fix: handle empty ticket description
docs: update API documentation
test: add unit tests for ticket creation
chore: update dependencies
```

### Pull Request Süreci
1. Feature branch'ından PR oluştur
2. CI Pipeline otomatik olarak testleri çalıştırır
3. Code review yapılır
4. Merge işlemi gerçekleştirilir
5. Main'e merge edildiğinde otomatik deployment

---

## 🧪 Testing (Hafta 2)

### Test Çalıştırma
```bash
# Tüm testleri çalıştır
npm test

# Belirli bir test dosyasını çalıştır
npm test -- tests/api.test.js

# Coverage raporu ile çalıştır
npm test -- --coverage

# Watch mode'de çalıştır (dosya değişikliğinde otomatik test)
npm test -- --watch
```

### Test Türleri
- **Unit Tests** - Bireysel fonksiyonlar
- **Integration Tests** - API endpoint'leri
- **Error Handling Tests** - Hata yönetimi

---

## 🔐 Güvenlik

### Şifre Yönetimi
⚠️ **Uyarı:** Mevcut sistemde şifreler düz metin olarak saklanmaktadır. Production ortamında:
- Bcrypt veya Argon2 ile şifreler hash'lenmelidir
- JWT token'ları kullanılmalıdır
- HTTPS zorunlu olmalıdır

### API Güvenliği
- CORS yapılandırması yapılmıştır
- Input validation uygulanmıştır
- Error handling uygulanmıştır

---

## 📚 Kullanıcı Rolleri

| Rol | Yetkiler |
|-----|----------|
| **Student** | Ticket açma, kendi ticket'larını görme, yorum yapma |
| **Support** | Atanan ticket'ları yönetme, durum güncelleme, yorum yapma |
| **Department** | Departman ticket'larını görme, support personeline atama, analitikler |
| **Admin** | Tüm ticket'ları yönetme, departman yönetimi, sistem ayarları |

---

## 🐛 Sorun Giderme

### Veritabanı Hatası
```
Error: SQLITE_CANTOPEN: unable to open database file
```
**Çözüm:** Proje dizininde yazma izni olduğundan emin olun.

### Port Zaten Kullanımda
```
Error: listen EADDRINUSE: address already in use :::3000
```
**Çözüm:** Port'u değiştir veya eski işlemi kapat:
```bash
# macOS/Linux
lsof -ti:3000 | xargs kill -9

# Windows
netstat -ano | findstr :3000
taskkill /PID <PID> /F
```

### AI API Hatası
```
Error: OpenAI API key not found
```
**Çözüm:** `.env` dosyasında `OPENAI_API_KEY` ayarlanmış mı kontrol et.

---

## 📈 İstatistikler

- **Toplam Endpoint'ler:** 14
- **Veritabanı Tabloları:** 5
- **Desteklenen Roller:** 4
- **Logging Türleri:** 4
- **Bildirim Kanalları:** 2+

---

## 🤝 Katkıda Bulunma

1. Projeyi fork'la
2. Feature branch oluştur (`git checkout -b feature/AmazingFeature`)
3. Değişiklikleri commit'le (`git commit -m 'Add some AmazingFeature'`)
4. Branch'a push'la (`git push origin feature/AmazingFeature`)
5. Pull Request oluştur

---

## 📄 Lisans

Bu proje ISC lisansı altında yayınlanmıştır.

---

## 📞 İletişim

Sorularınız veya önerileriniz için:
- 📧 Email: support@campusupport.com
- 🐛 Issues: GitHub Issues
- 💬 Discussions: GitHub Discussions

---

## 🎯 Gelecek Özellikler

- [ ] Real-time notifications (WebSocket)
- [ ] Mobile app
- [ ] Advanced analytics dashboard
- [ ] Multi-language support
- [ ] Video/file upload support
- [ ] Automated ticket routing
- [ ] SLA management
- [ ] Knowledge base integration

---

## 📝 Sürüm Tarihi

| Versiyon | Tarih | Açıklama |
|----------|-------|----------|
| 1.0.0 | 2024-12-08 | Hafta 1 - Temel Ticket Sistemi |
| 2.0.0 | 2024-12-09 | Hafta 2 - AI & API Entegrasyonu |

---

**Son Güncelleme:** 2024-12-09

**Geliştiriciler:**
- Şilan PEHLİVAN
- Semanur YILDIRIM
- İlayda ÖZTÜRK

**Status:** 🟢 Active Development
