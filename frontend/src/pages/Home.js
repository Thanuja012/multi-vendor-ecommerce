import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { productApi } from '../services/api';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import MOCK_PRODUCTS from '../data/mockProducts';
import toast from 'react-hot-toast';

const CATEGORIES = [
  { name: 'Electronics',  emoji: '📱', color: '#e8f4fd', img: 'https://images.unsplash.com/photo-1498049794561-7780e7231661?w=300&q=80' },
  { name: 'Clothing',     emoji: '👗', color: '#fef9e7', img: 'https://images.unsplash.com/photo-1523381210434-271e8be1f52b?w=300&q=80' },
  { name: 'Books',        emoji: '📚', color: '#eafaf1', img: 'https://images.unsplash.com/photo-1512820790803-83ca734da794?w=300&q=80' },
  { name: 'Home',         emoji: '🏠', color: '#fdf2f8', img: 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=300&q=80' },
  { name: 'Sports',       emoji: '⚽', color: '#fff3e0', img: 'https://images.unsplash.com/photo-1461896836934-ffe607ba8211?w=300&q=80' },
  { name: 'Beauty',       emoji: '💄', color: '#fce4ec', img: 'https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=300&q=80' },
  { name: 'Toys',         emoji: '🧸', color: '#e8eaf6', img: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=300&q=80' },
  { name: 'Grocery',      emoji: '🛒', color: '#e8f5e9', img: 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=300&q=80' },
  { name: 'Automotive',   emoji: '🚗', color: '#eceff1', img: 'https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?w=300&q=80' },
  { name: 'Health',       emoji: '💊', color: '#e0f7fa', img: 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=300&q=80' },
];

const BANNERS = [
  { bg: 'linear-gradient(135deg,#131921,#232f3e)', title: 'Mega Sale — Up to 70% Off', sub: 'Electronics, Fashion & More', cta: 'Shop Now', cat: 'Electronics' },
  { bg: 'linear-gradient(135deg,#f90,#ff6b00)', title: 'New Arrivals in Fashion', sub: 'Trending styles for every season', cta: 'Explore', cat: 'Clothing' },
  { bg: 'linear-gradient(135deg,#1a6b3c,#27ae60)', title: 'Fresh Grocery Deals', sub: 'Farm fresh, delivered to your door', cta: 'Order Now', cat: 'Grocery' },
];

export default function Home() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [bannerIdx, setBannerIdx] = useState(0);
  const { addToCart, toggleWishlist, isWishlisted } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const params = new URLSearchParams(location.search);
  const searchQ = params.get('search') || '';
  const categoryQ = params.get('category') || '';

  useEffect(() => {
    setLoading(true);
    const p = {};
    if (searchQ) p.search = searchQ;
    if (categoryQ) p.category = categoryQ;
    productApi.getAll(p)
      .then(({ data }) => {
        // Merge real vendor products on top of mock catalog
        const realIds = new Set(data.map(r => r.id));
        let mock = MOCK_PRODUCTS;
        if (categoryQ) mock = mock.filter(m => m.category === categoryQ);
        if (searchQ) mock = mock.filter(m => m.name.toLowerCase().includes(searchQ.toLowerCase()));
        const merged = [...data, ...mock.filter(m => !realIds.has(m.id))];
        setProducts(merged);
        setLoading(false);
      })
      .catch(() => {
        // Fallback to mock only if backend is down
        let mock = MOCK_PRODUCTS;
        if (categoryQ) mock = mock.filter(m => m.category === categoryQ);
        if (searchQ) mock = mock.filter(m => m.name.toLowerCase().includes(searchQ.toLowerCase()));
        setProducts(mock);
        setLoading(false);
      });
  }, [searchQ, categoryQ]);

  useEffect(() => {
    const t = setInterval(() => setBannerIdx(i => (i + 1) % BANNERS.length), 4000);
    return () => clearInterval(t);
  }, []);

  const handleAddToCart = (p) => {
    addToCart(p);
    toast.success(`${p.name} added to cart`);
  };

  const handleWishlist = (p) => {
    if (!user) return toast.error('Please login to save items');
    toggleWishlist(p);
    toast.success(isWishlisted(p.id) ? 'Removed from wishlist' : 'Added to wishlist ❤️');
  };

  const showingFiltered = searchQ || categoryQ;
  const banner = BANNERS[bannerIdx];

  return (
    <div style={s.page}>

      {/* Hero Banner */}
      {!showingFiltered && (
        <div style={{ ...s.hero, background: banner.bg }}>
          <div style={s.heroContent}>
            <p style={s.heroSub}>{banner.sub}</p>
            <h1 style={s.heroTitle}>{banner.title}</h1>
            <button style={s.heroCta} onClick={() => navigate(`/?category=${banner.cat}`)}>
              {banner.cta} →
            </button>
          </div>
          <div style={s.heroDots}>
            {BANNERS.map((_, i) => (
              <span key={i} style={{ ...s.dot, background: i === bannerIdx ? '#f90' : 'rgba(255,255,255,0.4)' }}
                onClick={() => setBannerIdx(i)} />
            ))}
          </div>
        </div>
      )}

      {/* Category Grid */}
      {!showingFiltered && (
        <div style={s.section}>
          <h2 style={s.sectionTitle}>Shop by Category</h2>
          <div style={s.catGrid}>
            {CATEGORIES.map(cat => (
              <div key={cat.name} style={s.catCard} onClick={() => navigate(`/?category=${cat.name}`)}>
                <div style={s.catImgWrap}>
                  <img src={cat.img} alt={cat.name} style={s.catImg}
                    onError={e => { e.target.style.display = 'none'; e.target.nextSibling.style.display = 'flex'; }} />
                  <div style={{ ...s.catEmoji, display: 'none' }}>{cat.emoji}</div>
                </div>
                <p style={s.catName}>{cat.name}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Deals / Featured strip */}
      {!showingFiltered && products.length > 0 && (
        <div style={s.dealsBar}>
          <span style={s.dealsBadge}>🔥 Today's Deals</span>
          <span style={s.dealsText}>Free delivery on orders over $50 &nbsp;|&nbsp; New vendors joining daily</span>
        </div>
      )}

      {/* Products Section */}
      <div style={s.section}>
        {showingFiltered && (
          <div style={s.filterHeader}>
            <h2 style={s.sectionTitle}>
              {categoryQ ? `${categoryQ}` : `Results for "${searchQ}"`}
              <span style={s.resultCount}> — {products.length} products</span>
            </h2>
            <button style={s.clearFilter} onClick={() => navigate('/')}>✕ Clear filter</button>
          </div>
        )}
        {!showingFiltered && <h2 style={s.sectionTitle}>Featured Products</h2>}

        {loading ? (
          <div style={s.loadingGrid}>
            {[...Array(8)].map((_, i) => <div key={i} style={s.skeleton} />)}
          </div>
        ) : products.length === 0 ? (
          <div style={s.emptyState}>
            <div style={s.emptyIcon}>🔍</div>
            <h3>No products found</h3>
            <p>Try a different search or browse categories above</p>
            <button style={s.heroCta} onClick={() => navigate('/')}>Back to Home</button>
          </div>
        ) : (
          <div style={s.productGrid}>
            {products.map(p => (
              <div key={p.id} style={s.card}>
                {/* Wishlist button */}
                <button style={{ ...s.wishBtn, color: isWishlisted(p.id) ? '#e94560' : '#ccc' }}
                  onClick={() => handleWishlist(p)} title="Add to Wishlist">
                  {isWishlisted(p.id) ? '❤️' : '🤍'}
                </button>

                {/* Product image */}
                <div style={s.cardImg} onClick={() => navigate(`/product/${p.id}`)}>
                  {p.imageUrls?.[0]
                    ? <img src={p.imageUrls[0]} alt={p.name} style={s.productImg} />
                    : <div style={s.imgFallback}>{CATEGORIES.find(c => c.name === p.category)?.emoji || '📦'}</div>}
                </div>

                <div style={s.cardBody}>
                  <span style={s.catTag}>{p.category}</span>
                  <h3 style={s.cardTitle} onClick={() => navigate(`/product/${p.id}`)}>{p.name}</h3>
                  <p style={s.cardDesc}>{p.description}</p>

                  {/* Star rating */}
                  <div style={s.stars}>
                    {'★'.repeat(Math.round(p.rating || 4))}{'☆'.repeat(5 - Math.round(p.rating || 4))}
                    <span style={s.ratingCount}>({(p.reviews || 128).toLocaleString()})</span>
                  </div>

                  <div style={s.priceRow}>
                    <span style={s.price}>${p.price.toFixed(2)}</span>
                    <span style={s.originalPrice}>${(p.price * 1.2).toFixed(2)}</span>
                    <span style={s.discount}>20% off</span>
                  </div>

                  {p.vendorName && <p style={s.vendorName}>Sold by: {p.vendorName}</p>}

                  {p.stock <= 5 && p.stock > 0 && <p style={s.lowStock}>Only {p.stock} left!</p>}
                  {p.stock === 0 && <p style={s.outOfStock}>Out of Stock</p>}

                  <button style={{ ...s.addBtn, opacity: p.stock === 0 ? 0.5 : 1 }}
                    onClick={() => handleAddToCart(p)} disabled={p.stock === 0}>
                    {p.stock === 0 ? 'Out of Stock' : '🛒 Add to Cart'}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Footer strip */}
      <div style={s.footerStrip}>
        <div style={s.footerItem}><span style={s.footerIcon}>🚚</span><span>Free Delivery over $50</span></div>
        <div style={s.footerItem}><span style={s.footerIcon}>🔄</span><span>Easy 30-day Returns</span></div>
        <div style={s.footerItem}><span style={s.footerIcon}>🔒</span><span>Secure JWT Payments</span></div>
        <div style={s.footerItem}><span style={s.footerIcon}>🏪</span><span>1000+ Verified Vendors</span></div>
      </div>
    </div>
  );
}

const s = {
  page: { background: '#f3f3f3', minHeight: '100vh' },

  // Hero
  hero: { position: 'relative', padding: '60px 48px', color: '#fff', overflow: 'hidden', minHeight: '280px', display: 'flex', alignItems: 'center' },
  heroContent: { maxWidth: '500px', zIndex: 1 },
  heroSub: { margin: '0 0 8px', fontSize: '1rem', opacity: 0.85, letterSpacing: '1px', textTransform: 'uppercase' },
  heroTitle: { margin: '0 0 20px', fontSize: '2.2rem', fontWeight: '800', lineHeight: 1.2 },
  heroCta: { background: '#f90', color: '#131921', border: 'none', padding: '12px 28px', borderRadius: '4px', fontWeight: 'bold', fontSize: '1rem', cursor: 'pointer' },
  heroDots: { position: 'absolute', bottom: '16px', left: '50%', transform: 'translateX(-50%)', display: 'flex', gap: '8px' },
  dot: { width: '10px', height: '10px', borderRadius: '50%', cursor: 'pointer', transition: 'background 0.3s' },

  // Section
  section: { padding: '24px 24px' },
  sectionTitle: { fontSize: '1.4rem', fontWeight: '700', color: '#1a1a2e', marginBottom: '16px' },
  filterHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' },
  resultCount: { color: '#888', fontWeight: '400', fontSize: '1rem' },
  clearFilter: { background: 'none', border: '1px solid #ddd', padding: '6px 14px', borderRadius: '4px', cursor: 'pointer', color: '#555' },

  // Category grid
  catGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(130px, 1fr))', gap: '12px' },
  catCard: { background: '#fff', borderRadius: '8px', overflow: 'hidden', cursor: 'pointer', boxShadow: '0 1px 4px rgba(0,0,0,0.08)', transition: 'transform 0.2s', textAlign: 'center' },
  catImgWrap: { height: '100px', overflow: 'hidden', position: 'relative' },
  catImg: { width: '100%', height: '100%', objectFit: 'cover' },
  catEmoji: { width: '100%', height: '100%', alignItems: 'center', justifyContent: 'center', fontSize: '2.5rem', background: '#f5f5f5' },
  catName: { margin: '8px 0', fontWeight: '600', fontSize: '0.85rem', color: '#1a1a2e' },

  // Deals bar
  dealsBar: { background: '#131921', color: '#fff', padding: '10px 24px', display: 'flex', gap: '16px', alignItems: 'center', flexWrap: 'wrap' },
  dealsBadge: { background: '#f90', color: '#131921', padding: '3px 10px', borderRadius: '12px', fontWeight: 'bold', fontSize: '0.85rem' },
  dealsText: { fontSize: '0.9rem', opacity: 0.85 },

  // Product grid
  productGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '16px' },
  card: { background: '#fff', borderRadius: '8px', overflow: 'hidden', boxShadow: '0 1px 4px rgba(0,0,0,0.08)', position: 'relative', display: 'flex', flexDirection: 'column' },
  wishBtn: { position: 'absolute', top: '8px', right: '8px', background: 'rgba(255,255,255,0.9)', border: 'none', borderRadius: '50%', width: '32px', height: '32px', cursor: 'pointer', fontSize: '1rem', zIndex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 1px 4px rgba(0,0,0,0.15)' },
  cardImg: { height: '180px', overflow: 'hidden', cursor: 'pointer', background: '#f9f9f9', display: 'flex', alignItems: 'center', justifyContent: 'center' },
  productImg: { width: '100%', height: '100%', objectFit: 'cover', transition: 'transform 0.3s' },
  imgFallback: { fontSize: '4rem' },
  cardBody: { padding: '12px', display: 'flex', flexDirection: 'column', gap: '6px', flex: 1 },
  catTag: { background: '#fff3e0', color: '#e65100', padding: '2px 8px', borderRadius: '12px', fontSize: '0.72rem', fontWeight: '600', alignSelf: 'flex-start' },
  cardTitle: { margin: 0, fontSize: '0.92rem', fontWeight: '600', color: '#1a1a2e', cursor: 'pointer', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' },
  cardDesc: { margin: 0, fontSize: '0.8rem', color: '#888', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' },
  stars: { color: '#f90', fontSize: '0.85rem' },
  ratingCount: { color: '#888', fontSize: '0.78rem' },
  priceRow: { display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' },
  price: { color: '#e94560', fontWeight: 'bold', fontSize: '1.1rem' },
  originalPrice: { color: '#aaa', fontSize: '0.82rem', textDecoration: 'line-through' },
  discount: { background: '#e8f5e9', color: '#27ae60', padding: '1px 6px', borderRadius: '4px', fontSize: '0.75rem', fontWeight: '600' },
  lowStock: { color: '#e65100', fontSize: '0.78rem', margin: 0 },
  outOfStock: { color: '#e74c3c', fontSize: '0.78rem', margin: 0, fontWeight: '600' },
  vendorName: { margin: 0, fontSize: '0.75rem', color: '#007185' },
  addBtn: { background: '#f90', color: '#131921', border: 'none', padding: '9px', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold', fontSize: '0.88rem', marginTop: 'auto' },

  // Loading skeletons
  loadingGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '16px' },
  skeleton: { height: '320px', background: 'linear-gradient(90deg,#f0f0f0 25%,#e0e0e0 50%,#f0f0f0 75%)', backgroundSize: '200% 100%', borderRadius: '8px', animation: 'shimmer 1.5s infinite' },

  // Empty state
  emptyState: { textAlign: 'center', padding: '60px 20px', color: '#888' },
  emptyIcon: { fontSize: '4rem', marginBottom: '16px' },

  // Footer strip
  footerStrip: { background: '#131921', color: '#fff', display: 'flex', justifyContent: 'space-around', padding: '20px 24px', flexWrap: 'wrap', gap: '16px', marginTop: '24px' },
  footerItem: { display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.9rem' },
  footerIcon: { fontSize: '1.4rem' },
};
