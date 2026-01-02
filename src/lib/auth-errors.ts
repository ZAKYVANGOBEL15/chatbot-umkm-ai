/**
 * Maps Firebase Auth error codes to user-friendly Indonesian messages.
 */
export const getFriendlyErrorMessage = (errorCode: string): string => {
    switch (errorCode) {
        // Registration Errors
        case 'auth/email-already-in-use':
            return 'Email ini sudah terdaftar bro, coba login atau pake email lain ya! 😊';
        case 'auth/invalid-email':
            return 'Format email kamu gak valid nih, coba cek lagi penulisannya ya! 🧐';
        case 'auth/operation-not-allowed':
            return 'Metode login ini lagi dinonaktifkan sementara. Hubungi admin ya! 🛠️';
        case 'auth/weak-password':
            return 'Password kamu terlalu lemah bro. Minimal 6 karakter biar aman ya! 💪';

        // Login Errors
        case 'auth/user-disabled':
            return 'Akun kamu dinonaktifkan. Hubungi bantuan untuk info lebih lanjut ya! 🚫';
        case 'auth/user-not-found':
            return 'Email kamu belum terdaftar nih. Yuk daftar dulu! 🚀';
        case 'auth/wrong-password':
            return 'Password yang kamu masukkan salah bro. Coba ingat-ingat lagi ya! 🔑';
        case 'auth/invalid-credential':
            return 'Email atau password salah nih, silakan cek lagi ya! 🧐';

        // General / Popup Errors
        case 'auth/popup-closed-by-user':
            return 'Yah, jendela login ketutup sebelum selesai. Coba klik lagi ya! 🔄';
        case 'auth/popup-blocked':
            return 'Yah, popup di browser kamu terblokir. Izinkan popup dulu ya! 🔊';
        case 'auth/cancelled-popup-request':
            return 'Proses login dibatalkan karena ada request baru. Coba lagi ya! 🔄';
        case 'auth/network-request-failed':
            return 'Koneksi internet bermasalah nih. Cek sinyal kamu ya! 📶';

        default:
            return 'Waduh, ada kendala teknis sebentar. Coba lagi beberapa saat lagi ya! 🙏';
    }
};
