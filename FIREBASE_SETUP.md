# Panduan Setup Firebase

1. Buka [Firebase Console](https://console.firebase.google.com/).
2. Buat Project baru (misal: `chatbot-umkm`).
3. Masuk ke **Build** > **Authentication**.
    - Klik **Get Started**.
    - Pilih **Google** dan aktifkan (Enable).
    - **PENTING:** Jangan aktifkan Email/Password untuk keamanan maksimal.
    - Sistem ini hanya menggunakan Google Sign-In untuk memastikan akun asli.
4. Masuk ke **Build** > **Firestore Database**.
    - Klik **Create Database**.
    - Pilih Start in **Test Mode** (untuk development).
    - Pilih lokasi server terdekat (misal: `asia-southeast2` Jakarta).
5. Masuk ke **Project Settings** (ikon gear).
    - Scroll ke bawah ke section **Your apps**.
    - Klik ikon **Web** (`</>`).
    - Beri nama app, lalu klik **Register app**.
    - Salin `firebaseConfig`.
6. Buka file `env.example` di folder project.
7. Isi nilai-nilainya sesuai config dari Firebase.
8. Rename file `env.example` menjadi `.env.local`.

Contoh isi `.env.local`:
```
VITE_FIREBASE_API_KEY=AIzaSy...
VITE_FIREBASE_AUTH_DOMAIN=project-id.firebaseapp.com
...
VITE_RECAPTCHA_SITE_KEY=your_recaptcha_site_key
```

---

## 🛡️ Setup Firebase App Check (Bot Protection & Rate Limiting)

Firebase App Check melindungi aplikasi dari bot attacks dan automated abuse dengan reCAPTCHA v3.

### 9. Setup reCAPTCHA v3

1. Buka [Google reCAPTCHA Admin Console](https://www.google.com/recaptcha/admin).
2. Klik tombol **+** untuk create new site.
3. Isi form:
   - **Label**: `Nusavite AI Chatbot` (atau nama project kamu)
   - **reCAPTCHA type**: Pilih **reCAPTCHA v3**
   - **Domains**: Tambahkan:
     - `localhost` (untuk development)
     - `127.0.0.1` (untuk development)
     - Domain production kamu (misal: `nusavite.com`)
4. Accept terms of service dan klik **Submit**.
5. **Copy Site Key** yang muncul (format: `6Lc...`).
6. Paste Site Key ke file `.env.local`:
   ```
   VITE_RECAPTCHA_SITE_KEY=6Lc_your_site_key_here
   ```

> **💡 Tips:** reCAPTCHA v3 berjalan di background, tidak ada CAPTCHA challenge yang mengganggu user!

### 10. Enable Firebase App Check

1. Buka [Firebase Console](https://console.firebase.google.com/).
2. Pilih project kamu.
3. Masuk ke **Build** > **App Check**.
4. Klik **Get Started**.
5. Pilih web app kamu dari dropdown.
6. Pilih **reCAPTCHA v3** sebagai provider.
7. Paste **Site Key** dari step 9.
8. Klik **Save**.

### 11. Configure App Check Enforcement

1. Di Firebase Console → App Check → **APIs** tab.
2. Untuk setiap service, klik **Enforce**:
   - ✅ **Authentication** → Klik **Enforce**
   - ✅ **Cloud Firestore** → Klik **Enforce**
   
> **⚠️ PENTING:** Jangan enforce dulu saat development! Set ke **Unenforced** dulu untuk testing.
> Setelah testing OK, baru ubah ke **Enforced** untuk production.

### 12. Testing App Check (Development)

1. Buka browser dan navigate ke `http://localhost:5173`.
2. Buka **Developer Console** (F12).
3. Cek console logs, harus ada:
   ```
   ✅ Firebase App Check initialized successfully
   ```
4. Test login dengan Google Sign-In.
5. Kalau ada error, cek:
   - Site Key sudah benar di `.env.local`
   - Domain `localhost` sudah ditambahkan di reCAPTCHA Console
   - App Check masih **Unenforced** di Firebase Console

---

### 13. Penting: Keamanan Data (Security Rules)

Ganti Rules di Tab **Rules** Firestore Console agar user hanya bisa melihat datanya sendiri:

```javascript
service cloud.firestore {
  match /databases/{database}/documents {
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
      
      match /products/{productId} {
        allow read, write: if request.auth != null && request.auth.uid == userId;
      }
    }
  }
}
```

### 14. Penting: Keamanan API Key

Agar API Key Mistral tidak bocor:
1. Di Dashboard Vercel, jangan gunakan awalan `VITE_`.
2. Gunakan nama variabel: `MISTRAL_API_KEY`.
3. Kodingan sudah otomatis menggunakan proxy aman.

---

## 🎉 Setup Selesai!

**Checklist Akhir:**
- ✅ Firebase Authentication (Google Sign-In) enabled
- ✅ Firestore Database created dengan security rules
- ✅ reCAPTCHA v3 registered dan site key configured
- ✅ Firebase App Check enabled (Unenforced untuk testing)
- ✅ Environment variables configured di `.env.local`

**Next Steps:**
1. Test login flow di `http://localhost:5173/login`
2. Verify App Check initialization di browser console
3. Setelah testing OK, enable App Check enforcement di Firebase Console
4. Deploy ke production dengan domain yang sudah registered di reCAPTCHA

**Security Score: 9.5/10** 🔒🚀

