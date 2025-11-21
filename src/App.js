import React, { useEffect, useState } from 'react';
import { customAlphabet, nanoid } from 'nanoid';
import { db } from './firebase';
import { ref, set, update, onValue, get } from 'firebase/database';
import Home from './components/Home';
import Lobby from './components/Lobby';
import WordScreen from './components/WordScreen';
import HintScreen from './components/HintScreen';
import VoteScreen from './components/VoteScreen';
import ResultScreen from './components/ResultScreen';

function App() {
  const [room, setRoom] = useState(null);
  const [roomCode, setRoomCode] = useState(localStorage.getItem('roomCode') || '');
  const [playerId, setPlayerId] = useState(localStorage.getItem('playerId') || '');

  useEffect(() => {
    if (!roomCode) return;
    const roomRef = ref(db, `rooms/${roomCode}`);
    const unsub = onValue(roomRef, snapshot => {
      setRoom(snapshot.val());
    });
    return () => unsub();
  }, [roomCode]);

  useEffect(() => {
    if (roomCode) localStorage.setItem('roomCode', roomCode);
    else localStorage.removeItem('roomCode');
  }, [roomCode]);

  useEffect(() => {
    if (playerId) localStorage.setItem('playerId', playerId);
    else localStorage.removeItem('playerId');
  }, [playerId]);

  const createRoom = async (displayName) => {
    const alpha4 = customAlphabet('ABCDEFGHIJKLMNOPQRSTUVWXYZ', 4);
    const code = alpha4();
    const playerId = nanoid();
    const roomRef = ref(db, `rooms/${code}`);

    const newRoom = {
      phase: 'lobby',
      createdAt: Date.now(),
      host: playerId
    };

    await set(roomRef, newRoom);

    await set(ref(db, `rooms/${code}/players/${playerId}`), {
      id: playerId,
      name: displayName || 'Host',
      ready: false
    });

    setRoomCode(code);
    setPlayerId(playerId);
  };

  const joinRoom = async (code, displayName) => {
    const snapshot = await get(ref(db, `rooms/${code}`));
    if (!snapshot.exists()) {
      throw new Error('Room does not exist');
    }
    const pid = nanoid();
    await set(ref(db, `rooms/${code}/players/${pid}`), {
      id: pid,
      name: displayName || 'Player',
      ready: false
    });
    setRoomCode(code);
    setPlayerId(pid);
  };

  const leaveRoom = async () => {
    if (!roomCode || !playerId) return;
    await update(ref(db, `rooms/${roomCode}/players/${playerId}`), { left: true });
    setPlayerId('');
    setRoomCode('');
  };

  const startGame = async () => {
    if (!roomCode) return;
    const playersSnap = await get(ref(db, `rooms/${roomCode}/players`));
    const players = playersSnap.val() || {};
    const pids = Object.keys(players).filter(id => !players[id].left);
    if (pids.length < 4 || pids.length > 6) {
      throw new Error('Players must be 4 to 6 to start');
    }

    // choose word pair
    const wordsModule = await import('./words');
    const pairs = wordsModule.default;
    const pair = pairs[Math.floor(Math.random() * pairs.length)];

    // choose imposter
    const impIndex = Math.floor(Math.random() * pids.length);
    const imposterId = pids[impIndex];

    // assign roles
    const updates = {};
    pids.forEach(pid => {
      const isImp = pid === imposterId;
      updates[`players/${pid}/role`] = isImp ? 'imposter' : 'crewmate';
      updates[`players/${pid}/word`] = isImp ? pair.imposter : pair.crew;
      updates[`players/${pid}/ready`] = false;
    });

    updates['phase'] = 'word';
    updates['imposterId'] = imposterId;
    updates['wordPair'] = pair;

    await update(ref(db, `rooms/${roomCode}`), updates);
  };

  const leaveToHome = () => {
    setPlayerId('');
    setRoomCode('');
  };

  // Render based on current phase
  const phase = room?.phase || 'home';

  return (
    <div className="app">
      <h1>Imposter Word Game</h1>
      {!roomCode && <Home createRoom={createRoom} joinRoom={joinRoom} />}

      {roomCode && room && phase === 'lobby' && (
        <Lobby room={room} roomCode={roomCode} playerId={playerId} startGame={startGame} leaveRoom={leaveRoom} />
      )}

      {roomCode && room && phase === 'word' && (
        <WordScreen room={room} roomCode={roomCode} playerId={playerId} />
      )}

      {roomCode && room && phase === 'hint' && (
        <HintScreen room={room} roomCode={roomCode} playerId={playerId} />
      )}

      {roomCode && room && phase === 'vote' && (
        <VoteScreen room={room} roomCode={roomCode} playerId={playerId} />
      )}

      {roomCode && room && phase === 'result' && (
        <ResultScreen room={room} roomCode={roomCode} playerId={playerId} leaveToHome={leaveToHome} />
      )}
    </div>
  );
}

export default App;
