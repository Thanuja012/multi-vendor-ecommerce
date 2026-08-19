import { useState, useEffect } from 'react';
import { adminApi } from '../../services/api';
import toast from 'react-hot-toast';

export default function AdminPanel() {
  const [vendors, setVendors] = useState([]);
  const [users, setUsers] = useState([]);
  const [tab, setTab] = useState('vendors');

  useEffect(() => {
    adminApi.getVendors().then(({ data }) => setVendors(data));
    adminApi.getUsers().then(({ data }) => setUsers(data));
  }, []);

  const approve = async (id) => {
    const { data } = await adminApi.approveVendor(id);
    setVendors(vendors.map((v) => (v.id === id ? data : v)));
    toast.success('Vendor approved');
  };

  const suspend = async (id) => {
    const { data } = await adminApi.suspendVendor(id);
    setVendors(vendors.map((v) => (v.id === id ? data : v)));
    toast.success('Vendor suspended');
  };

  const statusColor = { PENDING: '#f39c12', APPROVED: '#27ae60', SUSPENDED: '#e74c3c' };

  return (
    <div style={styles.container}>
      <h2 style={styles.heading}>Admin Panel</h2>

      <div style={styles.statsRow}>
        <div style={styles.statCard}><div style={styles.statVal}>{vendors.length}</div><div style={styles.statLabel}>Total Vendors</div></div>
        <div style={styles.statCard}><div style={styles.statVal}>{vendors.filter(v => v.status === 'PENDING').length}</div><div style={styles.statLabel}>Pending Approval</div></div>
        <div style={styles.statCard}><div style={styles.statVal}>{users.length}</div><div style={styles.statLabel}>Total Users</div></div>
      </div>

      <div style={styles.tabs}>
        {['vendors', 'users'].map((t) => (
          <button key={t} style={{ ...styles.tab, ...(tab === t ? styles.activeTab : {}) }} onClick={() => setTab(t)}>
            {t.charAt(0).toUpperCase() + t.slice(1)}
          </button>
        ))}
      </div>

      {tab === 'vendors' && (
        <div style={styles.tableWrap}>
          <table style={styles.table}>
            <thead><tr>{['Store Name', 'Status', 'Rating', 'Sales', 'Actions'].map(h => <th key={h} style={styles.th}>{h}</th>)}</tr></thead>
            <tbody>
              {vendors.map((v) => (
                <tr key={v.id}>
                  <td style={styles.td}>{v.storeName}</td>
                  <td style={styles.td}><span style={{ ...styles.badge, background: statusColor[v.status] }}>{v.status}</span></td>
                  <td style={styles.td}>{v.rating.toFixed(1)} ⭐</td>
                  <td style={styles.td}>{v.totalSales}</td>
                  <td style={styles.td}>
                    {v.status !== 'APPROVED' && <button style={styles.approveBtn} onClick={() => approve(v.id)}>Approve</button>}
                    {v.status !== 'SUSPENDED' && <button style={styles.suspendBtn} onClick={() => suspend(v.id)}>Suspend</button>}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {tab === 'users' && (
        <div style={styles.tableWrap}>
          <table style={styles.table}>
            <thead><tr>{['Name', 'Email', 'Role', 'Status'].map(h => <th key={h} style={styles.th}>{h}</th>)}</tr></thead>
            <tbody>
              {users.map((u) => (
                <tr key={u.id}>
                  <td style={styles.td}>{u.name}</td>
                  <td style={styles.td}>{u.email}</td>
                  <td style={styles.td}>{[...u.roles].join(', ')}</td>
                  <td style={styles.td}><span style={{ ...styles.badge, background: u.active ? '#27ae60' : '#e74c3c' }}>{u.active ? 'Active' : 'Inactive'}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

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
  badge: { color: '#fff', padding: '2px 8px', borderRadius: '12px', fontSize: '0.75rem' },
  approveBtn: { background: '#27ae60', color: '#fff', border: 'none', padding: '4px 10px', borderRadius: '4px', cursor: 'pointer', marginRight: '6px', fontSize: '0.8rem' },
  suspendBtn: { background: '#e74c3c', color: '#fff', border: 'none', padding: '4px 10px', borderRadius: '4px', cursor: 'pointer', fontSize: '0.8rem' },
};
