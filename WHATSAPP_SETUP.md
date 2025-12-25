# Panduan Integrasi WhatsApp (Phase 2)

Setelah dashboard web selesai, langkah berikutnya adalah menghubungkannya ke WhatsApp asli.

### 1. Buat Meta Developer App
1. Buka [Meta for Developers](https://developers.facebook.com/).
2. Buat App baru: **Other** > **Business**.
3. Tambahkan produk **WhatsApp** ke app tersebut.

### 2. Setup Webhook
1. Deploy project ini ke **Vercel**.
2. Di Dashboard Meta, masukkan URL Webhook: `https://domain-anda.vercel.app/api/webhook`.
3. Masukkan **Verify Token** (bebas, misal: `my_secret_token_123`).
4. Pastikan di Environment Variables Vercel, Anda sudah menambahkan `WHATSAPP_VERIFY_TOKEN` dengan nilai yang sama.

### 3. Masukkan Credentials
Anda butuh 3 hal berikut dari Meta Dashboard untuk membalas pesan:
1. **WhatsApp Business Account ID**
2. **Phone Number ID**
3. **Permanent Access Token** (System User)

Simpan data ini di dokumen `users/{uid}` di Firestore agar sistem tahu akun WhatsApp mana yang milik siapa.
