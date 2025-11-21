import React, { useState } from 'react';

export default function Home({ createRoom, joinRoom }) {
  const [name, setName] = useState('');
  const [joinCode, setJoinCode] = useState('');
  const [error, setError] = useState('');

  const onCreate = async () => {
    setError('');
    try {
      await createRoom(name || 'Host');
    } catch (e) {
      setError(e.message);
    }
  };

  const onJoin = async () => {
    setError('');
    try {
      await joinRoom(joinCode.trim().toUpperCase(), name || 'Player');
    } catch (e) {
      setError(e.message);
    }
  };

  return (
    <div className="card">
      <h2>Home</h2>
      <label>Name</label>
      <input value={name} onChange={e => setName(e.target.value)} placeholder="Your name" />

      <div className="row">
        <button onClick={onCreate}>Create Room</button>
      </div>

      <hr />

      <label>Room Code</label>
      <input value={joinCode} onChange={e => setJoinCode(e.target.value)} placeholder="ABCD" />
      <div className="row">
        <button onClick={onJoin}>Join Room</button>
      </div>

      {error && <div className="error">{error}</div>}
    </div>
  );
}
