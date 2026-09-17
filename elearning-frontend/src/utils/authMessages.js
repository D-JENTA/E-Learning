// Backend (elearning-backend/controllers/authController.js + middleware/rateLimiter.js)
// mengirim pesan error apa adanya, sebagian bahasa Inggris dan sebagian bahasa Indonesia.
// UI kita berbahasa Indonesia, jadi pemetaannya dikumpulkan di satu tempat ini supaya
// /login dan /verify menampilkan kalimat yang konsisten.

const MESSAGE_MAP = [
  // POST /api/auth/login
  [/^email not found$/i, 'Email tidak terdaftar.'],
  [/^wrong password$/i, 'Kata sandi salah.'],
  [/^account not verified yet$/i, 'Akun Anda belum diverifikasi.'],

  // POST /api/auth/verifyOtp
  [/^invalid otp$/i, 'Kode OTP salah. Silakan periksa kembali.'],
  [/^otp expired$/i, 'Kode OTP sudah kedaluwarsa. Silakan kirim ulang kode baru.'],
  [/^user not found$/i, 'Sesi tidak valid. Silakan login kembali.'],
  [/^user_id and otp are required$/i, 'Kode OTP belum lengkap.'],

  // POST /api/auth/resend-otp
  [/^otp resent successfully$/i, 'Kode OTP berhasil dikirim ulang.'],
  [/^email user tidak ditemukan$/i, 'Email tidak terdaftar.'],
  [/^user_id atau email wajib diisi$/i, 'Sesi tidak valid. Silakan login kembali.'],
  [/^server error while resending otp$/i, 'Gagal mengirim ulang kode. Silakan coba lagi.'],

  // Umum
  [/^server error$/i, 'Terjadi kesalahan pada server. Silakan coba lagi.'],
  [/too many login attempts/i, 'Terlalu banyak percobaan. Silakan coba lagi sebentar lagi.'],
];

/**
 * Ubah pesan error dari backend menjadi kalimat berbahasa Indonesia.
 * Pesan yang tidak dikenali dikembalikan apa adanya; pesan kosong jadi `fallback`.
 * @param {string} message pesan mentah dari `result.message`
 * @param {string} [fallback]
 * @returns {string}
 */
export const toIndonesianMessage = (
  message,
  fallback = 'Terjadi kesalahan. Silakan coba lagi.'
) => {
  if (typeof message !== 'string') return fallback;

  const trimmed = message.trim();
  if (!trimmed) return fallback;

  const match = MESSAGE_MAP.find(([pattern]) => pattern.test(trimmed));
  return match ? match[1] : trimmed;
};

/**
 * Deteksi OTP kedaluwarsa dari pesan MENTAH backend (sebelum diterjemahkan),
 * supaya /verify bisa langsung menawarkan kirim ulang kode.
 * @param {string} message
 * @returns {boolean}
 */
export const isOtpExpired = (message) =>
  typeof message === 'string' && /otp\s*expired/i.test(message);
