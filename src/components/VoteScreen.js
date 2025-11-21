import React, { useEffect, useState } from 'react';
import { ref, onValue, update, get } from 'firebase/database';
import { db } from '../firebase';

export default function VoteScreen({ room, roomCode, playerId }) {
  const [players, setPlayers] = useState({});
  const [hints, setHints] = useState({});
  const [selected, setSelected] = useState('');
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    const pRef = ref(db, `rooms/${roomCode}/players`);
    const hRef = ref(db, `rooms/${roomCode}/hints`);
    const unsubP = onValue(pRef, snap => setPlayers(snap.val() || {}));
    const unsubH = onValue(hRef, snap => setHints(snap.val() || {}));
    return () => { unsubP(); unsubH(); };
  }, [roomCode]);

  const submitVote = async () => {
    if (!selected) return;
    await update(ref(db, `rooms/${roomCode}/votes/${playerId}`), { vote: selected });
    setSubmitted(true);

    // check all votes
    const playersSnap = await get(ref(db, `rooms/${roomCode}/players`));
    const currentPlayers = playersSnap.val() || {};
    const pids = Object.keys(currentPlayers).filter(id => !currentPlayers[id].left);
    const votesSnap = await get(ref(db, `rooms/${roomCode}/votes`));
    const votes = votesSnap.val() || {};
    const allVoted = pids.every(id => votes[id]?.vote);
    if (allVoted) {
      // tally votes
      const counts = {};
      Object.values(votes).forEach(v => {
        counts[v.vote] = (counts[v.vote] || 0) + 1;
      });
      // find max
      let max = -1; let chosen = null;
      for (const pid of Object.keys(counts)) {
        if (counts[pid] > max) { max = counts[pid]; chosen = pid; }
      }
      // if tie pick random among tied
      const tied = Object.keys(counts).filter(k => counts[k] === max);
      if (tied.length > 1) {
        chosen = tied[Math.floor(Math.random() * tied.length)];
      }

      await update(ref(db, `rooms/${roomCode}`), { votedOut: chosen, phase: 'result' });
    }
  };

  return (
    <div className="card">
      <h2>Vote</h2>
      <div>Read hints and vote who you think is the imposter.</div>

      <div className="hints">
        {Object.entries(hints).map(([pid, entry]) => (
          <div key={pid} className="hint-item">{entry.hint || '...'}</div>
        ))}
      </div>

      {!submitted ? (
        <div>
          <select value={selected} onChange={e => setSelected(e.target.value)}>
            <option value="">Select player</option>
            {Object.values(players).map(p => (
              <option key={p.id} value={p.id}>{p.name}</option>
            ))}
          </select>
          <div className="row">
            <button onClick={submitVote}>Submit Vote</button>
          </div>
        </div>
      ) : (
        <div>Vote submitted. Waiting for others...</div>
      )}
    </div>
  );
}
