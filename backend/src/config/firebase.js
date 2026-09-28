const admin = require('firebase-admin');
const serviceAccount = require('./firebaseServiceAccount.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  storageBucket: 'orzuedu2025.firebasestorage.app' // Using standard new format or project_id.appspot.com
});

// For older firebase projects it's appspot.com, but we can also use gs://orzuedu2025.appspot.com
// Actually, let's use the explicit name orzuedu2025.appspot.com as it's the standard default
const bucket = admin.storage().bucket('orzuedu2025.appspot.com');

module.exports = { bucket };
