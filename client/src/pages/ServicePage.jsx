import { useState, useEffect, useCallback } from 'react';
import { useSocket } from '../context/SocketContext';
import OrderQueue from '../components/service/OrderQueue';
import SatisfactionBar from '../components/service/SatisfactionBar';

export default function ServicePage() {
  const socket = useSocket();
  const [running, setRunning] = useState(false);
  const [orders, setOrders] = useState([]);
  const [satisfaction, setSatisfaction] = useState(20);
  const [gameOver, setGameOver] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    if (!socket) return;

    socket.on('order:new', (order) => {
      setOrders(prev => [...prev, order]);
    });

    socket.on('order:expired', ({ orderId }) => {
      setOrders(prev => prev.filter(o => o.id !== orderId));
    });

    socket.on('order:result', ({ success, satisfaction: sat, message: msg }) => {
      setMessage(msg);
      if (sat !== undefined) setSatisfaction(sat);
      setTimeout(() => setMessage(''), 3000);
    });

    socket.on('satisfaction:update', ({ satisfaction: sat }) => {
      setSatisfaction(sat);
    });

    socket.on('game:over', () => {
      setGameOver(true);
      setRunning(false);
      setOrders([]);
    });

    return () => {
      socket.off('order:new');
      socket.off('order:expired');
      socket.off('order:result');
      socket.off('satisfaction:update');
      socket.off('game:over');
    };
  }, [socket]);

  const handleStart = () => {
    if (!socket) return;
    socket.emit('service:start');
    setRunning(true);
    setGameOver(false);
    setOrders([]);
  };

  const handleStop = () => {
    if (!socket) return;
    socket.emit('service:stop');
    setRunning(false);
    setOrders([]);
  };

  const handleServe = useCallback((orderId) => {
    if (!socket) return;
    socket.emit('order:served', { orderId });
    setOrders(prev => prev.filter(o => o.id !== orderId));
  }, [socket]);

  const handleReset = () => {
    if (!socket) return;
    socket.emit('game:reset');
    setGameOver(false);
    setSatisfaction(20);
    setOrders([]);
  };

  return (
    <div className="service-page">
      <h2>Service</h2>
      <SatisfactionBar satisfaction={satisfaction} />

      {!running && !gameOver && (
        <button className="btn-start" onClick={handleStart}>Start Service</button>
      )}
      {running && (
        <button className="btn-stop" onClick={handleStop}>Stop Service</button>
      )}

      {message && (
        <div className={`service-message ${message.includes('Served') ? 'msg-success' : 'msg-fail'}`}>
          {message}
        </div>
      )}

      {running && <OrderQueue orders={orders} onServe={handleServe} />}

      {gameOver && (
        <div className="game-over-overlay">
          <div className="game-over-card">
            <h2>GAME OVER</h2>
            <p>Your satisfaction dropped below 0!</p>
            <button className="btn-start" onClick={handleReset}>Try Again</button>
          </div>
        </div>
      )}
    </div>
  );
}
