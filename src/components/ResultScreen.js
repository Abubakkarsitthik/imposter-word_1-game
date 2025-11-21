import React, { useEffect, useState } from 'react';
import { ref, onValue, update, get } from 'firebase/database';
import { db } from '../firebase';

export default function ResultScreen({ room, roomCode, playerId, leaveToHome }) {
  const [votedOut, setVotedOut] = useState(null);
  const [imposter, setImposter] = useState(null);
  const [players, setPlayers] = useState({});

  useEffect(() => {
    const rRef = ref(db, `rooms/${roomCode}`);
    const pRef = ref(db, `rooms/${roomCode}/players`);
    const unsubR = onValue(rRef, snap => setVotedOut(snap.val()?.votedOut || null));
    const unsubP = onValue(pRef, snap => setPlayers(snap.val() || {}));
    setImposter(room.imposterId || null);
    return () => { unsubR(); unsubP(); };
  }, [roomCode, room]);

  const computeWinner = () => {
    if (!votedOut) return 'No one';
    if (votedOut === room.imposterId) return 'Crewmates win!';
    return 'Imposter wins!';
  };

  const restart = async () => {
    // clear hints, votes, votedOut, reset player roles, words, ready
    const updates = { hints: null, votes: null, votedOut: null };
    Object.keys(players).forEach(pid => {
      updates[`players/${pid}/role`] = null;
      updates[`players/${pid}/word`] = null;
      updates[`players/${pid}/ready`] = false;
    });
    updates['phase'] = 'lobby';
    await update(ref(db, `rooms/${roomCode}`), updates);
  };

  return (
    <div className="card">
      <h2>Result</h2>
      <div>Voted Out: {votedOut ? (players[votedOut]?.name || votedOut) : '—'}</div>
      <div>Real Imposter: {room.imposterId ? (players[room.imposterId]?.name || room.imposterId) : '—'}</div>
      <div className="result-banner">{computeWinner()}</div>

      <div className="row">
        <button onClick={restart}>Restart (to Lobby)</button>
        <button onClick={leaveToHome}>Home</button>
      </div>
    </div>
  );
}
