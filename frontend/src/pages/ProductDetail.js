import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { productApi, orderApi } from '../services/api';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import MOCK_PRODUCTS from '../data/mockProducts';
import toast from 'react-hot-toast';

export default function ProductDetail() {
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const [selectedImg, setSelectedImg] = useState(0);
  const [qty, setQty] = useState(1);
  const [showCheckout, setShowCheckout] = useState(false);
  const [address, setAddress] = useState({ name: '', street: '', city: '', state: '', zip: '', phone: '' });
  const [payMethod, setPayMethod] = useState('COD');
  const [placing, setPlacing] = useState(false);
  const { addToCart, toggleWishlist, isWishlisted } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    productApi.getAll({})
      .then(({ data }) => {
        const found = data.find(p => p.id === id) || MOCK_PRODUCTS.find(p => p.id === id);
        if (found) setProduct(found);
      })
      .catch(() => {
        const found = MOCK_PRODUCTS.find(p => p.id === id);
        if (found) setProduct(found);
      });
  }, [id]);

  if (!product) return <div style={s.loading}>Loading product...</div>;

  const handleAddToCart = () => {
    addToCart(product, qty);
    toast.success(`${product.name} (x${qty}) added to cart`);
  };

  const handleBuyNow = () => {
    if (!user) { toast.error('Please login to continue'); return navigate('/login'); }
    setShowCheckout(true);
  };

  const handlePlaceOrder = async () => {
    const { name, street, city, state, zip, phone } = address;
    if (!name || !street || !city || !state || !zip || !phone) {
      return toast.error('Please fill all address fields');
    }
    setPlacing(true);
    try {
      await orderApi.place({
        items: [{ productId: product.id, quantity: qty, productName: product.name, price: product.price }],
        shippingAddress: `${name}, ${street}, ${city}, ${state} ${zip} | Ph: ${phone}`,
        paymentMethod: payMethod,
      });
      setShowCheckout(false);
      toast.success('🎉 Order placed successfully!');
      navigate('/orders');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Order failed. Please try again.');
    } finally {
      setPlacing(false);
    }
  };

  const handleWishlist = () => {
    if (!user) return toast.error('Please login');
    toggleWishlist(product);
    toast.success(isWishlisted(product.id) ? 'Removed from wishlist' : 'Saved to wishlist ❤️');
  };

  const images = product.imageUrls?.length ? product.imageUrls : [null];

  return (
    <div style={s.page}>
      <button style={s.back} onClick={() => navigate(-1)}>← Back</button>

      <div style={s.container}>
        {/* Image gallery */}
        <div style={s.gallery}>
          <div style={s.thumbCol}>
            {images.map((img, i) => (
              <div key={i} style={{ ...s.thumb, border: selectedImg === i ? '2px solid #f90' : '2px solid #eee' }}
                onClick={() => setSelectedImg(i)}>
                {img ? <img src={img} alt="" style={s.thumbImg} /> : <span style={s.thumbEmoji}>📦</span>}
              </div>
            ))}
          </div>
          <div style={s.mainImgWrap}>
            {images[selectedImg]
              ? <img src={images[selectedImg]} alt={product.name} style={s.mainImg} />
              : <div style={s.mainImgFallback}>📦</div>}
          </div>
        </div>

        {/* Product info */}
        <div style={s.info}>
          <span style={s.catTag}>{product.category}</span>
          <h1 style={s.title}>{product.name}</h1>

          <div style={s.stars}>{'★'.repeat(Math.round(product.rating||4))}{'☆'.repeat(5-Math.round(product.rating||4))} <span style={s.ratingCount}>{(product.rating||4.0).toFixed(1)} ({(product.reviews||128).toLocaleString()} ratings)</span></div>

          <div style={s.divider} />

          <div style={s.priceRow}>
            <span style={s.price}>${product.price.toFixed(2)}</span>
            <span style={s.originalPrice}>${(product.price * 1.2).toFixed(2)}</span>
            <span style={s.discount}>Save 20%</span>
          </div>

          <div style={s.divider} />

          <p style={s.desc}>{product.description}</p>

          <div style={s.stockRow}>
            <span style={s.stockLabel}>Availability:</span>
            {product.stock > 5
              ? <span style={s.inStock}>✓ In Stock ({product.stock} available)</span>
              : product.stock > 0
              ? <span style={s.lowStock}>⚠ Only {product.stock} left!</span>
              : <span style={s.outOfStock}>✗ Out of Stock</span>}
          </div>

          {product.vendorName && (
            <div style={s.vendorRow}>
              <span style={s.vendorLabel}>Sold by:</span>
              <span style={s.vendorVal}>{product.vendorName}</span>
            </div>
          )}

          <div style={s.deliveryBox}>
            <p style={s.deliveryItem}>🚚 <strong>Free delivery</strong> on orders over $50</p>
            <p style={s.deliveryItem}>🔄 <strong>30-day returns</strong> — hassle free</p>
            <p style={s.deliveryItem}>🔒 <strong>Secure checkout</strong> with JWT auth</p>
          </div>

          {/* Qty selector */}
          <div style={s.qtyRow}>
            <span style={s.qtyLabel}>Quantity:</span>
            <div style={s.qtyControl}>
              <button style={s.qtyBtn} onClick={() => setQty(q => Math.max(1, q - 1))}>−</button>
              <span style={s.qtyVal}>{qty}</span>
              <button style={s.qtyBtn} onClick={() => setQty(q => Math.min(product.stock, q + 1))}>+</button>
            </div>
          </div>

          <div style={s.actionRow}>
            <button style={{ ...s.addBtn, opacity: product.stock === 0 ? 0.5 : 1 }}
              onClick={handleAddToCart} disabled={product.stock === 0}>
              🛒 Add to Cart
            </button>
            <button style={{ ...s.buyBtn, opacity: product.stock === 0 ? 0.5 : 1 }}
              onClick={handleBuyNow} disabled={product.stock === 0}>
              ⚡ Buy Now
            </button>
          </div>

          <button style={{ ...s.wishlistBtn, color: isWishlisted(product.id) ? '#e94560' : '#555' }}
            onClick={handleWishlist}>
            {isWishlisted(product.id) ? '❤️ Saved to Wishlist' : '🤍 Add to Wishlist'}
          </button>
        </div>
      </div>

      {/* Checkout Modal */}
      {showCheckout && (
        <div style={s.modalOverlay} onClick={() => setShowCheckout(false)}>
          <div style={s.modal} onClick={e => e.stopPropagation()}>
            <div style={s.modalHeader}>
              <h3 style={s.modalTitle}>Checkout</h3>
              <button style={s.modalClose} onClick={() => setShowCheckout(false)}>✕</button>
            </div>

            {/* Order Summary */}
            <div style={s.summaryBox}>
              <div style={s.summaryRow}>
                <div style={s.summaryImg}>
                  {product.imageUrls?.[0]
                    ? <img src={product.imageUrls[0]} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    : <span style={{ fontSize: '1.8rem' }}>📦</span>}
                </div>
                <div style={{ flex: 1 }}>
                  <p style={s.summaryName}>{product.name}</p>
                  <p style={s.summaryMeta}>Qty: {qty} &nbsp;|&nbsp; ${product.price.toFixed(2)} each</p>
                </div>
                <p style={s.summaryTotal}>${(product.price * qty).toFixed(2)}</p>
              </div>
              <div style={s.summaryFooter}>
                <span>Total</span>
                <span style={s.summaryGrandTotal}>${(product.price * qty).toFixed(2)}</span>
              </div>
            </div>

            {/* Delivery Address */}
            <p style={s.sectionLabel}>Delivery Address</p>
            <div style={s.formGrid}>
              {[['name','Full Name'],['phone','Phone Number'],['street','Street Address'],['city','City'],['state','State'],['zip','ZIP Code']].map(([field, label]) => (
                <input key={field} placeholder={label}
                  style={{ ...s.input, gridColumn: field === 'street' || field === 'name' ? 'span 2' : 'span 1' }}
                  value={address[field]}
                  onChange={e => setAddress(a => ({ ...a, [field]: e.target.value }))} />
              ))}
            </div>

            {/* Payment Method */}
            <p style={s.sectionLabel}>Payment Method</p>
            <div style={s.payRow}>
              {['COD', 'Card', 'UPI'].map(m => (
                <button key={m}
                  style={{ ...s.payBtn, ...(payMethod === m ? s.payBtnActive : {}) }}
                  onClick={() => setPayMethod(m)}>
                  {m === 'COD' ? '💵 Cash on Delivery' : m === 'Card' ? '💳 Credit/Debit Card' : '📱 UPI'}
                </button>
              ))}
            </div>
            {payMethod !== 'COD' && (
              <p style={s.payNote}>ℹ️ {payMethod === 'Card' ? 'Card' : 'UPI'} payment is simulated for demo purposes.</p>
            )}

            <button style={{ ...s.placeBtn, opacity: placing ? 0.7 : 1 }}
              onClick={handlePlaceOrder} disabled={placing}>
              {placing ? 'Placing Order...' : `Place Order — $${(product.price * qty).toFixed(2)}`}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

const s = {
  modalOverlay: { position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.55)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px' },
  modal: { background: '#fff', borderRadius: '10px', width: '100%', maxWidth: '520px', maxHeight: '90vh', overflowY: 'auto', boxShadow: '0 8px 40px rgba(0,0,0,0.2)' },
  modalHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px 20px', borderBottom: '1px solid #eee', background: '#131921', borderRadius: '10px 10px 0 0' },
  modalTitle: { margin: 0, color: '#fff', fontSize: '1.1rem' },
  modalClose: { background: 'none', border: 'none', color: '#fff', fontSize: '1.2rem', cursor: 'pointer' },
  summaryBox: { margin: '16px 20px', border: '1px solid #e8e8e8', borderRadius: '8px', overflow: 'hidden' },
  summaryRow: { display: 'flex', alignItems: 'center', gap: '12px', padding: '12px' },
  summaryImg: { width: '64px', height: '64px', borderRadius: '6px', overflow: 'hidden', background: '#f5f5f5', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
  summaryName: { margin: '0 0 4px', fontWeight: '600', fontSize: '0.9rem', color: '#1a1a2e' },
  summaryMeta: { margin: 0, fontSize: '0.8rem', color: '#888' },
  summaryTotal: { fontWeight: 'bold', color: '#e94560', fontSize: '1rem', margin: 0 },
  summaryFooter: { display: 'flex', justifyContent: 'space-between', padding: '10px 12px', background: '#f9f9f9', borderTop: '1px solid #eee', fontWeight: '600', fontSize: '0.95rem' },
  summaryGrandTotal: { color: '#e94560', fontSize: '1.1rem' },
  sectionLabel: { margin: '0 20px 8px', fontWeight: '600', fontSize: '0.9rem', color: '#333' },
  formGrid: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', padding: '0 20px 16px' },
  input: { padding: '9px 12px', border: '1px solid #ddd', borderRadius: '6px', fontSize: '0.88rem', outline: 'none', width: '100%', boxSizing: 'border-box' },
  payRow: { display: 'flex', gap: '8px', padding: '0 20px 12px', flexWrap: 'wrap' },
  payBtn: { flex: 1, padding: '9px 12px', border: '1px solid #ddd', borderRadius: '6px', background: '#f9f9f9', cursor: 'pointer', fontSize: '0.82rem', fontWeight: '500', whiteSpace: 'nowrap' },
  payBtnActive: { border: '2px solid #f90', background: '#fff8e1', fontWeight: '700' },
  payNote: { margin: '0 20px 12px', fontSize: '0.8rem', color: '#888', background: '#f0f4ff', padding: '8px 12px', borderRadius: '6px' },
  placeBtn: { display: 'block', width: 'calc(100% - 40px)', margin: '4px 20px 20px', background: '#f90', border: 'none', padding: '14px', borderRadius: '6px', fontWeight: 'bold', fontSize: '1rem', cursor: 'pointer', color: '#131921' },
  page: { background: '#f3f3f3', minHeight: '100vh', padding: '16px 24px' },
  loading: { padding: '60px', textAlign: 'center', color: '#888', fontSize: '1.1rem' },
  back: { background: 'none', border: 'none', color: '#131921', cursor: 'pointer', fontSize: '0.95rem', marginBottom: '16px', padding: '6px 0' },
  container: { display: 'flex', gap: '32px', background: '#fff', borderRadius: '8px', padding: '24px', boxShadow: '0 1px 4px rgba(0,0,0,0.08)', flexWrap: 'wrap' },
  gallery: { display: 'flex', gap: '12px', flex: '0 0 auto' },
  thumbCol: { display: 'flex', flexDirection: 'column', gap: '8px' },
  thumb: { width: '60px', height: '60px', borderRadius: '4px', overflow: 'hidden', cursor: 'pointer', background: '#f5f5f5', display: 'flex', alignItems: 'center', justifyContent: 'center' },
  thumbImg: { width: '100%', height: '100%', objectFit: 'cover' },
  thumbEmoji: { fontSize: '1.5rem' },
  mainImgWrap: { width: '360px', height: '360px', borderRadius: '8px', overflow: 'hidden', background: '#f9f9f9', display: 'flex', alignItems: 'center', justifyContent: 'center' },
  mainImg: { width: '100%', height: '100%', objectFit: 'contain' },
  mainImgFallback: { fontSize: '8rem' },
  info: { flex: 1, minWidth: '280px', display: 'flex', flexDirection: 'column', gap: '12px' },
  catTag: { background: '#fff3e0', color: '#e65100', padding: '3px 10px', borderRadius: '12px', fontSize: '0.78rem', fontWeight: '600', alignSelf: 'flex-start' },
  title: { margin: 0, fontSize: '1.5rem', fontWeight: '700', color: '#1a1a2e', lineHeight: 1.3 },
  stars: { color: '#f90', fontSize: '1rem' },
  ratingCount: { color: '#888', fontSize: '0.85rem' },
  divider: { borderTop: '1px solid #f0f0f0' },
  priceRow: { display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' },
  price: { fontSize: '1.8rem', fontWeight: '800', color: '#e94560' },
  originalPrice: { fontSize: '1rem', color: '#aaa', textDecoration: 'line-through' },
  discount: { background: '#e8f5e9', color: '#27ae60', padding: '3px 8px', borderRadius: '4px', fontSize: '0.85rem', fontWeight: '600' },
  desc: { color: '#555', fontSize: '0.95rem', lineHeight: 1.6, margin: 0 },
  stockRow: { display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.9rem' },
  stockLabel: { color: '#888' },
  inStock: { color: '#27ae60', fontWeight: '600' },
  lowStock: { color: '#e65100', fontWeight: '600' },
  outOfStock: { color: '#e74c3c', fontWeight: '600' },
  vendorRow: { display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.9rem' },
  vendorLabel: { color: '#888' },
  vendorVal: { color: '#007185', fontWeight: '500' },
  deliveryBox: { background: '#f9f9f9', borderRadius: '6px', padding: '12px 16px', display: 'flex', flexDirection: 'column', gap: '4px' },
  deliveryItem: { margin: 0, fontSize: '0.88rem', color: '#555' },
  qtyRow: { display: 'flex', alignItems: 'center', gap: '12px' },
  qtyLabel: { color: '#555', fontSize: '0.9rem' },
  qtyControl: { display: 'flex', alignItems: 'center', gap: '0', border: '1px solid #ddd', borderRadius: '4px', overflow: 'hidden' },
  qtyBtn: { width: '36px', height: '36px', border: 'none', background: '#f5f5f5', cursor: 'pointer', fontSize: '1.1rem' },
  qtyVal: { width: '40px', textAlign: 'center', fontWeight: 'bold' },
  actionRow: { display: 'flex', gap: '12px', flexWrap: 'wrap' },
  addBtn: { flex: 1, background: '#f90', color: '#131921', border: 'none', padding: '12px', borderRadius: '4px', fontWeight: 'bold', fontSize: '1rem', cursor: 'pointer' },
  buyBtn: { flex: 1, background: '#131921', color: '#fff', border: 'none', padding: '12px', borderRadius: '4px', fontWeight: 'bold', fontSize: '1rem', cursor: 'pointer' },
  wishlistBtn: { background: 'none', border: '1px solid #ddd', padding: '10px', borderRadius: '4px', cursor: 'pointer', fontSize: '0.9rem', fontWeight: '500' },
};
