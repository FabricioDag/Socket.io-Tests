// client/src/App.js
import React, { useState } from 'react';
import io from 'socket.io-client';

const socket = io('http://localhost:3001');

function App() {
  const [roomCode, setRoomCode] = useState('');
  const [roomId, setRoomId] = useState(null);
  const [status, setStatus] = useState('Desconectado');

  const joinRoomWithCode = () => {
    socket.emit('joinWithCode', roomCode);
  };

  const joinRandomRoom = () => {
    socket.emit('joinRandom');
  };

  socket.on('roomJoined', (id) => {
    setRoomId(id);
    setStatus('Conectado à sala: ' + id);
  });

  socket.on('roomFull', (message) => {
    setStatus(message);
  });

  socket.on('roomError', (message) => {
    setStatus(message);
  });

  return (
    <div className="App">
      <h2>Conectar a uma Sala</h2>
      <input
        type="text"
        placeholder="Código da Sala"
        value={roomCode}
        onChange={(e) => setRoomCode(e.target.value)}
      />
      <button onClick={joinRoomWithCode}>Entrar com Código</button>
      <button onClick={joinRandomRoom}>Entrar em Sala Aleatória</button>
      <p>Status: {status}</p>
    </div>
  );
}

export default App;
