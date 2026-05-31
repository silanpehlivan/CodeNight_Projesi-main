# CampuSupport API Dokümantasyonu

## Genel Bilgiler

**Base URL:** `http://localhost:3000/api`

**API Versiyonu:** 2.0.0

**Son Güncelleme:** Hafta 2 - AI Destekli & API Entegrasyonlu

---

## Authentication Endpoints

### 1. Kullanıcı Kaydı

**Endpoint:** `POST /auth/register`

**İstek Gövdesi:**
```json
{
  "email": "user@example.com",
  "password": "password123",
  "student_id": "2024001",
  "role": "student",
  "department_id": 1
}
```

**Yanıt (201):**
```json
{
  "id": 1,
  "email": "user@example.com",
  "role": "student"
}
```

**Hata Yanıtları:**
- `400`: Email ve şifre gerekli
- `400`: Kullanıcı zaten mevcut

---

### 2. Kullanıcı Girişi

**Endpoint:** `POST /auth/login`

**İstek Gövdesi:**
```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

**Yanıt (200):**
```json
{
  "id": 1,
  "email": "user@example.com",
  "role": "student",
  "department_id": 1
}
```

**Hata Yanıtları:**
- `400`: Email ve şifre gerekli
- `401`: Geçersiz kimlik bilgileri
- `500`: Veritabanı hatası

---

## Ticket Endpoints

### 3. Tüm Ticket'ları Getir

**Endpoint:** `GET /tickets`

**Query Parametreleri:**
- `status` (opsiyonel): open, in_progress, resolved, closed
- `priority` (opsiyonel): low, medium, high
- `department_id` (opsiyonel): Departman ID'si

**Örnek:**
```
GET /tickets?status=open&priority=high&department_id=1
```

**Yanıt (200):**
```json
[
  {
    "id": 1,
    "user_id": 1,
    "title": "Wi-Fi Bağlantı Sorunu",
    "description": "Yurt odasında Wi-Fi süreklı kopuyor",
    "category": "İnternet",
    "ai_suggested_category": "İnternet",
    "category_confidence": 0.9,
    "priority": "high",
    "ai_suggested_priority": "high",
    "priority_confidence": 0.85,
    "status": "open",
    "department_id": 1,
    "assigned_to": null,
    "ai_summary": "Yurt odasında Wi-Fi süreklı kopuyor...",
    "created_at": "2024-12-08T10:30:00Z",
    "updated_at": "2024-12-08T10:30:00Z"
  }
]
```

---

### 4. Kullanıcının Ticket'larını Getir

**Endpoint:** `GET /tickets/user/:user_id`

**Yanıt (200):**
```json
[
  {
    "id": 1,
    "user_id": 1,
    "title": "Wi-Fi Bağlantı Sorunu",
    ...
  }
]
```

---

### 5. Yeni Ticket Oluştur (Hafta 2 - AI Önerileri ile)

**Endpoint:** `POST /tickets`

**İstek Gövdesi:**
```json
{
  "user_id": 1,
  "title": "Wi-Fi Bağlantı Sorunu",
  "description": "Yurt odasında Wi-Fi süreklı kopuyor, LMS'ye giremiyorum.",
  "department_id": 1,
  "category": "İnternet",
  "priority": "high"
}
```

**Yanıt (201):**
```json
{
  "id": 1,
  "status": "open",
  "ai_suggested_category": "İnternet",
  "ai_suggested_priority": "high"
}
```

**Özellikler:**
- AI otomatik olarak kategori önerisi yapar
- AI otomatik olarak öncelik önerisi yapar
- Ticket özeti AI tarafından oluşturulur
- Tüm işlemler log dosyasına kaydedilir

---

### 6. Ticket Detayını Getir

**Endpoint:** `GET /tickets/:id`

**Yanıt (200):**
```json
{
  "id": 1,
  "user_id": 1,
  "title": "Wi-Fi Bağlantı Sorunu",
  "description": "Yurt odasında Wi-Fi süreklı kopuyor",
  "category": "İnternet",
  "ai_suggested_category": "İnternet",
  "category_confidence": 0.9,
  "priority": "high",
  "ai_suggested_priority": "high",
  "priority_confidence": 0.85,
  "status": "open",
  "department_id": 1,
  "assigned_to": null,
  "ai_summary": "Yurt odasında Wi-Fi süreklı kopuyor...",
  "response_draft": null,
  "created_at": "2024-12-08T10:30:00Z",
  "updated_at": "2024-12-08T10:30:00Z",
  "resolved_at": null
}
```

**Hata Yanıtları:**
- `404`: Ticket bulunamadı
- `500`: Veritabanı hatası

---

### 7. Ticket Durumunu Güncelle (Hafta 2 - Bildirim ile)

**Endpoint:** `PUT /tickets/:id`

**İstek Gövdesi:**
```json
{
  "status": "resolved",
  "priority": "high",
  "assigned_to": 2,
  "updated_by": 2
}
```

**Yanıt (200):**
```json
{
  "success": true,
  "message": "Ticket updated"
}
```

**Özellikler:**
- Ticket çözüldüğünde (resolved) otomatik bildirim gönderilir
- Tüm durum değişiklikleri log dosyasına kaydedilir
- resolved_at alanı otomatik olarak ayarlanır

**Hata Yanıtları:**
- `404`: Ticket bulunamadı
- `500`: Veritabanı hatası

---

### 8. Ticket için AI Önerileri Getir (Hafta 2 - Yeni Endpoint)

**Endpoint:** `POST /tickets/:id/ai-suggestions`

**Yanıt (200):**
```json
{
  "summary": "Yurt odasında Wi-Fi süreklı kopuyor...",
  "response_draft": "Merhaba,\n\nWi-Fi bağlantı sorununuz için özür dileriz. Lütfen aşağıdaki adımları deneyin:\n1. Cihazınızı yeniden başlatın\n2. Wi-Fi ağını unutup yeniden bağlanın\n3. Sorun devam ederse IT destek ekibine başvurun\n\nYardımcı olabilir miyim?",
  "suggested_category": "İnternet",
  "suggested_priority": "high"
}
```

---

## Comment Endpoints

### 9. Ticket'a Yorum Ekle

**Endpoint:** `POST /tickets/:id/comments`

**İstek Gövdesi:**
```json
{
  "user_id": 2,
  "comment_text": "Sorununuzu kontrol etmek için IT ekibine yönlendirdim."
}
```

**Yanıt (201):**
```json
{
  "id": 1,
  "comment_text": "Sorununuzu kontrol etmek için IT ekibine yönlendirdim."
}
```

**Özellikler:**
- Yorum eklendiğinde ticket sahibine bildirim gönderilir
- Tüm yorumlar log dosyasına kaydedilir

---

### 10. Ticket'ın Yorumlarını Getir

**Endpoint:** `GET /tickets/:id/comments`

**Yanıt (200):**
```json
[
  {
    "id": 1,
    "ticket_id": 1,
    "user_id": 2,
    "comment_text": "Sorununuzu kontrol etmek için IT ekibine yönlendirdim.",
    "email": "support@example.com",
    "created_at": "2024-12-08T11:00:00Z"
  }
]
```

---

## Department Endpoints

### 11. Tüm Departmanları Getir

**Endpoint:** `GET /departments`

**Yanıt (200):**
```json
[
  {
    "id": 1,
    "name": "BİLİŞİM BÖLÜMÜ",
    "description": "Bilişim ve Teknoloji Desteği",
    "created_at": "2024-12-08T09:00:00Z"
  }
]
```

---

### 12. Yeni Departman Oluştur

**Endpoint:** `POST /departments`

**İstek Gövdesi:**
```json
{
  "name": "YENİ DEPARTMAN",
  "description": "Departman açıklaması"
}
```

**Yanıt (201):**
```json
{
  "id": 7,
  "name": "YENİ DEPARTMAN",
  "description": "Departman açıklaması"
}
```

---

### 13. Departmanın Ticket'larını Getir

**Endpoint:** `GET /departments/:id/tickets`

**Yanıt (200):**
```json
[
  {
    "id": 1,
    "user_id": 1,
    "title": "Wi-Fi Bağlantı Sorunu",
    ...
  }
]
```

---

### 14. Departman Analitiklerini Getir (Hafta 2 - Yeni Endpoint)

**Endpoint:** `GET /departments/:id/analytics`

**Yanıt (200):**
```json
{
  "total_tickets": 45,
  "open_tickets": 12,
  "in_progress_tickets": 8,
  "resolved_tickets": 20,
  "closed_tickets": 5,
  "high_priority_tickets": 3,
  "avg_resolution_time": 2.5
}
```

**Açıklama:**
- `total_tickets`: Toplam ticket sayısı
- `open_tickets`: Açık ticket sayısı
- `in_progress_tickets`: İşlenen ticket sayısı
- `resolved_tickets`: Çözülen ticket sayısı
- `closed_tickets`: Kapalı ticket sayısı
- `high_priority_tickets`: Yüksek öncelikli ticket sayısı
- `avg_resolution_time`: Ortalama çözüm süresi (gün)

---

## HTTP Status Kodları

| Kod | Anlamı |
|-----|--------|
| 200 | Başarılı GET isteği |
| 201 | Başarılı POST isteği (kaynak oluşturuldu) |
| 400 | Hatalı istek (eksik veya geçersiz parametreler) |
| 401 | Yetkisiz (kimlik doğrulama başarısız) |
| 404 | Kaynak bulunamadı |
| 500 | Sunucu hatası |

---

## Logging Sistemi (Hafta 2)

Tüm işlemler `./logs/app.log` dosyasına kaydedilir:

- **Ticket Oluşturma:** Ticket ID, kullanıcı ID, başlık
- **AI Çağrıları:** İstek türü, başarı/başarısızlık, detaylar
- **Bildirim Gönderimi:** Ticket ID, yöntem, başarı/başarısızlık
- **Durum Değişiklikleri:** Ticket ID, eski durum, yeni durum, kullanıcı

---

## Örnek Workflow

### 1. Kullanıcı Kaydı
```bash
POST /auth/register
{
  "email": "ogrenci@example.com",
  "password": "pass123",
  "student_id": "2024001",
  "role": "student"
}
```

### 2. Kullanıcı Girişi
```bash
POST /auth/login
{
  "email": "ogrenci@example.com",
  "password": "pass123"
}
```

### 3. Ticket Oluşturma (AI Önerileri ile)
```bash
POST /tickets
{
  "user_id": 1,
  "title": "Wi-Fi Sorunu",
  "description": "Yurt odasında Wi-Fi süreklı kopuyor, LMS'ye giremiyorum.",
  "department_id": 1
}
```

### 4. AI Önerileri Getirme
```bash
POST /tickets/1/ai-suggestions
```

### 5. Ticket Durumunu Güncelleme (Bildirim gönderilir)
```bash
PUT /tickets/1
{
  "status": "resolved",
  "assigned_to": 2
}
```

### 6. Yorum Ekleme (Bildirim gönderilir)
```bash
POST /tickets/1/comments
{
  "user_id": 2,
  "comment_text": "Sorununuz çözüldü."
}
```

---

## Konfigürasyon (.env)

```
PORT=3000
NODE_ENV=development
OPENAI_API_KEY=your_key_here
OPENAI_MODEL=gpt-3.5-turbo
EMAIL_SERVICE=smtp
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your_email@gmail.com
EMAIL_PASSWORD=your_password
SLACK_WEBHOOK_URL=https://hooks.slack.com/...
DATABASE_PATH=./database.db
LOG_LEVEL=info
LOG_FILE=./logs/app.log
```

---

## Hata Yönetimi

Tüm API endpoint'leri hata durumunda anlamlı mesajlar döndürür:

```json
{
  "error": "Ticket not found"
}
```

Detaylı hata bilgileri `./logs/app.log` dosyasında bulunur.

---

## Versiyonlama

**Hafta 1 (v1.0.0):**
- Temel CRUD işlemleri
- Rol tabanlı erişim
- Basit filtreleme

**Hafta 2 (v2.0.0):**
- AI kategori ve öncelik önerisi
- Harici bildirim API'leri
- GitHub workflow
- CI Pipeline
- Logging sistemi
- Departman analitikleri
