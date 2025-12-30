# Panduan Setup Firebase

1. Buka [Firebase Console](https://console.firebase.google.com/).
2. Buat Project baru (misal: `chatbot-umkm`).
3. Masuk ke **Build** > **Authentication**.
    - Klik **Get Started**.
    - Pilih **Email/Password** dan aktifkan (Enable).
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
```

### 9. Penting: Keamanan Data (Security Rules)

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

### 10. Penting: Keamanan API Key

Agar API Key Mistral tidak bocor:
1. Di Dashboard Vercel, jangan gunakan awalan `VITE_`.
2. Gunakan nama variabel: `MISTRAL_API_KEY`.
3. Kodingan sudah otomatis menggunakan proxy aman.

