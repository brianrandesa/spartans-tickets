import { useState, useEffect } from 'react';
import { AdminLogin } from './components/AdminLogin';
import { AdminDashboard } from './components/AdminDashboard';
import { GASalesPage } from './components/GASalesPage';
import { HomeMarketingPage } from './components/HomeMarketingPage';

function App() {
  const [isAdmin, setIsAdmin] = useState(false);
  const [adminError, setAdminError] = useState('');
  const [showGaPopup, setShowGaPopup] = useState(false);
  const [leadSubmitting, setLeadSubmitting] = useState(false);
  const [leadData, setLeadData] = useState({
    ticketName: '',
    email: '',
    phone: '',
  });
  const [leadError, setLeadError] = useState('');

  // Check for admin mode in URL
  useEffect(() => {
    if (window.location.pathname === '/admin') {
      const savedAdmin = sessionStorage.getItem('spartans-admin');
      if (savedAdmin === 'true') {
        setIsAdmin(true);
      }
    }
  }, []);

  const handleAdminLogin = async (password: string) => {
    try {
      const res = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password })
      });

      if (res.ok) {
        sessionStorage.setItem('spartans-admin', 'true');
        setIsAdmin(true);
        setAdminError('');
      } else {
        setAdminError('Invalid password');
      }
    } catch {
      setAdminError('Login failed');
    }
  };

  const handleAdminLogout = () => {
    sessionStorage.removeItem('spartans-admin');
    setIsAdmin(false);
    window.location.href = '/';
  };

  // Admin routes
  if (window.location.pathname === '/admin') {
    if (!isAdmin) {
      return <AdminLogin onLogin={handleAdminLogin} error={adminError} />;
    }
    return <AdminDashboard onLogout={handleAdminLogout} />;
  }

  // Success page after payment
  if (window.location.pathname === '/success') {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="bg-gray-900 rounded-xl border border-gray-800 p-8 max-w-md text-center">
          <div className="w-20 h-20 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-6">
            <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h1 className="text-3xl font-bold text-white mb-4">Payment Successful!</h1>
          <p className="text-gray-400 mb-6">
            Thank you for your purchase. Your Spartans tickets are confirmed.
            You will receive a confirmation email shortly.
          </p>
          <div className="bg-gray-800 rounded-lg p-4 mb-6">
            <p className="text-cyan-400 font-bold">Colorado Spartans</p>
            <p className="text-gray-300">Denver Coliseum</p>
          </div>
          <a
            href="/"
            className="inline-block bg-cyan-500 hover:bg-cyan-600 text-black font-bold py-3 px-8 rounded-lg transition"
          >
            Back to Home
          </a>
        </div>
      </div>
    );
  }

  if (window.location.pathname === '/ga' || window.location.pathname === '/ga/') {
    return <GASalesPage onBackToHome={() => { window.location.href = '/'; }} />;
  }

  return (
    <div className="relative">
      <HomeMarketingPage onOpenSalesPopup={() => setShowGaPopup(true)} />

      {showGaPopup && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="relative w-full max-w-xl rounded-2xl border border-cyan-400/40 bg-gradient-to-b from-gray-900 to-black shadow-[0_0_40px_rgba(34,211,238,0.18)] p-7 text-center">
            <button
              type="button"
              onClick={() => setShowGaPopup(false)}
              className="absolute top-3 right-3 w-9 h-9 rounded-full border border-gray-700 text-gray-300 hover:text-white hover:border-cyan-400/50 hover:bg-gray-800 transition-colors"
              aria-label="Close popup"
            >
              ×
            </button>
            <div className="inline-flex items-center px-3 py-1 rounded-full border border-cyan-400/30 bg-cyan-500/10 text-cyan-300 text-xs font-semibold tracking-[0.18em] uppercase mb-4">
              Secure Your Seats
            </div>
            <h2 className="text-3xl font-black text-white mb-2">General Admission Is Live</h2>
            <p className="text-gray-300 mb-2">
              All tickets are now general admission. Buy fast and sit anywhere in the stadium.
            </p>
            <p className="text-cyan-400 font-semibold mb-4">
              Single GA: $35 • Family 4-Pack: $100
            </p>
            <form
              onSubmit={async (e) => {
                e.preventDefault();
                if (leadSubmitting) return;
                if (!leadData.ticketName || !leadData.email || !leadData.phone) {
                  setLeadError('Please fill out name, email, and phone to continue.');
                  return;
                }

                setLeadSubmitting(true);
                setLeadError('');

                try {
                  await fetch('/api/lead-capture', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                      name: leadData.ticketName,
                      email: leadData.email,
                      phone: leadData.phone,
                      source: 'Homepage Popup',
                    }),
                  });
                } catch (error) {
                  console.error('Lead capture request failed:', error);
                } finally {
                  sessionStorage.setItem('spartans-ga-lead', JSON.stringify(leadData));
                  window.location.href = '/ga';
                }
              }}
              className="space-y-3"
            >
              <div>
                <label className="block text-sm text-gray-400 mb-1">What name are we putting on these tickets? *</label>
                <input
                  type="text"
                  value={leadData.ticketName}
                  onChange={(e) => setLeadData({ ...leadData, ticketName: e.target.value })}
                  className="w-full px-4 py-3 bg-gray-950 border border-gray-700 rounded-lg text-white text-center focus:outline-none focus:border-cyan-500"
                  placeholder="Full name"
                  required
                />
              </div>
              <div>
                <label className="block text-sm text-gray-400 mb-1">Email *</label>
                <input
                  type="email"
                  value={leadData.email}
                  onChange={(e) => setLeadData({ ...leadData, email: e.target.value })}
                  className="w-full px-4 py-3 bg-gray-950 border border-gray-700 rounded-lg text-white text-center focus:outline-none focus:border-cyan-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm text-gray-400 mb-1">Phone *</label>
                <input
                  type="tel"
                  value={leadData.phone}
                  onChange={(e) => setLeadData({ ...leadData, phone: e.target.value })}
                  className="w-full px-4 py-3 bg-gray-950 border border-gray-700 rounded-lg text-white text-center focus:outline-none focus:border-cyan-500"
                  required
                />
              </div>
              {leadError && <p className="text-red-400 text-sm">{leadError}</p>}
              <p className="text-xs text-gray-500 pt-1">We will pre-fill your checkout details on the next page.</p>
              <div className="flex flex-wrap gap-3 justify-center pt-1">
                <button
                  type="submit"
                  disabled={leadSubmitting}
                  className="px-6 py-3 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-black font-bold transition-colors"
                >
                  {leadSubmitting ? 'Saving...' : 'Secure Your Ticket'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
