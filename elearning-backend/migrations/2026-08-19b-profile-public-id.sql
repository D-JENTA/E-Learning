-- 2026-08-19: kolom profile_public_id (audit lanjutan)
-- Jalankan sekali per environment: mariadb -u <user> -p <db> < migrations/2026-08-19b-profile-public-id.sql
-- Tanpa kolom ini updateProfilePicture menulis ke field yang tidak ada (diabaikan Sequelize),
-- sehingga foto profil lama tidak pernah dihapus dan menumpuk di Cloudinary.

ALTER TABLE user_tb ADD COLUMN profile_public_id VARCHAR(255) NULL AFTER profile_picture_url;
