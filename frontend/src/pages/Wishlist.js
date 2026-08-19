import { useCart } from '../context/CartContext';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';

export default function Wishlist() {
  const { wishlist, toggleWishlist, addToCart } = useCart();
  const navigate = useNavigate();

  const handleMoveToCart = (p) => {
    addToCart(p);
    toggleWishlist(p);
    toast.success(`${p.name} moved to cart`);
  };

  return (
    <div style={s.page}>
      <h2 style={s.heading}>My Wishlist ({wishlist.length})</h2>

      {wishlist.length === 0 ? (
        <div style={s.empty}>
          <div style={s.emptyIcon}>🤍</div>
          <h3>Your wishlist is empty</h3>
          <p>Save items you love and come back to them anytime.</p>
          <button style={s.shopBtn} onClick={() => navigate('/')}>Start Shopping</button>
        </div>
      ) : (
        <div style={s.grid}>
          {wishlist.map(p => (
            <div key={p.id} style={s.card}>
              <div style={s.imgWrap} onClick={() => navigate(`/product/${p.id}`)}>
                {p.imageUrls?.[0]
                  ? <img src={p.imageUrls[0]} alt={p.name} style={s.img} />
                  : <div style={s.imgFallback}>📦</div>}
              </div>
              <div style={s.body}>
                <span style={s.catTag}>{p.category}</span>
                <h3 style={s.name} onClick={() => navigate(`/product/${p.id}`)}>{p.name}</h3>
                <div style={s.stars}>★★★★☆ <span style={s.ratingCount}>(128)</span></div>
                <div style={s.priceRow}>
                  <span style={s.price}>${p.price.toFixed(2)}</span>
                  <span style={s.originalPrice}>${(p.price * 1.2).toFixed(2)}</span>
                </div>
                {p.stock === 0 && <p style={s.outOfStock}>Out of Stock</p>}
                <div style={s.actions}>
                  <button style={{ ...s.cartBtn, opacity: p.stock === 0 ? 0.5 : 1 }}
                    onClick={() => handleMoveToCart(p)} disabled={p.stock === 0}>
                    🛒 Move to Cart
                  </button>
                  <button style={s.removeBtn} onClick={() => { toggleWishlist(p); toast('Removed from wishlist'); }}>
                    ✕ Remove
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

const s = {
  page: { background: '#f3f3f3', minHeight: '100vh', padding: '24px' },
  heading: { color: '#1a1a2e', marginBottom: '20px', fontSize: '1.5rem' },
  empty: { textAlign: 'center', padding: '80px 20px', color: '#888' },
  emptyIcon: { fontSize: '5rem', marginBottom: '16px' },
  shopBtn: { background: '#f90', border: 'none', padding: '12px 28px', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold', fontSize: '1rem', marginTop: '12px' },
  grid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '16px' },
  card: { background: '#fff', borderRadius: '8px', overflow: 'hidden', boxShadow: '0 1px 4px rgba(0,0,0,0.08)', display: 'flex', flexDirection: 'column' },
  imgWrap: { height: '180px', overflow: 'hidden', cursor: 'pointer', background: '#f9f9f9', display: 'flex', alignItems: 'center', justifyContent: 'center' },
  img: { width: '100%', height: '100%', objectFit: 'cover' },
  imgFallback: { fontSize: '4rem' },
  body: { padding: '12px', display: 'flex', flexDirection: 'column', gap: '6px', flex: 1 },
  catTag: { background: '#fff3e0', color: '#e65100', padding: '2px 8px', borderRadius: '12px', fontSize: '0.72rem', fontWeight: '600', alignSelf: 'flex-start' },
  name: { margin: 0, fontSize: '0.92rem', fontWeight: '600', color: '#1a1a2e', cursor: 'pointer' },
  stars: { color: '#f90', fontSize: '0.85rem' },
  ratingCount: { color: '#888', fontSize: '0.78rem' },
  priceRow: { display: 'flex', alignItems: 'center', gap: '8px' },
  price: { color: '#e94560', fontWeight: 'bold', fontSize: '1.1rem' },
  originalPrice: { color: '#aaa', fontSize: '0.82rem', textDecoration: 'line-through' },
  outOfStock: { color: '#e74c3c', fontSize: '0.78rem', margin: 0, fontWeight: '600' },
  actions: { display: 'flex', gap: '8px', marginTop: 'auto', flexWrap: 'wrap' },
  cartBtn: { flex: 1, background: '#f90', color: '#131921', border: 'none', padding: '8px', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold', fontSize: '0.85rem' },
  removeBtn: { background: 'none', border: '1px solid #ddd', padding: '8px 10px', borderRadius: '4px', cursor: 'pointer', color: '#888', fontSize: '0.82rem' },
};
