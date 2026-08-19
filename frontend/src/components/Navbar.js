import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import CartDrawer from './CartDrawer';

const CATEGORIES = ['All', 'Electronics', 'Clothing', 'Books', 'Home', 'Sports', 'Beauty', 'Toys', 'Grocery', 'Automotive'];

export default function Navbar() {
  const { user, logout } = useAuth();
  const { cartCount, wishlist } = useCart();
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [cartOpen, setCartOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [selectedCat, setSelectedCat] = useState('All');

  const handleSearch = (e) => {
    e.preventDefault();
    navigate(`/?search=${encodeURIComponent(search)}&category=${selectedCat === 'All' ? '' : selectedCat}`);
  };

  const handleLogout = () => { logout(); navigate('/login'); };

  return (
    <>
      {/* Top bar */}
      <nav style={s.topBar}>
        <Link to="/" style={s.brand}>🛒 ShopHub</Link>

        {/* Search bar */}
        <form onSubmit={handleSearch} style={s.searchForm}>
          <select style={s.catSelect} value={selectedCat} onChange={e => setSelectedCat(e.target.value)}>
            {CATEGORIES.map(c => <option key={c}>{c}</option>)}
          </select>
          <input style={s.searchInput} placeholder="Search products, brands and more..."
            value={search} onChange={e => setSearch(e.target.value)} />
          <button type="submit" style={s.searchBtn}>🔍</button>
        </form>

        {/* Right icons */}
        <div style={s.rightIcons}>
          {user ? (
            <div style={s.accountWrap} onMouseEnter={() => setDropdownOpen(true)} onMouseLeave={() => setDropdownOpen(false)}>
              <div style={s.iconBtn}>
                <span style={s.iconLabel}>Hello, {user.name.split(' ')[0]}</span>
                <span style={s.iconMain}>Account ▾</span>
              </div>
              {dropdownOpen && (
                <div style={s.dropdown}>
                  {user.role === 'ROLE_VENDOR' && <Link to="/vendor/dashboard" style={s.dropItem}>Vendor Dashboard</Link>}
                  {user.role === 'ROLE_ADMIN' && <Link to="/admin" style={s.dropItem}>Admin Panel</Link>}
                  <Link to="/orders" style={s.dropItem}>My Orders</Link>
                  <Link to="/wishlist" style={s.dropItem}>Wishlist ({wishlist.length})</Link>
                  <div style={s.dropDivider} />
                  <button onClick={handleLogout} style={s.dropLogout}>Sign Out</button>
                </div>
              )}
            </div>
          ) : (
            <div style={s.accountWrap} onMouseEnter={() => setDropdownOpen(true)} onMouseLeave={() => setDropdownOpen(false)}>
              <div style={s.iconBtn}>
                <span style={s.iconLabel}>Hello, Sign in</span>
                <span style={s.iconMain}>Account ▾</span>
              </div>
              {dropdownOpen && (
                <div style={s.dropdown}>
                  <Link to="/login" style={s.dropItem}>Sign In</Link>
                  <Link to="/register" style={s.dropItem}>Create Account</Link>
                </div>
              )}
            </div>
          )}

          <Link to="/wishlist" style={s.iconBtn}>
            <span style={s.iconLabel}>Wishlist</span>
            <span style={s.iconMain}>❤️ {wishlist.length > 0 && <span style={s.badge}>{wishlist.length}</span>}</span>
          </Link>

          <button onClick={() => setCartOpen(true)} style={s.cartIconBtn}>
            <span style={s.cartIcon}>🛒</span>
            {cartCount > 0 && <span style={s.cartBadge}>{cartCount}</span>}
            <span style={s.iconMain}>Cart</span>
          </button>
        </div>
      </nav>

      {/* Category nav bar */}
      <div style={s.catBar}>
        <span style={s.catBarItem} onClick={() => navigate('/')}>☰ All</span>
        {CATEGORIES.filter(c => c !== 'All').map(c => (
          <span key={c} style={s.catBarItem} onClick={() => navigate(`/?category=${c}`)}>{c}</span>
        ))}
        {user?.role === 'ROLE_VENDOR' && <Link to="/vendor/dashboard" style={{ ...s.catBarItem, color: '#f90' }}>Vendor Dashboard</Link>}
      </div>

      <CartDrawer open={cartOpen} onClose={() => setCartOpen(false)} />
    </>
  );
}

const s = {
  topBar: { display: 'flex', alignItems: 'center', gap: '12px', padding: '8px 16px', background: '#131921', color: '#fff', flexWrap: 'wrap' },
  brand: { color: '#f90', fontWeight: 'bold', fontSize: '1.5rem', textDecoration: 'none', whiteSpace: 'nowrap' },
  searchForm: { display: 'flex', flex: 1, minWidth: '280px', borderRadius: '4px', overflow: 'hidden' },
  catSelect: { background: '#f3f3f3', border: 'none', padding: '0 8px', fontSize: '0.8rem', color: '#333', cursor: 'pointer', maxWidth: '120px' },
  searchInput: { flex: 1, border: 'none', padding: '10px 14px', fontSize: '0.95rem', outline: 'none' },
  searchBtn: { background: '#f90', border: 'none', padding: '0 16px', fontSize: '1.1rem', cursor: 'pointer' },
  rightIcons: { display: 'flex', gap: '8px', alignItems: 'center' },
  accountWrap: { position: 'relative' },
  iconBtn: { display: 'flex', flexDirection: 'column', padding: '4px 10px', cursor: 'pointer', color: '#fff', textDecoration: 'none', borderRadius: '2px', border: '1px solid transparent', ':hover': { border: '1px solid #fff' } },
  iconLabel: { fontSize: '0.72rem', color: '#ccc' },
  iconMain: { fontSize: '0.88rem', fontWeight: 'bold', position: 'relative' },
  badge: { background: '#f90', color: '#131921', borderRadius: '50%', padding: '1px 5px', fontSize: '0.7rem', fontWeight: 'bold', marginLeft: '2px' },
  cartIconBtn: { display: 'flex', alignItems: 'center', gap: '4px', background: 'none', border: 'none', color: '#fff', cursor: 'pointer', padding: '4px 10px', position: 'relative', fontSize: '0.88rem', fontWeight: 'bold' },
  cartIcon: { fontSize: '1.4rem' },
  cartBadge: { position: 'absolute', top: '0', left: '22px', background: '#f90', color: '#131921', borderRadius: '50%', width: '18px', height: '18px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.7rem', fontWeight: 'bold' },
  dropdown: { position: 'absolute', top: '100%', right: 0, background: '#fff', boxShadow: '0 4px 20px rgba(0,0,0,0.15)', borderRadius: '4px', minWidth: '180px', zIndex: 1000, padding: '8px 0' },
  dropItem: { display: 'block', padding: '8px 16px', color: '#333', textDecoration: 'none', fontSize: '0.9rem', cursor: 'pointer' },
  dropDivider: { borderTop: '1px solid #eee', margin: '4px 0' },
  dropLogout: { display: 'block', width: '100%', textAlign: 'left', padding: '8px 16px', background: 'none', border: 'none', color: '#e94560', fontSize: '0.9rem', cursor: 'pointer' },
  catBar: { display: 'flex', gap: '0', background: '#232f3e', padding: '0 8px', overflowX: 'auto' },
  catBarItem: { color: '#fff', padding: '8px 12px', fontSize: '0.85rem', cursor: 'pointer', whiteSpace: 'nowrap', textDecoration: 'none', display: 'block' },
};
