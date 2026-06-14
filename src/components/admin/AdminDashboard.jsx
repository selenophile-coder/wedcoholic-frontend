import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../../context/AuthContext';
import { 
  Plus, Edit2, Trash2, Layout, Database, ShoppingCart, 
  Settings as SettingsIcon, LogOut, Check, X, ShieldAlert, TrendingUp, Upload,
  Video, Calendar
} from 'lucide-react';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5001/api';

export default function AdminDashboard({ onExit }) {
  const { token, logout, user } = useContext(AuthContext);
  const [activeTab, setActiveTab] = useState('analytics');
  
  // States
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [analytics, setAnalytics] = useState(null);
  const [timeframe, setTimeframe] = useState('weekly');
  
  const [settings, setSettings] = useState({
    isOfferPopupEnabled: true,
    offerPopupTitle: '',
    offerPopupText: '',
    offerPopupDiscountCode: '',
    offerPopupBgColor: '#7A0C2E',
    isNewArrivalsEnabled: true,
    newArrivalsTitle: "What's New",
    newArrivalsSubtitle: 'JUST ARRIVED',
    isCelebrityChoiceEnabled: true,
    celebrityChoiceTitle: 'Celebrity Closet',
    celebrityChoiceSubtitle: 'AS SEEN ON CELEBRITIES',
    heroSlides: [],
    occasionsList: []
  });

  const [bookings, setBookings] = useState([]);
  const [productErrors, setProductErrors] = useState({});

  // Modal / Form States
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [productForm, setProductForm] = useState({
    name: '',
    category: 'Men',
    price: '',
    image: '',
    badge: '',
    description: '',
    highlights: '',
    designer: '',
    sizes: 'S, M, L, XL',
    occasions: '',
    discount: '0',
    isNew: false,
    celebrityCloset: false,
    rating: '5.0',
  });

  // Load Data
  const fetchData = async () => {
    try {
      const headers = { Authorization: `Bearer ${token}` };

      // 1. Products
      const prodRes = await fetch(`${API_BASE}/products`);
      if (prodRes.ok) {
        const prodData = await prodRes.json();
        setProducts(prodData);
      }

      // 2. Orders
      const orderRes = await fetch(`${API_BASE}/orders`, { headers });
      if (orderRes.ok) {
        const orderData = await orderRes.json();
        setOrders(orderData);
      }

      // 3. Analytics
      const analyticsRes = await fetch(`${API_BASE}/orders/analytics?filter=${timeframe}`, { headers });
      if (analyticsRes.ok) {
        const analyticsData = await analyticsRes.json();
        setAnalytics(analyticsData);
      }

      // 4. Settings
      const settingsRes = await fetch(`${API_BASE}/settings`);
      if (settingsRes.ok) {
        const settingsData = await settingsRes.json();
        setSettings(settingsData);
      }

      // 5. Bookings
      const bookingsRes = await fetch(`${API_BASE}/bookings`, { headers });
      if (bookingsRes.ok) {
        const bookingsData = await bookingsRes.json();
        setBookings(bookingsData);
      }
    } catch (error) {
      console.error('Error fetching admin data:', error);
    }
  };

  useEffect(() => {
    if (token) {
      fetchData();
    }
  }, [token, timeframe]);

  const validateProductForm = () => {
    const errs = {};
    if (!productForm.name || productForm.name.trim().length < 3) {
      errs.name = 'Garment Name must be at least 3 characters';
    }
    if (!productForm.designer || productForm.designer.trim().length < 2) {
      errs.designer = 'Designer Brand is required';
    }
    const parsedPrice = parseFloat(productForm.price);
    if (isNaN(parsedPrice) || parsedPrice <= 0) {
      errs.price = 'Please enter a valid retail price greater than 0';
    }
    const parsedDiscount = parseFloat(productForm.discount);
    if (isNaN(parsedDiscount) || parsedDiscount < 0 || parsedDiscount > 99) {
      errs.discount = 'Discount must be a number between 0 and 99';
    }
    if (!productForm.image) {
      errs.image = 'Garment Image is required';
    } else if (!productForm.image.startsWith('data:image/') && !productForm.image.startsWith('http') && !productForm.image.startsWith('/')) {
      errs.image = 'Please enter a valid image URL or upload a file';
    }
    if (!productForm.description || productForm.description.trim().length < 10) {
      errs.description = 'Please enter a description of at least 10 characters';
    }
    const parsedRating = parseFloat(productForm.rating);
    if (isNaN(parsedRating) || parsedRating < 1 || parsedRating > 5) {
      errs.rating = 'Rating must be a number between 1.0 and 5.0';
    }

    setProductErrors(errs);
    return Object.keys(errs).length === 0;
  };

  // Handle product edit/add
  const handleProductSubmit = async (e) => {
    e.preventDefault();
    setProductErrors({});
    if (!validateProductForm()) return;

    const url = editingProduct 
      ? `${API_BASE}/products/${editingProduct._id}` 
      : `${API_BASE}/products`;
    const method = editingProduct ? 'PUT' : 'POST';

    try {
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(productForm),
      });

      if (response.ok) {
        setIsProductModalOpen(false);
        setEditingProduct(null);
        resetProductForm();
        fetchData();
      } else {
        const err = await response.json();
        alert(err.message || 'Action failed');
      }
    } catch (error) {
      console.error(error);
    }
  };

  // Convert uploaded image to Base64
  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setProductForm(prev => ({ ...prev, image: reader.result }));
      };
      reader.readAsDataURL(file);
    }
  };

  const resetProductForm = () => {
    setProductForm({
      name: '',
      category: 'Men',
      price: '',
      image: '',
      badge: '',
      description: '',
      highlights: '',
      designer: '',
      sizes: 'S, M, L, XL',
      occasions: '',
      discount: '0',
      isNew: false,
      celebrityCloset: false,
      rating: '5.0',
    });
  };

  const handleEditClick = (prod) => {
    setEditingProduct(prod);
    setProductForm({
      name: prod.name,
      category: prod.category,
      price: prod.price.toString(),
      image: prod.image,
      badge: prod.badge || '',
      description: prod.description,
      highlights: prod.highlights ? prod.highlights.join(', ') : '',
      designer: prod.designer,
      sizes: prod.sizes ? prod.sizes.join(', ') : 'S, M, L, XL',
      occasions: prod.occasions ? prod.occasions.join(', ') : '',
      discount: prod.discount ? prod.discount.toString() : '0',
      isNew: prod.isNew || false,
      celebrityCloset: prod.celebrityCloset || false,
      rating: prod.rating ? prod.rating.toString() : '5.0',
    });
    setIsProductModalOpen(true);
  };

  const handleDeleteClick = async (id) => {
    if (!window.confirm('Delete this masterpiece?')) return;
    try {
      const response = await fetch(`${API_BASE}/products/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      if (response.ok) {
        fetchData();
      }
    } catch (error) {
      console.error(error);
    }
  };

  // Handle status update
  const handleStatusUpdate = async (orderId, newStatus) => {
    try {
      const response = await fetch(`${API_BASE}/orders/${orderId}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ status: newStatus }),
      });

      if (response.ok) {
        fetchData();
      } else {
        const err = await response.json();
        alert(err.message || 'Status update failed');
      }
    } catch (error) {
      console.error(error);
    }
  };

  // Handle delete order record
  const handleDeleteOrder = async (orderId) => {
    if (!window.confirm('Delete this transaction record?')) return;
    try {
      const response = await fetch(`${API_BASE}/orders/${orderId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.ok) {
        fetchData();
      } else {
        const err = await response.json();
        alert(err.message || 'Delete failed');
      }
    } catch (error) {
      console.error(error);
    }
  };

  // Handle clear all order records
  const handleClearAllOrders = async () => {
    if (!window.confirm('WIPE ALL TRANSACTION AND ORDER RECORDS FROM THE DATABASE? This cannot be undone.')) return;
    try {
      const response = await fetch(`${API_BASE}/orders`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.ok) {
        fetchData();
      } else {
        const err = await response.json();
        alert(err.message || 'Clear failed');
      }
    } catch (error) {
      console.error(error);
    }
  };

  // Handle settings update
  const handleSettingsSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch(`${API_BASE}/settings`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(settings),
      });

      if (response.ok) {
        alert('Website configurations updated successfully!');
        fetchData();
      }
    } catch (error) {
      console.error(error);
    }
  };

  // Handle booking status update
  const handleBookingStatusUpdate = async (bookingId, newStatus) => {
    try {
      const response = await fetch(`${API_BASE}/bookings/${bookingId}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ status: newStatus }),
      });

      if (response.ok) {
        fetchData();
      } else {
        const err = await response.json();
        alert(err.message || 'Status update failed');
      }
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <div className="min-h-screen bg-neutral-900 text-neutral-100 flex flex-col lg:flex-row">
      {/* Sidebar navigation */}
      <div className="w-full lg:w-64 bg-neutral-950 border-b lg:border-b-0 lg:border-r border-neutral-800 flex flex-col lg:flex-col justify-between shrink-0 select-none">
        <div>
          <div className="p-4 lg:p-6 border-b border-neutral-800 flex items-center justify-between lg:justify-start gap-2">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center font-display font-extrabold text-white text-lg">W</div>
              <div>
                <h3 className="font-display font-bold text-sm tracking-wide">WedCoholic</h3>
                <p className="text-[10px] text-primary tracking-widest font-sans font-bold uppercase">{user?.role} Portal</p>
              </div>
            </div>

            {/* Quick Exit on Mobile/Tablet */}
            <button
              onClick={onExit}
              className="text-[10px] bg-neutral-900 hover:bg-neutral-850 px-2.5 py-1.5 rounded text-neutral-400 hover:text-white border border-neutral-800 cursor-pointer lg:hidden font-sans uppercase font-bold"
            >
              Exit Portal
            </button>
          </div>

          <div className="p-2 lg:p-4 flex flex-row lg:flex-col overflow-x-auto lg:overflow-visible gap-1 scrollbar-none">
            <button
              onClick={() => setActiveTab('analytics')}
              className={`whitespace-nowrap py-2 px-3 lg:py-2.5 lg:px-4 rounded-lg flex items-center gap-2 lg:gap-3 text-[10px] lg:text-xs font-sans font-bold uppercase tracking-wider transition ${
                activeTab === 'analytics' ? 'bg-primary text-white shadow-md' : 'text-neutral-400 hover:bg-neutral-800 hover:text-white'
              }`}
            >
              <TrendingUp className="w-3.5 h-3.5 lg:w-4 lg:h-4" />
              Bespoke Analytics
            </button>
            <button
              onClick={() => setActiveTab('products')}
              className={`whitespace-nowrap py-2 px-3 lg:py-2.5 lg:px-4 rounded-lg flex items-center gap-2 lg:gap-3 text-[10px] lg:text-xs font-sans font-bold uppercase tracking-wider transition ${
                activeTab === 'products' ? 'bg-primary text-white shadow-md' : 'text-neutral-400 hover:bg-neutral-800 hover:text-white'
              }`}
            >
              <Database className="w-3.5 h-3.5 lg:w-4 lg:h-4" />
              Manage Inventory
            </button>
            <button
              onClick={() => setActiveTab('orders')}
              className={`whitespace-nowrap py-2 px-3 lg:py-2.5 lg:px-4 rounded-lg flex items-center gap-2 lg:gap-3 text-[10px] lg:text-xs font-sans font-bold uppercase tracking-wider transition ${
                activeTab === 'orders' ? 'bg-primary text-white shadow-md' : 'text-neutral-400 hover:bg-neutral-800 hover:text-white'
              }`}
            >
              <ShoppingCart className="w-3.5 h-3.5 lg:w-4 lg:h-4" />
              Order Records
            </button>
            <button
              onClick={() => setActiveTab('bookings')}
              className={`whitespace-nowrap py-2 px-3 lg:py-2.5 lg:px-4 rounded-lg flex items-center gap-2 lg:gap-3 text-[10px] lg:text-xs font-sans font-bold uppercase tracking-wider transition ${
                activeTab === 'bookings' ? 'bg-primary text-white shadow-md' : 'text-neutral-400 hover:bg-neutral-800 hover:text-white'
              }`}
            >
              <Video className="w-3.5 h-3.5 lg:w-4 lg:h-4" />
              Styling Bookings
            </button>
            <button
              onClick={() => setActiveTab('settings')}
              className={`whitespace-nowrap py-2 px-3 lg:py-2.5 lg:px-4 rounded-lg flex items-center gap-2 lg:gap-3 text-[10px] lg:text-xs font-sans font-bold uppercase tracking-wider transition ${
                activeTab === 'settings' ? 'bg-primary text-white shadow-md' : 'text-neutral-400 hover:bg-neutral-800 hover:text-white'
              }`}
            >
              <SettingsIcon className="w-3.5 h-3.5 lg:w-4 lg:h-4" />
              Config Toggles
            </button>
          </div>
        </div>

        <div className="p-4 border-t border-neutral-800 hidden lg:flex flex-col gap-2">
          <button
            type="button"
            onClick={onExit}
            className="w-full py-2 px-4 rounded-lg bg-neutral-950 hover:bg-neutral-800 border border-neutral-800 text-[#C5A880] hover:text-white transition flex items-center justify-center gap-2 text-xs font-sans uppercase font-bold tracking-wider cursor-pointer"
          >
            Return to Shop
          </button>
          <button
            type="button"
            onClick={logout}
            className="w-full py-2 px-4 rounded-lg bg-neutral-850 hover:bg-red-900/40 border border-neutral-800 text-neutral-400 hover:text-white transition flex items-center justify-center gap-2 text-xs font-sans uppercase font-bold tracking-wider cursor-pointer"
          >
            <LogOut className="w-3.5 h-3.5" />
            Logout Securely
          </button>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 overflow-y-auto p-4 sm:p-8 max-h-screen">
        
        {/* ================= TAB 1: ANALYTICS ================= */}
        {activeTab === 'analytics' && (
          <div className="space-y-8">
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-baseline gap-3 pb-4 border-b border-neutral-850">
              <div>
                <h1 className="font-display text-xl sm:text-2xl font-bold tracking-tight">Couture Analytics Dashboard</h1>
                <p className="text-xs text-neutral-400 font-sans">Visual metrics, order transactions and database counts</p>
              </div>
              <div className="flex items-center gap-2 select-none self-start sm:self-auto">
                <span className="text-[10px] uppercase font-sans font-bold text-neutral-400">Timeframe:</span>
                <select
                  value={timeframe}
                  onChange={(e) => setTimeframe(e.target.value)}
                  className="bg-neutral-900 border border-neutral-850 text-xs text-neutral-200 px-3 py-1.5 rounded focus:outline-none focus:border-primary cursor-pointer font-bold"
                >
                  <option value="weekly">Weekly (Last 7 Days)</option>
                  <option value="monthly">Monthly (Last 30 Days)</option>
                </select>
              </div>
            </div>

            {/* Grid Summary Cards */}
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
              <div className="p-4 bg-neutral-950 border border-neutral-800 rounded-2xl flex items-center justify-between">
                <div>
                  <span className="text-[9px] uppercase font-sans font-bold text-neutral-500 tracking-wider">Gross Revenue</span>
                  <h3 className="font-display text-base sm:text-lg font-extrabold text-white mt-1 truncate max-w-[120px]">
                    {analytics ? new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(analytics.totalRevenue) : '₹0'}
                  </h3>
                </div>
              </div>

              <div className="p-4 bg-neutral-950 border border-neutral-800 rounded-2xl flex items-center justify-between">
                <div>
                  <span className="text-[9px] uppercase font-sans font-bold text-neutral-500 tracking-wider">Total Orders</span>
                  <h3 className="font-display text-base sm:text-lg font-extrabold text-white mt-1">
                    {analytics?.totalOrders || 0}
                  </h3>
                </div>
              </div>

              <div className="p-4 bg-neutral-950 border border-neutral-800 rounded-2xl flex items-center justify-between">
                <div>
                  <span className="text-[9px] uppercase font-sans font-bold text-neutral-500 tracking-wider">Delivered</span>
                  <h3 className="font-display text-base sm:text-lg font-extrabold text-emerald-400 mt-1">
                    {analytics?.deliveredCount || 0}
                  </h3>
                </div>
              </div>

              <div className="p-4 bg-neutral-950 border border-neutral-800 rounded-2xl flex items-center justify-between">
                <div>
                  <span className="text-[9px] uppercase font-sans font-bold text-neutral-500 tracking-wider">Returned</span>
                  <h3 className="font-display text-base sm:text-lg font-extrabold text-amber-400 mt-1">
                    {analytics?.returnedCount || 0}
                  </h3>
                </div>
              </div>

              <div className="p-4 bg-neutral-950 border border-neutral-800 rounded-2xl flex items-center justify-between">
                <div>
                  <span className="text-[9px] uppercase font-sans font-bold text-neutral-500 tracking-wider">Cancelled</span>
                  <h3 className="font-display text-base sm:text-lg font-extrabold text-red-400 mt-1">
                    {analytics?.cancelledCount || 0}
                  </h3>
                </div>
              </div>

              <div className="p-4 bg-neutral-950 border border-neutral-800 rounded-2xl flex items-center justify-between">
                <div>
                  <span className="text-[9px] uppercase font-sans font-bold text-neutral-500 tracking-wider">Defected</span>
                  <h3 className="font-display text-base sm:text-lg font-extrabold text-neutral-400 mt-1">
                    {analytics?.defectedCount || 0}
                  </h3>
                </div>
              </div>
            </div>

            {/* SVG Order Count Chart */}
            <div className="p-6 bg-neutral-950 border border-neutral-800 rounded-2xl">
              <h4 className="font-display text-sm font-bold uppercase tracking-wider text-neutral-300 mb-6 flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-primary" />
                {timeframe === 'weekly' ? 'Daily Order Trend (Last 7 Days)' : 'Daily Order Trend (Last 30 Days)'}
              </h4>

              {analytics && analytics.timeline && analytics.timeline.length > 0 ? (
                <div className="overflow-x-auto pb-4 scroll-smooth">
                  <div className="h-64 relative flex items-end justify-between border-b border-neutral-800 pb-2 min-w-[500px]">
                    {analytics.timeline.map((day, idx) => {
                      const maxVal = Math.max(...analytics.timeline.map(t => t.count), 1);
                      const pct = (day.count / maxVal) * 80 + 10; 

                      return (
                        <div key={idx} className="flex-1 flex flex-col items-center group relative px-1">
                          {/* Tooltip */}
                          <div className="absolute -top-12 bg-neutral-800 text-white text-[10px] py-1.5 px-2.5 rounded-lg shadow-xl opacity-0 group-hover:opacity-100 transition duration-200 pointer-events-none z-10 border border-neutral-700 whitespace-nowrap text-center">
                            <p className="font-bold text-primary">{day.count} Order(s)</p>
                            <p className="text-neutral-400 font-medium">₹{day.revenue.toLocaleString('en-IN')}</p>
                          </div>
                          
                          {/* Bar */}
                          <div 
                            style={{ height: `${pct}%` }}
                            className="w-full max-w-[32px] bg-gradient-to-t from-primary/80 to-primary rounded-t-sm transition-all duration-500 group-hover:to-secondary cursor-pointer shadow-lg hover:shadow-primary/20"
                          ></div>
                          
                          {/* Label */}
                          <span className="text-[8px] text-neutral-500 font-bold uppercase mt-3 font-sans truncate max-w-full text-center">
                            {day.date}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ) : (
                <div className="h-64 flex items-center justify-center text-xs text-neutral-500">
                  Insufficient transaction reports. Seed mock data to view stats.
                </div>
              )}
            </div>
          </div>
        )}

        {/* ================= TAB 2: PRODUCTS CRUD ================= */}
        {activeTab === 'products' && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 pb-4 border-b border-neutral-800">
              <div>
                <h1 className="font-display text-2xl font-bold tracking-tight">Garments Master Inventory</h1>
                <p className="text-xs text-neutral-400 font-sans">Modify prices, discounts, tags, badges, and catalog descriptions</p>
              </div>
              <button
                onClick={() => {
                  setEditingProduct(null);
                  resetProductForm();
                  setIsProductModalOpen(true);
                }}
                className="bg-primary hover:bg-[#5C061E] text-white py-2 px-4 rounded-lg flex items-center gap-2 text-xs font-sans uppercase font-bold tracking-wider cursor-pointer border-none shadow-md self-start sm:self-auto"
              >
                <Plus className="w-4 h-4" />
                Add Masterpiece
              </button>
            </div>

            {/* Inventory Table Grid */}
            <div className="bg-neutral-950 border border-neutral-800 rounded-2xl overflow-x-auto shadow-2xl">
              <table className="min-w-[800px] w-full text-left border-collapse text-xs sm:text-sm">
                <thead>
                  <tr className="border-b border-neutral-850 bg-neutral-900/50 text-[10px] text-neutral-400 uppercase font-sans font-bold tracking-widest select-none">
                    <th className="p-4">Couture Item</th>
                    <th className="p-4">Designer</th>
                    <th className="p-4">Category</th>
                    <th className="p-4">Retail Price</th>
                    <th className="p-4">Discount</th>
                    <th className="p-4 text-center">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-900">
                  {products.map((prod) => (
                    <tr key={prod._id} className="hover:bg-neutral-900/20 transition-colors">
                      <td className="p-4 flex items-center gap-3">
                        <img 
                          alt={prod.name}
                          src={prod.image}
                          className="w-10 h-12 object-cover rounded-lg bg-neutral-800 border border-neutral-800"
                        />
                        <div>
                          <h4 className="font-sans font-bold text-neutral-200">{prod.name}</h4>
                          <span className="text-[9px] bg-primary/10 text-primary px-2 py-0.5 rounded uppercase font-bold border border-primary/20 tracking-wider">
                            {prod.badge || 'Standard'}
                          </span>
                        </div>
                      </td>
                      <td className="p-4 text-neutral-300 font-medium">{prod.designer}</td>
                      <td className="p-4 text-neutral-400 font-semibold">{prod.category}</td>
                      <td className="p-4 text-white font-extrabold font-sans">₹{prod.price.toLocaleString('en-IN')}</td>
                      <td className="p-4 text-secondary-accent font-bold font-sans">{prod.discount}% Off</td>
                      <td className="p-4">
                        <div className="flex justify-center gap-2.5">
                          <button
                            onClick={() => handleEditClick(prod)}
                            className="p-1.5 hover:bg-neutral-800 rounded text-neutral-400 hover:text-white transition cursor-pointer border-none bg-transparent"
                            title="Edit details"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleDeleteClick(prod._id)}
                            className="p-1.5 hover:bg-neutral-800 rounded text-red-500 hover:text-red-400 transition cursor-pointer border-none bg-transparent"
                            title="Delete item"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ================= TAB 3: ORDERS LIST ================= */}
        {activeTab === 'orders' && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 pb-4 border-b border-neutral-800">
              <div>
                <h1 className="font-display text-2xl font-bold tracking-tight">Transaction Order Records</h1>
                <p className="text-xs text-neutral-400 font-sans">Fulfillment status logs, shipping addresses, and bespoke items ordered</p>
              </div>
              {orders.length > 0 && (
                <button
                  onClick={handleClearAllOrders}
                  className="bg-red-950/60 hover:bg-red-900 text-white border border-red-900 py-2 px-4 rounded-lg flex items-center gap-2 text-xs font-sans uppercase font-bold tracking-wider cursor-pointer shadow-md self-start sm:self-auto"
                >
                  <Trash2 className="w-4 h-4" />
                  Clear Order Records
                </button>
              )}
            </div>

            <div className="bg-neutral-950 border border-neutral-800 rounded-2xl overflow-x-auto shadow-2xl">
              <table className="min-w-[950px] w-full text-left border-collapse text-xs sm:text-sm">
                <thead>
                  <tr className="border-b border-neutral-850 bg-neutral-900/50 text-[10px] text-neutral-400 uppercase font-sans font-bold tracking-widest select-none">
                    <th className="p-4">Order Details</th>
                    <th className="p-4">Customer</th>
                    <th className="p-4">Items Summary</th>
                    <th className="p-4">Total Price</th>
                    <th className="p-4">Fulfillment Status</th>
                    <th className="p-4">Payment</th>
                    <th className="p-4 text-center">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-900">
                  {orders.map((order) => (
                    <tr key={order._id} className="hover:bg-neutral-900/20 transition-colors">
                      <td className="p-4">
                        <span className="font-mono text-neutral-400 font-bold block">ID: {order._id.substring(18)}</span>
                        <span className="text-[10px] text-neutral-500 font-medium font-sans">Date: {new Date(order.createdAt).toLocaleDateString()}</span>
                      </td>
                      <td className="p-4">
                        <h4 className="font-sans font-bold text-neutral-200">{order.guestDetails?.name || 'Guest User'}</h4>
                        <p className="text-[10px] text-neutral-500 font-medium font-sans">{order.guestDetails?.email}</p>
                      </td>
                      <td className="p-4">
                        <div className="space-y-1">
                          {order.items.map((it, idx) => (
                            <div key={idx} className="text-[11px] text-neutral-300 font-medium">
                              {it.name} <span className="text-neutral-500 font-sans font-bold">x{it.quantity}</span> ({it.selectedSize})
                            </div>
                          ))}
                        </div>
                      </td>
                      <td className="p-4 text-white font-extrabold font-sans">₹{order.totalPrice.toLocaleString('en-IN')}</td>
                      <td className="p-4">
                        <select
                          value={order.status}
                          onChange={(e) => handleStatusUpdate(order._id, e.target.value)}
                          className="bg-neutral-900 border border-neutral-800 text-xs text-neutral-200 px-2.5 py-1.5 rounded-lg focus:outline-none focus:border-primary cursor-pointer font-bold font-sans"
                        >
                          <option value="Pending">Pending</option>
                          <option value="Confirmed">Confirmed</option>
                          <option value="Packed">Packed</option>
                          <option value="Shipped">Shipped</option>
                          <option value="Delivered">Delivered</option>
                          <option value="Returned">Returned</option>
                          <option value="Cancelled">Cancelled</option>
                          <option value="Defected">Defected</option>
                        </select>
                      </td>
                      <td className="p-4">
                        <span className={`px-2 py-0.5 rounded-sm text-[9px] uppercase tracking-wider font-sans font-bold border ${
                          order.paymentStatus === 'Paid' 
                            ? 'bg-emerald-950 text-emerald-400 border-emerald-800' 
                            : 'bg-red-950 text-red-400 border-red-800'
                        }`}>
                          {order.paymentStatus}
                        </span>
                        <p className="text-[9px] text-neutral-500 mt-1 uppercase font-bold tracking-wider font-sans">{order.paymentMethod}</p>
                      </td>
                      <td className="p-4">
                        <div className="flex justify-center">
                          <button
                            onClick={() => handleDeleteOrder(order._id)}
                            className="p-1.5 hover:bg-neutral-800 rounded text-red-500 hover:text-red-400 transition cursor-pointer border-none bg-transparent"
                            title="Delete transaction log"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ================= TAB 4: SETTINGS POP-UP TOGGLE ================= */}
        {activeTab === 'settings' && (
          <div className="space-y-6 max-w-xl mx-auto">
            <div className="pb-4 border-b border-neutral-800">
              <h1 className="font-display text-2xl font-bold tracking-tight text-center sm:text-left">Website Customizations & Toggles</h1>
              <p className="text-xs text-neutral-400 font-sans text-center sm:text-left">Toggle offer pop-ups, custom segment headers, titles, and section states</p>
            </div>

            <form onSubmit={handleSettingsSubmit} className="bg-neutral-950 border border-neutral-800 rounded-2xl p-6 space-y-6 shadow-2xl">
              
              {/* SECTION 1: PROMO BANNER */}
              <div className="space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-neutral-800">
                  <div>
                    <h4 className="font-sans font-bold text-neutral-200">Active Offer Pop-Up Banner</h4>
                    <p className="text-[11px] text-neutral-500 font-sans mt-0.5">Show or hide the promo banner popup for clients on home view</p>
                  </div>
                  
                  <button
                    type="button"
                    onClick={() => setSettings(prev => ({ ...prev, isOfferPopupEnabled: !prev.isOfferPopupEnabled }))}
                    className={`w-12 h-6.5 rounded-full p-1 transition-colors cursor-pointer border-none flex items-center ${
                      settings.isOfferPopupEnabled ? 'bg-primary justify-end' : 'bg-neutral-700 justify-start'
                    }`}
                  >
                    <span className="w-4.5 h-4.5 rounded-full bg-white shadow-md"></span>
                  </button>
                </div>

                {settings.isOfferPopupEnabled && (
                  <div className="space-y-4 pt-2">
                    <div className="space-y-1.5">
                      <label className="text-[10px] uppercase font-sans font-bold tracking-widest text-neutral-400">Popup Banner Title</label>
                      <input
                        type="text"
                        required
                        value={settings.offerPopupTitle}
                        onChange={(e) => setSettings(prev => ({ ...prev, offerPopupTitle: e.target.value }))}
                        className="w-full bg-neutral-900 border border-neutral-800 px-3.5 py-2.5 text-xs sm:text-sm rounded-lg outline-none focus:border-primary text-white"
                        placeholder="e.g. Royal Season Discount"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-[10px] uppercase font-sans font-bold tracking-widest text-neutral-400">Promotion Message Description</label>
                      <textarea
                        required
                        rows={2}
                        value={settings.offerPopupText}
                        onChange={(e) => setSettings(prev => ({ ...prev, offerPopupText: e.target.value }))}
                        className="w-full bg-neutral-900 border border-neutral-800 px-3.5 py-2.5 text-xs sm:text-sm rounded-lg outline-none focus:border-primary text-white resize-none"
                        placeholder="Promo text message description details..."
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-1.5">
                        <label className="text-[10px] uppercase font-sans font-bold tracking-widest text-neutral-400">Coupon Discount Code</label>
                        <input
                          type="text"
                          required
                          value={settings.offerPopupDiscountCode}
                          onChange={(e) => setSettings(prev => ({ ...prev, offerPopupDiscountCode: e.target.value }))}
                          className="w-full bg-neutral-900 border border-neutral-800 px-3.5 py-2.5 text-xs sm:text-sm rounded-lg outline-none focus:border-primary text-white"
                        />
                      </div>

                      <div className="space-y-1.5">
                        <label className="text-[10px] uppercase font-sans font-bold tracking-widest text-neutral-400">HEX Bg Color</label>
                        <div className="flex gap-2">
                          <input
                            type="color"
                            value={settings.offerPopupBgColor}
                            onChange={(e) => setSettings(prev => ({ ...prev, offerPopupBgColor: e.target.value }))}
                            className="w-10 h-10 rounded border border-neutral-800 bg-neutral-900 cursor-pointer overflow-hidden p-0"
                          />
                          <input
                            type="text"
                            required
                            value={settings.offerPopupBgColor}
                            onChange={(e) => setSettings(prev => ({ ...prev, offerPopupBgColor: e.target.value }))}
                            className="flex-1 bg-neutral-900 border border-neutral-800 px-3 py-2 text-xs rounded-lg outline-none focus:border-primary text-white"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* SECTION 2: NEW ARRIVALS */}
              <div className="space-y-4 pt-4 border-t border-neutral-800">
                <div className="flex items-center justify-between pb-3 border-b border-neutral-800">
                  <div>
                    <h4 className="font-sans font-bold text-neutral-200">New Arrivals Section</h4>
                    <p className="text-[11px] text-neutral-500 font-sans mt-0.5">Toggle and customize the "What's New" section on the home page</p>
                  </div>
                  
                  <button
                    type="button"
                    onClick={() => setSettings(prev => ({ ...prev, isNewArrivalsEnabled: !prev.isNewArrivalsEnabled }))}
                    className={`w-12 h-6.5 rounded-full p-1 transition-colors cursor-pointer border-none flex items-center ${
                      settings.isNewArrivalsEnabled ? 'bg-primary justify-end' : 'bg-neutral-700 justify-start'
                    }`}
                  >
                    <span className="w-4.5 h-4.5 rounded-full bg-white shadow-md"></span>
                  </button>
                </div>

                {settings.isNewArrivalsEnabled && (
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-[10px] uppercase font-sans font-bold tracking-widest text-neutral-400">Section Title</label>
                      <input
                        type="text"
                        required
                        value={settings.newArrivalsTitle}
                        onChange={(e) => setSettings(prev => ({ ...prev, newArrivalsTitle: e.target.value }))}
                        className="w-full bg-neutral-900 border border-neutral-800 px-3.5 py-2.5 text-xs sm:text-sm rounded-lg outline-none focus:border-primary text-white"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-[10px] uppercase font-sans font-bold tracking-widest text-neutral-400">Section Subtitle</label>
                      <input
                        type="text"
                        required
                        value={settings.newArrivalsSubtitle}
                        onChange={(e) => setSettings(prev => ({ ...prev, newArrivalsSubtitle: e.target.value }))}
                        className="w-full bg-neutral-900 border border-neutral-800 px-3.5 py-2.5 text-xs sm:text-sm rounded-lg outline-none focus:border-primary text-white"
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* SECTION 3: CELEBRITY CHOICE */}
              <div className="space-y-4 pt-4 border-t border-neutral-800">
                <div className="flex items-center justify-between pb-3 border-b border-neutral-800">
                  <div>
                    <h4 className="font-sans font-bold text-neutral-200">Celebrity Choice Section</h4>
                    <p className="text-[11px] text-neutral-500 font-sans mt-0.5">Toggle and customize the "Celebrity Closet" section on the home page</p>
                  </div>
                  
                  <button
                    type="button"
                    onClick={() => setSettings(prev => ({ ...prev, isCelebrityChoiceEnabled: !prev.isCelebrityChoiceEnabled }))}
                    className={`w-12 h-6.5 rounded-full p-1 transition-colors cursor-pointer border-none flex items-center ${
                      settings.isCelebrityChoiceEnabled ? 'bg-primary justify-end' : 'bg-neutral-700 justify-start'
                    }`}
                  >
                    <span className="w-4.5 h-4.5 rounded-full bg-white shadow-md"></span>
                  </button>
                </div>

                {settings.isCelebrityChoiceEnabled && (
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-[10px] uppercase font-sans font-bold tracking-widest text-neutral-400">Section Title</label>
                      <input
                        type="text"
                        required
                        value={settings.celebrityChoiceTitle}
                        onChange={(e) => setSettings(prev => ({ ...prev, celebrityChoiceTitle: e.target.value }))}
                        className="w-full bg-neutral-900 border border-neutral-800 px-3.5 py-2.5 text-xs sm:text-sm rounded-lg outline-none focus:border-primary text-white"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-[10px] uppercase font-sans font-bold tracking-widest text-neutral-400">Section Subtitle</label>
                      <input
                        type="text"
                        required
                        value={settings.celebrityChoiceSubtitle}
                        onChange={(e) => setSettings(prev => ({ ...prev, celebrityChoiceSubtitle: e.target.value }))}
                        className="w-full bg-neutral-900 border border-neutral-800 px-3.5 py-2.5 text-xs sm:text-sm rounded-lg outline-none focus:border-primary text-white"
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* SECTION 4: HERO SLIDES CRUD EDITOR */}
              <div className="space-y-4 pt-4 border-t border-neutral-800">
                <div className="pb-3 border-b border-neutral-800">
                  <h4 className="font-sans font-bold text-neutral-200">Hero Carousel Campaign Slides</h4>
                  <p className="text-[11px] text-neutral-500 font-sans mt-0.5">Customize homepage hero campaign slides (Titles & Base64 images)</p>
                </div>

                <div className="space-y-4">
                  {settings.heroSlides && settings.heroSlides.map((slide, index) => (
                    <div key={index} className="bg-neutral-900 border border-neutral-800 p-4 rounded-xl space-y-3 relative">
                      <div className="flex justify-between items-center select-none">
                        <span className="text-[10px] uppercase font-sans font-bold text-primary">Slide #{index + 1}</span>
                        <div className="flex gap-2">
                          <button
                            type="button"
                            disabled={index === 0}
                            onClick={() => {
                              const newSlides = [...settings.heroSlides];
                              const temp = newSlides[index];
                              newSlides[index] = newSlides[index - 1];
                              newSlides[index - 1] = temp;
                              setSettings(prev => ({ ...prev, heroSlides: newSlides }));
                            }}
                            className="bg-neutral-850 hover:bg-neutral-750 text-neutral-300 disabled:opacity-40 disabled:hover:bg-neutral-850 text-[10px] px-2 py-1 rounded cursor-pointer border border-neutral-800"
                          >
                            Move Up
                          </button>
                          <button
                            type="button"
                            disabled={index === settings.heroSlides.length - 1}
                            onClick={() => {
                              const newSlides = [...settings.heroSlides];
                              const temp = newSlides[index];
                              newSlides[index] = newSlides[index + 1];
                              newSlides[index + 1] = temp;
                              setSettings(prev => ({ ...prev, heroSlides: newSlides }));
                            }}
                            className="bg-neutral-850 hover:bg-neutral-750 text-neutral-300 disabled:opacity-40 disabled:hover:bg-neutral-850 text-[10px] px-2 py-1 rounded cursor-pointer border border-neutral-800"
                          >
                            Move Down
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              const newSlides = settings.heroSlides.filter((_, i) => i !== index);
                              setSettings(prev => ({ ...prev, heroSlides: newSlides }));
                            }}
                            className="bg-red-950/40 hover:bg-red-900 text-red-400 text-[10px] px-2 py-1 rounded cursor-pointer border border-red-900"
                          >
                            Delete
                          </button>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <div className="space-y-1">
                          <label className="text-[9px] uppercase font-sans font-bold tracking-widest text-neutral-400">Slide Title</label>
                          <input
                            type="text"
                            required
                            value={slide.title}
                            onChange={(e) => {
                              const newSlides = [...settings.heroSlides];
                              newSlides[index].title = e.target.value;
                              setSettings(prev => ({ ...prev, heroSlides: newSlides }));
                            }}
                            className="w-full bg-neutral-950 border border-neutral-800 px-3 py-2 text-xs rounded-lg text-white outline-none focus:border-primary"
                            placeholder="e.g. Regal Couture Collection"
                          />
                        </div>

                        <div className="space-y-1">
                          <label className="text-[9px] uppercase font-sans font-bold tracking-widest text-neutral-400">Slide Image</label>
                          <div className="flex flex-col gap-2 bg-neutral-950/50 p-2.5 border border-neutral-800 rounded-lg">
                            <div className="flex items-center gap-2">
                              <label className="flex items-center gap-1.5 bg-neutral-850 hover:bg-neutral-800 border border-neutral-750 text-neutral-200 px-2.5 py-1 rounded text-[9px] uppercase font-sans font-bold tracking-wider cursor-pointer transition select-none">
                                <Upload className="w-3 h-3 text-secondary" />
                                Choose Slide File
                                <input
                                  type="file"
                                  accept="image/*"
                                  onChange={(e) => {
                                    const file = e.target.files[0];
                                    if (file) {
                                      const reader = new FileReader();
                                      reader.onloadend = () => {
                                        const newSlides = [...settings.heroSlides];
                                        newSlides[index].image = reader.result;
                                        setSettings(prev => ({ ...prev, heroSlides: newSlides }));
                                      };
                                      reader.readAsDataURL(file);
                                    }
                                  }}
                                  className="hidden"
                                />
                              </label>
                              <span className="text-[8px] text-neutral-500 font-sans">
                                {slide.image && slide.image.startsWith('data:') ? 'Custom Image Loaded (Base64)' : 'Static Path or URL'}
                                | Recommended Size: 1920x800 (landscape format)
                              </span>
                            </div>

                            <div className="flex gap-2 items-center">
                              <input
                                type="text"
                                required
                                value={slide.image}
                                onChange={(e) => {
                                    const newSlides = [...settings.heroSlides];
                                    newSlides[index].image = e.target.value;
                                    setSettings(prev => ({ ...prev, heroSlides: newSlides }));
                                }}
                                className="flex-1 bg-neutral-950 border border-neutral-855 px-3 py-1.5 text-xs rounded outline-none text-white font-mono"
                                placeholder="/images/hero/custom.jpg"
                              />
                              {slide.image && (
                                <img 
                                  src={slide.image} 
                                  alt="Slide preview" 
                                  className="w-10 h-6 object-cover rounded border border-neutral-800 bg-neutral-950 shrink-0"
                                  onError={(e) => e.target.style.display = 'none'}
                                />
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}

                  <button
                    type="button"
                    onClick={() => {
                      const newSlides = [...(settings.heroSlides || [])];
                      newSlides.push({ title: 'New Regal Campaign', image: '/images/hero/home.webp' });
                      setSettings(prev => ({ ...prev, heroSlides: newSlides }));
                    }}
                    className="w-full py-2.5 rounded-lg border border-dashed border-neutral-750 bg-neutral-900/40 hover:bg-neutral-850/50 text-neutral-300 text-xs font-sans font-bold uppercase tracking-wider flex items-center justify-center gap-2 cursor-pointer transition"
                  >
                    <Plus className="w-4 h-4 text-primary" />
                    Add Carousel Slide
                  </button>
                </div>
              </div>

              {/* SECTION 5: SHOP BY OCCASION CUSTOMIZATION */}
              <div className="space-y-4 pt-4 border-t border-neutral-800">
                <div className="pb-3 border-b border-neutral-800">
                  <h4 className="font-sans font-bold text-neutral-200">Shop By Occasion Banners</h4>
                  <p className="text-[11px] text-neutral-500 font-sans mt-0.5">Customize display labels and uploaded images for the 5 homepage occasion grids</p>
                </div>

                <div className="space-y-4">
                  {settings.occasionsList && settings.occasionsList.map((occ, index) => (
                    <div key={index} className="bg-neutral-900 border border-neutral-800 p-4 rounded-xl space-y-3">
                      <div className="flex justify-between items-center select-none">
                        <span className="text-[10px] uppercase font-sans font-bold text-primary">Occasion #{index + 1} - {occ.name}</span>
                        <span className="text-[8px] text-neutral-400 font-sans font-bold uppercase">{occ.name === 'The Wedding' ? 'Main Tall Grid' : 'Standard Grid'}</span>
                      </div>

                      <div className="space-y-2">
                        <div className="space-y-1">
                          <label className="text-[9px] uppercase font-sans font-bold tracking-widest text-neutral-400">Display Title / Label</label>
                          <input
                            type="text"
                            required
                            value={occ.label}
                            onChange={(e) => {
                              const newOccasions = [...settings.occasionsList];
                              newOccasions[index].label = e.target.value;
                              setSettings(prev => ({ ...prev, occasionsList: newOccasions }));
                            }}
                            className="w-full bg-neutral-950 border border-neutral-800 px-3 py-2 text-xs rounded-lg text-white outline-none focus:border-primary"
                            placeholder="e.g. Sangeet Soirée"
                          />
                        </div>

                        <div className="space-y-1">
                          <label className="text-[9px] uppercase font-sans font-bold tracking-widest text-neutral-400">Card Image Background</label>
                          <div className="flex flex-col gap-2 bg-neutral-955 p-2.5 border border-neutral-800 rounded-lg">
                            <div className="flex items-center gap-2">
                              <label className="flex items-center gap-1.5 bg-neutral-850 hover:bg-neutral-800 border border-neutral-750 text-neutral-200 px-2.5 py-1 rounded text-[9px] uppercase font-sans font-bold tracking-wider cursor-pointer transition select-none">
                                <Upload className="w-3.5 h-3.5 text-secondary" />
                                Choose Image File
                                <input
                                  type="file"
                                  accept="image/*"
                                  onChange={(e) => {
                                    const file = e.target.files[0];
                                    if (file) {
                                      const reader = new FileReader();
                                      reader.onloadend = () => {
                                        const newOccasions = [...settings.occasionsList];
                                        newOccasions[index].img = reader.result;
                                        setSettings(prev => ({ ...prev, occasionsList: newOccasions }));
                                      };
                                      reader.readAsDataURL(file);
                                    }
                                  }}
                                  className="hidden"
                                />
                              </label>
                              <span className="text-[8px] text-neutral-500 font-sans">
                                {occ.img && occ.img.startsWith('data:') ? 'Custom Image Loaded (Base64)' : 'Static Path'} | 
                                Recommended Size: {occ.name === 'The Wedding' ? '800x1200' : '800x600'}
                              </span>
                            </div>

                            <div className="flex gap-2 items-center">
                              <input
                                type="text"
                                required
                                value={occ.img}
                                onChange={(e) => {
                                    const newOccasions = [...settings.occasionsList];
                                    newOccasions[index].img = e.target.value;
                                    setSettings(prev => ({ ...prev, occasionsList: newOccasions }));
                                }}
                                className="flex-1 bg-neutral-950 border border-neutral-855 px-3 py-1.5 text-xs rounded outline-none text-white font-mono"
                                placeholder="/images/occasions/file.webp"
                              />
                              {occ.img && (
                                <img 
                                  src={occ.img} 
                                  alt="Preview" 
                                  className="w-8 h-10 object-cover rounded border border-neutral-800 bg-neutral-955 shrink-0"
                                  onError={(e) => e.target.style.display = 'none'}
                                />
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Submit Settings */}
              <button
                type="submit"
                className="w-full bg-primary hover:bg-[#5C061E] text-white py-3.5 rounded-lg font-sans font-bold uppercase tracking-widest text-xs border-none cursor-pointer shadow-md transition-colors pt-4 animate-pulse"
              >
                Save all configurations
              </button>

            </form>
          </div>
        )}

        {/* ================= TAB 5: APPOINTMENTS ================= */}
        {activeTab === 'bookings' && (
          <div className="space-y-6 animate-fade-in">
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 pb-4 border-b border-neutral-800">
              <div>
                <h1 className="font-display text-2xl font-bold tracking-tight">Virtual Fitting & Styling Consultations</h1>
                <p className="text-xs text-neutral-400 font-sans">Review virtual bookings, customer notes, styling houses, and timing slots</p>
              </div>
            </div>

            <div className="bg-neutral-950 border border-neutral-800 rounded-2xl overflow-x-auto shadow-2xl">
              <table className="min-w-[900px] w-full text-left border-collapse text-xs sm:text-sm">
                <thead>
                  <tr className="border-b border-neutral-850 bg-neutral-900/50 text-[10px] text-neutral-400 uppercase font-sans font-bold tracking-widest select-none">
                    <th className="p-4">Customer Details</th>
                    <th className="p-4">Boutique House</th>
                    <th className="p-4">Style Category</th>
                    <th className="p-4">Appointment Date</th>
                    <th className="p-4">Time Slot (IST)</th>
                    <th className="p-4">Special Notes</th>
                    <th className="p-4 text-center">Status</th>
                    <th className="p-4 text-center">Booked Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-900">
                  {bookings && bookings.length > 0 ? (
                    bookings.map((booking) => (
                      <tr key={booking._id} className="hover:bg-neutral-900/20 transition-colors">
                        <td className="p-4">
                          <h4 className="font-sans font-bold text-neutral-200">{booking.name}</h4>
                          <p className="text-[10px] text-neutral-500 font-medium font-sans">{booking.email}</p>
                          <p className="text-[10px] text-[#C5A880] font-sans font-bold mt-0.5">{booking.phone}</p>
                        </td>
                        <td className="p-4 text-neutral-300 font-bold uppercase tracking-wider text-[11px]">{booking.designer}</td>
                        <td className="p-4 text-neutral-300 font-semibold">{booking.style}</td>
                        <td className="p-4 text-white font-extrabold flex items-center gap-1.5 mt-2">
                          <Calendar className="w-3.5 h-3.5 text-primary" />
                          {booking.date}
                        </td>
                        <td className="p-4 text-neutral-300 font-bold font-sans">{booking.time}</td>
                        <td className="p-4 text-neutral-400 leading-relaxed max-w-[200px] truncate" title={booking.notes}>
                          {booking.notes || <span className="text-neutral-600 font-sans italic">None</span>}
                        </td>
                        <td className="p-4 text-center">
                          <select
                            value={booking.status || 'Pending'}
                            onChange={(e) => handleBookingStatusUpdate(booking._id, e.target.value)}
                            className="bg-neutral-900 border border-neutral-800 rounded px-2.5 py-1 text-[11px] font-bold text-white outline-none cursor-pointer focus:border-primary"
                          >
                            <option value="Pending">Pending</option>
                            <option value="Approved">Approved</option>
                          </select>
                        </td>
                        <td className="p-4 text-neutral-500 text-center">{booking.createdAt ? new Date(booking.createdAt).toLocaleDateString() : 'N/A'}</td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="8" className="p-8 text-center text-xs text-neutral-500 font-medium">
                        No virtual styling consultations booked yet.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

      </div>

      {/* ================= EDIT / ADD PRODUCT MODAL ================= */}
      {isProductModalOpen && (
        <div className="fixed inset-0 z-[250] flex items-center justify-center px-4">
          <div className="fixed inset-0 bg-black/80 backdrop-blur-sm" onClick={() => setIsProductModalOpen(false)}></div>
          <div className="relative w-full max-w-xl bg-neutral-950 border border-neutral-800 rounded-2xl overflow-hidden z-10 flex flex-col max-h-[85vh]">
            
            <div className="bg-neutral-900 p-5 flex justify-between items-center border-b border-neutral-800 select-none">
              <h3 className="font-display text-base font-bold uppercase tracking-wider text-neutral-200">
                {editingProduct ? 'Edit Couture details' : 'Add New Couture Piece'}
              </h3>
              <button onClick={() => setIsProductModalOpen(false)} className="text-neutral-400 hover:text-white border-none bg-transparent cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleProductSubmit} className="p-6 overflow-y-auto space-y-4 text-xs select-none">
              
              <div className="space-y-1.5">
                <label className="text-[9px] uppercase font-sans font-bold tracking-widest text-neutral-400">Garment Name</label>
                <input
                  type="text"
                  value={productForm.name}
                  onChange={(e) => setProductForm(prev => ({ ...prev, name: e.target.value }))}
                  className="w-full bg-neutral-900 border border-neutral-800 px-3.5 py-2 rounded-lg text-white outline-none focus:border-primary"
                  placeholder="Grand Ivory Sherwani"
                />
                {productErrors.name && <p className="text-[10px] text-red-500 mt-1">{productErrors.name}</p>}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[9px] uppercase font-sans font-bold tracking-widest text-neutral-400">Designer Brand</label>
                  <input
                    type="text"
                    value={productForm.designer}
                    onChange={(e) => setProductForm(prev => ({ ...prev, designer: e.target.value }))}
                    className="w-full bg-neutral-900 border border-neutral-800 px-3.5 py-2 rounded-lg text-white outline-none"
                    placeholder="e.g. Manyavar Mohey"
                  />
                  {productErrors.designer && <p className="text-[10px] text-red-500 mt-1">{productErrors.designer}</p>}
                </div>
                <div className="space-y-1.5">
                  <label className="text-[9px] uppercase font-sans font-bold tracking-widest text-neutral-400">Category Tag</label>
                  <select
                    value={productForm.category}
                    onChange={(e) => setProductForm(prev => ({ ...prev, category: e.target.value }))}
                    className="w-full bg-neutral-900 border border-neutral-850 px-3 py-2 rounded-lg text-white outline-none cursor-pointer"
                  >
                    <option value="Men">Men</option>
                    <option value="Lehengas">Lehengas</option>
                    <option value="Women">Women</option>
                    <option value="Kids">Kids</option>
                    <option value="Designers">Designers</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div className="space-y-1.5">
                  <label className="text-[9px] uppercase font-sans font-bold tracking-widest text-neutral-400">Retail Price (INR)</label>
                  <input
                    type="number"
                    value={productForm.price}
                    onChange={(e) => setProductForm(prev => ({ ...prev, price: e.target.value }))}
                    className="w-full bg-neutral-900 border border-neutral-800 px-3.5 py-2 rounded-lg text-white outline-none"
                  />
                  {productErrors.price && <p className="text-[10px] text-red-500 mt-1">{productErrors.price}</p>}
                </div>
                <div className="space-y-1.5">
                  <label className="text-[9px] uppercase font-sans font-bold tracking-widest text-neutral-400">Discount %</label>
                  <input
                    type="number"
                    value={productForm.discount}
                    onChange={(e) => setProductForm(prev => ({ ...prev, discount: e.target.value }))}
                    className="w-full bg-neutral-900 border border-neutral-800 px-3.5 py-2 rounded-lg text-white outline-none"
                  />
                  {productErrors.discount && <p className="text-[10px] text-red-500 mt-1">{productErrors.discount}</p>}
                </div>
                <div className="space-y-1.5">
                  <label className="text-[9px] uppercase font-sans font-bold tracking-widest text-neutral-400">Collection Badge</label>
                  <input
                    type="text"
                    value={productForm.badge}
                    onChange={(e) => setProductForm(prev => ({ ...prev, badge: e.target.value }))}
                    className="w-full bg-neutral-900 border border-neutral-800 px-3.5 py-2 rounded-lg text-white outline-none"
                    placeholder="e.g. Couture Master"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-[9px] uppercase font-sans font-bold tracking-widest text-neutral-400">Garment Rating (1.0 - 5.0)</label>
                <input
                  type="number"
                  step="0.1"
                  min="1"
                  max="5"
                  value={productForm.rating}
                  onChange={(e) => setProductForm(prev => ({ ...prev, rating: e.target.value }))}
                  className="w-full bg-neutral-900 border border-neutral-800 px-3.5 py-2 rounded-lg text-white outline-none focus:border-primary"
                  placeholder="e.g. 4.8"
                />
                {productErrors.rating && <p className="text-[10px] text-red-500 mt-1">{productErrors.rating}</p>}
              </div>

              {/* IMAGE UPLOAD & TEXT PREVIEW CONSOLE */}
              <div className="space-y-1.5">
                <label className="text-[9px] uppercase font-sans font-bold tracking-widest text-neutral-400">Garment Image</label>
                <div className="flex flex-col gap-2 bg-neutral-900/60 p-3.5 border border-neutral-850 rounded-xl">
                  <div className="flex items-center gap-2">
                    <label className="flex items-center gap-2 bg-neutral-800 hover:bg-neutral-750 border border-neutral-700 text-neutral-200 px-3 py-1.5 rounded-lg text-[10px] uppercase font-sans font-bold tracking-wider cursor-pointer transition select-none">
                      <Upload className="w-3.5 h-3.5 text-secondary" />
                      Choose Image File
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleImageUpload}
                        className="hidden"
                      />
                    </label>
                    <span className="text-[9px] text-neutral-500 font-medium font-sans">
                      {productForm.image && productForm.image.startsWith('data:') ? 'Image uploaded (Base64)' : 'Select local image file'} |
                      Rec. Aspect Ratio: 2:3 portrait (e.g. 1000x1500)
                    </span>
                  </div>

                  <div className="flex gap-2.5 items-center">
                    <input
                      type="text"
                      value={productForm.image}
                      onChange={(e) => setProductForm(prev => ({ ...prev, image: e.target.value }))}
                      className="flex-1 bg-neutral-950 border border-neutral-800 px-3.5 py-2 rounded-lg text-white outline-none"
                      placeholder="e.g. /images/products/item.jpg or paste Base64 string..."
                    />
                    {productForm.image && (
                      <img 
                        src={productForm.image} 
                        alt="Preview" 
                        className="w-9 h-11 object-cover rounded border border-neutral-800 bg-neutral-955 shrink-0"
                        onError={(e) => e.target.style.display = 'none'}
                      />
                    )}
                  </div>
                  {productErrors.image && <p className="text-[10px] text-red-500 mt-1">{productErrors.image}</p>}
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-[9px] uppercase font-sans font-bold tracking-widest text-neutral-400">Detailed Description</label>
                <textarea
                  rows={2}
                  value={productForm.description}
                  onChange={(e) => setProductForm(prev => ({ ...prev, description: e.target.value }))}
                  className="w-full bg-neutral-900 border border-neutral-800 px-3.5 py-2 rounded-lg text-white outline-none resize-none"
                />
                {productErrors.description && <p className="text-[10px] text-red-500 mt-1">{productErrors.description}</p>}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[9px] uppercase font-sans font-bold tracking-widest text-neutral-400">Occasions (Comma Separated)</label>
                  <input
                    type="text"
                    value={productForm.occasions}
                    onChange={(e) => setProductForm(prev => ({ ...prev, occasions: e.target.value }))}
                    className="w-full bg-neutral-900 border border-neutral-800 px-3.5 py-2 rounded-lg text-white outline-none"
                    placeholder="Wedding, Sangeet"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[9px] uppercase font-sans font-bold tracking-widest text-neutral-400">Sizes (Comma Separated)</label>
                  <input
                    type="text"
                    value={productForm.sizes}
                    onChange={(e) => setProductForm(prev => ({ ...prev, sizes: e.target.value }))}
                    className="w-full bg-neutral-900 border border-neutral-800 px-3.5 py-2 rounded-lg text-white outline-none"
                  />
                </div>
              </div>

              {/* Toggles */}
              <div className="flex gap-6 py-2 border-t border-b border-neutral-850">
                <label className="flex items-center gap-2 text-neutral-300 font-semibold cursor-pointer">
                  <input
                    type="checkbox"
                    checked={productForm.isNew}
                    onChange={(e) => setProductForm(prev => ({ ...prev, isNew: e.target.checked }))}
                    className="accent-primary"
                  />
                  New Arrival
                </label>
                <label className="flex items-center gap-2 text-neutral-300 font-semibold cursor-pointer">
                  <input
                    type="checkbox"
                    checked={productForm.celebrityCloset}
                    onChange={(e) => setProductForm(prev => ({ ...prev, celebrityCloset: e.target.checked }))}
                    className="accent-primary"
                  />
                  Celebrity Choice
                </label>
              </div>

              {/* Submit Buttons */}
              <div className="flex gap-3 pt-3 border-t border-neutral-850">
                <button
                  type="submit"
                  className="flex-1 bg-primary hover:bg-[#5C061E] text-white py-2.5 rounded-lg font-sans font-bold uppercase tracking-wider text-xs border-none cursor-pointer transition"
                >
                  Save Piece
                </button>
                <button
                  type="button"
                  onClick={() => setIsProductModalOpen(false)}
                  className="bg-neutral-800 hover:bg-neutral-750 text-neutral-300 px-5 py-2.5 rounded-lg font-sans font-bold uppercase tracking-wider text-xs border border-neutral-700 cursor-pointer"
                >
                  Cancel
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

    </div>
  );
}
