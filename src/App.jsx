import { Routes, Route, Navigate, useNavigate, useLocation } from "react-router-dom";
import { useEffect, useState, useCallback } from "react";

import LandingPage from "./Pages/Auth/LandingPage";
import Login from "./Pages/Auth/Login";
import Create from "./Pages/Auth/Create";
import Forgot from "./Pages/Auth/Forgot";
import Verify from "./Pages/Auth/verify";
import Resetpassword from "./Pages/Auth/Resetpassword";

import UsersAdmin from "./Pages/Admin/UsersAdmin";
import StudentAdmin from "./Pages/Admin/StudentAdmin";
import TeacherAdmin from "./Pages/Admin/TeacherAdmin";
import ClassAdmin from "./Pages/Admin/ClassAdmin";
import CalendarAdmin from "./Pages/Admin/CalendarAdmin";
import SettingsAdmin from "./Pages/Admin/SettingsAdmin";
import SuperAdminManageUsers from "./Pages/Admin/SuperAdminManageUsers";
import SuperAdminDashboard from "./Pages/Admin/SuperAdminDashboard";
import AdminStudentClasses from "./Pages/Admin/Adminstudentclasses";
import AdminStudentClassTasks from "./Pages/Admin/Adminstudenttask";

import HomeStudent from "./Pages/Student/HomeStudent";
import ClassStudent from "./Pages/Student/ClassStudent";
import TaskStudent from "./Pages/Student/TaskStudent";
import CoursesStudent from "./Pages/Student/CoursesStudent";
import LessonStudent from "./Pages/Student/LessonStudent";
import MateriStudent from "./Pages/Student/MateriStudent";
import PlustaskStudent from "./Pages/Student/PlustaskStudent";
import CalendarStudent from "./Pages/Student/CalendarStudent";
import SettingsStudent from "./Pages/Student/SettingsStudent";
import JoinClass from "./Pages/Student/JoinClass";

import TeacherDashboard from "./Pages/Teacher/TeacherDashboard";
import ClassList from "./Pages/Teacher/ClassList";
import CreateClass from "./Pages/Teacher/CreateClass";
import ManageStudent from "./Pages/Teacher/ManageStudent";
import UploadLessons from "./Pages/Teacher/UploadLessons";
import CalendarTeacher from "./Pages/Teacher/CalendarTeacher";
import SettingsTeacher from "./Pages/Teacher/SettingsTeacher";
import ManageClass from "./Pages/Teacher/ManageClass";
import UploadTask from "./Pages/Teacher/UploadTask";
import TeacherAssignments from "./Pages/Teacher/TeacherAssignments";
import GradeAssignment from "./Pages/Teacher/GradeAssignment";
import StudentSubmissions from "./Pages/Teacher/StudentSubmissions";

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

  const [isInitialized, setIsInitialized] = useState(false);

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
          const normalizedUser = {
            ...data.user,
            role: normalizeRole(data.user.role),
          };

          localStorage.setItem("user", JSON.stringify(normalizedUser));
          setAuthState({ isLoading: false, user: normalizedUser });
          return;
        }
      }

      localStorage.removeItem("user");
      setAuthState({ isLoading: false, user: null });
    } catch (err) {
      localStorage.removeItem("user");
      setAuthState({ isLoading: false, user: null });
    } finally {
      setIsInitialized(true);
    }
  }, []);

  useEffect(() => {
    verifyUser();
  }, [verifyUser]);

  useEffect(() => {
    const handleLogout = () => {
      localStorage.removeItem("user");
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
    return (
      <div className="h-screen w-full flex flex-col items-center justify-center">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600 mb-2" />
        <p className="text-gray-500 text-sm">Loading Application...</p>
      </div>
    );
  }

  return (
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

      <Route path="/teacher/dashboard" element={<Guard allowedRoles="teacher" user={authState.user}><TeacherDashboard user={authState.user} /></Guard>} />
      <Route path="/teacher/classes" element={<Guard allowedRoles="teacher" user={authState.user}><ClassList user={authState.user} /></Guard>} />
      <Route path="/teacher/create-class" element={<Guard allowedRoles="teacher" user={authState.user}><CreateClass user={authState.user} /></Guard>} />
      <Route path="/teacher/manage-students/:id_class" element={<Guard allowedRoles="teacher" user={authState.user}><ManageStudent user={authState.user} /></Guard>} />
      <Route path="/teacher/upload-lessons" element={<Guard allowedRoles="teacher" user={authState.user}><UploadLessons user={authState.user} /></Guard>} />
      <Route path="/teacher/calendar" element={<Guard allowedRoles="teacher" user={authState.user}><CalendarTeacher user={authState.user} /></Guard>} />
      <Route path="/teacher/settings" element={<Guard allowedRoles="teacher" user={authState.user}><SettingsTeacher user={authState.user} /></Guard>} />
      <Route path="/teacher/manage-class/:id" element={<Guard allowedRoles="teacher" user={authState.user}><ManageClass user={authState.user} /></Guard>} />
      <Route path="/teacher/upload-task/:id_class" element={<Guard allowedRoles="teacher" user={authState.user}><UploadTask user={authState.user} /></Guard>} />
      <Route path="/teacher/assignments/:id" element={<Guard allowedRoles="teacher" user={authState.user}><TeacherAssignments user={authState.user} /></Guard>} />
      <Route path="/teacher/submissions/:id/:id_assignment" element={<Guard allowedRoles="teacher" user={authState.user}><StudentSubmissions user={authState.user} /></Guard>} />
      <Route path="/teacher/grade/:id_submission" element={<Guard allowedRoles="teacher" user={authState.user}><GradeAssignment user={authState.user} /></Guard>} />

      <Route path="/admin/users" element={<Guard allowedRoles="superAdmin" user={authState.user}><UsersAdmin /></Guard>} />
      <Route path="/admin/students" element={<Guard allowedRoles="superAdmin" user={authState.user}><StudentAdmin /></Guard>} />
      <Route path="/admin/teachers" element={<Guard allowedRoles="superAdmin" user={authState.user}><TeacherAdmin /></Guard>} />
      <Route path="/admin/classes" element={<Guard allowedRoles="superAdmin" user={authState.user}><ClassAdmin /></Guard>} />
      <Route path="/admin/calendar" element={<Guard allowedRoles="superAdmin" user={authState.user}><CalendarAdmin /></Guard>} />
      <Route path="/admin/settings" element={<Guard allowedRoles="superAdmin" user={authState.user}><SettingsAdmin /></Guard>} />
      <Route path="/admin/super-control" element={<Guard allowedRoles="superAdmin" user={authState.user}><SuperAdminManageUsers /></Guard>} />
      <Route path="/admin/super-dashboard" element={<Guard allowedRoles="superAdmin" user={authState.user}><SuperAdminDashboard /></Guard>} />

      <Route path="/admin/admin-classes" element={<Guard allowedRoles="superAdmin" user={authState.user}><Navigate to="/admin/students" replace /></Guard>} />
      <Route path="/admin/admin-classes/:id_user" element={<Guard allowedRoles="superAdmin" user={authState.user}><AdminStudentClasses /></Guard>} />
      <Route path="/admin/admin-classes/:id_user/:id_class/tasks" element={<Guard allowedRoles="superAdmin" user={authState.user}><AdminStudentClassTasks /></Guard>} />

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default App;