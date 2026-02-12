import { useState, useEffect } from 'react';

export default function OrderCard({ order, onServe }) {
  const [timeLeft, setTimeLeft] = useState(order.timeLimit);

  useEffect(() => {
    const elapsed = (Date.now() - order.createdAt) / 1000;
    setTimeLeft(Math.max(0, Math.ceil(order.timeLimit - elapsed)));

    const interval = setInterval(() => {
      const remaining = order.timeLimit - (Date.now() - order.createdAt) / 1000;
      setTimeLeft(Math.max(0, Math.ceil(remaining)));
      if (remaining <= 0) clearInterval(interval);
    }, 500);

    return () => clearInterval(interval);
  }, [order]);

  const progress = (timeLeft / order.timeLimit) * 100;
  const timerColor = timeLeft > 15 ? '#2ed573' : timeLeft > 5 ? '#ffa502' : '#ff4757';

  return (
    <div className="order-card">
      <div className="order-header">
        <h4>{order.recipeName}</h4>
        <span className="order-timer" style={{ color: timerColor }}>
          {timeLeft}s
        </span>
      </div>
      <div className="order-timer-track">
        <div
          className="order-timer-fill"
          style={{ width: `${progress}%`, background: timerColor }}
        />
      </div>
      <button className="btn-serve" onClick={() => onServe(order.id)}>
        Serve
      </button>
    </div>
  );
}
