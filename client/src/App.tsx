import { useState, useEffect } from 'react';
import { AdminLogin } from './components/AdminLogin';
import { AdminDashboard } from './components/AdminDashboard';
import { GASalesPage } from './components/GASalesPage';
import { HomeMarketingPage } from './components/HomeMarketingPage';

function App() {
  const [isAdmin, setIsAdmin] = useState(false);
  const [adminError, setAdminError] = useState('');
  const [showGaPopup, setShowGaPopup] = useState(false);
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
        <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4">
          <div className="w-full max-w-xl rounded-xl border border-cyan-500/30 bg-gray-900 p-6">
            <h2 className="text-2xl font-bold text-white mb-2">General Admission Is Live</h2>
            <p className="text-gray-300 mb-2">
              All tickets are now general admission. Buy fast and sit anywhere in the stadium.
            </p>
            <p className="text-cyan-400 font-semibold mb-4">
              Single GA: $35 • Family 4-Pack: $100
            </p>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                if (!leadData.ticketName || !leadData.email || !leadData.phone) {
                  setLeadError('Please fill out name, email, and phone to continue.');
                  return;
                }

                sessionStorage.setItem('spartans-ga-lead', JSON.stringify(leadData));
                setLeadError('');
                window.location.href = '/ga';
              }}
              className="space-y-3"
            >
              <div>
                <label className="block text-sm text-gray-400 mb-1">What name are we putting on these tickets? *</label>
                <input
                  type="text"
                  value={leadData.ticketName}
                  onChange={(e) => setLeadData({ ...leadData, ticketName: e.target.value })}
                  className="w-full px-4 py-3 bg-gray-950 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-cyan-500"
                  placeholder="Full name"
                  required
                />
              </div>
              <div className="grid sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm text-gray-400 mb-1">Email *</label>
                  <input
                    type="email"
                    value={leadData.email}
                    onChange={(e) => setLeadData({ ...leadData, email: e.target.value })}
                    className="w-full px-4 py-3 bg-gray-950 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-cyan-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-400 mb-1">Phone *</label>
                  <input
                    type="tel"
                    value={leadData.phone}
                    onChange={(e) => setLeadData({ ...leadData, phone: e.target.value })}
                    className="w-full px-4 py-3 bg-gray-950 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-cyan-500"
                    required
                  />
                </div>
              </div>
              {leadError && <p className="text-red-400 text-sm">{leadError}</p>}
              <div className="flex flex-wrap gap-3 justify-end pt-1">
                <button
                  type="button"
                  onClick={() => setShowGaPopup(false)}
                  className="px-4 py-2 rounded-lg border border-gray-700 text-gray-300 hover:bg-gray-800 transition-colors"
                >
                  Stay on This Page
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-black font-bold transition-colors"
                >
                  Continue to GA Sales Page
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
