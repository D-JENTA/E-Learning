/**
 * Debug Utility untuk Testing Cookie Logout
 * Gunakan ini di DevTools Console untuk debugging
 */

// ✅ Check semua cookies yang ada
const checkCookies = () => {
  console.log('=== CURRENT COOKIES ===');
  console.log('document.cookie:', document.cookie || '(empty)');
  
  // Parse cookies
  const cookies = document.cookie.split('; ').filter(c => c);
  if (cookies.length === 0) {
    console.log('✅ SEMUA COOKIES KOSONG');
  } else {
    console.log('❌ COOKIES MASIH ADA:');
    cookies.forEach(cookie => {
      const [name, value] = cookie.split('=');
      console.log(`  - ${name}: ${value.substring(0, 50)}...`);
    });
  }
};

// ✅ Check localStorage
const checkLocalStorage = () => {
  console.log('=== LOCAL STORAGE ===');
  if (localStorage.length === 0) {
    console.log('✅ LOCAL STORAGE KOSONG');
  } else {
    console.log('❌ LOCAL STORAGE MASIH ADA:');
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      const value = localStorage.getItem(key);
      console.log(`  - ${key}: ${value.substring(0, 50)}...`);
    }
  }
};

// ✅ Check sessionStorage
const checkSessionStorage = () => {
  console.log('=== SESSION STORAGE ===');
  if (sessionStorage.length === 0) {
    console.log('✅ SESSION STORAGE KOSONG');
  } else {
    console.log('❌ SESSION STORAGE MASIH ADA:');
    for (let i = 0; i < sessionStorage.length; i++) {
      const key = sessionStorage.key(i);
      const value = sessionStorage.getItem(key);
      console.log(`  - ${key}: ${value.substring(0, 50)}...`);
    }
  }
};

// ✅ Full check semua storage
const checkAllStorage = () => {
  console.clear();
  console.log('🔍 === FULL STORAGE CHECK ===\n');
  checkLocalStorage();
  console.log('\n');
  checkSessionStorage();
  console.log('\n');
  checkCookies();
  console.log('\n============================');
};

// ✅ Test logout function
const testLogout = async () => {
  console.log('🚀 Testing Logout...\n');
  
  // Check sebelum logout
  console.log('📍 SEBELUM LOGOUT:');
  checkAllStorage();
  
  // Tunggu user klik logout
  console.log('\n⏳ Silakan klik tombol LOGOUT di UI...');
  
  // Wait 2 detik
  await new Promise(resolve => setTimeout(resolve, 2000));
  
  // Check sesudah logout
  console.log('\n\n📍 SESUDAH LOGOUT:');
  checkAllStorage();
};

// ✅ Simulate token di localStorage untuk testing
const setFakeToken = () => {
  const fakeToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MTI2LCJyb2xlIjoic3R1ZGVudCIsImlhdCI6MTc3NjA2NjMzNywiZXhwIjoxNzc2MTUyNzM3fQ.w6N4dHeh-jUbym8xsiyIELpUXreL6Pf-nj2kx61areI';
  localStorage.setItem('token', fakeToken);
  localStorage.setItem('user', JSON.stringify({ id: 126, role: 'student' }));
  console.log('✅ Fake token dan user sudah ditambah ke localStorage');
  checkCookies();
};

// ✅ Manual cookie test (untuk non-HttpOnly cookies)
const testManualClearCookie = () => {
  const testCookieName = 'test_logout_token';
  
  // Set cookie
  document.cookie = `${testCookieName}=testvalue; path=/`;
  console.log(`✅ Test cookie set: ${testCookieName}=testvalue`);
  console.log('Current cookies:', document.cookie);
  
  // Clear dengan berbagai cara
  console.log('\n🔄 Attempting to clear cookie...\n');
  
  document.cookie = `${testCookieName}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; max-age=0`;
  document.cookie = `${testCookieName}=; max-age=-1`;
  
  console.log('After clear:', document.cookie || '(empty)');
  console.log('✅ Test complete');
};

// ✅ Export untuk digunakan
export {
  checkCookies,
  checkLocalStorage,
  checkSessionStorage,
  checkAllStorage,
  testLogout,
  setFakeToken,
  testManualClearCookie
};

// ✅ Helper console commands
console.log(`
╔════════════════════════════════════════════════════════════════╗
║         LOGOUT DEBUG UTILITY - Available Commands             ║
╚════════════════════════════════════════════════════════════════╝

📋 COMMANDS:

  checkAllStorage()         → Check semua storage (localStorage, sessionStorage, cookies)
  checkCookies()           → Check hanya cookies
  checkLocalStorage()      → Check hanya localStorage  
  checkSessionStorage()    → Check hanya sessionStorage
  testLogout()            → Test full logout flow
  setFakeToken()          → Set fake token untuk testing
  testManualClearCookie() → Test manual cookie clearing

🧪 TESTING WORKFLOW:

  1. setFakeToken()                    // Set fake data
  2. Klik tombol LOGOUT di UI
  3. checkAllStorage()                 // Verify semua terhapus

════════════════════════════════════════════════════════════════
`);
