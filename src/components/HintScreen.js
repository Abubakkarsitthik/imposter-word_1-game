import React, { useEffect, useState } from 'react';
import { ref, onValue, update, get } from 'firebase/database';
import { db } from '../firebase';

export default function HintScreen({ room, roomCode, playerId }) {
  const [hint, setHint] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [players, setPlayers] = useState({});

  useEffect(() => {
    const playersRef = ref(db, `rooms/${roomCode}/players`);
    const unsub = onValue(playersRef, snap => setPlayers(snap.val() || {}));
    return () => unsub();
  }, [roomCode]);

  const submitHint = async () => {
    const clean = hint.trim().split(' ')[0] || '';
    if (!clean) return;
    await update(ref(db, `rooms/${roomCode}/hints/${playerId}`), { hint: clean });
    setSubmitted(true);

    // check all hints
    const snap = await get(ref(db, `rooms/${roomCode}/players`));
    const currentPlayers = snap.val() || {};
    const pids = Object.keys(currentPlayers).filter(id => !currentPlayers[id].left);
    const hintsSnap = await get(ref(db, `rooms/${roomCode}/hints`));
    const hints = hintsSnap.val() || {};
    const allSubmitted = pids.every(id => hints[id]?.hint);
    if (allSubmitted) {
      await update(ref(db, `rooms/${roomCode}`), { phase: 'vote' });
    }
  };

  return (
    <div className="card">
      <h2>Hint Phase</h2>
      <div>Submit one-word hint related to your word</div>
      {!submitted ? (
        <div>
          <input value={hint} onChange={e => setHint(e.target.value)} placeholder="one-word hint" />
          <div className="row">
            <button onClick={submitHint}>Submit Hint</button>
          </div>
        </div>
      ) : (
        <div>Hint submitted. Waiting for others...</div>
      )}

      <div className="players-list">
        <h4>Players</h4>
        {Object.values(players).map(p => (
          <div key={p.id} className="player-row">{p.name} — {p.ready ? 'Ready' : 'Not Ready'}</div>
        ))}
      </div>
    </div>
  );
}
