# Scaling Strategy: Automated WhatsApp Onboarding

Dokumen ini menjelaskan bagaimana Zaky AI bertransisi dari **Manual Setup** (MVP) ke **Fully Automated** (Scale-Up) menggunakan **WhatsApp Embedded Signup**.

## Masalah Utama (Current User Concern)
Saat scale-up, tidak mungkin Admin meminta user mengirimkan nomor HP dan Admin memasukkannya satu per satu ke Meta Developer Console.

## Solusi: WhatsApp Embedded Signup

Fitur resmi dari Meta yang memungkinkan user menghubungkan nomor WhatsApp Business mereka sendiri langsung dari dalam dashboard aplikasi kita, tanpa campur tangan Admin.

### Perbandingan Flow

| Fitur | MVP (Sekarang) | Scaling Phase (Future) |
| :--- | :--- | :--- |
| **Setup Nomor** | User chat Admin -> Admin input di Meta Dev | User klik tombol "Connect WhatsApp" di Dashboard |
| **Waktu Setup** | 1-2 Jam (Tergantung respon Admin) | < 5 Menit (Instant) |
| **Akses Token** | Generate manual di System User | Otomatis didapat via API setelah user login FB |
| **Scalability** | Rendah (Butuh banyak CS/Admin) | **Unlimited** (Self-service) |

### Technical Architecture (Scaling Phase)

1.  **Button "Connect WhatsApp"**:
    Di Dashboard, user klik tombol ini. Ini akan memicu `Facebook Login SDK` dengan scope khusus (`whatsapp_business_management`, `whatsapp_business_messaging`).

2.  **Facebook Popup Flow**:
    *   User login Facebook mereka.
    *   User memilih/membuat akun WhatsApp Business.
    *   User memverifikasi nomor HP (OTP).
    *   User memberikan izin ke App kita.

3.  **Callback (Webhooks)**:
    Meta akan mengirim data berikut ke backend kita:
    *   `WABA_ID` (ID Bisnis WhatsApp user)
    *   `Phone_Number_ID` (ID Nomor HP user)
    *   `Access_Token` (Token untuk kita kirim pesan atas nama mereka)

4.  **Auto-Save to Database**:
    Backend kita otomatis menyimpan data tersebut ke Firestore profile user:
    ```json
    // users/{uid}
    {
      "whatsapp": {
        "isConnected": true,
        "phoneNumberId": "1029384756",
        "wabaId": "5647382910",
        "accessToken": "EAA..." // Encrypted
      }
    }
    ```
    *Hasil: Sistem langsung siap kirim pesan/balas chat tanpa input manual Admin.*

## Kesimpulan

Kekhawatiran Anda bahwa "gak mungkin input manual satu-satu" **SANGAT VALID**. Dan itulah kenapa Meta menciptakan **Embedded Signup**. Kita hanya perlu implementasi flow ini di Fase 2 nanti.
