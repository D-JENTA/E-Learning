-- 2026-08-19: constraint & cleanup (audit D1, D2, D3, D5, D8)
-- Jalankan sekali per environment: mariadb -u <user> -p <db> < migrations/2026-08-19-constraints.sql
-- Sudah diverifikasi 0 duplikat sebelum dijalankan. Kalau gagal, cek duplikat dulu.

-- D5: dua unique index identik untuk email, sisakan satu
ALTER TABLE user_tb DROP INDEX idx_users_email;

-- D2: satu siswa = satu pengumpulan per tugas (akar masalah "data double")
ALTER TABLE assignmentstudent_tb
  ADD UNIQUE KEY uq_submission_student_assignment (id_student, id_assignment);

-- D3: unique yang hilang
ALTER TABLE student_tb ADD UNIQUE KEY uq_student_nis (nis);
ALTER TABLE teacher_tb ADD UNIQUE KEY uq_teacher_nip (nip);
ALTER TABLE class_tb ADD UNIQUE KEY uq_class_name (class_name);
ALTER TABLE mapel_tb ADD UNIQUE KEY uq_mapel_name_class (mapel_name, id_class);
ALTER TABLE schedule_mapel_tb ADD UNIQUE KEY uq_schedule_mapel_day_jp (id_mapel, day, jp);

-- D8: satu OTP aktif per user (upsert di controller)
ALTER TABLE email_otps ADD UNIQUE KEY uq_email_otp_user (user_id);
ALTER TABLE email_otps DROP INDEX user_id;

-- D1: username hanya hidup di user_tb (single source of truth, dibaca via JOIN)
ALTER TABLE student_tb DROP COLUMN username;
ALTER TABLE teacher_tb DROP COLUMN username;
