import { Navigate, useLocation } from 'react-router-dom';

const ROLE_HOME_PATH = {
  teacher: '/teacher/dashboard',
  student: '/student/home',
  admin: '/admin/home',
};

const ProtectedRoute = ({ user, allowedRole, isLoading, children }) => {
  const location = useLocation();

  if (isLoading) {
    return (
      <div className="h-screen w-full flex items-center justify-center bg-[#f3f4f6]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-900" />
      </div>
    );
  }

  if (!user) {
    if (location.pathname === '/login') {
      return children;
    }

    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  if (allowedRole && user.role !== allowedRole) {
    const dest = ROLE_HOME_PATH[user.role] || '/login';

    if (location.pathname === dest) {
      return children;
    }

    return <Navigate to={dest} replace />;
  }

  return children;
};

export default ProtectedRoute;