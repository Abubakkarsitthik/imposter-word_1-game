// Paste your Firebase config into the `firebaseConfig` object below.
// IMPORTANT: Replace each "PASTE_HERE" or "PASTE_YOUR_API_KEY_HERE" value
// with the corresponding value from your Firebase project settings.
// Example:
// const firebaseConfig = {
//   apiKey: "AIza...",
//   authDomain: "your-app.firebaseapp.com",
//   databaseURL: "https://your-app-default-rtdb.firebaseio.com",
//   projectId: "your-app-id",
//   storageBucket: "your-app.appspot.com",
//   messagingSenderId: "...",
//   appId: "1:...:web:..."
// };

const firebaseConfig = {
	apiKey: "AIzaSyBjtQ1dwGtBX4EKbntt3HwtqBjORqQ8IAM",
	authDomain: "impostergame1-ed1ed.firebaseapp.com",
	databaseURL: "https://impostergame1-ed1ed-default-rtdb.firebaseio.com",
	projectId: "impostergame1-ed1ed",
	storageBucket: "impostergame1-ed1ed.firebasestorage.app",
	messagingSenderId: "193511264208",
	appId: "1:193511264208:web:0b8058e696b074e2cc33d5"
};

// IMPORTANT: Paste your config above (replace each PASTE_HERE value).

import { initializeApp } from 'firebase/app';
import { getDatabase } from 'firebase/database';

const app = initializeApp(firebaseConfig);
const db = getDatabase(app);

export { db };
