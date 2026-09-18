import { Routes, Route, Navigate, useNavigate, useLocation } from "react-router-dom";
import { lazy, Suspense, useEffect, useState, useCallback, useRef } from "react";

import { AuthProvider } from "./context/AuthContext";

// LandingPage sengaja TIDAK di-lazy: itu halaman pertama yang dilihat
// pengunjung publik, jadi menundanya hanya menambah waktu tampil.
import LandingPage from "./Pages/Auth/LandingPage";

// Halaman lain dipisah per-route dengan React.lazy supaya satu halaman tidak
// perlu mengunduh kode SEMUA halaman sekaligus (sebelumnya satu bundel 788KB).
// Yang paling terbantu: @fullcalendar yang cuma dipakai 3 halaman kalender,
// dan video 2,5MB yang cuma dipakai halaman verifikasi OTP.
const Login = lazy(() => import("./Pages/Auth/Login"));
const Create = lazy(() => import("./Pages/Auth/Create"));
const Forgot = lazy(() => import("./Pages/Auth/Forgot"));
const Verify = lazy(() => import("./Pages/Auth/verify"));
const Resetpassword = lazy(() => import("./Pages/Auth/Resetpassword"));

const StudentAdmin = lazy(() => import("./Pages/Admin/StudentAdmin"));
const TeacherAdmin = lazy(() => import("./Pages/Admin/TeacherAdmin"));
const ClassAdmin = lazy(() => import("./Pages/Admin/ClassAdmin"));
const CreateMapelAdmin = lazy(() => import("./Pages/Admin/CreateMapel"));
const MapelAdmin = lazy(() => import("./Pages/Admin/MapelAdmin"));
const CalendarAdmin = lazy(() => import("./Pages/Admin/CalendarAdmin"));
const SettingsAdmin = lazy(() => import("./Pages/Admin/SettingsAdmin"));
const SuperAdminManageUsers = lazy(() => import("./Pages/Admin/SuperAdminManageUser"));
const SuperAdminDashboard = lazy(() => import("./Pages/Admin/SuperadminDashboard"));
const AdminStudentClasses = lazy(() => import("./Pages/Admin/Adminstudentclasses"));
const AdminStudentClassTasks = lazy(() => import("./Pages/Admin/Adminstudenttask"));

const HomeStudent = lazy(() => import("./Pages/Student/HomeStudent"));
const ClassStudent = lazy(() => import("./Pages/Student/ClassStudent"));
const TaskStudent = lazy(() => import("./Pages/Student/TaskStudent"));
const CoursesStudent = lazy(() => import("./Pages/Student/CoursesStudent"));
const LessonStudent = lazy(() => import("./Pages/Student/LessonStudent"));
const MateriStudent = lazy(() => import("./Pages/Student/MateriStudent"));
const PlustaskStudent = lazy(() => import("./Pages/Student/PlustaskStudent"));
const CalendarStudent = lazy(() => import("./Pages/Student/CalendarStudent"));
const SettingsStudent = lazy(() => import("./Pages/Student/SettingsStudent"));
const JoinClass = lazy(() => import("./Pages/Student/JoinClass"));
const ProgressStudent = lazy(() => import("./Pages/Student/ProgressStudent"));

const TeacherDashboard = lazy(() => import("./Pages/Teacher/TeacherDashboard"));
const ClassList = lazy(() => import("./Pages/Teacher/ClassList"));
const ManageStudent = lazy(() => import("./Pages/Teacher/ManageStudent"));
const UploadLessons = lazy(() => import("./Pages/Teacher/UploadLessons"));
const CalendarTeacher = lazy(() => import("./Pages/Teacher/CalendarTeacher"));
const SettingsTeacher = lazy(() => import("./Pages/Teacher/SettingsTeacher"));
const ManageClass = lazy(() => import("./Pages/Teacher/ManageClass"));
const UploadTask = lazy(() => import("./Pages/Teacher/UploadTask"));
const TeacherAssignments = lazy(() => import("./Pages/Teacher/TeacherAssignments"));
const GradeAssignment = lazy(() => import("./Pages/Teacher/GradeAssignment"));
const StudentSubmissions = lazy(() => import("./Pages/Teacher/StudentSubmissions"));

