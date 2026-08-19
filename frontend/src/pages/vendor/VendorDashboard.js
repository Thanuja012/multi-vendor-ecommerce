import { useState, useEffect } from 'react';
import { productApi, orderApi } from '../../services/api';
import toast from 'react-hot-toast';

const emptyForm = { name: '', description: '', price: '', stock: '', category: 'Electronics', imageUrls: [] };

export default function VendorDashboard() {
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [editId, setEditId] = useState(null);
  const [tab, setTab] = useState('products');

  const [backendError, setBackendError] = useState(false);

  useEffect(() => {
    productApi.getVendorProducts()
      .then(({ data }) => setProducts(data))
      .catch(() => setBackendError(true));
    orderApi.getVendorOrders()
      .then(({ data }) => setOrders(data))
      .catch(() => {});
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const payload = { ...form, price: parseFloat(form.price), stock: parseInt(form.stock) };
    try {
      if (editId) {
        const { data } = await productApi.update(editId, payload);
        setProducts(products.map((p) => (p.id === editId ? data : p)));
        toast.success('Product updated');
      } else {
        const { data } = await productApi.create(payload);
        setProducts([...products, data]);
        toast.success('Product created');
      }
      setForm(emptyForm);
      setEditId(null);
    } catch (err) {
      toast.error('Failed to save product');
    }
  };

  const handleEdit = (p) => {
    setForm({ name: p.name, description: p.description, price: p.price, stock: p.stock, category: p.category, imageUrls: p.imageUrls || [] });
    setEditId(p.id);
    setTab('products');
  };

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);
    Promise.all(files.map(file => new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = (ev) => resolve(ev.target.result);
      reader.readAsDataURL(file);
    }))).then(urls => setForm(f => ({ ...f, imageUrls: [...f.imageUrls, ...urls] })));
  };

  const removeImage = (idx) => {
    setForm(f => ({ ...f, imageUrls: f.imageUrls.filter((_, i) => i !== idx) }));
  };

  const handleDelete = async (id) => {
    await productApi.delete(id);
    setProducts(products.filter((p) => p.id !== id));
    toast.success('Product removed');
  };

  const updateOrderStatus = async (id, status) => {
    const { data } = await orderApi.updateStatus(id, status);
    setOrders(orders.map((o) => (o.id === id ? data : o)));
    toast.success('Order status updated');
  };

  const stats = {
    totalProducts: products.length,
    totalOrders: orders.length,
    revenue: orders.filter(o => o.status !== 'CANCELLED').reduce((s, o) => s + o.totalAmount, 0),
  };

  return (
    <div style={styles.container}>
      <h2 style={styles.heading}>Vendor Dashboard</h2>

      <div style={styles.statsRow}>
        {[['Products', stats.totalProducts], ['Orders', stats.totalOrders], ['Revenue', `$${stats.revenue.toFixed(2)}`]].map(([label, val]) => (
          <div key={label} style={styles.statCard}>
            <div style={styles.statVal}>{val}</div>
            <div style={styles.statLabel}>{label}</div>
          </div>
        ))}
      </div>

      <div style={styles.tabs}>
        {['products', 'add', 'orders'].map((t) => (
          <button key={t} style={{ ...styles.tab, ...(tab === t ? styles.activeTab : {}) }} onClick={() => setTab(t)}>
            {t === 'add' ? (editId ? 'Edit Product' : 'Add Product') : t.charAt(0).toUpperCase() + t.slice(1)}
          </button>
        ))}
      </div>

      {tab === 'products' && (
        <div style={styles.tableWrap}>
          {backendError && (
            <div style={styles.backendWarn}>
              ⚠️ Backend not connected. Products you add here will save once the Spring Boot server is running on port 8080.
            </div>
          )}
          {products.length === 0 && !backendError && (
            <div style={styles.emptyMsg}>No products yet. Click <strong>Add Product</strong> to list your first item.</div>
          )}
          {products.length === 0 && backendError && (
            <div style={styles.emptyMsg}>Start the backend with <code>mvn spring-boot:run</code> then refresh.</div>
          )}
          <table style={styles.table}>
            <thead><tr>{['Image', 'Name', 'Category', 'Price', 'Stock', 'Actions'].map(h => <th key={h} style={styles.th}>{h}</th>)}</tr></thead>
            <tbody>
              {products.map((p) => (
                <tr key={p.id}>
                  <td style={styles.td}>
                    {p.imageUrls && p.imageUrls[0]
                      ? <img src={p.imageUrls[0]} alt={p.name} style={styles.thumb} />
                      : <div style={styles.noImg}>{p.name[0]}</div>}
                  </td>
                  <td style={styles.td}>{p.name}</td>
                  <td style={styles.td}>{p.category}</td>
                  <td style={styles.td}>${p.price}</td>
                  <td style={styles.td}>{p.stock}</td>
                  <td style={styles.td}>
                    <button style={styles.editBtn} onClick={() => { handleEdit(p); setTab('add'); }}>Edit</button>
                    <button style={styles.delBtn} onClick={() => handleDelete(p.id)}>Delete</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {tab === 'add' && (
        <form onSubmit={handleSubmit} style={styles.form}>
          {['name', 'description', 'price', 'stock'].map((field) => (
            <input key={field} style={styles.input} placeholder={field.charAt(0).toUpperCase() + field.slice(1)}
              value={form[field]} onChange={(e) => setForm({ ...form, [field]: e.target.value })} required />
          ))}
          <select style={styles.input} value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })}>
            {['Electronics','Clothing','Books','Home','Sports','Beauty','Toys','Grocery','Automotive','Health'].map(c => <option key={c}>{c}</option>)}
          </select>

          <div>
            <label style={styles.uploadLabel}>
              📷 Upload Images
              <input type="file" accept="image/*" multiple onChange={handleImageChange} style={{ display: 'none' }} />
            </label>
            {form.imageUrls.length > 0 && (
              <div style={styles.previewRow}>
                {form.imageUrls.map((url, i) => (
                  <div key={i} style={styles.previewWrap}>
                    <img src={url} alt="preview" style={styles.previewImg} />
                    <button type="button" style={styles.removeImg} onClick={() => removeImage(i)}>✕</button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <button style={styles.submitBtn} type="submit">{editId ? 'Update Product' : 'Add Product'}</button>
          {editId && <button type="button" style={styles.cancelBtn} onClick={() => { setEditId(null); setForm(emptyForm); }}>Cancel</button>}
        </form>
      )}

      {tab === 'orders' && (
        <div style={styles.tableWrap}>
          <table style={styles.table}>
            <thead><tr>{['Order ID', 'Amount', 'Status', 'Payment', 'Update Status'].map(h => <th key={h} style={styles.th}>{h}</th>)}</tr></thead>
            <tbody>
              {orders.map((o) => (
                <tr key={o.id}>
                  <td style={styles.td}>{o.id.slice(-8)}</td>
                  <td style={styles.td}>${o.totalAmount.toFixed(2)}</td>
                  <td style={styles.td}><span style={{ ...styles.badge, background: statusColor(o.status) }}>{o.status}</span></td>
                  <td style={styles.td}>{o.paymentStatus}</td>
                  <td style={styles.td}>
                    <select style={styles.statusSelect} value={o.status}
                      onChange={(e) => updateOrderStatus(o.id, e.target.value)}>
                      {['PENDING', 'CONFIRMED', 'SHIPPED', 'DELIVERED', 'CANCELLED'].map(s => <option key={s}>{s}</option>)}
                    </select>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

const statusColor = (s) => ({ PENDING: '#f39c12', CONFIRMED: '#3498db', SHIPPED: '#9b59b6', DELIVERED: '#27ae60', CANCELLED: '#e74c3c' }[s] || '#888');

const styles = {
  container: { padding: '24px', background: '#f5f5f5', minHeight: '100vh' },
  heading: { color: '#1a1a2e', marginBottom: '20px' },
  statsRow: { display: 'flex', gap: '16px', marginBottom: '24px', flexWrap: 'wrap' },
  statCard: { background: '#fff', padding: '20px 32px', borderRadius: '8px', boxShadow: '0 2px 8px rgba(0,0,0,0.08)', textAlign: 'center', flex: 1, minWidth: '120px' },
  statVal: { fontSize: '1.8rem', fontWeight: 'bold', color: '#e94560' },
  statLabel: { color: '#888', fontSize: '0.9rem' },
  tabs: { display: 'flex', gap: '8px', marginBottom: '20px' },
  tab: { padding: '8px 20px', border: '1px solid #ddd', borderRadius: '4px', cursor: 'pointer', background: '#fff' },
  activeTab: { background: '#1a1a2e', color: '#fff', border: '1px solid #1a1a2e' },
  tableWrap: { background: '#fff', borderRadius: '8px', overflow: 'auto', boxShadow: '0 2px 8px rgba(0,0,0,0.08)' },
  table: { width: '100%', borderCollapse: 'collapse' },
  th: { padding: '12px 16px', background: '#1a1a2e', color: '#fff', textAlign: 'left', fontSize: '0.9rem' },
  td: { padding: '12px 16px', borderBottom: '1px solid #f0f0f0', fontSize: '0.9rem' },
  form: { background: '#fff', padding: '24px', borderRadius: '8px', display: 'flex', flexDirection: 'column', gap: '12px', maxWidth: '480px', boxShadow: '0 2px 8px rgba(0,0,0,0.08)' },
  input: { padding: '10px 14px', border: '1px solid #ddd', borderRadius: '4px', fontSize: '0.95rem' },
  submitBtn: { background: '#e94560', color: '#fff', border: 'none', padding: '12px', borderRadius: '4px', cursor: 'pointer' },
  cancelBtn: { background: '#888', color: '#fff', border: 'none', padding: '10px', borderRadius: '4px', cursor: 'pointer' },
  thumb: { width: '48px', height: '48px', objectFit: 'cover', borderRadius: '4px' },
  noImg: { width: '48px', height: '48px', background: '#1a1a2e', color: '#e94560', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '4px', fontWeight: 'bold', fontSize: '1.2rem' },
  uploadLabel: { display: 'inline-block', padding: '8px 16px', background: '#f0f0f0', border: '1px dashed #aaa', borderRadius: '4px', cursor: 'pointer', fontSize: '0.9rem' },
  previewRow: { display: 'flex', gap: '8px', flexWrap: 'wrap', marginTop: '10px' },
  previewWrap: { position: 'relative' },
  previewImg: { width: '72px', height: '72px', objectFit: 'cover', borderRadius: '4px', border: '1px solid #ddd' },
  removeImg: { position: 'absolute', top: '-6px', right: '-6px', background: '#e74c3c', color: '#fff', border: 'none', borderRadius: '50%', width: '18px', height: '18px', cursor: 'pointer', fontSize: '0.65rem', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 0 },
  editBtn: { background: '#3498db', color: '#fff', border: 'none', padding: '4px 10px', borderRadius: '4px', cursor: 'pointer', marginRight: '6px', fontSize: '0.8rem' },
  delBtn: { background: '#e74c3c', color: '#fff', border: 'none', padding: '4px 10px', borderRadius: '4px', cursor: 'pointer', fontSize: '0.8rem' },
  backendWarn: { background: '#fff3cd', border: '1px solid #ffc107', padding: '12px 16px', margin: '12px', borderRadius: '6px', fontSize: '0.88rem', color: '#856404' },
  emptyMsg: { padding: '32px', textAlign: 'center', color: '#888', fontSize: '0.95rem' },
  badge: { color: '#fff', padding: '2px 8px', borderRadius: '12px', fontSize: '0.75rem' },
  statusSelect: { padding: '4px 8px', border: '1px solid #ddd', borderRadius: '4px', fontSize: '0.85rem' },
};
