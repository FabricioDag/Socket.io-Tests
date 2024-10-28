// server.js
const express = require('express');
const http = require('http');
const { Server } = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = new Server(server);

const PORT = 3001;
const rooms = {};

// Função para adicionar jogador a uma sala ou criar nova se não existir
function joinRoom(socket, roomId) {
  if (!rooms[roomId]) {
    rooms[roomId] = [];
  }
  if (rooms[roomId].length < 2) {
    rooms[roomId].push(socket.id);
    socket.join(roomId);
    socket.emit('roomJoined', roomId);
    io.to(roomId).emit('playerJoined', { players: rooms[roomId].length });

    // Aviso se a sala estiver cheia
    if (rooms[roomId].length === 2) {
      io.to(roomId).emit('roomFull', 'Room is now full!');
    }
  } else {
    socket.emit('roomError', 'Room is full');
  }
}

// Evento de conexão e manipulação de salas
io.on('connection', (socket) => {
  console.log('Novo usuário conectado:', socket.id);

  // Ingresso via código de sala
  socket.on('joinWithCode', (roomId) => {
    joinRoom(socket, roomId);
  });

  // Ingresso aleatório em uma sala vaga
  socket.on('joinRandom', () => {
    let roomId = Object.keys(rooms).find((id) => rooms[id].length < 2);
    if (!roomId) roomId = socket.id; // Criar nova sala
    joinRoom(socket, roomId);
  });

  // Evento de desconexão
  socket.on('disconnect', () => {
    for (const [roomId, players] of Object.entries(rooms)) {
      rooms[roomId] = players.filter((id) => id !== socket.id);
      if (rooms[roomId].length === 0) delete rooms[roomId];
    }
    console.log('Usuário desconectado:', socket.id);
  });
});

server.listen(PORT, () => {
  console.log(`Servidor rodando em http://localhost:${PORT}`);
});
