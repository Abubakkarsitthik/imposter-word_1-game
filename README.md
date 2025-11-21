# Imposter Word Game

This is a multiplayer social deduction word game built with React and Firebase Realtime Database.

Features:
- Create or join rooms using a 4-letter code
- 4–6 players per game
- One imposter receives a different (related) word
- Players give one-word hints, then vote to find the imposter

Local development

1. Install dependencies:

```bash
npm install
```

2. Start the dev server:

```bash
npm start
```

Firebase setup

1. Create a Firebase project at https://console.firebase.google.com/
2. Enable the Realtime Database and set rules to allow read/write during development (use secure rules in production).
3. Copy your Firebase config object and paste it into `src/firebase.js` replacing the placeholder values.

Deployment

Vercel:
- Install the Vercel CLI or connect your GitHub repo to Vercel.
- Build and deploy; Vercel will run `npm run build`.

Firebase Hosting:
1. Install Firebase Tools: `npm install -g firebase-tools`
2. `firebase login` and `firebase init` (select Hosting)
3. Configure `build` as the public directory and deploy with `firebase deploy` after `npm run build`.
