import OrderCard from './OrderCard';

export default function OrderQueue({ orders, onServe, stockMap }) {
  if (orders.length === 0) {
    return <p className="empty-message">Waiting for orders...</p>;
  }

  return (
    <div className="order-queue">
      {orders.map(order => (
        <OrderCard key={order.id} order={order} onServe={onServe} stockMap={stockMap} />
      ))}
    </div>
  );
}
