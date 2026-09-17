require('dotenv').config();
const cron = require('node-cron');
const mysql = require('mysql2/promise');
const cloudinary = require('cloudinary').v2;

// 1. Konfigurasi Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// 2. Konfigurasi Database Pool
const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'elearning_db',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

/**
 * Helper function untuk menghapus asset dari Cloudinary.
 * Mencoba resource_type 'image', 'raw', dan 'video' secara berurutan.
 */
async function deleteFromCloudinary(publicId) {
  if (!publicId) return;

  const resourceTypes = ['image', 'raw', 'video'];

  for (const type of resourceTypes) {
    try {
      const result = await cloudinary.uploader.destroy(publicId, { resource_type: type });
      
      if (result.result === 'ok') {
        console.log(`[Cloudinary] Terhapus (${type}): ${publicId}`);
        return;
      }
    } catch (err) {
      // Abaikan error dan coba tipe resource selanjutnya
    }
  }

  console.warn(`[Cloudinary Warning] File tidak ditemukan atau gagal dihapus: ${publicId}`);
}

/**
 * Fungsi Utama Pembersihan Tugas berdasarkan createdAt (> 24 Jam)
 */
async function cleanExpiredAssignments() {
  console.log('[CRON] Memulai pembersihan data tugas yang dibuat lebih dari 24 jam lalu...');
  let connection;

  try {
    connection = await pool.getConnection();

    // A. Cari semua tugas yang createdAt-nya sudah lewat dari 24 jam (1 hari)
    const [expiredAssignments] = await connection.query(
      `SELECT id_assignment, file_public_id, createdAt 
       FROM assignment_tb 
       WHERE createdAt < DATE_SUB(NOW(), INTERVAL 24 HOUR)`
    );

    if (expiredAssignments.length === 0) {
      console.log('[CRON] Tidak ada tugas berusia > 24 jam yang perlu dibersihkan.');
      return;
    }

    console.log(`[CRON] Ditemukan ${expiredAssignments.length} tugas berusia > 24 jam.`);

    for (const assignment of expiredAssignments) {
      const assignmentId = assignment.id_assignment;

      // B. Ambil daftar file_public_id submisi siswa sebelum barisnya terhapus oleh CASCADE
      const [studentSubmissions] = await connection.query(
        `SELECT file_public_id 
         FROM assignmentstudent_tb 
         WHERE id_assignment = ? AND file_public_id IS NOT NULL`,
        [assignmentId]
      );

      // C. Hapus seluruh file submisi siswa dari Cloudinary
      for (const submission of studentSubmissions) {
        if (submission.file_public_id) {
          await deleteFromCloudinary(submission.file_public_id);
        }
      }

      // D. Hapus file utama dari tugas guru (jika ada)
      if (assignment.file_public_id) {
        await deleteFromCloudinary(assignment.file_public_id);
      }

      // E. Hapus baris tugas di assignment_tb
      // (Data di assignmentstudent_tb akan otomatis terhapus via ON DELETE CASCADE)
      await connection.query(
        `DELETE FROM assignment_tb WHERE id_assignment = ?`,
        [assignmentId]
      );

      console.log(`[Database] Berhasil menghapus assignment ID: ${assignmentId} (dibuat pada ${assignment.createdAt}) beserta seluruh pengumpulan siswanya.`);
    }

    console.log('[CRON] Proses pembersihan selesai sepenuhnya.');
  } catch (error) {
    console.error('[CRON Error] Terjadi kesalahan saat pembersihan:', error);
  } finally {
    if (connection) connection.release();
  }
}

// Menjalankan Cron Job otomatis setiap jam 2.00
cron.schedule('0 2 * * *', () => {
  cleanExpiredAssignments();
});

// Export fungsi agar bisa di-import di server.js jika ingin dipanggil manual
module.exports = { cleanExpiredAssignments };