import React, { useEffect, useState } from 'react';
import { ref, onValue, update, get } from 'firebase/database';
import { db } from '../firebase';

export default function Lobby({ room, roomCode, playerId, startGame, leaveRoom }) {
  const [players, setPlayers] = useState({});
  const [error, setError] = useState('');

  useEffect(() => {
    const playersRef = ref(db, `rooms/${roomCode}/players`);
    const unsub = onValue(playersRef, snap => {
      setPlayers(snap.val() || {});
    });
    return () => unsub();
  }, [roomCode]);

  const markReady = async () => {
    await update(ref(db, `rooms/${roomCode}/players/${playerId}`), { ready: true });
    // If all ready, optionally auto-start -- but host should start
  };

  const onStart = async () => {
    setError('');
    try {
      await startGame();
    } catch (e) {
      setError(e.message);
    }
  };

  return (
    <div className="card">
      <h2>Lobby — {roomCode}</h2>
      <div>Phase: {room.phase}</div>
      <div className="players">
        {Object.values(players).map(p => (
          <div key={p.id} className="player">
            <strong>{p.name}</strong>
            <div>{p.ready ? 'Ready' : 'Not ready'}</div>
          </div>
        ))}
      </div>

      <div className="row">
        <button onClick={markReady}>I'm Ready</button>
        {room.host === playerId && <button onClick={onStart}>Start Game</button>}
        <button onClick={leaveRoom}>Leave</button>
      </div>

      {error && <div className="error">{error}</div>}
    </div>
  );
}
