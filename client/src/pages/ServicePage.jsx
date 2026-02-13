import { useEffect } from 'react';
import { useGame } from '../context/GameContext';
import OrderQueue from '../components/service/OrderQueue';
import SatisfactionBar from '../components/service/SatisfactionBar';
import StockDisplay from '../components/shop/StockDisplay';

export default function ServicePage() {
  const {
    generating, orders, satisfaction, treasury, stock, stockMap,
    gameOver, message,
    startService, stopService, serveOrder, resetGame, refreshStatus,
  } = useGame();

  // Refresh state when navigating to this page (e.g. after buying stock)
  useEffect(() => {
    refreshStatus();
  }, [refreshStatus]);

  const hasOrders = orders.length > 0;

  return (
    <div className="service-page">
      <div className="service-header">
        <h2>Service</h2>
        <span className="treasury-badge">{treasury}$</span>
      </div>
      <SatisfactionBar satisfaction={satisfaction} />

      {stock.length > 0 && (
        <div className="service-stock">
          <h4>Your Stock</h4>
          <StockDisplay ingredients={stock} />
        </div>
      )}

      {!generating && !gameOver && !hasOrders && (
        <button className="btn-start" onClick={startService}>Start Service</button>
      )}
      {generating && (
        <button className="btn-stop" onClick={stopService}>Stop Service</button>
      )}

      {message && (
        <div className={`service-message ${message.includes('Served') ? 'msg-success' : 'msg-fail'}`}>
          {message}
        </div>
      )}

      {hasOrders && <OrderQueue orders={orders} onServe={serveOrder} stockMap={stockMap} />}

      {gameOver && (
        <div className="game-over-overlay">
          <div className="game-over-card">
            <h2>GAME OVER</h2>
            <p>Your satisfaction dropped below 0!</p>
            <button className="btn-start" onClick={resetGame}>Try Again</button>
          </div>
        </div>
      )}
    </div>
  );
}
