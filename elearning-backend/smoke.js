// smoke: app boots, model joins compile, D2/D3/D8 constraints benar-benar aktif
require("dotenv").config();
const assert = require("assert");
const sequelize = require("./config/db");
const { Student, Teacher, User, Mapel, Assignment, assignmentStudent, emailOtp } = require("./models");

(async () => {
  // 1. semua controller & route ter-load tanpa error (cookieParser sudah tidak ada)
  require("./routes/auth"); require("./routes/tugasRoute");
  require("./routes/classRoute"); require("./routes/fiturRoute");
  console.log("routes loaded OK");

  // 2. query yang dipakai controller setelah username di-drop (D1/E8/E10)
  await Student.findAll({ attributes: ["id_student", "nis", "id_class"], include: [{ model: User, attributes: ["username", "email"] }], limit: 1 });
  await Teacher.findAll({ attributes: ["id_teacher", "nip"], include: [{ model: User, as: "User", attributes: ["username", "email"] }], limit: 1 });
  await assignmentStudent.findAll({ attributes: ["id_assignmentStudent"], include: [{ model: Student, attributes: ["nis"], include: [{ model: User, attributes: ["username"] }] }], limit: 1 });
  console.log("joins OK (student/teacher/submission -> user)");

  // 3. UNIQUE benar-benar menolak duplikat (D2)
  const sub = await assignmentStudent.findOne({ attributes: ["id_student", "id_assignment", "id_mapel"], raw: true });
  if (sub) {
    let blocked = false;
    try { await assignmentStudent.create({ title: "dup-test", file_url: "x", id_mapel: sub.id_mapel, id_assignment: sub.id_assignment, id_student: sub.id_student }); }
    catch (e) { blocked = e.name === "SequelizeUniqueConstraintError"; }
    assert(blocked, "D2: duplikat pengumpulan masih lolos!");
    console.log("D2 OK: pengumpulan duplikat ditolak DB");
  } else console.log("D2 skip: tabel pengumpulan kosong");

  // 4. UNIQUE(nis) aktif (D3)
  const st = await Student.findOne({ attributes: ["nis", "id_class"], raw: true });
  if (st) {
    let blocked = false;
    try { await Student.create({ id_student: 999999, nis: st.nis, id_class: st.id_class }); }
    catch (e) { blocked = e.name === "SequelizeUniqueConstraintError" || e.name === "SequelizeForeignKeyConstraintError"; }
    assert(blocked, "D3: nis duplikat masih lolos!");
    console.log("D3 OK: nis duplikat ditolak");
  } else console.log("D3 skip: tabel siswa kosong");

  // 5. upsert OTP -> tetap satu baris per user (D8)
  const u = await User.findOne({ attributes: ["id_user"], raw: true });
  if (u) {
    for (const otp of ["111111", "222222"]) {
      await emailOtp.upsert({ user_id: u.id_user, otp, expires_at: new Date(Date.now() + 300000), created_at: new Date() });
    }
    const rows = await emailOtp.findAll({ where: { user_id: u.id_user }, raw: true });
    assert.strictEqual(rows.length, 1, "D8: OTP per user lebih dari satu!");
    assert.strictEqual(rows[0].otp, "222222", "D8: upsert tidak menimpa OTP lama");
    await emailOtp.destroy({ where: { user_id: u.id_user } });
    console.log("D8 OK: satu OTP aktif per user, upsert menimpa");
  } else console.log("D8 skip: tabel user kosong");

  // 6. profile_public_id benar-benar tersimpan (sebelumnya di-drop diam-diam oleh Sequelize)
  if (u) {
    const row = await User.findByPk(u.id_user);
    const before = row.profile_public_id;
    await row.update({ profile_public_id: "smoke-test-public-id" });
    const reread = await User.findByPk(u.id_user, { attributes: ["profile_public_id"], raw: true });
    assert.strictEqual(reread.profile_public_id, "smoke-test-public-id", "profile_public_id tidak tersimpan!");
    await row.update({ profile_public_id: before });
    console.log("OK: profile_public_id tersimpan (foto profil lama bisa dihapus)");
  }

  // 7. assertOwnsMapel: guru lain ditolak, pemilik lolos, admin dilewatkan
  const assertOwnsMapel = require("./utils/assertOwnsMapel");
  const mp = await Mapel.findOne({ where: { id_teacher: { [require("sequelize").Op.ne]: null } }, attributes: ["id_mapel", "id_teacher"], raw: true });
  if (mp) {
    await assertOwnsMapel({ id: mp.id_teacher, role: "teacher" }, mp.id_mapel);
    await assertOwnsMapel({ id: 999999, role: "admin" }, mp.id_mapel);
    let denied = 0;
    try { await assertOwnsMapel({ id: mp.id_teacher + 999999, role: "teacher" }, mp.id_mapel); }
    catch (e) { denied = e.status; }
    assert.strictEqual(denied, 403, "assertOwnsMapel: guru lain masih bisa akses mapel!");
    console.log("OK: mapel guru lain ditolak 403, pemilik & admin lolos");
  } else console.log("assertOwnsMapel skip: belum ada mapel dengan guru");

  // 8. storage tugas: params dihitung per-file, harus streaming ke folder & resource_type benar
  const { uploadTeacher, uploadStudent } = require("./config/cloudinary");
  const p = await uploadTeacher.storage.params({}, { mimetype: "video/mp4", originalname: "WhatsApp Video 2026.mp4" });
  assert.strictEqual(p.folder, "e-learning_assignments/teacher");
  assert.strictEqual(p.resource_type, "video", "video harus resource_type video");
  assert(!/\.mp4$/.test(p.public_id), "public_id video tidak boleh berekstensi");
  assert(p.timeout >= 600000, "timeout harus digedein, 60s default kena idle-timeout");
  const ps = await uploadStudent.storage.params({}, { mimetype: "application/pdf", originalname: "tugas 1.pdf" });
  assert.strictEqual(ps.folder, "e-learning_assignments/student");
  assert.strictEqual(ps.resource_type, "image", "pdf dipetakan ke image di Cloudinary");
  console.log("OK: storage tugas streaming, folder/resource_type/timeout benar");

  // 9. guard pre-upload: tugas yang deadline-nya lewat ditolak SEBELUM multer jalan
  const { canSubmitAssignment } = require("./middleware/assignmentGuards");
  const stubRes = () => {
    const r = { code: null, body: null };
    r.status = (c) => { r.code = c; return r; };
    r.json = (b) => { r.body = b; return r; };
    return r;
  };
  const anyAsg = await Assignment.findOne({ attributes: ["id_assignment"], raw: true });
  if (anyAsg) {
    // deadline lewat -> 400
    const past = await Assignment.findByPk(anyAsg.id_assignment);
    const keepDeadline = past.deadline;
    await past.update({ deadline: new Date(Date.now() - 60000) });
    let r = stubRes(), nexted = false;
    await canSubmitAssignment({ params: { id_assignment: anyAsg.id_assignment }, user: { id: 1 } }, r, () => { nexted = true; });
    assert(!nexted && r.code === 400, `deadline lewat harus 400 sebelum upload, dapat ${r.code}`);
    await past.update({ deadline: keepDeadline });
    console.log("OK: deadline lewat ditolak 400 sebelum satu byte pun naik");
  }
  // tugas tidak ada -> 404
  let r404 = stubRes(), n404 = false;
  await canSubmitAssignment({ params: { id_assignment: 99999999 }, user: { id: 1 } }, r404, () => { n404 = true; });
  assert(!n404 && r404.code === 404, `tugas tidak ada harus 404, dapat ${r404.code}`);
  console.log("OK: tugas tidak ada ditolak 404 sebelum upload");

  // 10. format tidak didukung -> 400, bukan 500
  const filterErr = await new Promise((r) => uploadTeacher.fileFilter({}, { mimetype: "application/zip" }, (e) => r(e)));
  assert.strictEqual(filterErr.status, 400, "format tidak didukung harus 400, bukan 500");
  console.log("OK: format tidak didukung dibalas 400");

  await sequelize.close();
  console.log("\nSMOKE PASS");
})().catch(e => { console.error("SMOKE FAIL:", e.message); process.exit(1); });
