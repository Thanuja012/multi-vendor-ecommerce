import { useState, useEffect } from 'react';
import { orderApi } from '../services/api';

export default function Orders() {
  const [orders, setOrders] = useState([]);

  useEffect(() => {
    orderApi.getMyOrders().then(({ data }) => setOrders(data));
  }, []);

  const statusColor = { PENDING: '#f39c12', CONFIRMED: '#3498db', SHIPPED: '#9b59b6', DELIVERED: '#27ae60', CANCELLED: '#e74c3c' };

  return (
    <div style={styles.container}>
      <h2 style={styles.heading}>My Orders</h2>
      {orders.length === 0 ? (
        <p style={styles.empty}>No orders yet.</p>
      ) : (
        orders.map((o) => (
          <div key={o.id} style={styles.card}>
            <div style={styles.cardHeader}>
              <span style={styles.orderId}>Order #{o.id.slice(-8)}</span>
              <span style={{ ...styles.badge, background: statusColor[o.status] }}>{o.status}</span>
              <span style={styles.amount}>${o.totalAmount.toFixed(2)}</span>
            </div>
            <div style={styles.items}>
              {o.items.map((item, i) => (
                <div key={i} style={styles.item}>
                  <span>{item.productName}</span>
                  <span>x{item.quantity}</span>
                  <span>${(item.price * item.quantity).toFixed(2)}</span>
                </div>
              ))}
            </div>
            <div style={styles.cardFooter}>
              <span style={styles.payStatus}>Payment: {o.paymentStatus}</span>
              <span style={styles.date}>{new Date(o.createdAt).toLocaleDateString()}</span>
            </div>
          </div>
        ))
      )}
    </div>
  );
}

const styles = {
  container: { padding: '24px', background: '#f5f5f5', minHeight: '100vh' },
  heading: { color: '#1a1a2e', marginBottom: '20px' },
  empty: { color: '#888', textAlign: 'center', padding: '40px' },
  card: { background: '#fff', borderRadius: '8px', padding: '20px', marginBottom: '16px', boxShadow: '0 2px 8px rgba(0,0,0,0.08)' },
  cardHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' },
  orderId: { fontWeight: 'bold', color: '#1a1a2e' },
  badge: { color: '#fff', padding: '3px 10px', borderRadius: '12px', fontSize: '0.8rem' },
  amount: { fontWeight: 'bold', color: '#e94560', fontSize: '1.1rem' },
  items: { borderTop: '1px solid #f0f0f0', paddingTop: '12px', display: 'flex', flexDirection: 'column', gap: '6px' },
  item: { display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem', color: '#555' },
  cardFooter: { display: 'flex', justifyContent: 'space-between', marginTop: '12px', paddingTop: '12px', borderTop: '1px solid #f0f0f0', fontSize: '0.85rem', color: '#888' },
  payStatus: {},
  date: {},
};