// Dipakai saat aplikasi masih memastikan status login, dan sebagai fallback
// Suspense selagi chunk halaman yang dituju diunduh.
const PageLoader = ({ message = "Memuat halaman..." }) => (
  <div className="h-screen w-full flex flex-col items-center justify-center">
    <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600 mb-2" />
    <p className="text-gray-500 text-sm">{message}</p>
  </div>
);

const normalizeRole = (role) => {
  if (role === "admin" || role === "superadmin" || role === "super_admin") {
    return "superAdmin";
  }

  return role;
};

const ROLE_DEST = {
  superAdmin: "/admin/super-dashboard",
  teacher: "/teacher/dashboard",
  student: "/student/home",
};

// Rute yang bisa dibuka tanpa login. Di sini /api/auth/check-me sengaja TIDAK
// dipanggil: pengunjung publik tidak perlu menembak endpoint ber-proteksi
// (dulu itulah yang memunculkan 401 di console) dan halaman bisa langsung
// tampil tanpa sempat menampilkan spinner "Loading Application...".
const PUBLIC_PATHS = ["/", "/create", "/forgot", "/verify", "/reset-password"];

// /login tetap perlu dicek, tapi hanya kalau ada token tersimpan. Justru inilah
// yang membuat pengguna dengan sesi masih hidup otomatis dilempar ke dashboard
// sesuai perannya (lihat efek ROLE_DEST di bawah). Kalau belum pernah login,
// tidak ada gunanya menembak check-me — hasilnya cuma 401.
const LOGIN_PATHS = ["/login", "/admin/login"];

const hasStoredToken = () =>
  Boolean(localStorage.getItem("token") || localStorage.getItem("admin_token"));

// true = route ini butuh kepastian status login sebelum dirender.
const routeNeedsAuthCheck = (pathname) => {
  const path = (pathname || "/").toLowerCase();

  if (PUBLIC_PATHS.includes(path)) return false;
  if (LOGIN_PATHS.includes(path)) return hasStoredToken();

  return true;
};

const Guard = ({ allowedRoles, user, children }) => {
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  const roles = Array.isArray(allowedRoles) ? allowedRoles : [allowedRoles];
  const userRole = normalizeRole(user.role);

  if (!roles.includes(userRole)) {
    const dest = ROLE_DEST[userRole] || "/login";
    return <Navigate to={dest} replace />;
  }

  return children;
};

