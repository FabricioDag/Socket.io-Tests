import { useEffect, useState } from 'react';
import io from 'socket.io-client';

const socket = io("https://seu-backend.onrender.com");

const GameComponent = () => {
  const [roomId, setRoomId] = useState('');
  const [userId, setUserId] = useState('');
  const [scores, setScores] = useState({ player1: 0, player2: 0 });
  const [winner, setWinner] = useState('');

  useEffect(() => {
    socket.emit("joinRoom", { roomId, userId });

    socket.on("updateScores", (data) => {
      setScores(data.scores);
    });

    socket.on("gameOver", ({ winner }) => {
      setWinner(winner);
    });

    return () => {
      socket.disconnect();
    };
  }, [roomId, userId]);

  const playRound = (choice) => {
    socket.emit("playRound", { roomId, userId, choice });
  };

  return (
    <div>
      <>
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
      </>

      <h1>Pedra, Papel ou Tesoura</h1>
      <h2>Placar:</h2>
      <p>Jogador 1: {scores.player1}</p>
      <p>Jogador 2: {scores.player2}</p>
      <button onClick={() => playRound('rock')}>Pedra</button>
      <button onClick={() => playRound('paper')}>Papel</button>
      <button onClick={() => playRound('scissors')}>Tesoura</button>
      {winner && <h2>O vencedor é: {winner}</h2>}
    </div>
  );
};

export default GameComponent;
