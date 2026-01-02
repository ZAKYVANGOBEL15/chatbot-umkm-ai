/**
 * Maps Firebase Auth error codes to user-friendly Indonesian messages.
 * Only includes errors relevant to Google Sign-In authentication.
 */
export const getFriendlyErrorMessage = (errorCode: string): string => {
    switch (errorCode) {
        // Google OAuth Errors
        case 'auth/popup-closed-by-user':
            return 'Jendela login ditutup sebelum selesai. Silakan coba lagi ya!';
        case 'auth/popup-blocked':
            return 'Popup login terblokir oleh browser. Mohon izinkan popup untuk situs ini.';
        case 'auth/cancelled-popup-request':
            return 'Proses login dibatalkan karena ada request baru. Silakan coba lagi.';

        // Account Status Errors
        case 'auth/user-disabled':
            return 'Akun Anda dinonaktifkan. Hubungi bantuan untuk informasi lebih lanjut.';

        // Network & General Errors
        case 'auth/network-request-failed':
            return 'Koneksi internet bermasalah. Periksa koneksi Anda dan coba lagi.';
        case 'auth/too-many-requests':
            return 'Terlalu banyak percobaan login. Mohon tunggu beberapa saat.';

        // App Check Errors (Bot Protection)
        case 'appCheck/fetch-status-error':
            return 'Verifikasi keamanan gagal. Silakan refresh halaman dan coba lagi.';
        case 'appCheck/throttled':
            return 'Terlalu banyak request. Mohon tunggu beberapa saat sebelum mencoba lagi.';
        case 'appCheck/fetch-network-error':
            return 'Gagal memverifikasi koneksi. Periksa internet Anda dan coba lagi.';

        default:
            return 'Terjadi kendala teknis. Silakan coba lagi beberapa saat lagi.';
    }
};
