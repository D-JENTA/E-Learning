const puppeteer = require("puppeteer");
const { Class, Mapel, ScheduleMapel, Teacher, User } = require("../models");

function esc(str) {
  if (str === null || str === undefined) return "";
  return String(str).replace(/[&<>"']/g, (char) => {
    const map = {
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      '"': "&quot;",
      "'": "&#39;",
    };
    return map[char];
  });
}

const printDataJadwalPDF = async (req, res, next) => {
  let browser;
  try {
    const classesData = await Class.findAll({
      attributes: ["id_class", "class_name"],
      include: [
        {
          model: Mapel,
          as: "Mapels",
          attributes: ["id_mapel", "mapel_name"],
          include: [
            {
              model: ScheduleMapel,
              as: "Schedules",
              attributes: ["id_schedule", "day", "jp"],
            },
            {
              model: Teacher,
              as: "teacher_tb",
              attributes: ["id_teacher"],
              include: [
                {
                  model: User,
                  as: "User",
                  attributes: ["username"],
                },
              ],
            },
          ],
        },
      ],
    });

    const htmlContent = generateJadwalHTML(classesData);

    browser = await puppeteer.launch({
      args: ["--no-sandbox", "--disable-setuid-sandbox", "--disable-gpu"],
    });
    const page = await browser.newPage();

    await page.setContent(htmlContent, { waitUntil: "load" });

    const pdfBuffer = await page.pdf({
      format: "A4",
      landscape: true,
      printBackground: true,
      margin: { top: "10mm", bottom: "10mm", left: "10mm", right: "10mm" },
    });

    res.contentType("application/pdf");
    res.setHeader(
      "Content-Disposition",
      "inline; filename=Jadwal_Pelajaran.pdf",
    );
    res.send(pdfBuffer);
  } catch (error) {
    next(error);
  } finally {
    if (browser) await browser.close();
  }
};
// Helper untuk merender isi cell Mapel berdasarkan DAY & JP
function renderMapelCell(mapels, currentDay, currentJam) {
  const targetDay = String(currentDay)
    .toLowerCase()
    .replace(/[^a-z]/g, "");

  for (const mapel of mapels) {
    const schedules = mapel.Schedules || [];

    const matchedSchedule = schedules.find((s) => {
      if (!s) return false;
      if (s.day === null || s.day === undefined) return false;
      if (s.jp === null || s.jp === undefined) return false;

      const scheduleDay = String(s.day)
        .toLowerCase()
        .replace(/[^a-z]/g, "");
      const jpArray = String(s.jp)
        .split(",")
        .map((j) => j.trim());

      return scheduleDay === targetDay && jpArray.includes(String(currentJam));
    });

    if (matchedSchedule) {
      const teacherObj = mapel.teacher_tb;
      const teacherName =
        teacherObj?.User?.username ||
        teacherObj?.user_tb?.username ||
        teacherObj?.user?.username ||
        "Tanpa Guru";

      return `
        <td>
          <span class="subject-name">${esc(mapel.mapel_name)}</span>
          <span class="teacher-name">${esc(teacherName)}</span>
        </td>
      `;
    }
  }

  return `<td class="empty-cell"></td>`;
}

