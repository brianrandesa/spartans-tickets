import { useState, useEffect } from 'react';
import {
  LayoutDashboard,
  DollarSign,
  Grid3X3,
  LogOut,
  Save,
  Trash2,
  Plus,
  RefreshCw,
  Check,
  AlertCircle,
  MessageCircle,
  Send,
  Clock,
  CheckCircle2,
  Circle,
  BookOpen,
  Edit3,
  X,
  Upload,
  Ticket,
  Tag
} from 'lucide-react';

interface AdminDashboardProps {
  onLogout: () => void;
}

type Tab = 'overview' | 'banners' | 'pricing' | 'seats' | 'sales' | 'support' | 'knowledge' | 'sold-tickets' | 'coupons';

interface Banner {
  id: string;
  text: string;
  active: boolean;
  backgroundColor: string;
  textColor: string;
}

interface SectionPrice {
  id: string;
  name: string;
  price: number;
  level: string;
}

interface SalesSummary {
  totalRevenue: number;
  ticketsSold: number;
  todayRevenue: number;
  todayTickets: number;
}

interface SupportMessage {
  id: string;
  message: string;
  sender: 'client' | 'support';
  status: 'pending' | 'in_progress' | 'resolved';
  createdAt: string;
  resolvedAt?: string;
  resolvedNotes?: string;
}

interface KnowledgeArticle {
  id: string;
  title: string;
  content: string;
  category: string;
  createdAt: string;
  updatedAt: string;
}

interface SoldTicket {
  id: string;
  soldAt: string;
  customerName?: string;
  customerEmail?: string;
}

interface Coupon {
  code: string;
  discount: number; // in cents
  discountType: 'fixed' | 'percent';
  active: boolean;
  usageCount: number;
}

