import { useNavigate } from 'react-router-dom';
import authService from '../services/authService';

/**
 * Custom hook for logout functionality
 * @returns {Object} Object with logout function and isLoading state
 */
export const useLogout = () => {
  const navigate = useNavigate();

  const logout = async () => {
    try {
      // Call the logout API and clear local data
      await authService.logout();
      
      // Navigate to login page
      navigate("/login", { replace: true });
      
      return { success: true, message: 'Logout successful' };
    } catch (error) {
      console.error('Logout error:', error);
      
      // Still navigate to login even if error occurs
      navigate("/login", { replace: true });
      
      return { success: false, message: error.message };
    }
  };

  return { logout };
};

export default useLogout;