//generateSchedule
const generateJadwalHTML = (classesData) => {
  const days = ["Senin", "Selasa", "Rabu", "Kamis", "Jumat"];

  const dayColors = {
    Senin: "#e3f2fd",
    Selasa: "#e8f5e9",
    Rabu: "#fff8e1",
    Kamis: "#fce4ec",
    Jumat: "#ede7f6",
  };
  const dayAccent = {
    Senin: "#1565c0",
    Selasa: "#2e7d32",
    Rabu: "#f9a825",
    Kamis: "#ad1457",
    Jumat: "#5e35b1",
  };

  return `
    <!DOCTYPE html>
    <html lang="id">
    <head>
      <meta charset="UTF-8">
      <style>
        @page {
          size: A4 landscape;
          margin: 8mm;
        }

        body {
          font-family: Arial, sans-serif;
          margin: 0;
          padding: 0;
          color: #111;
        }

        .page-kelas {
          page-break-after: always;
          break-after: page;
          box-sizing: border-box;
        }

        .page-kelas:last-child {
          page-break-after: auto;
          break-after: auto;
        }

        .header {
          text-align: center;
          margin-bottom: 12px;
          padding: 10px 0;
          background: linear-gradient(135deg, #1565c0, #5e35b1);
          border-radius: 8px;
        }

        .header h2 {
          margin: 0;
          font-size: 18pt;
          text-transform: uppercase;
          color: #ffffff;
          letter-spacing: 1px;
        }

        .header h3 {
          margin: 4px 0 0 0;
          font-size: 13pt;
          font-weight: bold;
          color: #fff8e1;
        }

        table.jadwal-table {
          width: 100%;
          border-collapse: collapse;
          table-layout: fixed;
          text-align: center;
        }

        table.jadwal-table th, table.jadwal-table td {
          border: 1px solid #999;
          padding: 5px 2px;
          font-size: 8.5pt;
          word-wrap: break-word;
          height: 40px;
        }

        table.jadwal-table thead th {
          background-color: #263238;
          color: #ffffff;
          font-weight: bold;
          font-size: 9pt;
        }

        table.jadwal-table tbody th {
          font-weight: bold;
          font-size: 9pt;
        }

        .bg-break {
          background-color: #616161 !important;
          color: #ffffff;
          font-weight: bold;
          font-size: 8pt;
          width: 35px;
        }

        .subject-name {
          font-weight: bold;
          display: block;
          color: #000;
        }

        .teacher-name {
          font-size: 7.5pt;
          color: #444;
          font-style: italic;
          display: block;
          margin-top: 2px;
        }

        ${days
          .map(
            (hari) => `
        tr.day-${hari.toLowerCase()} th {
          background-color: ${dayAccent[hari]};
          color: #ffffff;
        }
        tr.day-${hari.toLowerCase()} td:not(.bg-break) {
          background-color: ${dayColors[hari]};
        }
        `,
          )
          .join("")}
      </style>
    </head>
    <body>
      ${classesData
        .map((cls) => {
          const mapels = cls.Mapels || [];
          return `
          <div class="page-kelas">
            <div class="header">
              <h2>JADWAL PELAJARAN</h2>
              <h3>KELAS: ${esc(cls.class_name)}</h3>
            </div>
            <table class="jadwal-table">
              <thead>
                <tr>
                  <th style="width: 70px;">Hari</th>
                  <th>1</th>
                  <th>2</th>
                  <th>3</th>
                  <th>4</th>
                  <th class="bg-break">Istirahat</th>
                  <th>5</th>
                  <th>6</th>
                  <th>7</th>
                  <th class="bg-break">Ishoma</th>
                  <th>8</th>
                  <th>9</th>
                  <th>10</th>
                  <th>11</th>
                </tr>
              </thead>
              <tbody>
                ${days
                  .map(
                    (hari) => `
                  <tr class="day-${hari.toLowerCase()}">
                    <th>${hari}</th>
                    ${[1, 2, 3, 4]
                      .map((jam) => renderMapelCell(mapels, hari, jam))
                      .join("")}
                    <td class="bg-break">I<br>S<br>T</td>
                    ${[5, 6, 7]
                      .map((jam) => renderMapelCell(mapels, hari, jam))
                      .join("")}
                    <td class="bg-break">I<br>S<br>H<br>O</td>
                    ${[8, 9, 10, 11]
                      .map((jam) => renderMapelCell(mapels, hari, jam))
                      .join("")}
                  </tr>
                `,
                  )
                  .join("")}
              </tbody>
            </table>
          </div>
        `;
        })
        .join("")}
    </body>
    </html>
  `;
};
//get schedule
const getSchedule = async (req, res, next) => {
  try {
    const { day, classId } = req.query;

    const classData = await Class.findByPk(classId, {
      include: [
        {
          model: Mapel,
          as: "Mapels",
          attributes: ["id_mapel"],
        },
      ],
    });
    if (!classData) {
      return res.status(404).json({ message: "Class not found" });
    }
    if (!day || !["Senin", "Selasa", "Rabu", "Kamis", "Jumat"].includes(day)) {
      return res
        .status(400)
        .json({ message: "Invalid or missing 'day' parameter" });
    }

    const schedulesData = await ScheduleMapel.findAll({
      where: {
        day: day,
        id_mapel: classData.Mapels.map((mapel) => mapel.id_mapel),
      },
      attributes: ["jp"],
    });
    res.json(schedulesData);
  } catch (error) {
    next(error);
  }
};

module.exports = { printDataJadwalPDF, getSchedule };
