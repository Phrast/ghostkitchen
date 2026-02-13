import { useState, useEffect } from 'react';
import { getShopIngredients, buyIngredient } from '../api/shopApi';
import ShopItem from '../components/shop/ShopItem';
import StockDisplay from '../components/shop/StockDisplay';

export default function ShopPage() {
  const [ingredients, setIngredients] = useState([]);
  const [treasury, setTreasury] = useState(0);
  const [message, setMessage] = useState('');

  const loadShop = async () => {
    const res = await getShopIngredients();
    setIngredients(res.data.ingredients);
    setTreasury(res.data.treasury);
  };

  useEffect(() => {
    loadShop();
  }, []);

  const handleBuy = async (ingredientId, quantity) => {
    try {
      const res = await buyIngredient(ingredientId, quantity);
      setTreasury(res.data.treasury);
      setMessage('Purchase successful!');
      await loadShop();
    } catch (err) {
      setMessage(err.response?.data?.error || 'Purchase failed');
    }
    setTimeout(() => setMessage(''), 3000);
  };

  return (
    <div className="shop-page">
      <div className="shop-header">
        <h2>Shop</h2>
        <span className="treasury-badge">{treasury}$</span>
      </div>

      {message && (
        <div className={`service-message ${message.includes('successful') ? 'msg-success' : 'msg-fail'}`}>
          {message}
        </div>
      )}

      <h3>Your Stock</h3>
      <StockDisplay ingredients={ingredients} />

      <h3>Buy Ingredients</h3>
      <div className="shop-grid">
        {ingredients.map(ing => (
          <ShopItem
            key={ing.id}
            ingredient={ing}
            treasury={treasury}
            onBuy={handleBuy}
          />
        ))}
      </div>
    </div>
  );
}
