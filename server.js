const express = require("express");
const http = require("http");
const socketIo = require("socket.io");
const cors = require("cors");

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: "https://socket-io-tests-front.onrender.com", // URL do seu frontend
    methods: ["GET", "POST"],
    allowedHeaders: ["my-custom-header"],
    credentials: true
  }
});

app.use(cors({
  origin: "https://socket-io-tests-front.onrender.com",
  methods: ["GET", "POST"],
  credentials: true
}));

// Armazenamento de salas
const rooms = {};

io.on("connection", (socket) => {
  console.log(`Usuário conectado: ${socket.id}`);

  // Entrar na sala
  socket.on("joinRoom", ({ roomId, userId }) => {
    socket.join(roomId);
    if (!rooms[roomId]) {
      rooms[roomId] = {
        players: {},
        scores: { player1: 0, player2: 0 },
        roundResults: []
      };
    }
    rooms[roomId].players[userId] = socket.id;
    io.to(roomId).emit("updateScores", rooms[roomId]);
  });

  // Jogar uma rodada
  socket.on("playRound", ({ roomId, userId, choice }) => {
    const opponentId = Object.keys(rooms[roomId].players).find(id => id !== userId);
    const opponentChoice = rooms[roomId].players[opponentId]?.choice;

    if (opponentChoice) {
      const result = determineWinner(choice, opponentChoice);
      rooms[roomId].roundResults.push({ userId, choice, result });
      if (result === 'win') {
        rooms[roomId].scores[userId]++;
      } else if (result === 'lose') {
        rooms[roomId].scores[opponentId]++;
      }

      io.to(roomId).emit("updateScores", rooms[roomId]);
      checkGameOver(roomId);
    } else {
      rooms[roomId].players[userId].choice = choice; // Guarda a escolha do usuário
    }
  });

  // Verificar se o jogo acabou
  function checkGameOver(roomId) {
    const scores = rooms[roomId].scores;
    if (scores.player1 === 3 || scores.player2 === 3) {
      const winner = scores.player1 === 3 ? "player1" : "player2";
      io.to(roomId).emit("gameOver", { winner });
      delete rooms[roomId]; // Limpa a sala após o jogo
    }
  }

  // Determinar o vencedor da rodada
  function determineWinner(choice1, choice2) {
    if (choice1 === choice2) return "draw"; // Empate
    if (
      (choice1 === "rock" && choice2 === "scissors") ||
      (choice1 === "scissors" && choice2 === "paper") ||
      (choice1 === "paper" && choice2 === "rock")
    ) {
      return "win"; // O jogador 1 ganha
    }
    return "lose"; // O jogador 2 ganha
  }

  // Desconectar
  socket.on("disconnect", () => {
    console.log(`Usuário desconectado: ${socket.id}`);
  });
});

server.listen(3001, () => {
  console.log("Servidor rodando na porta 3001");
});
