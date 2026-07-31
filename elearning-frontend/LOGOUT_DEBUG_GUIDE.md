# 🔍 LOGOUT DEBUGGING GUIDE

## 📍 Masalah: Token Cookie Tidak Terhapus

Jika token di cookie masih ada setelah logout, ikuti langkah debugging ini:

---

## 🧪 Step-by-Step Testing

### Step 1: Import Debug Utility ke main.jsx

Edit `src/main.jsx`:

```javascript
import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './input.css'

// ✅ Import debug utility (hanya untuk development)
import * as logoutDebug from './utils/logoutDebug.js'

// ✅ Expose ke window agar bisa diakses di DevTools console
window.logoutDebug = logoutDebug

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)
```

### Step 2: Buka DevTools Console

Tekan `F12` → pilih tab **Console**

### Step 3: Set Fake Token untuk Testing

Jalankan:
```javascript
logoutDebug.setFakeToken()
```

**Output:**
```
✅ Fake token dan user sudah ditambah ke localStorage
Current cookies: (empty) atau mungkin ada cookies lain
```

### Step 4: Check Data Sebelum Logout

```javascript
logoutDebug.checkAllStorage()
```

**Output yang diharapkan:**
```
=== LOCAL STORAGE ===
❌ LOCAL STORAGE MASIH ADA:
  - token: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
  - user: {"id":126,"role":"student"}

=== SESSION STORAGE ===
✅ SESSION STORAGE KOSONG

=== CURRENT COOKIES ===
document.cookie: (empty)
✅ SEMUA COOKIES KOSONG
```

### Step 5: Klik Tombol LOGOUT di UI

- Pergi ke sidebar dan klik tombol **Logout**
- User akan dipindahkan ke `/login`

### Step 6: Check Data Sesudah Logout

```javascript
logoutDebug.checkAllStorage()
```

**Output yang diharapkan:**
```
=== LOCAL STORAGE ===
✅ LOCAL STORAGE KOSONG

=== SESSION STORAGE ===
✅ SESSION STORAGE KOSONG

=== CURRENT COOKIES ===
document.cookie: (empty)
✅ SEMUA COOKIES KOSONG
```

---

## 📊 Hasil Testing

### ✅ LOGOUT BERHASIL
Jika semua di atas kosong setelah logout

### ❌ LOGOUT GAGAL - Token Masih Ada
Jika masih ada `token` di localStorage atau cookies

**Kemungkinan Penyebab:**

1. **LocalStorage Tidak Terhapus**: 
   - Error di `authService.logout()`
   - Browser blocking `localStorage.clear()`

2. **Cookies Tidak Terhapus (HttpOnly)**:
   - Token adalah HttpOnly cookie
   - Hanya backend yang bisa clear
   - Update backend endpoint

3. **Cookies Tidak Terhapus (Regular Cookie)**:
   - Path configuration salah
   - Domain mismatch
   - Test dengan `testManualClearCookie()`

---

## 🔧 Troubleshooting

### Test 1: Manual Cookie Clear

```javascript
logoutDebug.testManualClearCookie()
```

Ini akan test apakah JavaScript bisa clear cookies. Jika gagal, cookies kemungkinan HttpOnly.

### Test 2: Check Browser Network Request

1. Buka DevTools → **Network** tab
2. Klik Logout
3. Cari request ke `/api/auth/logout`
4. Check **Response Headers** → harus ada:
   ```
   Set-Cookie: token=; Max-Age=0; Path=/
   ```

Jika tidak ada, **backend belum clear cookie**!

### Test 3: Full Logout Test

```javascript
await logoutDebug.testLogout()
```

Ini akan:
1. Show storage sebelum logout
2. Tunggu user klik logout
3. Show storage sesudah logout

---

## 📋 Checklist Debugging

- [ ] Debug utility sudah di-import di main.jsx
- [ ] F12 Console menampilkan pesan "Available Commands"
- [ ] `logoutDebug.setFakeToken()` berhasil
- [ ] `logoutDebug.checkAllStorage()` show data ada
- [ ] Klik Logout di UI
- [ ] `logoutDebug.checkAllStorage()` show semua kosong
- [ ] Check Network tab → ada Set-Cookie dari backend

---

## 💡 Jika Token Masih Ada Sesudah Logout

### Penyebab #1: localStorage Tidak Clear (Frontend Issue)

**Solution:**
- Check console errors (F12 Console tab)
- Verify `authService.logout()` executes properly
- Add breakpoint di logout function

### Penyebab #2: Cookies Tidak Clear (Backend Issue)

**Solution:**
- Backend endpoint tidak send Set-Cookie header
- Update backend (lihat `BACKEND_LOGOUT_SETUP.md`)
- Test network response punya `Set-Cookie` header

### Penyebab #3: HttpOnly + Secure Cookie

**Solution:**
- Backend harus clear via Set-Cookie
- Frontend tidak bisa clear HttpOnly cookie
- Tidak ada workaround

---

## 🎯 Quick Debug Flow

```javascript
// 1. Set fake data
logoutDebug.setFakeToken()

// 2. Check sebelum
logoutDebug.checkAllStorage()

// 3. Klik Logout (di UI)

// 4. Check sesudah
logoutDebug.checkAllStorage()

// 5. Kalau masih ada, check network request
// F12 → Network → Filter "logout" → Check Response Headers
```

---

## 📞 Support Info

Jika masih error:
1. Jalankan seluruh debug steps di atas
2. Screenshot console output
3. Check Network tab untuk Set-Cookie header
4. Verify backend endpoint responds dengan Set-Cookie

**Key Issue**: Jika localStorage clear tapi cookies tidak, error ada di **BACKEND**, bukan frontend!
