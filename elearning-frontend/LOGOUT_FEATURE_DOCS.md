# Fitur Logout - Dokumentasi

## Penjelasan Singkat

Fitur logout telah diintegrasikan dengan API backend Anda. Ketika user mengklik tombol "Logout", aplikasi akan:

1. ✅ Mengirim permintaan DELETE ke `http://localhost:5000/api/auth/logout` dengan Bearer token
2. ✅ Menghapus semua data lokal (localStorage, sessionStorage, cookies)
3. ✅ Mengarahkan user ke halaman login

---

## Struktur File

### 1. **authService.js** (`src/services/authService.js`)
Layanan pusat untuk autentikasi yang menangani:
- Logout API call
- Pembersihan data lokal
- Penghapusan cookies dari berbagai path
- Helper functions untuk mengecek autentikasi

### 2. **useLogout Hook** (`src/hooks/useLogout.js`)
Custom React hook yang dapat digunakan di komponen mana saja untuk logout

### 3. **Updated Sidebars**
- Admin: `src/components/Admin/Sidebar.jsx`
- Student: `src/components/Student/SidebarStudent.jsx`
- Teacher: `src/components/Teacher/SidebarTeacher.jsx`

### 4. **axios.js** (Updated)
Konfigurasi axios dengan:
- Request interceptor: Otomatis menambahkan token ke header
- Response interceptor: Handle 401 errors (token expired)

---

## Cara Menggunakan

### Opsi 1: Menggunakan authService (Rekomendasi)

```javascript
import authService from '../services/authService';

// Di dalam komponen atau handler
const handleLogout = async () => {
  try {
    await authService.logout();
    navigate("/login");
  } catch (error) {
    console.error('Logout failed:', error);
  }
};
```

### Opsi 2: Menggunakan useLogout Hook

```javascript
import { useLogout } from '../hooks/useLogout';

export default function MyComponent() {
  const { logout } = useLogout();

  const handleLogout = async () => {
    await logout();
    // User akan otomatis diarahkan ke /login
  };

  return (
    <button onClick={handleLogout}>
      Logout
    </button>
  );
}
```

### Opsi 3: Menggunakan di Sidebar (Sudah Implementasi)

Semua sidebar sudah menggunakan logout dengan benar:

```javascript
const handleLogout = async () => {
  try {
    await authService.logout();
    navigate("/login", { replace: true });
  } catch (error) {
    console.error('Logout failed:', error);
    navigate("/login", { replace: true });
  }
};
```

---

## API Endpoint

```
METHOD: DELETE
URL: http://localhost:5000/api/auth/logout
HEADER: Authorization: Bearer <token>
RESPONSE: Text response dari server
```

---

## Error Handling

Jika API call gagal (network error, server error, dll):
- Aplikasi akan tetap membersihkan data lokal
- User akan tetap diarahkan ke halaman login
- Error akan di-log ke console

---

## Features

✅ **Automatic Token Injection** - Token otomatis ditambahkan ke setiap request via axios interceptor
✅ **401 Handling** - Otomatis logout jika token expired (401 response)
✅ **Cookie Cleanup** - Menghapus cookies dari multiple paths
✅ **Error Resilient** - Logout berhasil meski API call gagal
✅ **Type Safe** - Cocok dengan React hooks

---

## Testing Logout

1. Login dengan akun user
2. Check localStorage di DevTools (F12) - lihat token ada
3. Klik tombol Logout di sidebar
4. Verifikasi:
   - localStorage kosong
   - User diarahkan ke /login
   - Network tab menunjukkan DELETE request ke `/api/auth/logout`

---

## Troubleshooting

**Masalah**: Logout button tidak berfungsi
- Check browser console untuk error messages
- Verifikasi token ada di localStorage
- Check network request di DevTools

**Masalah**: User tidak diarahkan ke login
- Check React Router setup di App.jsx
- Verifikasi `/login` route terdaftar

**Masalah**: Token masih ada di localStorage
- Check apakah Ada error di authService.logout()
- Verifikasi localStorage.clear() tidak di-block

---

## Best Practices

1. ✅ Selalu gunakan `authService.logout()` untuk logout
2. ✅ Handle errors dengan try-catch
3. ✅ Jangan hardcode token di komponen
4. ✅ Gunakan axios interceptor untuk otomatis inject token
5. ✅ Check isDev mode saat testing di localhost:5000

---

## Version History

- **v1.0** - Initial implementation dengan API integration
- **v1.1** - Added custom hook `useLogout` untuk reusability
- **v1.2** - Added axios interceptors untuk automatic token injection