function App() {
  const navigate = useNavigate();
  const location = useLocation();

  const [authState, setAuthState] = useState({
    isLoading: true,
    user: null,
  });

  // Kalau halaman pertama yang dibuka memang publik, tidak ada yang perlu
  // ditunggu — sehingga spinner tidak sempat berkedip sebelum landing tampil.
  const [isInitialized, setIsInitialized] = useState(
    () => !routeNeedsAuthCheck(window.location.pathname)
  );

  // verifyUser() cukup sekali per sesi (App.jsx tidak pernah remount selama
  // sesi berjalan), sama seperti perilaku sebelumnya.
  const hasVerifiedRef = useRef(false);

  // Ambil data profil lengkap (username, foto) sekali saja di sini.
  // /api/auth/check-me cuma balikin { id, role } — nggak cukup buat
  // ditampilkan di topbar, jadi kita lengkapi dengan /api/auth/users/me.
  // Karena App.jsx tidak pernah remount selama sesi berjalan, fetch ini
  // hanya jalan SEKALI per sesi, bukan tiap kali pindah halaman.
  const fetchFullProfile = useCallback(async () => {
    try {
      const token = localStorage.getItem("token") || localStorage.getItem("admin_token");
      const res = await fetch("/api/auth/users/me", {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          "ngrok-skip-browser-warning": "69420",
        },
        credentials: "include",
      });

      if (!res.ok) return null;

      const json = await res.json();
      const data = json.data || json;

      return {
        username: data.username || null,
        profile_picture_url: data.profile_picture_url || null,
      };
    } catch (err) {
      console.error("Gagal mengambil profil lengkap:", err);
      return null;
    }
  }, []);

  const verifyUser = useCallback(async () => {
    try {
      const response = await fetch("/api/auth/check-me", {
        method: "GET",
        credentials: "include",
        headers: {
          Accept: "application/json",
          "ngrok-skip-browser-warning": "true",
        },
      });

      if (response.ok) {
        const data = await response.json();

        if (data.isAuthenticated && data.user) {
          let normalizedUser = {
            ...data.user,
            role: normalizeRole(data.user.role),
          };

          const profile = await fetchFullProfile();
          if (profile) {
            normalizedUser = { ...normalizedUser, ...profile };
          }

          // Cukup simpan di React state — tidak perlu disimpan ke
          // localStorage lagi. Setiap reload halaman, verifyUser() akan
          // jalan ulang dan mengambil data terbaru dari backend (via cookie).
          setAuthState({ isLoading: false, user: normalizedUser });
          return;
        }
      }

      setAuthState({ isLoading: false, user: null });
    } catch (err) {
      setAuthState({ isLoading: false, user: null });
    } finally {
      setIsInitialized(true);
    }
  }, [fetchFullProfile]);

  useEffect(() => {
    if (!routeNeedsAuthCheck(location.pathname)) {
      // Halaman publik: tidak ada request auth yang perlu ditunggu. Data user
      // yang sudah ada sengaja dipertahankan supaya berpindah dari halaman
      // dalam ke halaman publik tidak mengosongkan sesi yang sedang berjalan.
      setAuthState((prev) => (prev.isLoading ? { ...prev, isLoading: false } : prev));
      setIsInitialized(true);
      return;
    }

    if (hasVerifiedRef.current) return;
    hasVerifiedRef.current = true;
    verifyUser();
  }, [location.pathname, verifyUser]);

  useEffect(() => {
    const handleLogout = () => {
      localStorage.removeItem("pending_user_id");
      localStorage.removeItem("pending_role");
      localStorage.removeItem("pending_email");

      setAuthState({ isLoading: false, user: null });
      navigate("/login", { replace: true });
    };

    window.addEventListener("user-logout", handleLogout);

    return () => {
      window.removeEventListener("user-logout", handleLogout);
    };
  }, [navigate]);

  useEffect(() => {
    if (!isInitialized || !authState.user) return;

    const authPaths = ["/login", "/admin/login"];
    const currentPath = location.pathname.toLowerCase();

    if (!authPaths.includes(currentPath)) return;

    const userRole = normalizeRole(authState.user.role);
    const roleDest = ROLE_DEST[userRole];

    if (roleDest && location.pathname !== roleDest) {
      navigate(roleDest, { replace: true });
    }
  }, [isInitialized, authState.user, location.pathname, navigate]);

  if (!isInitialized) {
    return <PageLoader message="Loading Application..." />;
  }

  return (
    <AuthProvider user={authState.user}>
      <Suspense fallback={<PageLoader />}>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/create" element={<Create />} />
        <Route path="/login" element={<Login />} />
        <Route path="/admin/login" element={<Navigate to="/login" replace />} />
        <Route path="/forgot" element={<Forgot />} />
        <Route path="/verify" element={<Verify />} />
        <Route path="/reset-password" element={<Resetpassword />} />

        <Route path="/student/home" element={<Guard allowedRoles="student" user={authState.user}><HomeStudent /></Guard>} />
        <Route path="/student/class" element={<Guard allowedRoles="student" user={authState.user}><ClassStudent /></Guard>} />
        <Route path="/student/task/:id_class" element={<Guard allowedRoles="student" user={authState.user}><TaskStudent /></Guard>} />
        <Route path="/student/courses" element={<Guard allowedRoles="student" user={authState.user}><CoursesStudent /></Guard>} />
        <Route path="/student/lesson" element={<Guard allowedRoles="student" user={authState.user}><LessonStudent /></Guard>} />
        <Route path="/student/materi" element={<Guard allowedRoles="student" user={authState.user}><MateriStudent /></Guard>} />
        <Route path="/student/plus-task" element={<Guard allowedRoles="student" user={authState.user}><PlustaskStudent /></Guard>} />
        <Route path="/student/calendar" element={<Guard allowedRoles="student" user={authState.user}><CalendarStudent /></Guard>} />
        <Route path="/student/settings" element={<Guard allowedRoles="student" user={authState.user}><SettingsStudent /></Guard>} />
        <Route path="/student/join-class" element={<Guard allowedRoles="student" user={authState.user}><JoinClass /></Guard>} />
        <Route path="/student/progress" element={<Guard allowedRoles="student" user={authState.user}><ProgressStudent /></Guard>} />

        <Route path="/teacher/dashboard" element={<Guard allowedRoles="teacher" user={authState.user}><TeacherDashboard user={authState.user} /></Guard>} />
        <Route path="/teacher/classes" element={<Guard allowedRoles="teacher" user={authState.user}><ClassList user={authState.user} /></Guard>} />
        <Route path="/teacher/manage-class/:id" element={<Guard allowedRoles="teacher" user={authState.user}><ManageClass user={authState.user} /></Guard>} />
        <Route path="/teacher/manage-students/:id_class" element={<Guard allowedRoles="teacher" user={authState.user}><ManageStudent user={authState.user} /></Guard>} />
        <Route path="/teacher/upload-lessons" element={<Guard allowedRoles="teacher" user={authState.user}><UploadLessons user={authState.user} /></Guard>} />
        <Route path="/teacher/calendar" element={<Guard allowedRoles="teacher" user={authState.user}><CalendarTeacher user={authState.user} /></Guard>} />
        <Route path="/teacher/settings" element={<Guard allowedRoles="teacher" user={authState.user}><SettingsTeacher user={authState.user} /></Guard>} />
        <Route path="/teacher/upload-task/:id_class" element={<Guard allowedRoles="teacher" user={authState.user}><UploadTask user={authState.user} /></Guard>} />
        {/* Diubah: assignments & submissions sekarang juga bisa diakses superAdmin (view tugas guru + pengumpulan siswa) */}
        <Route path="/teacher/assignments/:id" element={<Guard allowedRoles={["teacher", "superAdmin"]} user={authState.user}><TeacherAssignments user={authState.user} /></Guard>} />
        <Route path="/teacher/submissions/:id/:id_assignment" element={<Guard allowedRoles={["teacher", "superAdmin"]} user={authState.user}><StudentSubmissions user={authState.user} /></Guard>} />
        <Route path="/teacher/grade/:id_submission" element={<Guard allowedRoles="teacher" user={authState.user}><GradeAssignment user={authState.user} /></Guard>} />

        {/* Halaman hub User sudah dihapus — menunya kini dropdown di sidebar.
            Path lama dialihkan ke daftar siswa supaya link lama tidak mati. */}
        <Route path="/admin/users" element={<Navigate to="/admin/students" replace />} />
        <Route path="/admin/students" element={<Guard allowedRoles="superAdmin" user={authState.user}><StudentAdmin /></Guard>} />
        <Route path="/admin/teachers" element={<Guard allowedRoles="superAdmin" user={authState.user}><TeacherAdmin /></Guard>} />
        <Route path="/admin/classes" element={<Guard allowedRoles="superAdmin" user={authState.user}><ClassAdmin /></Guard>} />
        <Route path="/admin/create-mapel" element={<Guard allowedRoles="superAdmin" user={authState.user}><CreateMapelAdmin user={authState.user} /></Guard>} />
        <Route path="/admin/mapels" element={<Guard allowedRoles="superAdmin" user={authState.user}><MapelAdmin /></Guard>} />
        <Route path="/admin/calendar" element={<Guard allowedRoles="superAdmin" user={authState.user}><CalendarAdmin /></Guard>} />
        <Route path="/admin/settings" element={<Guard allowedRoles="superAdmin" user={authState.user}><SettingsAdmin /></Guard>} />
        <Route path="/admin/super-control" element={<Guard allowedRoles="superAdmin" user={authState.user}><SuperAdminManageUsers /></Guard>} />
        <Route path="/admin/super-dashboard" element={<Guard allowedRoles="superAdmin" user={authState.user}><SuperAdminDashboard /></Guard>} />

        <Route path="/admin/admin-classes" element={<Guard allowedRoles="superAdmin" user={authState.user}><Navigate to="/admin/students" replace /></Guard>} />
        <Route path="/admin/admin-classes/:id_user" element={<Guard allowedRoles="superAdmin" user={authState.user}><AdminStudentClasses /></Guard>} />
        <Route path="/admin/admin-classes/:id_user/:id_class/tasks" element={<Guard allowedRoles="superAdmin" user={authState.user}><AdminStudentClassTasks /></Guard>} />

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
      </Suspense>
    </AuthProvider>
  );
}

export default App;