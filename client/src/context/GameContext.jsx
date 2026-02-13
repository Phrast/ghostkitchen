import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useSocket } from './SocketContext';

const GameContext = createContext();

export function GameProvider({ children }) {
  const socket = useSocket();
  const [generating, setGenerating] = useState(false);
  const [orders, setOrders] = useState([]);
  const [satisfaction, setSatisfaction] = useState(20);
  const [treasury, setTreasury] = useState(0);
  const [stock, setStock] = useState([]);
  const [gameOver, setGameOver] = useState(false);
  const [message, setMessage] = useState('');

  // Listen to all service socket events at app level
  useEffect(() => {
    if (!socket) return;

    // Request current state on connect
    socket.emit('service:status');

    const onStatus = ({ generating: g, satisfaction: sat, treasury: tres, stock: s, orders: o }) => {
      setGenerating(g);
      setSatisfaction(sat);
      setTreasury(tres);
      setStock(s);
      setOrders(o);
      setGameOver(false);
    };

    const onNewOrder = (order) => {
      setOrders(prev => [...prev, order]);
    };

    const onExpired = ({ orderId }) => {
      setOrders(prev => prev.filter(o => o.id !== orderId));
    };

    const onResult = ({ success, satisfaction: sat, treasury: tres, message: msg }) => {
      setMessage(msg);
      if (sat !== undefined) setSatisfaction(sat);
      if (tres !== undefined) setTreasury(tres);
      setTimeout(() => setMessage(''), 3000);
    };

    const onSatisfaction = ({ satisfaction: sat }) => setSatisfaction(sat);
    const onTreasury = ({ treasury: tres }) => setTreasury(tres);
    const onStock = ({ stock: s }) => setStock(s);

    const onGameOver = () => {
      setGameOver(true);
      setGenerating(false);
      setOrders([]);
    };

    socket.on('service:status', onStatus);
    socket.on('order:new', onNewOrder);
    socket.on('order:expired', onExpired);
    socket.on('order:result', onResult);
    socket.on('satisfaction:update', onSatisfaction);
    socket.on('treasury:update', onTreasury);
    socket.on('stock:update', onStock);
    socket.on('game:over', onGameOver);

    return () => {
      socket.off('service:status', onStatus);
      socket.off('order:new', onNewOrder);
      socket.off('order:expired', onExpired);
      socket.off('order:result', onResult);
      socket.off('satisfaction:update', onSatisfaction);
      socket.off('treasury:update', onTreasury);
      socket.off('stock:update', onStock);
      socket.off('game:over', onGameOver);
    };
  }, [socket]);

  const startService = useCallback(() => {
    if (!socket) return;
    socket.emit('service:start');
    setGenerating(true);
    setGameOver(false);
    setOrders([]);
  }, [socket]);

  const stopService = useCallback(() => {
    if (!socket) return;
    socket.emit('service:stop');
    setGenerating(false);
    // Don't clear orders - let them be served or expire
  }, [socket]);

  const serveOrder = useCallback((orderId) => {
    if (!socket) return;
    socket.emit('order:served', { orderId });
    setOrders(prev => prev.filter(o => o.id !== orderId));
  }, [socket]);

  const resetGame = useCallback(() => {
    if (!socket) return;
    socket.emit('game:reset');
    setGameOver(false);
    setGenerating(false);
    setSatisfaction(20);
    setOrders([]);
  }, [socket]);

  const refreshStatus = useCallback(() => {
    if (!socket) return;
    socket.emit('service:status');
  }, [socket]);

  // Build stockMap for quick lookup
  const stockMap = {};
  for (const s of stock) {
    stockMap[s.id] = s.quantity;
  }

  return (
    <GameContext.Provider value={{
      generating, orders, satisfaction, treasury, stock, stockMap,
      gameOver, message,
      startService, stopService, serveOrder, resetGame, refreshStatus,
    }}>
      {children}
    </GameContext.Provider>
  );
}

export function useGame() {
  return useContext(GameContext);
}
