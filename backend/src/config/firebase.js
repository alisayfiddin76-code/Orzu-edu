const { initializeApp, cert } = require('firebase-admin/app');
const { getStorage } = require('firebase-admin/storage');
let serviceAccount;

try {
  if (process.env.FIREBASE_SERVICE_ACCOUNT) {
    serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);
  } else {
    serviceAccount = require('./firebaseServiceAccount.json');
  }
} catch (error) {
  console.error("Firebase Service Account kaliti topilmadi! Render'da 'Secret File' sifatida qo'shish kerak yoki .env orqali JSON matnini FIREBASE_SERVICE_ACCOUNT ga kiriting.");
  throw error;
}

initializeApp({
  credential: cert(serviceAccount),
  storageBucket: 'orzuedu2025.firebasestorage.app' // Using standard new format or project_id.appspot.com
});

// For older firebase projects it's appspot.com, but we can also use gs://orzuedu2025.appspot.com
// Actually, let's use the explicit name orzuedu2025.appspot.com as it's the standard default
const bucket = getStorage().bucket('orzuedu2025.appspot.com');

module.exports = { bucket };
