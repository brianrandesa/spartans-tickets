import { useMemo, useState, useEffect } from 'react';
import { SeatMap, GAMES } from './components/SeatMap';
import { Cart } from './components/Cart';
import { AdminLogin } from './components/AdminLogin';
import { AdminDashboard } from './components/AdminDashboard';
import { CheckoutModal, type CheckoutData } from './components/CheckoutModal';
import { GASalesPage } from './components/GASalesPage';
import { useCart } from './hooks/useCart';
import { useSeats } from './hooks/useSeats';
import type { Section, Seat } from './types';

function App() {
  const [selectedGameId, setSelectedGameId] = useState(GAMES[0].id);
  const { sections, seats, loading, error } = useSeats(selectedGameId);
  const cart = useCart();
  const [isAdmin, setIsAdmin] = useState(false);
  const [adminError, setAdminError] = useState('');
  const [showCheckout, setShowCheckout] = useState(false);
  const [showGaPopup, setShowGaPopup] = useState(false);

  const selectedGame = GAMES.find(g => g.id === selectedGameId) || GAMES[0];

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

  // Track selected seat IDs for current game
  const selectedSeats = useMemo(() => {
    return new Set(
      cart.items
        .filter(item => item.game.id === selectedGameId)
        .map(item => item.seat.id)
    );
  }, [cart.items, selectedGameId]);

  const handleSeatToggle = (seat: Seat, section: Section) => {
    cart.toggleSeat(seat, section, selectedGame);
  };

  const handleCheckout = () => {
    setShowCheckout(true);
  };

  const handleCheckoutComplete = async (data: CheckoutData) => {
    try {
      const response = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          items: data.items.map(item => ({
            seatId: item.seat.id,
            section: item.section.name,
            row: item.seat.row,
            seatNumber: item.seat.number,
            price: item.section.price,
            game: {
              id: item.game.id,
              opponent: item.game.opponent,
              date: item.game.date,
              dateDisplay: item.game.dateDisplay,
              time: item.game.time
            }
          })),
          customer: {
            firstName: data.firstName,
            lastName: data.lastName,
            email: data.email,
            phone: data.phone
          },
          couponCode: data.couponCode
        }),
      });
      const result = await response.json();
      if (result.url) {
        window.location.href = result.url;
      }
    } catch (error) {
      console.error('Checkout error:', error);
      alert('There was an error processing your checkout. Please try again.');
      setShowCheckout(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-spartans-cyan text-xl">Loading seats...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center flex-col gap-4">
        <div className="text-red-400 text-xl">Error loading seats</div>
        <div className="text-gray-400">{error}</div>
        <p className="text-gray-500 text-sm">Make sure the server is running: npm run dev:server</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black">
      {/* Main content */}
      <main className="container mx-auto px-4 py-8">
        <div className="mb-6 rounded-xl border border-cyan-500/35 bg-cyan-500/10 p-5 flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-cyan-400 font-bold">Now Offering General Admission</p>
            <p className="text-gray-300">Single GA $35 or Family 4-Pack $100. Sit anywhere in the arena.</p>
          </div>
          <button
            onClick={() => setShowGaPopup(true)}
            className="bg-cyan-500 hover:bg-cyan-400 text-black font-bold px-6 py-3 rounded-lg transition-colors"
          >
            Buy GA Tickets
          </button>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
            {/* Seat Map - takes 2 columns on large screens */}
            <div className="lg:col-span-2">
              <SeatMap
                sections={sections}
                seats={seats}
                selectedSeats={selectedSeats}
                onSeatToggle={handleSeatToggle}
                selectedGameId={selectedGameId}
                onGameChange={setSelectedGameId}
              />
            </div>

            {/* Cart - takes 1 column */}
            <div className="lg:col-span-1">
              <Cart
                items={cart.items}
                itemsByGame={cart.itemsByGame}
                onRemove={cart.removeSeat}
                onCheckout={handleCheckout}
                total={cart.total}
              />
              {/* Main Event Promo */}
              <div className="mt-6">
                <img
                  src="/main-event-promo.png"
                  alt="Main Event VIP Season Ticket Holder Promo"
                  className="w-full rounded-lg shadow-lg"
                />
              </div>
            </div>
          </div>
      </main>

      {/* Footer */}
      <footer className="bg-gray-900 border-t border-gray-800 py-6 mt-8">
        <div className="container mx-auto px-4 text-center text-gray-400">
          <p>Colorado Spartans • Denver Coliseum</p>
          <p className="text-sm mt-2">All tickets $35 • Secure checkout powered by Stripe</p>
        </div>
      </footer>

      {/* Checkout Modal */}
      {showCheckout && (
        <CheckoutModal
          items={cart.items}
          itemsByGame={cart.itemsByGame}
          total={cart.total}
          onClose={() => setShowCheckout(false)}
          onComplete={handleCheckoutComplete}
        />
      )}

      {showGaPopup && (
        <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4">
          <div className="w-full max-w-xl rounded-xl border border-cyan-500/30 bg-gray-900 p-6">
            <h2 className="text-2xl font-bold text-white mb-2">General Admission Is Live</h2>
            <p className="text-gray-300 mb-2">
              Skip section-by-section selection and lock in your seats with a simple GA purchase.
            </p>
            <p className="text-cyan-400 font-semibold mb-6">
              Single GA: $35 • Family 4-Pack: $100
            </p>

            <div className="flex flex-wrap gap-3 justify-end">
              <button
                onClick={() => setShowGaPopup(false)}
                className="px-4 py-2 rounded-lg border border-gray-700 text-gray-300 hover:bg-gray-800 transition-colors"
              >
                Stay on This Page
              </button>
              <button
                onClick={() => { window.location.href = '/ga'; }}
                className="px-5 py-2 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-black font-bold transition-colors"
              >
                Continue to GA Sales Page
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