export function AdminDashboard({ onLogout }: AdminDashboardProps) {
  const [activeTab, setActiveTab] = useState<Tab>('overview');
  const [saving, setSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Banner state
  const [banners, setBanners] = useState<Banner[]>([]);
  const [newBannerText, setNewBannerText] = useState('');

  // Pricing state
  const [sections, setSections] = useState<SectionPrice[]>([]);

  // Sales state
  const [sales, setSales] = useState<SalesSummary>({
    totalRevenue: 0,
    ticketsSold: 0,
    todayRevenue: 0,
    todayTickets: 0
  });

  // Seat stats
  const [seatStats, setSeatStats] = useState({
    total: 0,
    available: 0,
    sold: 0,
    held: 0
  });

  // Support messages
  const [messages, setMessages] = useState<SupportMessage[]>([]);
  const [newMessage, setNewMessage] = useState('');

  // Knowledge Base
  const [articles, setArticles] = useState<KnowledgeArticle[]>([]);
  const [editingArticle, setEditingArticle] = useState<KnowledgeArticle | null>(null);
  const [newArticle, setNewArticle] = useState({ title: '', content: '', category: 'General' });

  // Sold Tickets
  const [soldTickets, setSoldTickets] = useState<SoldTicket[]>([]);
  const [newSoldTicket, setNewSoldTicket] = useState({ gameId: '1', section: '', row: '', seat: '', customerName: '', customerEmail: '' });

  // Coupons
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [newCoupon, setNewCoupon] = useState({ code: '', discount: '', discountType: 'fixed' as 'fixed' | 'percent' });

  useEffect(() => {
    loadData();
    loadCoupons();
  }, []);

  const loadData = async () => {
    try {
      // Load banners
      const bannersRes = await fetch('/api/admin/banners');
      if (bannersRes.ok) {
        const data = await bannersRes.json();
        setBanners(data);
      }

      // Load sections/pricing
      const sectionsRes = await fetch('/api/sections');
      if (sectionsRes.ok) {
        const data = await sectionsRes.json();
        setSections(data.map((s: any) => ({
          id: s.id,
          name: s.name,
          price: s.price,
          level: s.level
        })));
      }

      // Load sales summary
      const salesRes = await fetch('/api/admin/sales');
      if (salesRes.ok) {
        const data = await salesRes.json();
        setSales(data);
      }

      // Load seat stats
      const statsRes = await fetch('/api/admin/seat-stats');
      if (statsRes.ok) {
        const data = await statsRes.json();
        setSeatStats(data);
      }

      // Load support messages
      const messagesRes = await fetch('/api/admin/messages');
      if (messagesRes.ok) {
        const data = await messagesRes.json();
        setMessages(data);
      }

      // Load knowledge base from localStorage
      const savedArticles = localStorage.getItem('spartans-knowledge-base');
      if (savedArticles) {
        setArticles(JSON.parse(savedArticles));
      }

      // Load sold tickets from localStorage
      const soldSeatsJson = localStorage.getItem('spartans-sold-seats');
      const localSoldSeats: string[] = soldSeatsJson ? JSON.parse(soldSeatsJson) : [];
      const localTickets: SoldTicket[] = localSoldSeats.map(id => ({
        id,
        soldAt: new Date().toISOString()
      }));
      setSoldTickets(localTickets);
    } catch (error) {
      console.error('Error loading admin data:', error);
    }
  };

  // Sold Tickets functions
  const addSoldTicket = async () => {
    if (!newSoldTicket.section || !newSoldTicket.row || !newSoldTicket.seat) {
      showMessage('error', 'Please fill in section, row, and seat');
      return;
    }

    // Save to localStorage for immediate updates
    const soldKey = `${newSoldTicket.section}-${newSoldTicket.row}-${newSoldTicket.seat}`;
    const soldSeatsJson = localStorage.getItem('spartans-sold-seats');
    const soldSeats: string[] = soldSeatsJson ? JSON.parse(soldSeatsJson) : [];
    if (!soldSeats.includes(soldKey)) {
      soldSeats.push(soldKey);
      localStorage.setItem('spartans-sold-seats', JSON.stringify(soldSeats));
    }

    // Also save to API for persistence
    try {
      const res = await fetch('/api/admin/sold-seats', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          seats: [{
            gameId: newSoldTicket.gameId,
            section: newSoldTicket.section,
            row: newSoldTicket.row,
            seat: newSoldTicket.seat,
            customerName: newSoldTicket.customerName,
            customerEmail: newSoldTicket.customerEmail
          }]
        })
      });

      if (res.ok) {
        await loadData();
        setNewSoldTicket({ gameId: '1', section: '', row: '', seat: '', customerName: '', customerEmail: '' });
        showMessage('success', 'Ticket marked as sold!');
      }
    } catch (error) {
      showMessage('error', 'Failed to add sold ticket');
    }
  };

  const removeSoldTicket = async (id: string) => {
    if (!confirm('Remove this sold ticket?')) return;

    // Remove from localStorage
    const seatKey = id.split('-').slice(1).join('-'); // Remove gameId prefix
    const soldSeatsJson = localStorage.getItem('spartans-sold-seats');
    const soldSeats: string[] = soldSeatsJson ? JSON.parse(soldSeatsJson) : [];
    const filtered = soldSeats.filter(s => s !== seatKey && s !== id);
    localStorage.setItem('spartans-sold-seats', JSON.stringify(filtered));

    try {
      const res = await fetch('/api/admin/sold-seats', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ seatIds: [id] })
      });

      if (res.ok) {
        setSoldTickets(soldTickets.filter(t => t.id !== id));
        showMessage('success', 'Ticket removed');
      }
    } catch (error) {
      showMessage('error', 'Failed to remove ticket');
    }
  };

  const handleCsvUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const text = await file.text();
    const lines = text.split('\n').filter(line => line.trim());
    const seats: any[] = [];

    // Skip header row, parse CSV
    lines.slice(1).forEach(line => {
      const [gameId, section, row, seat, customerName, customerEmail] = line.split(',').map(s => s.trim());
      if (section && row && seat) {
        seats.push({ gameId: gameId || '1', section, row, seat, customerName, customerEmail });
      }
    });

    if (seats.length === 0) {
      showMessage('error', 'No valid seats found in CSV');
      return;
    }

    // Save to localStorage for immediate updates
    const soldSeatsJson = localStorage.getItem('spartans-sold-seats');
    const soldSeatsArr: string[] = soldSeatsJson ? JSON.parse(soldSeatsJson) : [];
    seats.forEach(s => {
      const soldKey = `${s.section}-${s.row}-${s.seat}`;
      if (!soldSeatsArr.includes(soldKey)) {
        soldSeatsArr.push(soldKey);
      }
    });
    localStorage.setItem('spartans-sold-seats', JSON.stringify(soldSeatsArr));

    try {
      const res = await fetch('/api/admin/sold-seats', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ seats })
      });

      if (res.ok) {
        const data = await res.json();
        await loadData();
        showMessage('success', `Added ${data.added} sold tickets!`);
      }
    } catch (error) {
      showMessage('error', 'Failed to upload CSV');
    }

    e.target.value = '';
  };

  // Coupon functions
  const loadCoupons = () => {
    const saved = localStorage.getItem('spartans-coupons');
    if (saved) {
      setCoupons(JSON.parse(saved));
    } else {
      // Default coupon
      const defaultCoupons: Coupon[] = [
        { code: 'LOCAL455', discount: 1000, discountType: 'fixed', active: true, usageCount: 0 }
      ];
      setCoupons(defaultCoupons);
      localStorage.setItem('spartans-coupons', JSON.stringify(defaultCoupons));
    }
  };

  const addCoupon = () => {
    if (!newCoupon.code.trim() || !newCoupon.discount) {
      showMessage('error', 'Please enter code and discount');
      return;
    }

    const code = newCoupon.code.toUpperCase().trim();
    if (coupons.some(c => c.code === code)) {
      showMessage('error', 'Coupon code already exists');
      return;
    }

    const discount = newCoupon.discountType === 'fixed'
      ? parseFloat(newCoupon.discount) * 100 // Convert dollars to cents
      : parseFloat(newCoupon.discount); // Percent stays as-is

    const coupon: Coupon = {
      code,
      discount,
      discountType: newCoupon.discountType,
      active: true,
      usageCount: 0
    };

    const updated = [...coupons, coupon];
    setCoupons(updated);
    localStorage.setItem('spartans-coupons', JSON.stringify(updated));
    setNewCoupon({ code: '', discount: '', discountType: 'fixed' });
    showMessage('success', `Coupon ${code} created!`);
  };

  const toggleCoupon = (code: string) => {
    const updated = coupons.map(c =>
      c.code === code ? { ...c, active: !c.active } : c
    );
    setCoupons(updated);
    localStorage.setItem('spartans-coupons', JSON.stringify(updated));
  };

  const deleteCoupon = (code: string) => {
    if (!confirm(`Delete coupon ${code}?`)) return;
    const updated = coupons.filter(c => c.code !== code);
    setCoupons(updated);
    localStorage.setItem('spartans-coupons', JSON.stringify(updated));
    showMessage('success', 'Coupon deleted');
  };

  // Knowledge Base functions
  const saveArticle = () => {
    if (!newArticle.title.trim() || !newArticle.content.trim()) return;

    const article: KnowledgeArticle = {
      id: Date.now().toString(),
      title: newArticle.title,
      content: newArticle.content,
      category: newArticle.category,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    const updated = [...articles, article];
    setArticles(updated);
    localStorage.setItem('spartans-knowledge-base', JSON.stringify(updated));
    setNewArticle({ title: '', content: '', category: 'General' });
    showMessage('success', 'Article saved!');
  };

  const updateArticle = () => {
    if (!editingArticle) return;

    const updated = articles.map(a =>
      a.id === editingArticle.id
        ? { ...editingArticle, updatedAt: new Date().toISOString() }
        : a
    );
    setArticles(updated);
    localStorage.setItem('spartans-knowledge-base', JSON.stringify(updated));
    setEditingArticle(null);
    showMessage('success', 'Article updated!');
  };

  const deleteArticle = (id: string) => {
    if (!confirm('Delete this article?')) return;

    const updated = articles.filter(a => a.id !== id);
    setArticles(updated);
    localStorage.setItem('spartans-knowledge-base', JSON.stringify(updated));
    showMessage('success', 'Article deleted');
  };

  const sendMessage = async () => {
    if (!newMessage.trim()) return;

    try {
      const res = await fetch('/api/admin/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: newMessage, sender: 'client' })
      });

      if (res.ok) {
        const msg = await res.json();
        setMessages([msg, ...messages]);
        setNewMessage('');
        showMessage('success', 'Request submitted!');
      }
    } catch (error) {
      showMessage('error', 'Failed to send message');
    }
  };

  
  const showMessage = (type: 'success' | 'error', text: string) => {
    setSaveMessage({ type, text });
    setTimeout(() => setSaveMessage(null), 3000);
  };

  // Banner functions
  const addBanner = async () => {
    if (!newBannerText.trim()) return;

    setSaving(true);
    try {
      const res = await fetch('/api/admin/banners', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: newBannerText,
          active: true,
          backgroundColor: 'from-cyan-500 via-emerald-500 to-cyan-500',
          textColor: 'black'
        })
      });

      if (res.ok) {
        const banner = await res.json();
        setBanners([...banners, banner]);
        setNewBannerText('');
        showMessage('success', 'Banner added!');
      }
    } catch (error) {
      showMessage('error', 'Failed to add banner');
    }
    setSaving(false);
  };

  const toggleBanner = async (id: string, active: boolean) => {
    try {
      await fetch(`/api/admin/banners/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ active })
      });
      setBanners(banners.map(b => b.id === id ? { ...b, active } : b));
    } catch (error) {
      showMessage('error', 'Failed to update banner');
    }
  };

  const deleteBanner = async (id: string) => {
    if (!confirm('Delete this banner?')) return;

    try {
      await fetch(`/api/admin/banners/${id}`, { method: 'DELETE' });
      setBanners(banners.filter(b => b.id !== id));
      showMessage('success', 'Banner deleted');
    } catch (error) {
      showMessage('error', 'Failed to delete banner');
    }
  };

  // Pricing functions
  const updatePrice = async (id: string, price: number) => {
    setSaving(true);
    try {
      const res = await fetch(`/api/admin/sections/${id}/price`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ price })
      });

      if (res.ok) {
        setSections(sections.map(s => s.id === id ? { ...s, price } : s));
        showMessage('success', 'Price updated!');
      }
    } catch (error) {
      showMessage('error', 'Failed to update price');
    }
    setSaving(false);
  };

  const tabs = [
    { id: 'overview' as Tab, label: 'Overview', icon: LayoutDashboard },
    { id: 'sold-tickets' as Tab, label: 'Sold Tickets', icon: Ticket },
    { id: 'coupons' as Tab, label: 'Coupons', icon: Tag },
    { id: 'support' as Tab, label: 'Support Chat', icon: MessageCircle },
    { id: 'knowledge' as Tab, label: 'Knowledge Base', icon: BookOpen },
    { id: 'pricing' as Tab, label: 'Pricing', icon: DollarSign },
    { id: 'seats' as Tab, label: 'Seats', icon: Grid3X3 },
  ];

  return (
    <div className="min-h-screen bg-black">
      {/* Header */}
      <header className="bg-gray-900 border-b border-gray-800">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img src="/spartans-logo.png" alt="Spartans" className="w-10 h-10 object-contain" />
            <div>
              <h1 className="text-xl font-bold text-white">Admin Dashboard</h1>
              <p className="text-gray-400 text-sm">Colorado Spartans Tickets</p>
            </div>
          </div>
          <button
            onClick={onLogout}
            className="flex items-center gap-2 px-4 py-2 bg-gray-800 hover:bg-gray-700 text-gray-300 rounded-lg transition"
          >
            <LogOut className="w-4 h-4" />
            Logout
          </button>
        </div>
      </header>

      {/* Save Message */}
      {saveMessage && (
        <div className={`fixed top-4 right-4 z-50 px-4 py-3 rounded-lg flex items-center gap-2 ${
          saveMessage.type === 'success' ? 'bg-green-500/20 text-green-400 border border-green-500/30' : 'bg-red-500/20 text-red-400 border border-red-500/30'
        }`}>
          {saveMessage.type === 'success' ? <Check className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
          {saveMessage.text}
        </div>
      )}

      <div className="container mx-auto px-4 py-6">
        <div className="flex gap-6">
          {/* Sidebar */}
          <div className="w-56 flex-shrink-0">
            <nav className="space-y-1">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg font-medium transition ${
                      activeTab === tab.id
                        ? 'bg-cyan-500 text-black'
                        : 'text-gray-400 hover:bg-gray-800 hover:text-white'
                    }`}
                  >
                    <Icon className="w-5 h-5" />
                    {tab.label}
                  </button>
                );
              })}
            </nav>

            <div className="mt-8 p-4 bg-gray-900 rounded-lg border border-gray-800">
              <p className="text-gray-400 text-sm">Quick Stats</p>
              <div className="mt-3 space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-500">Tickets Sold</span>
                  <span className="text-white font-bold">{seatStats.sold}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Available</span>
                  <span className="text-cyan-400 font-bold">{seatStats.available}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Revenue</span>
                  <span className="text-green-400 font-bold">${sales.totalRevenue.toLocaleString()}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="flex-1">
            {/* Overview Tab */}
            {activeTab === 'overview' && (
              <div className="space-y-6">
                <h2 className="text-2xl font-bold text-white">Dashboard Overview</h2>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  <StatCard title="Total Revenue" value={`$${sales.totalRevenue.toLocaleString()}`} color="green" />
                  <StatCard title="Tickets Sold" value={seatStats.sold.toString()} color="cyan" />
                  <StatCard title="Available Seats" value={seatStats.available.toString()} color="blue" />
                  <StatCard title="Today's Sales" value={`$${sales.todayRevenue.toLocaleString()}`} color="purple" />
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div className="bg-gray-900 rounded-xl border border-gray-800 p-6">
                    <h3 className="text-lg font-semibold text-white mb-4">Seat Availability</h3>
                    <div className="space-y-3">
                      <ProgressBar label="Sold" value={seatStats.sold} max={seatStats.total} color="cyan" />
                      <ProgressBar label="Available" value={seatStats.available} max={seatStats.total} color="green" />
                      <ProgressBar label="Held" value={seatStats.held} max={seatStats.total} color="yellow" />
                    </div>
                  </div>

                  <div className="bg-gray-900 rounded-xl border border-gray-800 p-6">
                    <h3 className="text-lg font-semibold text-white mb-4">Active Banners</h3>
                    {banners.filter(b => b.active).length === 0 ? (
                      <p className="text-gray-500">No active banners</p>
                    ) : (
                      <ul className="space-y-2">
                        {banners.filter(b => b.active).map(banner => (
                          <li key={banner.id} className="text-gray-300 text-sm bg-gray-800 px-3 py-2 rounded">
                            {banner.text}
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                </div>

                {/* Recent Support Requests */}
                <div className="bg-gray-900 rounded-xl border border-gray-800 p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-white">Recent Support Requests</h3>
                    <button
                      onClick={() => setActiveTab('support')}
                      className="text-cyan-400 hover:text-cyan-300 text-sm"
                    >
                      View All →
                    </button>
                  </div>
                  {messages.filter(m => m.status !== 'resolved').length === 0 ? (
                    <p className="text-gray-500">No pending requests</p>
                  ) : (
                    <div className="space-y-3">
                      {messages.filter(m => m.status !== 'resolved').slice(0, 3).map(msg => (
                        <div key={msg.id} className="flex items-start gap-3 p-3 bg-gray-800 rounded-lg">
                          <div className={`w-2 h-2 rounded-full mt-2 ${
                            msg.status === 'in_progress' ? 'bg-yellow-400' : 'bg-gray-500'
                          }`} />
                          <div className="flex-1 min-w-0">
                            <p className="text-gray-300 text-sm truncate">{msg.message}</p>
                            <p className="text-xs text-gray-500 mt-1">
                              {new Date(msg.createdAt).toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Banners Tab */}
            {activeTab === 'banners' && (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <h2 className="text-2xl font-bold text-white">Banner Management</h2>
                  <button onClick={loadData} className="flex items-center gap-2 px-3 py-2 bg-gray-800 hover:bg-gray-700 rounded-lg text-gray-300">
                    <RefreshCw className="w-4 h-4" /> Refresh
                  </button>
                </div>

                {/* Add Banner */}
                <div className="bg-gray-900 rounded-xl border border-gray-800 p-6">
                  <h3 className="text-lg font-semibold text-white mb-4">Add New Banner</h3>
                  <div className="flex gap-3">
                    <input
                      type="text"
                      value={newBannerText}
                      onChange={(e) => setNewBannerText(e.target.value)}
                      placeholder="Enter banner text (e.g., 🎉 Special offer - 20% off today!)"
                      className="flex-1 px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-cyan-500"
                    />
                    <button
                      onClick={addBanner}
                      disabled={saving || !newBannerText.trim()}
                      className="flex items-center gap-2 px-6 py-3 bg-cyan-500 hover:bg-cyan-600 disabled:bg-gray-700 text-black font-bold rounded-lg transition"
                    >
                      <Plus className="w-4 h-4" /> Add Banner
                    </button>
                  </div>
                </div>

                {/* Banner List */}
                <div className="bg-gray-900 rounded-xl border border-gray-800 p-6">
                  <h3 className="text-lg font-semibold text-white mb-4">Current Banners</h3>
                  {banners.length === 0 ? (
                    <p className="text-gray-500">No banners yet. Add one above!</p>
                  ) : (
                    <div className="space-y-3">
                      {banners.map((banner) => (
                        <div
                          key={banner.id}
                          className={`flex items-center justify-between p-4 rounded-lg border ${
                            banner.active ? 'bg-gray-800 border-cyan-500/30' : 'bg-gray-800/50 border-gray-700'
                          }`}
                        >
                          <div className="flex items-center gap-4">
                            <button
                              onClick={() => toggleBanner(banner.id, !banner.active)}
                              className={`w-12 h-6 rounded-full transition relative ${
                                banner.active ? 'bg-cyan-500' : 'bg-gray-600'
                              }`}
                            >
                              <span
                                className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${
                                  banner.active ? 'left-7' : 'left-1'
                                }`}
                              />
                            </button>
                            <span className={banner.active ? 'text-white' : 'text-gray-500'}>
                              {banner.text}
                            </span>
                          </div>
                          <button
                            onClick={() => deleteBanner(banner.id)}
                            className="p-2 text-red-400 hover:bg-red-500/20 rounded-lg transition"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Pricing Tab */}
            {activeTab === 'pricing' && (
              <div className="space-y-6">
                <h2 className="text-2xl font-bold text-white">Ticket Pricing</h2>

                <div className="bg-gray-900 rounded-xl border border-gray-800 overflow-hidden">
                  <table className="w-full">
                    <thead>
                      <tr className="bg-gray-800 text-left">
                        <th className="px-6 py-4 text-gray-400 font-medium">Section</th>
                        <th className="px-6 py-4 text-gray-400 font-medium">Level</th>
                        <th className="px-6 py-4 text-gray-400 font-medium">Price</th>
                        <th className="px-6 py-4 text-gray-400 font-medium">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {sections.map((section) => (
                        <PricingRow
                          key={section.id}
                          section={section}
                          onUpdatePrice={(price) => updatePrice(section.id, price)}
                        />
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Seats Tab */}
            {activeTab === 'seats' && (
              <div className="space-y-6">
                <h2 className="text-2xl font-bold text-white">Seat Management</h2>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="bg-gray-900 rounded-xl border border-gray-800 p-6 text-center">
                    <p className="text-4xl font-bold text-cyan-400">{seatStats.available}</p>
                    <p className="text-gray-400 mt-1">Available</p>
                  </div>
                  <div className="bg-gray-900 rounded-xl border border-gray-800 p-6 text-center">
                    <p className="text-4xl font-bold text-green-400">{seatStats.sold}</p>
                    <p className="text-gray-400 mt-1">Sold</p>
                  </div>
                  <div className="bg-gray-900 rounded-xl border border-gray-800 p-6 text-center">
                    <p className="text-4xl font-bold text-yellow-400">{seatStats.held}</p>
                    <p className="text-gray-400 mt-1">On Hold</p>
                  </div>
                </div>

                <div className="bg-gray-900 rounded-xl border border-gray-800 p-6">
                  <h3 className="text-lg font-semibold text-white mb-4">Bulk Actions</h3>
                  <div className="flex flex-wrap gap-3">
                    <button className="px-4 py-2 bg-yellow-500/20 text-yellow-400 border border-yellow-500/30 rounded-lg hover:bg-yellow-500/30 transition">
                      Hold All Remaining
                    </button>
                    <button className="px-4 py-2 bg-green-500/20 text-green-400 border border-green-500/30 rounded-lg hover:bg-green-500/30 transition">
                      Release All Holds
                    </button>
                    <button className="px-4 py-2 bg-red-500/20 text-red-400 border border-red-500/30 rounded-lg hover:bg-red-500/30 transition">
                      Mark Section as Sold Out
                    </button>
                  </div>
                </div>

                <div className="bg-gray-900 rounded-xl border border-gray-800 p-6">
                  <h3 className="text-lg font-semibold text-white mb-4">Section Breakdown</h3>
                  <div className="space-y-3">
                    {sections.map((section) => (
                      <div key={section.id} className="flex items-center justify-between p-3 bg-gray-800 rounded-lg">
                        <span className="text-white font-medium">{section.name}</span>
                        <div className="flex items-center gap-4">
                          <span className="text-gray-400">Level {section.level}</span>
                          <span className="text-cyan-400 font-bold">${section.price}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Sales Tab */}
            {activeTab === 'sales' && (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <h2 className="text-2xl font-bold text-white">Sales Report</h2>
                  <button className="flex items-center gap-2 px-4 py-2 bg-cyan-500 hover:bg-cyan-600 text-black font-bold rounded-lg transition">
                    Export CSV
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  <StatCard title="Total Revenue" value={`$${sales.totalRevenue.toLocaleString()}`} color="green" />
                  <StatCard title="Total Tickets" value={sales.ticketsSold.toString()} color="cyan" />
                  <StatCard title="Today's Revenue" value={`$${sales.todayRevenue.toLocaleString()}`} color="purple" />
                  <StatCard title="Today's Tickets" value={sales.todayTickets.toString()} color="blue" />
                </div>

                <div className="bg-gray-900 rounded-xl border border-gray-800 p-6">
                  <h3 className="text-lg font-semibold text-white mb-4">Recent Transactions</h3>
                  <p className="text-gray-500">Transaction history will appear here once sales are made.</p>
                </div>
              </div>
            )}

            {/* Knowledge Base Tab */}
            {activeTab === 'knowledge' && (
              <div className="space-y-6">
                <h2 className="text-2xl font-bold text-white">Knowledge Base</h2>
                <p className="text-gray-400">Store documentation, guides, and information for reference. Add details about your business, policies, or anything you want us to know when making updates.</p>

                {/* Edit Modal */}
                {editingArticle && (
                  <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
                    <div className="bg-gray-900 rounded-xl border border-gray-700 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
                      <div className="flex items-center justify-between p-4 border-b border-gray-800">
                        <h3 className="text-lg font-semibold text-white">Edit Article</h3>
                        <button onClick={() => setEditingArticle(null)} className="p-2 hover:bg-gray-800 rounded-lg">
                          <X className="w-5 h-5 text-gray-400" />
                        </button>
                      </div>
                      <div className="p-6 space-y-4">
                        <div>
                          <label className="block text-sm text-gray-400 mb-2">Title</label>
                          <input
                            type="text"
                            value={editingArticle.title}
                            onChange={(e) => setEditingArticle({ ...editingArticle, title: e.target.value })}
                            className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-cyan-500"
                          />
                        </div>
                        <div>
                          <label className="block text-sm text-gray-400 mb-2">Category</label>
                          <select
                            value={editingArticle.category}
                            onChange={(e) => setEditingArticle({ ...editingArticle, category: e.target.value })}
                            className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-cyan-500"
                          >
                            <option value="General">General</option>
                            <option value="Policies">Policies</option>
                            <option value="Pricing">Pricing</option>
                            <option value="Events">Events</option>
                            <option value="Contacts">Contacts</option>
                            <option value="Technical">Technical</option>
                          </select>
                        </div>
                        <div>
                          <label className="block text-sm text-gray-400 mb-2">Content</label>
                          <textarea
                            value={editingArticle.content}
                            onChange={(e) => setEditingArticle({ ...editingArticle, content: e.target.value })}
                            rows={10}
                            className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-cyan-500 resize-none"
                          />
                        </div>
                        <div className="flex gap-3 pt-4">
                          <button
                            onClick={updateArticle}
                            className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-cyan-500 hover:bg-cyan-600 text-black font-bold rounded-lg transition"
                          >
                            <Save className="w-4 h-4" /> Save Changes
                          </button>
                          <button
                            onClick={() => setEditingArticle(null)}
                            className="px-6 py-3 bg-gray-800 hover:bg-gray-700 text-gray-300 rounded-lg transition"
                          >
                            Cancel
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Add New Article */}
                <div className="bg-gray-900 rounded-xl border border-gray-800 p-6">
                  <h3 className="text-lg font-semibold text-white mb-4">Add New Article</h3>
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <input
                        type="text"
                        value={newArticle.title}
                        onChange={(e) => setNewArticle({ ...newArticle, title: e.target.value })}
                        placeholder="Article title..."
                        className="px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-cyan-500"
                      />
                      <select
                        value={newArticle.category}
                        onChange={(e) => setNewArticle({ ...newArticle, category: e.target.value })}
                        className="px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-cyan-500"
                      >
                        <option value="General">General</option>
                        <option value="Policies">Policies</option>
                        <option value="Pricing">Pricing</option>
                        <option value="Events">Events</option>
                        <option value="Contacts">Contacts</option>
                        <option value="Technical">Technical</option>
                      </select>
                    </div>
                    <textarea
                      value={newArticle.content}
                      onChange={(e) => setNewArticle({ ...newArticle, content: e.target.value })}
                      placeholder="Article content... (Add any information, policies, contacts, notes, etc.)"
                      rows={6}
                      className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-cyan-500 resize-none"
                    />
                    <button
                      onClick={saveArticle}
                      disabled={!newArticle.title.trim() || !newArticle.content.trim()}
                      className="flex items-center gap-2 px-6 py-3 bg-cyan-500 hover:bg-cyan-600 disabled:bg-gray-700 text-black font-bold rounded-lg transition"
                    >
                      <Plus className="w-4 h-4" /> Add Article
                    </button>
                  </div>
                </div>

                {/* Articles List */}
                <div className="bg-gray-900 rounded-xl border border-gray-800 p-6">
                  <h3 className="text-lg font-semibold text-white mb-4">Saved Articles ({articles.length})</h3>
                  {articles.length === 0 ? (
                    <p className="text-gray-500 text-center py-8">No articles yet. Add one above to get started!</p>
                  ) : (
                    <div className="space-y-4">
                      {articles.map((article) => (
                        <div
                          key={article.id}
                          className="p-4 bg-gray-800 rounded-lg border border-gray-700"
                        >
                          <div className="flex items-start justify-between gap-4">
                            <div className="flex-1">
                              <div className="flex items-center gap-3 mb-2">
                                <h4 className="text-white font-semibold">{article.title}</h4>
                                <span className="px-2 py-0.5 bg-cyan-500/20 text-cyan-400 text-xs rounded-full">
                                  {article.category}
                                </span>
                              </div>
                              <p className="text-gray-400 text-sm whitespace-pre-wrap line-clamp-3">
                                {article.content}
                              </p>
                              <p className="text-xs text-gray-600 mt-2">
                                Updated: {new Date(article.updatedAt).toLocaleDateString()}
                              </p>
                            </div>
                            <div className="flex items-center gap-2">
                              <button
                                onClick={() => setEditingArticle(article)}
                                className="p-2 text-gray-400 hover:text-cyan-400 hover:bg-gray-700 rounded-lg transition"
                              >
                                <Edit3 className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => deleteArticle(article.id)}
                                className="p-2 text-gray-400 hover:text-red-400 hover:bg-red-500/20 rounded-lg transition"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Sold Tickets Tab */}
            {activeTab === 'sold-tickets' && (
              <div className="space-y-6">
                <h2 className="text-2xl font-bold text-white">Manage Sold Tickets</h2>
                <p className="text-gray-400">Mark tickets as sold manually or upload a CSV file. These will be removed from availability immediately.</p>

                {/* Manual Entry */}
                <div className="bg-gray-900 rounded-xl border border-gray-800 p-6">
                  <h3 className="text-lg font-semibold text-white mb-4">Add Sold Ticket Manually</h3>
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                    <div>
                      <label className="block text-sm text-gray-400 mb-1">Game</label>
                      <select
                        value={newSoldTicket.gameId}
                        onChange={(e) => setNewSoldTicket({ ...newSoldTicket, gameId: e.target.value })}
                        className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-cyan-500"
                      >
                        <option value="1">Apr 11 - Warbirds</option>
                        <option value="2">Apr 18 - Omaha</option>
                        <option value="3">May 2 - Pueblo</option>
                        <option value="4">May 10 - Dallas</option>
                        <option value="5">May 30 - Salina</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm text-gray-400 mb-1">Section *</label>
                      <input
                        type="text"
                        value={newSoldTicket.section}
                        onChange={(e) => setNewSoldTicket({ ...newSoldTicket, section: e.target.value })}
                        placeholder="e.g., 101"
                        className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-cyan-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm text-gray-400 mb-1">Row *</label>
                      <input
                        type="text"
                        value={newSoldTicket.row}
                        onChange={(e) => setNewSoldTicket({ ...newSoldTicket, row: e.target.value })}
                        placeholder="e.g., 1"
                        className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-cyan-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm text-gray-400 mb-1">Seat *</label>
                      <input
                        type="text"
                        value={newSoldTicket.seat}
                        onChange={(e) => setNewSoldTicket({ ...newSoldTicket, seat: e.target.value })}
                        placeholder="e.g., 5"
                        className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-cyan-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm text-gray-400 mb-1">Customer Name</label>
                      <input
                        type="text"
                        value={newSoldTicket.customerName}
                        onChange={(e) => setNewSoldTicket({ ...newSoldTicket, customerName: e.target.value })}
                        placeholder="Optional"
                        className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-cyan-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm text-gray-400 mb-1">Email</label>
                      <input
                        type="email"
                        value={newSoldTicket.customerEmail}
                        onChange={(e) => setNewSoldTicket({ ...newSoldTicket, customerEmail: e.target.value })}
                        placeholder="Optional"
                        className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-cyan-500"
                      />
                    </div>
                  </div>
                  <button
                    onClick={addSoldTicket}
                    className="mt-4 flex items-center gap-2 px-6 py-3 bg-cyan-500 hover:bg-cyan-600 text-black font-bold rounded-lg transition"
                  >
                    <Plus className="w-4 h-4" /> Mark as Sold
                  </button>
                </div>

                {/* CSV Upload */}
                <div className="bg-gray-900 rounded-xl border border-gray-800 p-6">
                  <h3 className="text-lg font-semibold text-white mb-4">Bulk Upload (CSV)</h3>
                  <p className="text-gray-400 text-sm mb-4">
                    Upload a CSV file with columns: <code className="text-cyan-400">gameId, section, row, seat, customerName, customerEmail</code>
                  </p>
                  <div className="flex items-center gap-4">
                    <label className="flex items-center gap-2 px-6 py-3 bg-gray-800 hover:bg-gray-700 text-white rounded-lg cursor-pointer transition border border-gray-700">
                      <Upload className="w-4 h-4" />
                      Upload CSV
                      <input
                        type="file"
                        accept=".csv"
                        onChange={handleCsvUpload}
                        className="hidden"
                      />
                    </label>
                    <a
                      href="data:text/csv;charset=utf-8,gameId,section,row,seat,customerName,customerEmail%0A1,101,1,5,John Doe,john@example.com"
                      download="sold-tickets-template.csv"
                      className="text-cyan-400 hover:text-cyan-300 text-sm"
                    >
                      Download Template
                    </a>
                  </div>
                </div>

                {/* Sold Tickets List */}
                <div className="bg-gray-900 rounded-xl border border-gray-800 p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-white">Sold Tickets ({soldTickets.length})</h3>
                    <button onClick={loadData} className="flex items-center gap-2 px-3 py-2 bg-gray-800 hover:bg-gray-700 rounded-lg text-gray-300">
                      <RefreshCw className="w-4 h-4" /> Refresh
                    </button>
                  </div>
                  {soldTickets.length === 0 ? (
                    <p className="text-gray-500 text-center py-8">No sold tickets recorded yet.</p>
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead>
                          <tr className="text-left border-b border-gray-800">
                            <th className="pb-3 text-gray-400 font-medium">Seat ID</th>
                            <th className="pb-3 text-gray-400 font-medium">Customer</th>
                            <th className="pb-3 text-gray-400 font-medium">Sold At</th>
                            <th className="pb-3 text-gray-400 font-medium">Actions</th>
                          </tr>
                        </thead>
                        <tbody>
                          {soldTickets.map((ticket) => (
                            <tr key={ticket.id} className="border-b border-gray-800/50">
                              <td className="py-3 text-white font-mono">{ticket.id}</td>
                              <td className="py-3 text-gray-300">
                                {ticket.customerName || ticket.customerEmail || '-'}
                              </td>
                              <td className="py-3 text-gray-400">
                                {new Date(ticket.soldAt).toLocaleString()}
                              </td>
                              <td className="py-3">
                                <button
                                  onClick={() => removeSoldTicket(ticket.id)}
                                  className="p-2 text-red-400 hover:bg-red-500/20 rounded-lg transition"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Coupons Tab */}
            {activeTab === 'coupons' && (
              <div className="space-y-6">
                <h2 className="text-2xl font-bold text-white">Coupon Codes</h2>
                <p className="text-gray-400">Create and manage discount codes for customers.</p>

                {/* Create Coupon */}
                <div className="bg-gray-900 rounded-xl border border-gray-800 p-6">
                  <h3 className="text-lg font-semibold text-white mb-4">Create New Coupon</h3>
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div>
                      <label className="block text-sm text-gray-400 mb-1">Code *</label>
                      <input
                        type="text"
                        value={newCoupon.code}
                        onChange={(e) => setNewCoupon({ ...newCoupon, code: e.target.value.toUpperCase() })}
                        placeholder="e.g., SAVE10"
                        className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white uppercase focus:outline-none focus:border-cyan-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm text-gray-400 mb-1">Discount Type</label>
                      <select
                        value={newCoupon.discountType}
                        onChange={(e) => setNewCoupon({ ...newCoupon, discountType: e.target.value as 'fixed' | 'percent' })}
                        className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-cyan-500"
                      >
                        <option value="fixed">$ Off Per Ticket</option>
                        <option value="percent">% Off Total</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm text-gray-400 mb-1">
                        {newCoupon.discountType === 'fixed' ? 'Amount ($)' : 'Percent (%)'}
                      </label>
                      <input
                        type="number"
                        value={newCoupon.discount}
                        onChange={(e) => setNewCoupon({ ...newCoupon, discount: e.target.value })}
                        placeholder={newCoupon.discountType === 'fixed' ? '10' : '20'}
                        className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-cyan-500"
                      />
                    </div>
                    <div className="flex items-end">
                      <button
                        onClick={addCoupon}
                        className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-cyan-500 hover:bg-cyan-600 text-black font-bold rounded-lg transition"
                      >
                        <Plus className="w-4 h-4" /> Create
                      </button>
                    </div>
                  </div>
                </div>

                {/* Coupon List */}
                <div className="bg-gray-900 rounded-xl border border-gray-800 p-6">
                  <h3 className="text-lg font-semibold text-white mb-4">Active Coupons ({coupons.length})</h3>
                  {coupons.length === 0 ? (
                    <p className="text-gray-500 text-center py-8">No coupons yet. Create one above!</p>
                  ) : (
                    <div className="space-y-3">
                      {coupons.map((coupon) => (
                        <div
                          key={coupon.code}
                          className={`flex items-center justify-between p-4 rounded-lg border ${
                            coupon.active ? 'bg-gray-800 border-cyan-500/30' : 'bg-gray-800/50 border-gray-700'
                          }`}
                        >
                          <div className="flex items-center gap-4">
                            <button
                              onClick={() => toggleCoupon(coupon.code)}
                              className={`w-12 h-6 rounded-full transition relative ${
                                coupon.active ? 'bg-cyan-500' : 'bg-gray-600'
                              }`}
                            >
                              <span
                                className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${
                                  coupon.active ? 'left-7' : 'left-1'
                                }`}
                              />
                            </button>
                            <div>
                              <span className={`font-mono font-bold text-lg ${coupon.active ? 'text-cyan-400' : 'text-gray-500'}`}>
                                {coupon.code}
                              </span>
                              <span className="ml-3 text-gray-400">
                                {coupon.discountType === 'fixed'
                                  ? `$${(coupon.discount / 100).toFixed(0)} off per ticket`
                                  : `${coupon.discount}% off total`}
                              </span>
                            </div>
                          </div>
                          <div className="flex items-center gap-4">
                            <span className="text-gray-500 text-sm">Used: {coupon.usageCount}x</span>
                            <button
                              onClick={() => deleteCoupon(coupon.code)}
                              className="p-2 text-red-400 hover:bg-red-500/20 rounded-lg transition"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Support Chat Tab */}
            {activeTab === 'support' && (
              <div className="space-y-6">
                <h2 className="text-2xl font-bold text-white">Support & Update Requests</h2>
                <p className="text-gray-400">Submit requests for changes to your ticket page or ask questions. We'll respond and implement changes for you.</p>

                {/* New Request Form */}
                <div className="bg-gray-900 rounded-xl border border-gray-800 p-6">
                  <h3 className="text-lg font-semibold text-white mb-4">Submit a Request</h3>
                  <div className="space-y-4">
                    <textarea
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      placeholder="Describe what you'd like us to change or update... (e.g., 'Change the banner to say 50% off today only', 'Update ticket prices to $45', 'Add a new section')"
                      rows={4}
                      className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-cyan-500 resize-none"
                    />
                    <button
                      onClick={sendMessage}
                      disabled={!newMessage.trim()}
                      className="flex items-center gap-2 px-6 py-3 bg-cyan-500 hover:bg-cyan-600 disabled:bg-gray-700 text-black font-bold rounded-lg transition"
                    >
                      <Send className="w-4 h-4" /> Submit Request
                    </button>
                  </div>
                </div>

                {/* Request History */}
                <div className="bg-gray-900 rounded-xl border border-gray-800 p-6">
                  <h3 className="text-lg font-semibold text-white mb-4">Request History</h3>
                  {messages.length === 0 ? (
                    <p className="text-gray-500 text-center py-8">No requests yet. Submit one above!</p>
                  ) : (
                    <div className="space-y-4">
                      {messages.map((msg) => (
                        <div
                          key={msg.id}
                          className={`p-4 rounded-lg border ${
                            msg.status === 'resolved'
                              ? 'bg-green-500/10 border-green-500/30'
                              : msg.status === 'in_progress'
                              ? 'bg-yellow-500/10 border-yellow-500/30'
                              : 'bg-gray-800 border-gray-700'
                          }`}
                        >
                          <div className="flex items-start justify-between gap-4">
                            <div className="flex-1">
                              <p className="text-white">{msg.message}</p>
                              <p className="text-xs text-gray-500 mt-2">
                                {new Date(msg.createdAt).toLocaleString()}
                              </p>
                              {msg.resolvedNotes && (
                                <p className="text-sm text-green-400 mt-2">
                                  ✓ {msg.resolvedNotes}
                                </p>
                              )}
                            </div>
                            <div className="flex items-center gap-2">
                              {msg.status === 'pending' && (
                                <span className="flex items-center gap-1 px-2 py-1 bg-gray-700 text-gray-300 text-xs rounded-full">
                                  <Circle className="w-3 h-3" /> Pending
                                </span>
                              )}
                              {msg.status === 'in_progress' && (
                                <span className="flex items-center gap-1 px-2 py-1 bg-yellow-500/20 text-yellow-400 text-xs rounded-full">
                                  <Clock className="w-3 h-3" /> In Progress
                                </span>
                              )}
                              {msg.status === 'resolved' && (
                                <span className="flex items-center gap-1 px-2 py-1 bg-green-500/20 text-green-400 text-xs rounded-full">
                                  <CheckCircle2 className="w-3 h-3" /> Completed
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function StatCard({ title, value, color }: { title: string; value: string; color: string }) {
  const colors: Record<string, string> = {
    green: 'text-green-400',
    cyan: 'text-cyan-400',
    blue: 'text-blue-400',
    purple: 'text-purple-400',
    yellow: 'text-yellow-400'
  };

  return (
    <div className="bg-gray-900 rounded-xl border border-gray-800 p-6">
      <p className="text-gray-400 text-sm">{title}</p>
      <p className={`text-3xl font-bold mt-2 ${colors[color]}`}>{value}</p>
    </div>
  );
}

function ProgressBar({ label, value, max, color }: { label: string; value: number; max: number; color: string }) {
  const percentage = max > 0 ? (value / max) * 100 : 0;
  const colors: Record<string, string> = {
    cyan: 'bg-cyan-500',
    green: 'bg-green-500',
    yellow: 'bg-yellow-500'
  };

  return (
    <div>
      <div className="flex justify-between text-sm mb-1">
        <span className="text-gray-400">{label}</span>
        <span className="text-white">{value} / {max}</span>
      </div>
      <div className="h-2 bg-gray-800 rounded-full overflow-hidden">
        <div className={`h-full ${colors[color]} transition-all`} style={{ width: `${percentage}%` }} />
      </div>
    </div>
  );
}

function PricingRow({ section, onUpdatePrice }: { section: SectionPrice; onUpdatePrice: (price: number) => void }) {
  const [editing, setEditing] = useState(false);
  const [price, setPrice] = useState(section.price.toString());

  const handleSave = () => {
    const newPrice = parseFloat(price);
    if (!isNaN(newPrice) && newPrice >= 0) {
      onUpdatePrice(newPrice);
      setEditing(false);
    }
  };

  return (
    <tr className="border-t border-gray-800">
      <td className="px-6 py-4 text-white font-medium">{section.name}</td>
      <td className="px-6 py-4 text-gray-400">{section.level}</td>
      <td className="px-6 py-4">
        {editing ? (
          <input
            type="number"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            className="w-24 px-3 py-1 bg-gray-800 border border-cyan-500 rounded text-white focus:outline-none"
            autoFocus
          />
        ) : (
          <span className="text-cyan-400 font-bold">${section.price}</span>
        )}
      </td>
      <td className="px-6 py-4">
        {editing ? (
          <div className="flex gap-2">
            <button onClick={handleSave} className="p-2 bg-green-500/20 text-green-400 rounded hover:bg-green-500/30">
              <Save className="w-4 h-4" />
            </button>
            <button onClick={() => setEditing(false)} className="p-2 bg-gray-700 text-gray-400 rounded hover:bg-gray-600">
              Cancel
            </button>
          </div>
        ) : (
          <button onClick={() => setEditing(true)} className="px-3 py-1 bg-gray-800 hover:bg-gray-700 text-gray-300 rounded">
            Edit
          </button>
        )}
      </td>
    </tr>
  );
}
