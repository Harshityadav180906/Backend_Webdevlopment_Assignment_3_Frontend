import { useState, useEffect } from 'react';
import axios from 'axios';
import { Toaster, toast } from 'react-hot-toast';
import { 
  Package, LayoutDashboard, Moon, Sun, 
  Edit2, Trash2, Plus, AlertCircle, 
  DollarSign, Tags, TrendingUp 
} from 'lucide-react';
import './index.css';

const API_URL = 'https://backend-webdevlopment-assignment-3.onrender.com/api/products';

function App() {
  const [products, setProducts] = useState([]);
  const [formData, setFormData] = useState({ name: '', price: '', description: '', category: '', stock: '' });
  const [editingId, setEditingId] = useState(null);
  const [theme, setTheme] = useState('light');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const savedTheme = localStorage.getItem('theme') || 'light';
    setTheme(savedTheme);
    document.documentElement.setAttribute('data-theme', savedTheme);
    fetchProducts();
  }, []);

  const toggleTheme = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
    document.documentElement.setAttribute('data-theme', newTheme);
    localStorage.setItem('theme', newTheme);
  };

  const fetchProducts = async () => {
    try {
      const res = await axios.get(API_URL);
      const data = Array.isArray(res.data) ? res.data : (res.data?.data || []);
      setProducts(data);
    } catch (error) {
      toast.error("Database connection failed. Ensure backend is running.");
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      if (editingId) {
        await axios.put(`${API_URL}/${editingId}`, formData);
        toast.success("Product updated successfully!");
      } else {
        await axios.post(API_URL, formData);
        toast.success("New product added to inventory!");
      }
      setFormData({ name: '', price: '', description: '', category: '', stock: '' });
      setEditingId(null);
      fetchProducts();
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to process request");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to permanently delete this product?")) {
      try {
        await axios.delete(`${API_URL}/${id}`);
        toast.success("Product removed from database.");
        fetchProducts();
      } catch (error) {
        toast.error("Failed to delete product.");
      }
    }
  };

  const handleEdit = (product) => {
    setFormData({
      name: product.name,
      price: product.price,
      description: product.description || '',
      category: product.category,
      stock: product.stock
    });
    setEditingId(product._id);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Dashboard Statistics
  const totalValue = products.reduce((acc, p) => acc + (p.price * p.stock), 0);
  const lowStockCount = products.filter(p => p.stock < 10).length;
  const uniqueCategories = new Set(products.map(p => p.category)).size;

  return (
    <div className="app-layout">
      <Toaster position="top-right" toastOptions={{ className: 'pro-toast' }} />
      
      {/* Sidebar / Navigation */}
      <nav className="sidebar">
        <div className="logo-container">
          <img src="/logo.png" alt="Lumina Logo" style={{ height: '32px', width: 'auto', borderRadius: '6px' }} />
          <h2>Lumina</h2>
        </div>
        <div className="nav-links">
          <button className="nav-item active"><LayoutDashboard size={20} /> Dashboard</button>
        </div>
        <div className="theme-toggle-wrapper">
          <button className="theme-toggle" onClick={toggleTheme}>
            {theme === 'light' ? <><Moon size={18} /> Dark Mode</> : <><Sun size={18} /> Light Mode</>}
          </button>
        </div>
      </nav>

      {/* Main Content Area */}
      <main className="main-content">
        <header className="topbar">
          <div>
            <h1>Inventory Overview</h1>
            <p className="subtitle">Manage your products and monitor stock levels in real-time.</p>
          </div>
          <div className="user-profile">
            <img src="https://ui-avatars.com/api/?name=Admin+User&background=6366f1&color=fff" alt="Admin" className="avatar" />
          </div>
        </header>

        {/* Stats Row */}
        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-icon bg-indigo"><Package size={24} /></div>
            <div className="stat-details">
              <h3>Total Products</h3>
              <p className="stat-value">{products.length}</p>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon bg-emerald"><TrendingUp size={24} /></div>
            <div className="stat-details">
              <h3>Inventory Value</h3>
              <p className="stat-value">${totalValue.toLocaleString(undefined, {minimumFractionDigits: 2})}</p>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon bg-amber"><Tags size={24} /></div>
            <div className="stat-details">
              <h3>Categories</h3>
              <p className="stat-value">{uniqueCategories}</p>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon bg-rose"><AlertCircle size={24} /></div>
            <div className="stat-details">
              <h3>Low Stock Alerts</h3>
              <p className="stat-value">{lowStockCount}</p>
            </div>
          </div>
        </div>

        <div className="content-grid">
          {/* Form Section */}
          <div className="form-section">
            <div className="pro-card">
              <div className="card-header">
                <h3>{editingId ? 'Edit Product Details' : 'Add New Product'}</h3>
                {editingId && <span className="badge badge-indigo">Editing Mode</span>}
              </div>
              <form onSubmit={handleSubmit} className="pro-form">
                <div className="form-group">
                  <label>Product Name</label>
                  <input type="text" name="name" value={formData.name} onChange={handleChange} required placeholder="e.g. Mechanical Keyboard" />
                </div>
                <div className="form-row">
                  <div className="form-group">
                    <label>Price (USD)</label>
                    <div className="input-with-icon">
                      <DollarSign size={16} className="input-icon" />
                      <input type="number" name="price" value={formData.price} onChange={handleChange} required step="0.01" placeholder="0.00" style={{paddingLeft: '36px'}}/>
                    </div>
                  </div>
                  <div className="form-group">
                    <label>Stock Qty</label>
                    <input type="number" name="stock" value={formData.stock} onChange={handleChange} required placeholder="0" />
                  </div>
                </div>
                <div className="form-group">
                  <label>Category</label>
                  <input type="text" name="category" value={formData.category} onChange={handleChange} required placeholder="e.g. Electronics" />
                </div>
                <div className="form-group">
                  <label>Description</label>
                  <textarea name="description" value={formData.description} onChange={handleChange} rows="3" placeholder="Brief product description..."></textarea>
                </div>
                <div className="form-actions">
                  {editingId && (
                    <button type="button" className="btn btn-ghost" onClick={() => {
                      setEditingId(null);
                      setFormData({ name: '', price: '', description: '', category: '', stock: '' });
                    }}>Cancel</button>
                  )}
                  <button type="submit" className="btn btn-primary" disabled={isSubmitting}>
                    {isSubmitting ? 'Saving...' : (editingId ? 'Update Product' : <><Plus size={18}/> Add Product</>)}
                  </button>
                </div>
              </form>
            </div>
          </div>

          {/* Table Section */}
          <div className="table-section">
            <div className="pro-card">
              <div className="card-header">
                <h3>Product Ledger</h3>
              </div>
              <div className="table-responsive">
                <table className="pro-table">
                  <thead>
                    <tr>
                      <th>Product Info</th>
                      <th>Price</th>
                      <th>Stock</th>
                      <th>Status</th>
                      <th className="text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {products.length === 0 ? (
                      <tr><td colSpan="5" className="empty-state-table">No products found. Start adding inventory.</td></tr>
                    ) : (
                      products.map((p) => (
                        <tr key={p._id}>
                          <td>
                            <div className="product-info-cell">
                              <div className="product-avatar">{p.name.substring(0,2).toUpperCase()}</div>
                              <div>
                                <p className="product-name">{p.name}</p>
                                <p className="product-category">{p.category}</p>
                              </div>
                            </div>
                          </td>
                          <td className="product-price">${Number(p.price).toFixed(2)}</td>
                          <td>
                            <span className={p.stock < 10 ? 'text-rose font-medium' : ''}>
                              {p.stock} units
                            </span>
                          </td>
                          <td>
                            <span className={`status-pill ${p.stock > 0 ? 'status-active' : 'status-danger'}`}>
                              {p.stock > 0 ? 'In Stock' : 'Out of Stock'}
                            </span>
                          </td>
                          <td className="text-right">
                            <div className="action-flex">
                              <button onClick={() => handleEdit(p)} className="icon-btn edit-btn" title="Edit"><Edit2 size={16}/></button>
                              <button onClick={() => handleDelete(p._id)} className="icon-btn delete-btn" title="Delete"><Trash2 size={16}/></button>
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

export default App;
