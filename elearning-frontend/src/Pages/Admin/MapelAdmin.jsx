import React, { useState, useEffect, useRef, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import MainLayout from "../../components/Admin/MainLayout";
import CustomSelect from "../../components/Admin/CustomSelect";
import Toast from "../../components/Toast";

const JP_OPTIONS = Array.from({ length: 11 }, (_, i) => String(i + 1));

const DAY_OPTIONS = [
  { value: "senin", label: "Senin" },
  { value: "selasa", label: "Selasa" },
  { value: "rabu", label: "Rabu" },
  { value: "kamis", label: "Kamis" },
  { value: "jumat", label: "Jumat" },
];

const IconEye = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/>
  </svg>
);

const extractDay = (item) => {
  if (!item) return "";

  const resolveValue = (val) => {
    if (!val) return "";
    if (typeof val === "string" || typeof val === "number") return String(val);
    if (Array.isArray(val)) {
      const first = val.find((v) => v !== null && v !== undefined && v !== "");
      return first !== undefined ? resolveValue(first) : "";
    }
    if (typeof val === "object") {
      return (
        val.nama_hari ??
        val.day_name ??
        val.dayName ??
        val.name ??
        val.hari ??
        val.day ??
        ""
      );
    }
    return "";
  };

  const directCandidates = [
    item.day,
    item.hari,
    item.nama_hari,
    item.day_name,
    item.dayName,
    item.hari_pelajaran,
    item.class_day,
    item.jadwal_hari,
  ];

  for (const candidate of directCandidates) {
    const resolved = resolveValue(candidate);
    if (resolved) return resolved;
  }

  const nestedCandidates = [item.schedule, item.schedules, item.jadwal, item.jadwals];

  for (const nested of nestedCandidates) {
    if (!nested) continue;
    const entry = Array.isArray(nested) ? nested[0] : nested;
    if (!entry) continue;

    const resolved = resolveValue(
      entry.day ?? entry.hari ?? entry.nama_hari ?? entry.day_name ?? entry.dayName
    );
    if (resolved) return resolved;
  }

  return "";
};

  export default function MapelAdmin() {
  const navigate = useNavigate();
  const [classes, setClasses] = useState([]);
  const [selectedClass, setSelectedClass] = useState("");
  const [selectedDay, setSelectedDay] = useState("all");
  const [mapels, setMapels] = useState([]);
  const [isLoadingClasses, setIsLoadingClasses] = useState(true);
  const [isLoadingMapels, setIsLoadingMapels] = useState(false);
  const [fetchError, setFetchError] = useState(null);
  const [teachers, setTeachers] = useState([]);
  const [editing, setEditing] = useState(null);
  const [editForm, setEditForm] = useState({ mapel_name: "", id_teacher: "", jp: [], day: "" });
  const [isSaving, setIsSaving] = useState(false);
  const [alertInfo, setAlertInfo] = useState({ show: false, message: '', type: 'success' });
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [isPrinting, setIsPrinting] = useState(false);

  // State untuk dropdown JP di modal edit
  const [isJpOpen, setIsJpOpen] = useState(false);
  const [takenJp, setTakenJp] = useState([]);
  const [isLoadingJp, setIsLoadingJp] = useState(false);
  const jpDropdownRef = useRef(null);

  // State untuk modal Create Mapel
  const [isCreating, setIsCreating] = useState(false);
  const [createForm, setCreateForm] = useState({ mapel_name: "", id_teacher: "", id_class: "", day: "senin", jp: [] });
  const [isCreateSaving, setIsCreateSaving] = useState(false);
  const [isCreateJpOpen, setIsCreateJpOpen] = useState(false);
  const [createTakenJp, setCreateTakenJp] = useState([]);
  const [isLoadingCreateJp, setIsLoadingCreateJp] = useState(false);
  const createJpDropdownRef = useRef(null);

  useEffect(() => {
    const loadClasses = async () => {
      try {
        const token = localStorage.getItem("token");
        const response = await fetch("/api/classes", {
          method: "GET",
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
          },
        });

        if (!response.ok) {
          throw new Error("Gagal memuat daftar kelas.");
        }

        const result = await response.json();
        const rawClasses = result.data ?? result;
        const loadedClasses = Array.isArray(rawClasses) ? rawClasses : [];

        setClasses(loadedClasses);

        if (loadedClasses.length > 0) {
          const firstId = loadedClasses[0].id_class ?? loadedClasses[0].id;
          setSelectedClass(String(firstId));
        }
      } catch (error) {
        console.error("Load classes error:", error);
        setFetchError(error.message || "Tidak dapat memuat kelas.");
      } finally {
        setIsLoadingClasses(false);
      }
    };

    loadClasses();
  }, []);

  useEffect(() => {
    const loadTeachers = async () => {
      try {
        const token = localStorage.getItem("token");
        const response = await fetch("/api/admin/users/teachers", {
          method: "GET",
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
          },
        });
        if (!response.ok) return;
        const data = await response.json();
        setTeachers(Array.isArray(data) ? data : []);
      } catch (error) {
        console.error("Load teachers error:", error);
      }
    };

    loadTeachers();
  }, []);

  const loadMapels = useCallback(async (signal) => {
    if (!selectedClass) {
      setMapels([]);
      return;
    }

    setFetchError(null);
    setIsLoadingMapels(true);

    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`/api/classes/${selectedClass}/mapels`, {
        method: "GET",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        signal,
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        throw new Error(errorData?.message || "Gagal memuat daftar mapel.");
      }

      const result = await response.json();

      let rawMapels;
      if (Array.isArray(result)) {
        rawMapels = result;
      } else if (Array.isArray(result?.data)) {
        rawMapels = result.data;
      } else if (result && typeof result === "object") {
        rawMapels = Object.values(result).flat();
      } else {
        rawMapels = [];
      }

      // Dedup per (id mapel + hari), BUKAN per id mapel saja: mapel yang
      // berjadwal di beberapa hari muncul sebagai entry terpisah per hari
      // (IPAS di "Senin" dan "Selasa"). Dedup per id mapel akan membuang
      // baris hari keduanya sehingga mapel tampak hilang di hari itu.
      const seen = new Set();
      const dedupedMapels = rawMapels.filter((item) => {
        const id = item.id_mapel ?? item.id;
        const key = `${id}-${extractDay(item)}`;
        if (seen.has(key)) return false;
        seen.add(key);
        return true;
      });

      // Satu mapel bisa punya BANYAK jadwal. Respons BE (objek ber-kunci hari,
      // mis. { Senin: [...], Selasa: [...] }) menuliskan mapel yang sama sekali
      // per hari — IPAS muncul di key "Senin" DAN "Selasa". Tiap entry dipecah
      // jadi satu baris tabel sendiri.
      const loadedMapels = dedupedMapels.flatMap((item, index) => {
        const teacherId =
          item.id_teacher ??
          item.teacher_id ??
          item.guru_id ??
          item.teacher?.id_teacher ??
          item.teacher?.id ??
          "";

        const base = {
          id: item.id_mapel ?? item.id ?? index,
          id_teacher: teacherId,
          mapelName: item.mapel_name ?? item.name ?? "Tanpa Nama",
          teacher: item.teacher_name ?? item.teacher?.username ?? item.teacher ?? "Belum ada guru",
        };

        // Bentuk respons bisa beda-beda antar versi BE: array jadwal datang
        // sebagai "schedules" (dibentuk manual controller) atau "Schedules"
        // (alias asosiasi Sequelize mentah). Kalau keduanya tidak ada, fallback
        // satu baris dari field day/jp level atas (hanya hari pertama).
        const scheduleSource = Array.isArray(item.schedules) && item.schedules.length > 0
          ? item.schedules
          : Array.isArray(item.Schedules) && item.Schedules.length > 0
          ? item.Schedules
          : null;

        const schedules = scheduleSource
          ? scheduleSource
          : [{ day: extractDay(item), jp: item.jp }];

        return schedules.map((schedule, sIdx) => {
          const jp = Array.isArray(schedule.jp)
            ? schedule.jp.join(",")
            : (schedule.jp ?? "");

          const day = schedule.day ?? schedule.hari ?? "";

          return {
            ...base,
            // key unik per baris (mapel sama bisa muncul beberapa baris)
            rowId: `${base.id}-${day}-${sIdx}`,
            // id jadwal spesifik (bukan id mapel) — dipakai saat edit supaya
            // BE bisa meng-update jadwal yang tepat, bukan jadwal pertama.
            // Belum dikirim BE versi sekarang; dikirim kalau tersedia.
            scheduleId: schedule.id_schedule ?? null,
            jp,
            day: String(day).toLowerCase(),
          };
        });
      });

      // Urutkan berdasarkan JP terkecil (ascending), jadi JP 1 di atas, JP 10 di bawah
      const getMinJp = (jpString) => {
        const numbers = String(jpString || "")
          .split(",")
          .map((v) => parseInt(v.trim(), 10))
          .filter((n) => !Number.isNaN(n));
        return numbers.length > 0 ? Math.min(...numbers) : Infinity;
      };

      const sortedMapels = [...loadedMapels].sort(
        (a, b) => getMinJp(a.jp) - getMinJp(b.jp)
      );

      setMapels(sortedMapels);
    } catch (error) {
      if (error.name !== "AbortError") {
        console.error("Load mapels error:", error);
        setFetchError(error.message || "Tidak dapat memuat mapel.");
        setMapels([]);
      }
    } finally {
      if (!signal || !signal.aborted) {
        setIsLoadingMapels(false);
      }
    }
  }, [selectedClass]);

  useEffect(() => {
    const controller = new AbortController();
    loadMapels(controller.signal);
    return () => controller.abort();
  }, [loadMapels]);

  // Dropdown filter hari: "Semua Hari" + hari standar Senin–Jumat.
  // Hari di data yang di luar daftar standar (mis. "sabtu") ikut ditambahkan
  // supaya mapelnya tetap bisa difilter.
  const DAY_ORDER = ["senin", "selasa", "rabu", "kamis", "jumat"];
  const dayFilterOptions = (() => {
    const known = new Set(DAY_OPTIONS.map((d) => d.value));
    const extraDays = mapels
      .map((m) => String(m.day || "").toLowerCase())
      .filter((d) => d && !known.has(d));
    const all = [...DAY_OPTIONS.map((d) => d.value), ...new Set(extraDays)];

    all.sort((a, b) => {
      const ia = DAY_ORDER.indexOf(a);
      const ib = DAY_ORDER.indexOf(b);
      if (ia === -1 && ib === -1) return a.localeCompare(b);
      if (ia === -1) return 1;
      if (ib === -1) return -1;
      return ia - ib;
    });

    return [
      { value: "all", label: "Semua Hari" },
      ...all.map((d) => ({ value: d, label: d.charAt(0).toUpperCase() + d.slice(1) })),
    ];
  })();

  const filteredMapels =
    selectedDay === "all"
      ? mapels
      : mapels.filter((m) => String(m.day || "").toLowerCase() === selectedDay);

  const confirmDelete = async () => {
    const id = deleteTarget.id;

    try {
      const token = localStorage.getItem("token");
      const response = await fetch("/api/mapels", {
        method: "DELETE",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({ id_mapel: id }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        throw new Error(errorData?.message || "Gagal menghapus mapel.");
      }

      setMapels((prev) => prev.filter((m) => m.id !== id));
    } catch (error) {
      console.error("Delete mapel error:", error);
      setAlertInfo({ show: true, message: error.message || "Tidak dapat menghapus mapel.", type: 'error' });
    } finally {
      setDeleteTarget(null);
    }
  };

  const expandJp = (jpValue) => {
    if (!jpValue) return [];
    return String(jpValue)
      .split(',')
      .flatMap((part) => {
        const trimmed = part.trim();
        if (trimmed.includes('-')) {
          const [start, end] = trimmed.split('-').map((n) => parseInt(n.trim(), 10));
          if (Number.isNaN(start) || Number.isNaN(end)) return [];
          const range = [];
          for (let i = start; i <= end; i++) range.push(String(i));
          return range;
        }
        return trimmed ? [trimmed] : [];
      });
  };

  // Warna badge JP — dirotasi supaya tiap jam pelajaran punya aksen warna sendiri,
  // bukan teks polos ber-koma seperti "1,3,5".
  const JP_BADGE_STYLES = [
    'bg-sky-100 text-sky-700 ring-sky-200',
    'bg-emerald-100 text-emerald-700 ring-emerald-200',
    'bg-amber-100 text-amber-700 ring-amber-200',
    'bg-violet-100 text-violet-700 ring-violet-200',
    'bg-rose-100 text-rose-700 ring-rose-200',
  ];

  const renderJpBadges = (jpValue) => {
    const list = expandJp(jpValue);
    if (!list.length) return <span className="text-sm text-gray-400">-</span>;

    return (
      // Di layar kecil (tablet/laptop kecil) badge dibuat kompak supaya beberapa JP
      // muat berdampingan dalam satu baris (tanpa melebarkan tabel/scrollbar);
      // di layar lg ke atas ukuran tetap seperti biasa.
      <div className="flex flex-wrap gap-0.5 lg:gap-1">
        {list.map((jp, idx) => (
          <span
            key={jp}
            className={`inline-flex items-center whitespace-nowrap rounded-md px-1.5 lg:px-2 py-0.5 text-[10px] lg:text-[11px] font-bold ring-1 ring-inset ${JP_BADGE_STYLES[idx % JP_BADGE_STYLES.length]}`}
          >
            JP {jp}
          </span>
        ))}
      </div>
    );
  };

  const toApiDay = (day) => {
    if (!day) return "";
    return day.charAt(0).toUpperCase() + day.slice(1).toLowerCase();
  };

  const fetchTakenJp = useCallback(async (signal) => {
    if (!selectedClass || !editForm.day || !editing) {
      setTakenJp([]);
      return;
    }

    setIsLoadingJp(true);
    try {
      const params = new URLSearchParams({
        classId: selectedClass,
        day: toApiDay(editForm.day),
      });

      const response = await fetch(`/api/schedule?${params.toString()}`, {
        method: 'GET',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        signal,
      });

      if (!response.ok) {
        throw new Error('Gagal memuat jadwal yang sudah terpakai');
      }

      const data = await response.json();
      const scheduleList = Array.isArray(data) ? data : (Array.isArray(data?.data) ? data.data : []);

      const otherSchedules = scheduleList.filter((item) => {
        const itemId = item.id_mapel ?? item.id;
        return itemId === undefined || itemId === null || String(itemId) !== String(editing.id);
      });

      const taken = otherSchedules.flatMap((item) => expandJp(item.jp));
      setTakenJp(taken);
    } catch (error) {
      if (error.name !== 'AbortError') {
        console.error("Load taken JP error:", error);
        setTakenJp([]);
      }
    } finally {
      setIsLoadingJp(false);
    }
  }, [selectedClass, editForm.day, editing]);

  useEffect(() => {
    if (!editing) return;
    const controller = new AbortController();
    const timer = setTimeout(() => {
      fetchTakenJp(controller.signal);
    }, 250);

    return () => {
      clearTimeout(timer);
      controller.abort();
    };
  }, [editing, selectedClass, editForm.day, fetchTakenJp]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (jpDropdownRef.current && !jpDropdownRef.current.contains(event.target)) {
        setIsJpOpen(false);
      }
      if (createJpDropdownRef.current && !createJpDropdownRef.current.contains(event.target)) {
        setIsCreateJpOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // JP milik baris yang sedang diedit. GET /api/schedule tidak mengembalikan
  // id_mapel, jadi JP milik mapel sendiri ikut terhitung "terpakai" di takenJp —
  // JP tersebut tetap boleh di-toggle supaya user bisa melepas/milih ulang jamnya.
  const ownJpSet = new Set(editing ? expandJp(editing.jp) : []);
  const isJpTaken = (jpValue) => takenJp.includes(jpValue) && !ownJpSet.has(jpValue);

  const toggleJp = (jpValue) => {
    if (isJpTaken(jpValue)) return;
    setEditForm((prev) => {
      const already = prev.jp.includes(jpValue);
      return {
        ...prev,
        jp: already
          ? prev.jp.filter((v) => v !== jpValue)
          : [...prev.jp, jpValue].sort((a, b) => Number(a) - Number(b)),
      };
    });
  };

  const fetchCreateTakenJp = useCallback(async (signal) => {
    if (!createForm.id_class || !createForm.day) {
      setCreateTakenJp([]);
      return;
    }

    setIsLoadingCreateJp(true);
    try {
      const token = localStorage.getItem("token");
      const params = new URLSearchParams({
        classId: createForm.id_class,
        day: toApiDay(createForm.day),
      });

      const response = await fetch(`/api/schedule?${params.toString()}`, {
        method: 'GET',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        signal,
      });

      if (response.status === 429) {
        throw new Error('Terlalu banyak permintaan.');
      }

      if (!response.ok) {
        throw new Error('Gagal memuat jadwal yang sudah terpakai');
      }

      const data = await response.json();
      const scheduleList = Array.isArray(data) ? data : (Array.isArray(data?.data) ? data.data : []);
      const taken = scheduleList.flatMap((item) => expandJp(item.jp));
      setCreateTakenJp(taken);

      setCreateForm((prev) => ({
        ...prev,
        jp: prev.jp.filter((j) => !taken.includes(j)),
      }));
    } catch (error) {
      if (error.name !== 'AbortError') {
        console.error("Load create taken JP error:", error);
        setCreateTakenJp([]);
        if (error.message.includes('Terlalu banyak permintaan')) {
          setAlertInfo({ show: true, message: error.message, type: 'error' });
        }
      }
    } finally {
      setIsLoadingCreateJp(false);
    }
  }, [createForm.id_class, createForm.day]);

  useEffect(() => {
    if (!isCreating) return;
    const controller = new AbortController();
    const timer = setTimeout(() => {
      fetchCreateTakenJp(controller.signal);
    }, 250);

    return () => {
      clearTimeout(timer);
      controller.abort();
    };
  }, [isCreating, createForm.id_class, createForm.day, fetchCreateTakenJp]);

  const toggleCreateJp = (jpValue) => {
    if (createTakenJp.includes(jpValue)) return;
    setCreateForm((prev) => {
      const already = prev.jp.includes(jpValue);
      return {
        ...prev,
        jp: already
          ? prev.jp.filter((v) => v !== jpValue)
          : [...prev.jp, jpValue].sort((a, b) => Number(a) - Number(b)),
      };
    });
  };

  const openCreate = () => {
    setCreateForm({
      mapel_name: "",
      // Guru opsional — default kosong, admin boleh pilih nanti (atau biarkan tanpa guru).
      id_teacher: "",
      id_class: selectedClass || "",
      day: "senin",
      jp: [],
    });
    setCreateTakenJp([]);
    setIsCreateJpOpen(false);
    setIsCreating(true);
  };

  const handleCreateSubmit = async (e) => {
    e.preventDefault();

    const mapelName = createForm.mapel_name.trim();
    // Guru opsional: boleh kosong, jadi tidak ikut divalidasi.
    if (!mapelName || !createForm.id_class || !createForm.day || createForm.jp.length === 0) {
      setAlertInfo({ show: true, message: 'Nama mapel, kelas, hari, dan JP wajib diisi.', type: 'error' });
      return;
    }

    setIsCreateSaving(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/admin/me/mapels', {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({
          mapel_name: mapelName,
          // Guru opsional — kirim null (bukan string kosong) kalau tidak dipilih.
          id_teacher: createForm.id_teacher || null,
          id_class: createForm.id_class,
          day: toApiDay(createForm.day),
          jp: createForm.jp.join(','),
        }),
      });

      const result = await response.json().catch(() => null);
      if (!response.ok) {
        throw new Error(result?.message || 'Gagal membuat mapel.');
      }

      setAlertInfo({ show: true, message: 'Mapel berhasil dibuat.', type: 'success' });
      setIsCreating(false);

      if (String(createForm.id_class) === String(selectedClass)) {
        loadMapels();
      } else {
        setSelectedClass(String(createForm.id_class));
      }
    } catch (error) {
      console.error("Create mapel error:", error);
      setAlertInfo({ show: true, message: error.message || 'Server error.', type: 'error' });
    } finally {
      setIsCreateSaving(false);
    }
  };

  const openEdit = (item) => {
    let foundTeacherId = "";
    if (item.id_teacher) {
      foundTeacherId = String(item.id_teacher);
    } else if (item.teacher) {
      const matchedTeacher = teachers.find(
        (t) => t.username.toLowerCase() === String(item.teacher).toLowerCase()
      );
      if (matchedTeacher) {
        foundTeacherId = String(matchedTeacher.id_teacher);
      }
    }

    setEditForm({ 
      mapel_name: item.mapelName || "", 
      id_teacher: foundTeacherId,
      jp: expandJp(item.jp),
      day: item.day ? String(item.day).toLowerCase() : ""
    });
    setIsJpOpen(false);
    setTakenJp([]);
    setEditing(item);
  };

  const handleSaveEdit = async (e) => {
    e.preventDefault();
    if (!editForm.mapel_name.trim()) {
      setAlertInfo({ show: true, message: "Nama mapel wajib diisi.", type: 'error' });
      return;
    }

    if (editForm.jp.length === 0) {
      setAlertInfo({ show: true, message: "JP wajib dipilih minimal satu.", type: 'error' });
      return;
    }

    setIsSaving(true);
    try {
      const token = localStorage.getItem("token");
      const jpString = editForm.jp.join(",");

      // Mapel yang berjadwal di beberapa hari muncul sebagai >1 baris dalam
      // satu kelas. Deteksi dua bentuk: (a) mapel yang sama (id sama) punya
      // beberapa jadwal, atau (b) ada baris lain bernama sama di kelas ini
      // (mapel kembar dengan id berbeda). Untuk kasus itu, jadwal
      // (jp/day/id_schedule) hanya dikirim kalau memang diubah — mengisi
      // guru/nama saja tidak boleh memicu notif "tidak bisa mengedit" dari BE
      // karena jadwalnya dikirim ulang tanpa perubahan. Mapel satu jadwal
      // tetap mengirim lengkap seperti sebelumnya.
      const isMultiScheduleMapel =
        mapels.filter((m) => String(m.id) === String(editing.id)).length > 1 ||
        mapels.some(
          (m) =>
            String(m.id) !== String(editing.id) &&
            String(m.mapelName || "").trim().toLowerCase() ===
              String(editing.mapelName || "").trim().toLowerCase()
        );
      const dayChanged =
        String(editForm.day).toLowerCase() !== String(editing.day).toLowerCase();
      const jpChanged =
        editForm.jp.join(",") !==
        [...expandJp(editing.jp)].sort((a, b) => Number(a) - Number(b)).join(",");
      const scheduleChanged =
        !isMultiScheduleMapel || dayChanged || jpChanged;

      const response = await fetch(`/api/admin/mapels/${editing.id}`, {
        method: "PUT",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({
          mapel_name: editForm.mapel_name.trim(),
          id_teacher: editForm.id_teacher || null,
          ...(scheduleChanged && {
            jp: jpString,
            // Backend menyimpan day kapital awal ("Senin"), sama seperti saat create.
            day: toApiDay(editForm.day),
            // Diteruskan kalau BE menyediakan id_schedule di daftar mapel —
            // supaya jadwal yang di-update adalah jadwal baris ini, bukan yang pertama.
            ...(editing.scheduleId ? { id_schedule: editing.scheduleId } : {}),
          }),
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        throw new Error(errorData?.message || "Gagal menyimpan perubahan.");
      }

      // Refetch dari server, bukan update optimis: backend meng-update Mapel
      // (nama, guru) + ScheduleMapel (day, jp) sekaligus, jadi data terbaru
      // paling aman diambil ulang dari GET /api/classes/:id/mapels.
      await loadMapels();
      setAlertInfo({ show: true, message: "Mapel berhasil diperbarui.", type: 'success' });
      setEditing(null);
    } catch (error) {
      console.error("Update mapel error:", error);
      setAlertInfo({ show: true, message: error.message || "Tidak dapat menyimpan perubahan.", type: 'error' });
    } finally {
      setIsSaving(false);
    }
  };

  // Cetak jadwal semua kelas ke PDF (endpoint admin-only: GET /api/print/jadwal).
  // Wajib lewat fetch + blob karena butuh header Authorization; window.open langsung akan 401.
  const handlePrintJadwal = async () => {
    try {
      setIsPrinting(true);
      const token = localStorage.getItem("token");
      const res = await fetch("/api/print/jadwal", {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!res.ok) {
        setAlertInfo({
          show: true,
          message:
            res.status === 403 ? "Hanya admin yang bisa cetak jadwal." :
            res.status === 401 ? "Sesi habis, silakan login ulang." :
            res.status === 429 ? "Terlalu banyak permintaan, tunggu sebentar." :
            `Gagal cetak jadwal (status ${res.status}).`,
          type: "error",
        });
        return;
      }

      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      window.open(url, "_blank");
      setTimeout(() => URL.revokeObjectURL(url), 15000);
    } catch {
      setAlertInfo({ show: true, message: "Gagal cetak jadwal.", type: "error" });
    } finally {
      setIsPrinting(false);
    }
  };

  // Navigasi ke halaman daftar tugas (read-only untuk admin).
  // Route /teacher/assignments/:id sudah diizinkan untuk role superAdmin di App.jsx,
  // dan komponen TeacherAssignments/StudentSubmissions sudah punya guard isAdmin
  // sendiri untuk menyembunyikan aksi buat/hapus/nilai.
  const handleViewTasks = (item) => {
    navigate(`/teacher/assignments/${item.id}`, {
      state: { id_class: selectedClass },
    });
  };

  return (
    <MainLayout>
      {/* Sembunyikan scrollbar bawaan browser di area yang bisa di-scroll
          (modal Buat Mapel & dropdown JP), tapi tetap bisa di-scroll */}
      <style>{`
        .custom-scrollbar {   
          scrollbar-width: none; /* Firefox */
          -ms-overflow-style: none; /* IE / Edge lama */
        }
        .custom-scrollbar::-webkit-scrollbar {
          display: none; /* Chrome, Edge, Safari */
          width: 0;
          height: 0;
        }
      `}</style>
      {alertInfo.show && (
        <Toast message={alertInfo.message} type={alertInfo.type} onClose={() => setAlertInfo({ ...alertInfo, show: false })} />
      )}
      <div className="animate-fade-in-up">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-8">
          <div>
            <h2 className="text-3xl font-bold text-gray-800">Daftar Mapel</h2>
            <p className="text-gray-500 mt-1">
              Lihat mapel yang telah dibuat.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-start gap-3 w-full lg:w-auto">
            <CustomSelect
              value={selectedClass}
              onChange={setSelectedClass}
              options={classes.map((kelas) => {
                const id = kelas.id_class ?? kelas.id;
                return {
                  value: String(id),
                  label: kelas.class_name ?? kelas.name ?? `Kelas ${id}`,
                };
              })}
              placeholder={isLoadingClasses ? "Memuat kelas..." : "Pilih kelas"}
              disabled={isLoadingClasses}
              searchable
              searchPlaceholder="Cari nama kelas..."
              variant="navy"
              className="w-full sm:w-52 lg:w-64"
            />

            <CustomSelect
              value={selectedDay}
              onChange={setSelectedDay}
              options={dayFilterOptions}
              placeholder="Pilih hari"
              variant="navy"
              className="w-full sm:w-36 lg:w-40"
            />

            {/* Aksi ditumpuk vertikal: "Buat Mapel" berada di bawah "Cetak Jadwal" */}
            <div className="flex flex-col gap-3 w-full sm:w-auto">
              <button
                type="button"
                onClick={handlePrintJadwal}
                disabled={isPrinting}
                className="flex items-center justify-center gap-2 rounded-xl bg-white border border-slate-200 px-4 py-2.5 text-sm font-semibold text-[#0d264f] shadow-sm hover:bg-slate-50 transition-all whitespace-nowrap disabled:opacity-50"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="6 9 6 2 18 2 18 9"></polyline>
                  <path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"></path>
                  <rect x="6" y="14" width="12" height="8"></rect>
                </svg>
                {isPrinting ? "Menyiapkan..." : "Cetak Jadwal"}
              </button>

              <button
                type="button"
                onClick={openCreate}
                className="flex items-center justify-center gap-2 rounded-xl bg-[#0d264f] px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-[#081a38] transition-all whitespace-nowrap"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="12" y1="5" x2="12" y2="19"></line>
                  <line x1="5" y1="12" x2="19" y2="12"></line>
                </svg>
                Buat Mapel
              </button>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="overflow-x-auto">
            {isLoadingMapels ? (
              <div className="p-8 text-center text-gray-500">Memuat mapel...</div>
            ) : fetchError ? (
              <div className="p-8 text-center text-red-500">{fetchError}</div>
            ) : (
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-gray-50 text-gray-500 text-xs font-bold uppercase tracking-wider border-b border-gray-200">
                    <th className="px-3 lg:px-6 py-4 w-[80px]">No</th>
                    <th className="px-3 lg:px-6 py-4">Nama Mapel</th>
                    <th className="px-3 lg:px-6 py-4">Guru</th>
                    <th className="px-3 lg:px-6 py-4">JP</th>
                    <th className="px-3 lg:px-6 py-4">Hari</th>
                    <th className="px-3 lg:px-6 py-4 text-center">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {filteredMapels.length === 0 ? (
                    <tr>
                      <td colSpan="6" className="px-6 py-8 text-center text-gray-400">
                        {selectedDay === "all"
                          ? "Belum ada mapel untuk kelas ini."
                          : `Belum ada mapel di hari ${dayFilterOptions.find((d) => d.value === selectedDay)?.label ?? selectedDay}.`}
                      </td>
                    </tr>
                  ) : (
                    filteredMapels.map((item, i) => (
                      <tr key={item.rowId ?? item.id} className="hover:bg-gray-50 transition-colors duration-150 group">
                        <td className="px-3 lg:px-6 py-4 text-sm font-medium text-gray-500">{i + 1}</td>
                        <td className="px-3 lg:px-6 py-4">
                          <span className="text-sm font-bold text-gray-800">{item.mapelName}</span>
                        </td>
                        <td className="px-3 lg:px-6 py-4">
                          {item.teacher && item.teacher !== "Belum ada guru" ? (
                            <span className="inline-flex items-center gap-1.5 rounded-full bg-blue-50 px-2.5 py-1 text-xs font-semibold text-blue-700 ring-1 ring-inset ring-blue-100">
                              <span className="h-1.5 w-1.5 rounded-full bg-blue-500"></span>
                              {item.teacher}
                            </span>
                          ) : (
                            <span className="inline-flex items-center rounded-full bg-gray-100 px-2.5 py-1 text-xs font-medium italic text-gray-400">
                              Belum ada guru
                            </span>
                          )}
                        </td>
                        <td className="px-3 lg:px-6 py-4">{renderJpBadges(item.jp)}</td>
                        <td className="px-3 lg:px-6 py-4 text-sm text-gray-600 capitalize">{item.day || "-"}</td>
                        <td className="px-3 lg:px-6 py-4">
                          <div className="flex items-center justify-center gap-2">
                            <button
                              onClick={() => handleViewTasks(item)}
                              className="inline-flex items-center gap-1.5 text-[#0d264f] hover:text-white hover:bg-[#0d264f] border border-[#0d264f]/30 hover:border-[#0d264f] rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors duration-150"
                              title="Lihat tugas untuk mapel ini"
                            >
                              <IconEye />
                              Lihat Tugas
                            </button>
                            <button
                              onClick={() => openEdit(item)}
                              className="text-[#0d264f] hover:text-white hover:bg-[#0d264f] border border-[#0d264f]/30 hover:border-[#0d264f] rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors duration-150"
                            >
                              Edit
                            </button>
                            <button
                              onClick={() => setDeleteTarget({ id: item.id, name: item.mapelName })}
                              className="text-red-500 hover:text-white hover:bg-red-500 border border-red-200 hover:border-red-500 rounded-lg p-2 transition-colors duration-150"
                              title="Hapus"
                            >
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <polyline points="3 6 5 6 21 6"></polyline>
                                <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                                <line x1="10" y1="11" x2="10" y2="17"></line>
                                <line x1="14" y1="11" x2="14" y2="17"></line>
                              </svg>
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            )}
          </div>
        </div>
      
        {editing && (
          <div
            onClick={(e) => { if (e.target === e.currentTarget) setEditing(null); }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 overflow-y-auto custom-scrollbar"
          >
            <div className="w-full max-w-md my-8 rounded-2xl bg-white p-6 shadow-2xl">
              <h3 className="text-xl font-bold text-gray-800 mb-4">Edit Mapel</h3>
              <form onSubmit={handleSaveEdit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-600 mb-1">Nama Mapel</label>
                  <input
                    type="text"
                    value={editForm.mapel_name}
                    onChange={(e) => setEditForm({ ...editForm, mapel_name: e.target.value })}
                    className="w-full rounded-xl border border-gray-300 px-4 py-2.5 text-gray-700 focus:border-[#0d264f] focus:outline-none focus:ring-2 focus:ring-[#0d264f]/20"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-600 mb-1">Guru <span className="font-normal text-gray-400">(opsional)</span></label>
                  <CustomSelect
                    value={editForm.id_teacher}
                    onChange={(val) => setEditForm({ ...editForm, id_teacher: val })}
                    options={teachers.map((t) => ({
                      value: String(t.id_teacher),
                      label: t.username,
                    }))}
                    placeholder="Pilih guru (opsional)"
                    searchable
                    searchPlaceholder="Cari nama guru..."
                    variant="navy"
                    clearable
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-600 mb-1">Hari</label>
                  <CustomSelect
                    value={editForm.day}
                    onChange={(val) => setEditForm({ ...editForm, day: val })}
                    options={DAY_OPTIONS}
                    placeholder="Pilih hari"
                    variant="navy"
                  />
                </div>

                {/* JP sebagai dropdown checkbox, dengan indikator "Penuh" */}
                <div ref={jpDropdownRef} className="relative">
                  <label className="block text-sm font-medium text-gray-600 mb-1">JP (Jam Pelajaran)</label>
                  <button
                    type="button"
                    onClick={() => setIsJpOpen((prev) => !prev)}
                    className="w-full flex items-center justify-between rounded-xl border border-gray-300 bg-white px-4 py-2.5 text-left text-gray-700 shadow-sm transition focus:border-[#0d264f] focus:outline-none focus:ring-2 focus:ring-[#0d264f]/20"
                  >
                    <span className={editForm.jp.length ? 'text-gray-900 font-semibold' : 'text-gray-400'}>
                      {isLoadingJp
                        ? 'Memuat jam terpakai...'
                        : editForm.jp.length
                          ? `JP Terpilih: ${editForm.jp.join(', ')}`
                          : 'Pilih Jam Pelajaran'}
                    </span>
                    <svg width="18" height="18" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg" className={`text-gray-400 transition-transform duration-200 flex-shrink-0 ${isJpOpen ? 'rotate-180' : ''}`}>
                      <path d="M6 8L10 12L14 8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </button>

                  {isJpOpen && (
                    <div className="absolute left-0 right-0 z-30 mt-2 rounded-2xl border border-gray-100 bg-white p-4 shadow-xl">
                      <div className="flex items-center justify-between pb-3 mb-3 border-b border-gray-100">
                        <span className="text-xs font-bold uppercase tracking-wider text-gray-400">Pilih JP</span>
                        <span className="text-xs font-semibold text-sky-600">{editForm.jp.length} Dipilih</span>
                      </div>

                      <div className="grid grid-cols-3 gap-2.5 max-h-52 overflow-y-auto pr-1 custom-scrollbar">
                        {JP_OPTIONS.map((jp) => {
                          const isTaken = isJpTaken(jp);
                          const isChecked = editForm.jp.includes(jp);

                          return (
                            <label
                              key={jp}
                              className={`flex flex-col justify-between p-2.5 min-h-[56px] rounded-xl border text-sm font-semibold transition-all select-none cursor-pointer ${
                                isTaken
                                  ? 'bg-slate-100/80 text-slate-400 border-slate-200 cursor-not-allowed'
                                  : isChecked
                                  ? 'bg-sky-50 border-sky-500 text-sky-700 ring-2 ring-sky-500/20'
                                  : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50 hover:border-slate-300'
                              }`}
                            >
                              <div className="flex items-center justify-between w-full">
                                <div className="flex items-center gap-2">
                                  <input
                                    type="checkbox"
                                    checked={isChecked}
                                    disabled={isTaken}
                                    onChange={() => toggleJp(jp)}
                                    className="h-4 w-4 rounded border-slate-300 text-sky-600 focus:ring-sky-500 disabled:opacity-50 cursor-pointer"
                                  />
                                  <span className="whitespace-nowrap font-bold text-xs">JP {jp}</span>
                                </div>
                              </div>
                              {isTaken && (
                                <span className="self-start mt-1 text-[9px] font-bold uppercase px-1.5 py-0.5 rounded-md bg-rose-100 text-rose-600">
                                  Penuh
                                </span>
                              )}
                            </label>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>

                <div className="flex justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setEditing(null)}
                    className="rounded-xl border border-gray-300 px-4 py-2 text-sm font-semibold text-gray-600 hover:bg-gray-100"
                  >
                    Batal
                  </button>
                  <button
                    type="submit"
                    disabled={isSaving}
                    className="rounded-xl bg-[#0d264f] px-4 py-2 text-sm font-semibold text-white hover:bg-[#081a38] disabled:opacity-60"
                  >
                    {isSaving ? "Menyimpan..." : "Simpan"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {isCreating && (
          <div
            onClick={(e) => { if (e.target === e.currentTarget) setIsCreating(false); }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 overflow-y-auto custom-scrollbar"
          >
            <div className="w-full max-w-2xl my-8">
              <div className="bg-white border border-slate-200/80 rounded-3xl p-8 shadow-2xl">
                <div className="border-b border-slate-200 pb-5 mb-6">
                  <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Buat Mapel Baru</h1>
                  <p className="text-sm text-slate-500 font-medium">Lengkapi formulir di bawah ini untuk menambahkan mata pelajaran.</p>
                </div>

                <form onSubmit={handleCreateSubmit} className="space-y-6">
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-2">Nama Mapel</label>
                    <input
                      type="text"
                      value={createForm.mapel_name}
                      onChange={(e) => setCreateForm({ ...createForm, mapel_name: e.target.value })}
                      className="w-full rounded-2xl border border-slate-200 bg-slate-50/50 p-3.5 text-slate-800 font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 transition-all placeholder:text-slate-400"
                      placeholder="Masukkan nama mata pelajaran (Contoh: PAI, Matematika)"
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-2">Pilih Kelas</label>
                      <CustomSelect
                        value={createForm.id_class}
                        onChange={(val) => setCreateForm({ ...createForm, id_class: val })}
                        options={classes.map((kelas) => {
                          const id = kelas.id_class ?? kelas.id;
                          return {
                            value: String(id),
                            label: kelas.class_name ?? kelas.name ?? `Kelas ${id}`,
                          };
                        })}
                        placeholder={isLoadingClasses ? "Memuat kelas..." : "Pilih kelas"}
                        disabled={isLoadingClasses}
                        searchable
                        searchPlaceholder="Cari nama kelas..."
                        variant="sky"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-2">Pilih Guru <span className="normal-case font-medium text-slate-400">(opsional)</span></label>
                      <CustomSelect
                        value={createForm.id_teacher}
                        onChange={(val) => setCreateForm({ ...createForm, id_teacher: val })}
                        options={teachers.map((t) => ({
                          value: String(t.id_teacher),
                          label: t.username,
                        }))}
                        placeholder="Pilih guru (opsional)"
                        searchable
                        searchPlaceholder="Cari nama guru..."
                        variant="sky"
                        clearable
                      />
                    </div>
                  </div>

                  {/* Row 3: Hari & JP Popover */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-2">Hari</label>
                      <CustomSelect
                        value={createForm.day}
                        onChange={(val) => setCreateForm({ ...createForm, day: val })}
                        options={DAY_OPTIONS}
                        placeholder="Pilih hari"
                        variant="sky"
                      />
                    </div>

                    {/* Popover Dropdown JP */}
                    <div ref={createJpDropdownRef} className="relative">
                      <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-2">JP (Jam Pelajaran)</label>
                      <button
                        type="button"
                        onClick={() => setIsCreateJpOpen((prev) => !prev)}
                        className="w-full flex items-center justify-between rounded-2xl border border-slate-200 bg-slate-50/50 px-4 py-3.5 text-left text-slate-800 font-medium shadow-sm transition focus:bg-white focus:border-sky-500 focus:outline-none focus:ring-2 focus:ring-sky-500/20"
                      >
                        <span className={createForm.jp.length ? 'text-slate-900 font-semibold' : 'text-slate-400'}>
                          {isLoadingCreateJp
                            ? 'Memuat jam terpakai...'
                            : createForm.jp.length
                              ? `JP Terpilih: ${createForm.jp.join(', ')}`
                              : 'Pilih Jam Pelajaran'}
                        </span>
                        <svg width="18" height="18" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg" className={`text-slate-400 transition-transform duration-200 ${isCreateJpOpen ? 'rotate-180' : ''}`}>
                          <path d="M6 8L10 12L14 8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                      </button>

                      {/* Grid Box Checkbox Popover */}
                      {isCreateJpOpen && (
                        <div className="absolute right-0 z-30 mt-2 w-full min-w-[320px] sm:min-w-[380px] rounded-3xl border border-slate-100 bg-white p-4 shadow-xl transition-all">
                          <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-100">
                            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Pilih JP</span>
                            <span className="text-xs font-semibold text-sky-600">{createForm.jp.length} Dipilih</span>
                          </div>

                          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 max-h-60 overflow-y-auto pr-1 custom-scrollbar">
                            {JP_OPTIONS.map((jp) => {
                              const isTaken = createTakenJp.includes(jp);
                              const isChecked = createForm.jp.includes(jp);

                              return (
                                <label
                                  key={jp}
                                  className={`flex flex-col justify-between p-2.5 min-h-[58px] rounded-2xl border text-sm font-semibold transition-all select-none cursor-pointer ${
                                    isTaken
                                      ? 'bg-slate-100/80 text-slate-400 border-slate-200 cursor-not-allowed'
                                      : isChecked
                                      ? 'bg-sky-50 border-sky-500 text-sky-700 ring-2 ring-sky-500/20'
                                      : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50 hover:border-slate-300'
                                  }`}
                                >
                                  <div className="flex items-center justify-between w-full">
                                    <div className="flex items-center gap-2">
                                      <input
                                        type="checkbox"
                                        checked={isChecked}
                                        disabled={isTaken}
                                        onChange={() => toggleCreateJp(jp)}
                                        className="h-4 w-4 rounded border-slate-300 text-sky-600 focus:ring-sky-500 disabled:opacity-50 cursor-pointer"
                                      />
                                      <span className="whitespace-nowrap font-bold text-xs sm:text-sm">JP {jp}</span>
                                    </div>
                                  </div>
                                  {isTaken && (
                                    <span className="self-start mt-1 text-[9px] font-bold uppercase px-1.5 py-0.5 rounded-md bg-rose-100 text-rose-600">
                                      Penuh
                                    </span>
                                  )}
                                </label>
                              );
                            })}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-3 pt-2">
                    <button
                      type="button"
                      onClick={() => setIsCreating(false)}
                      className="flex-1 rounded-2xl border border-slate-200 py-4 text-slate-600 font-bold tracking-wide hover:bg-slate-50 transition-all"
                    >
                      Batal
                    </button>
                    <button
                      type="submit"
                      disabled={isCreateSaving}
                      className="flex-[2] rounded-2xl bg-[#0d264f] py-4 text-white font-bold tracking-wide hover:bg-[#081a38] focus:ring-4 focus:ring-[#0d264f]/30 transition-all shadow-lg shadow-[#0d264f]/10 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isCreateSaving ? (
                        <div className="flex items-center justify-center gap-2">
                          <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                          <span>Menyimpan...</span>
                        </div>
                      ) : (
                        'Buat Mapel'
                      )}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}

        {deleteTarget && (
          <div
            onClick={(e) => { if (e.target === e.currentTarget) setDeleteTarget(null); }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4"
          >
            <div className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-2xl">
              <h3 className="text-xl font-bold text-gray-800 mb-2">Hapus Mapel</h3>
              <p className="text-gray-500 mb-2">
                Yakin ingin menghapus mapel{" "}
                <span className="font-semibold text-gray-700">"{deleteTarget.name}"</span>?
              </p>
              <p className="text-sm text-red-600 mb-6">
                Semua jadwal, tugas, dan nilai ikut terhapus. Tidak dapat dibatalkan.
              </p>
              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setDeleteTarget(null)}
                  className="rounded-xl border border-gray-300 px-4 py-2 text-sm font-semibold text-gray-600 hover:bg-gray-100"
                >
                  Batal
                </button>
                <button
                  type="button"
                  onClick={confirmDelete}
                  className="rounded-xl bg-red-500 px-4 py-2 text-sm font-semibold text-white hover:bg-red-600"
                >
                  Hapus
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </MainLayout>
  );
}