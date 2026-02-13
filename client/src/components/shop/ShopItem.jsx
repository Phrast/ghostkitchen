import { useState } from 'react';

export default function ShopItem({ ingredient, treasury, onBuy }) {
  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(false);

  const totalCost = ingredient.buy_price * quantity;
  const canAfford = treasury >= totalCost;

  const handleBuy = async () => {
    setLoading(true);
    await onBuy(ingredient.id, quantity);
    setLoading(false);
  };

  return (
    <div className="shop-item">
      <div className="shop-item-info">
        <span className="shop-item-emoji">{ingredient.emoji}</span>
        <span className="shop-item-name">{ingredient.name}</span>
        <span className="shop-item-price">{ingredient.buy_price}$ each</span>
      </div>
      <div className="shop-item-stock">Stock: {ingredient.stock}</div>
      <div className="shop-item-actions">
        <input
          type="number"
          min="1"
          max="99"
          value={quantity}
          onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
        />
        <button
          className="btn-buy"
          onClick={handleBuy}
          disabled={!canAfford || loading}
        >
          Buy ({totalCost}$)
        </button>
      </div>
    </div>
  );
}
