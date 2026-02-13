export default function StockDisplay({ ingredients }) {
  const stocked = ingredients.filter(i => (i.stock || i.quantity) > 0);

  if (stocked.length === 0) {
    return <p className="empty-message">No ingredients in stock. Buy some!</p>;
  }

  return (
    <div className="stock-display">
      {stocked.map(ing => (
        <div key={ing.id} className="stock-chip">
          <span>{ing.emoji}</span>
          <span>{ing.name}</span>
          <span className="stock-qty">x{ing.stock || ing.quantity}</span>
        </div>
      ))}
    </div>
  );
}
