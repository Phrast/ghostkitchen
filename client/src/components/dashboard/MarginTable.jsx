export default function MarginTable({ margins }) {
  if (margins.length === 0) {
    return <p className="empty-message">Discover recipes first to see margins.</p>;
  }

  return (
    <table className="margin-table">
      <thead>
        <tr>
          <th>Recipe</th>
          <th>Sell Price</th>
          <th>Ingredient Cost</th>
          <th>Margin</th>
          <th>Times Sold</th>
          <th>Total Profit</th>
        </tr>
      </thead>
      <tbody>
        {margins.map(m => (
          <tr key={m.id}>
            <td>{m.name}</td>
            <td>{m.sellPrice}$</td>
            <td>{m.ingredientCost}$</td>
            <td className={m.margin >= 0 ? 'positive' : 'negative'}>
              {m.margin}$
            </td>
            <td>{m.timesSold}</td>
            <td className={m.totalProfit >= 0 ? 'positive' : 'negative'}>
              {m.totalProfit}$
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
