import React, { useEffect, useState } from 'react';
import { ref, onValue, update, get } from 'firebase/database';
import { db } from '../firebase';

export default function WordScreen({ room, roomCode, playerId }) {
  const [player, setPlayer] = useState(null);
  useEffect(() => {
    const pRef = ref(db, `rooms/${roomCode}/players/${playerId}`);
    const unsub = onValue(pRef, snap => setPlayer(snap.val()));
    return () => unsub();
  }, [roomCode, playerId]);

  const ready = async () => {
    await update(ref(db, `rooms/${roomCode}/players/${playerId}`), { ready: true });

    // check if all ready
    const snap = await get(ref(db, `rooms/${roomCode}/players`));
    const players = snap.val() || {};
    const allReady = Object.values(players).filter(p => !p.left).every(p => p.ready);
    if (allReady) {
      await update(ref(db, `rooms/${roomCode}`), { phase: 'hint' });
    }
  };

  return (
    <div className="card">
      <h2>Your Word</h2>
      <div className="word-box">{player?.word || '...'}</div>
      <div>Role: {player?.role || '...'}</div>
      <div className="row">
        <button onClick={ready}>I'm Ready</button>
      </div>
    </div>
  );
}
