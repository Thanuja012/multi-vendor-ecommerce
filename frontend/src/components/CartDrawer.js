import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { orderApi } from '../services/api';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';

export default function CartDrawer({ open, onClose }) {
  const { cart, removeFromCart, updateQty, clearCart, cartTotal } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();

  const handleCheckout = async () => {
    if (!user) { onClose(); return navigate('/login'); }
    if (cart.length === 0) return toast.error('Cart is empty');
    try {
      await orderApi.place({
        items: cart.map(i => ({
          productId: i.productId,
          quantity: i.quantity,
          productName: i.product.name,
          price: i.product.price,
        })),
        shippingAddress: '123 Main St',
      });
      clearCart();
      onClose();
      toast.success('Order placed successfully! 🎉');
      navigate('/orders');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Order failed');
    }
  };

  return (
    <>
      {open && <div style={s.overlay} onClick={onClose} />}
      <div style={{ ...s.drawer, right: open ? 0 : '-420px' }}>
        <div style={s.header}>
          <h3 style={s.title}>Shopping Cart ({cart.length})</h3>
          <button onClick={onClose} style={s.closeBtn}>✕</button>
        </div>

        <div style={s.items}>
          {cart.length === 0 ? (
            <div style={s.empty}>
              <div style={s.emptyIcon}>🛒</div>
              <p>Your cart is empty</p>
              <button style={s.shopBtn} onClick={onClose}>Continue Shopping</button>
            </div>
          ) : (
            cart.map(item => (
              <div key={item.productId} style={s.item}>
                <div style={s.itemImg}>
                  {item.product.imageUrls?.[0]
                    ? <img src={item.product.imageUrls[0]} alt={item.product.name} style={s.img} />
                    : <span style={s.imgPlaceholder}>{item.product.name[0]}</span>}
                </div>
                <div style={s.itemInfo}>
                  <p style={s.itemName}>{item.product.name}</p>
                  <p style={s.itemVendor}>{item.product.category}</p>
                  <p style={s.itemPrice}>${(item.product.price * item.quantity).toFixed(2)}</p>
                  <div style={s.qtyRow}>
                    <button style={s.qtyBtn} onClick={() => updateQty(item.productId, item.quantity - 1)}>−</button>
                    <span style={s.qty}>{item.quantity}</span>
                    <button style={s.qtyBtn} onClick={() => updateQty(item.productId, item.quantity + 1)}>+</button>
                    <button style={s.removeBtn} onClick={() => removeFromCart(item.productId)}>Remove</button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {cart.length > 0 && (
          <div style={s.footer}>
            <div style={s.subtotal}>
              <span>Subtotal ({cart.reduce((s, i) => s + i.quantity, 0)} items):</span>
              <span style={s.total}>${cartTotal.toFixed(2)}</span>
            </div>
            <button style={s.checkoutBtn} onClick={handleCheckout}>Proceed to Checkout</button>
            <button style={s.clearBtn} onClick={clearCart}>Clear Cart</button>
          </div>
        )}
      </div>
    </>
  );
}

const s = {
  overlay: { position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 998 },
  drawer: { position: 'fixed', top: 0, width: '400px', maxWidth: '95vw', height: '100vh', background: '#fff', zIndex: 999, transition: 'right 0.3s ease', display: 'flex', flexDirection: 'column', boxShadow: '-4px 0 20px rgba(0,0,0,0.15)' },
  header: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px 20px', borderBottom: '1px solid #eee', background: '#131921' },
  title: { color: '#fff', margin: 0, fontSize: '1.1rem' },
  closeBtn: { background: 'none', border: 'none', color: '#fff', fontSize: '1.2rem', cursor: 'pointer' },
  items: { flex: 1, overflowY: 'auto', padding: '12px' },
  empty: { display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '300px', gap: '12px', color: '#888' },
  emptyIcon: { fontSize: '4rem' },
  shopBtn: { background: '#f90', border: 'none', padding: '10px 24px', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' },
  item: { display: 'flex', gap: '12px', padding: '12px 0', borderBottom: '1px solid #f0f0f0' },
  itemImg: { width: '80px', height: '80px', flexShrink: 0, borderRadius: '4px', overflow: 'hidden', background: '#f5f5f5', display: 'flex', alignItems: 'center', justifyContent: 'center' },
  img: { width: '100%', height: '100%', objectFit: 'cover' },
  imgPlaceholder: { fontSize: '2rem', color: '#aaa' },
  itemInfo: { flex: 1 },
  itemName: { margin: '0 0 2px', fontSize: '0.9rem', fontWeight: '500', color: '#1a1a2e' },
  itemVendor: { margin: '0 0 4px', fontSize: '0.78rem', color: '#888' },
  itemPrice: { margin: '0 0 6px', color: '#e94560', fontWeight: 'bold' },
  qtyRow: { display: 'flex', alignItems: 'center', gap: '6px' },
  qtyBtn: { width: '26px', height: '26px', border: '1px solid #ddd', background: '#f5f5f5', borderRadius: '4px', cursor: 'pointer', fontSize: '1rem' },
  qty: { minWidth: '24px', textAlign: 'center', fontWeight: 'bold' },
  removeBtn: { background: 'none', border: 'none', color: '#e94560', fontSize: '0.8rem', cursor: 'pointer', marginLeft: '4px' },
  footer: { padding: '16px 20px', borderTop: '1px solid #eee', display: 'flex', flexDirection: 'column', gap: '10px' },
  subtotal: { display: 'flex', justifyContent: 'space-between', fontSize: '1rem', fontWeight: '500' },
  total: { color: '#e94560', fontWeight: 'bold', fontSize: '1.1rem' },
  checkoutBtn: { background: '#f90', border: 'none', padding: '12px', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold', fontSize: '1rem' },
  clearBtn: { background: 'none', border: '1px solid #ddd', padding: '8px', borderRadius: '4px', cursor: 'pointer', color: '#888', fontSize: '0.85rem' },
};
