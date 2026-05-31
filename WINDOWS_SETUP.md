# Windows'ta CampuSupport Kurulum Rehberi

## Hızlı Başlangıç Komutları

Aşağıdaki komutları sırasıyla çalıştırın.

### 1. Node.js Kurulumu (İlk Defa Yapılacak)

Node.js henüz kurulu değilse, https://nodejs.org/ adresinden LTS sürümünü indirip kurun.

Kurulumu doğrulamak için:
```cmd
node --version
npm --version
```

### 2. Proje Klasörüne Gitme

Proje klasörünün yolunu belirleyin ve CMD'de açın:

```cmd
cd C:\Users\YourUsername\Desktop\CampuSupport
```

**Veya** klasörü Windows Explorer'da açıp, adres çubuğuna `cmd` yazıp Enter tuşuna basın.

### 3. Bağımlılıkları Yükleme (İlk Defa Yapılacak)

```cmd
npm install
```

Bu komut `node_modules` klasörünü oluşturur ve gerekli paketleri yükler. Birkaç dakika sürebilir.

### 4. Sunucuyu Başlatma

```cmd
npm start
```

Başarılı başlatma mesajı:
```
Server running on http://localhost:3000
Connected to SQLite database
Database tables initialized
```

### 5. Tarayıcıda Açma

Web tarayıcınızı açın ve şu adrese gidin:
```
http://localhost:3000
```

## Sunucuyu Durdurma

Sunucuyu durdurmak için CMD penceresinde `Ctrl + C` tuşlarına basın.

## Farklı Port Kullanma

Eğer port 3000 zaten kullanımda ise:

```cmd
set PORT=3001
npm start
```

Ardından tarayıcıda `http://localhost:3001` adresine gidin.

## Veritabanını Sıfırlama

Tüm verileri silip yeni başlamak istiyorsanız:

1. Sunucuyu durdurun (Ctrl + C)
2. `database.db` dosyasını silin (proje klasöründe)
3. Sunucuyu yeniden başlatın:
   ```cmd
   npm start
   ```

## Sorun Giderme

### "npm: Komut bulunamadı"
Node.js düzgün kurulmamış olabilir. https://nodejs.org/ adresinden yeniden kurun ve bilgisayarı yeniden başlatın.

### "Port 3000 zaten kullanımda"
Farklı bir port kullanın (yukarıda açıklandığı gibi) veya mevcut uygulamayı kapatın.

### "database.db: Erişim reddedildi"
Sunucuyu durdurun ve `database.db` dosyasını silin, sonra yeniden başlatın.

### Tarayıcıda "Bağlantı reddedildi"
- Sunucunun çalışıp çalışmadığını kontrol edin
- Doğru port numarasını kullandığınızdan emin olun
- Tarayıcıyı yenileyin (F5)

## Geliştirme Sırasında Sunucuyu Otomatik Yeniden Başlatma

Dosya değişikliklerinde sunucuyu otomatik yeniden başlatmak için `nodemon` kurun:

```cmd
npm install --save-dev nodemon
```

Ardından `package.json` dosyasında `"dev"` script'ini güncelleyin:

```json
"scripts": {
  "start": "node server.js",
  "dev": "nodemon server.js"
}
```

Geliştirme sırasında kullanın:
```cmd
npm run dev
```

## Dosya Yapısı

```
CampuSupport/
├── server.js              # Express sunucusu
├── package.json           # Bağımlılıklar
├── database.db            # SQLite veritabanı (otomatik oluşturulur)
├── public/
│   ├── index.html         # Ana sayfa
│   ├── app.js             # Frontend JavaScript
│   └── styles.css         # Stil dosyası
├── README.md              # Proje açıklaması
└── WINDOWS_SETUP.md       # Bu dosya
```

## Test Verileri

Sistemi test etmek için kayıt olun:

**Örnek 1 - Öğrenci:**
- Email: student@campus.edu
- Şifre: student123
- Rol: Öğrenci

**Örnek 2 - Destek Personeli:**
- Email: support@campus.edu
- Şifre: support123
- Rol: Destek Personeli

## VS Code'da Çalışma

1. VS Code'u açın
2. File → Open Folder → CampuSupport klasörünü seçin
3. Integrated Terminal'i açın (Ctrl + `)
4. `npm start` komutunu çalıştırın

## Ek Kaynaklar

- Node.js Dokümantasyonu: https://nodejs.org/docs/
- Express.js Dokümantasyonu: https://expressjs.com/
- SQLite Dokümantasyonu: https://www.sqlite.org/docs.html

---

Sorularınız için README.md dosyasını okuyun veya destek@campus.edu ile iletişime geçin.
