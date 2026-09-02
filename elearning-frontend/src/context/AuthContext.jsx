import { createContext, useContext } from "react";

// Menyimpan user yang sedang login (hasil verifyUser di App.jsx) supaya
// komponen layout seperti Topbar bisa membacanya langsung, tanpa perlu
// setiap halaman meneruskannya lewat props satu per satu.
const AuthContext = createContext(null);

export function AuthProvider({ user, children }) {
  return <AuthContext.Provider value={user}>{children}</AuthContext.Provider>;
}

export function useAuthUser() {
  return useContext(AuthContext);
}

export default AuthContext;
