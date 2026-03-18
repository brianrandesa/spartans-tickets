import { useMemo, useState } from 'react';
import { ArrowLeft, CreditCard, Loader2, ShieldCheck, Ticket } from 'lucide-react';
import { GAMES } from './SeatMap';

interface GASalesPageProps {
  onBackToHome: () => void;
}

const SINGLE_GA_PRICE = 3500;
const FAMILY_PACK_PRICE = 10000;
const PROCESSING_FEE = 499;

export function GASalesPage({ onBackToHome }: GASalesPageProps) {
  const [selectedGameId, setSelectedGameId] = useState(GAMES[0].id);
  const [singleQty, setSingleQty] = useState(1);
  const [familyQty, setFamilyQty] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
  });

  const selectedGame = GAMES.find((game) => game.id === selectedGameId) || GAMES[0];

  const subtotal = useMemo(() => {
    return (singleQty * SINGLE_GA_PRICE) + (familyQty * FAMILY_PACK_PRICE);
  }, [singleQty, familyQty]);

  const totalTickets = useMemo(() => {
    return singleQty + (familyQty * 4);
  }, [singleQty, familyQty]);

  const total = subtotal + PROCESSING_FEE;
  const canCheckout = (singleQty > 0 || familyQty > 0) && !!formData.firstName && !!formData.lastName && !!formData.email;

  const updateQuantity = (setter: (value: number) => void, next: number) => {
    setter(Math.max(0, next));
  };

  const handleCheckout = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!canCheckout) return;

    setLoading(true);
    setError('');

    try {
      const response = await fetch('/api/checkout-ga', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          singleQty,
          familyQty,
          game: {
            id: selectedGame.id,
            opponent: selectedGame.opponent,
            date: selectedGame.date,
            dateDisplay: selectedGame.dateDisplay,
            time: selectedGame.time,
          },
          customer: formData,
        }),
      });

      const result = await response.json();
      if (!response.ok) {
        throw new Error(result?.error || 'Failed to create checkout session');
      }

      if (result.url) {
        window.location.href = result.url;
        return;
      }

      throw new Error('Missing checkout URL');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Checkout failed. Please try again.');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-black text-white">
      <main className="container mx-auto px-4 py-8">
        <button
          onClick={onBackToHome}
          className="inline-flex items-center gap-2 text-gray-300 hover:text-cyan-400 transition-colors mb-6"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Main Page
        </button>

        <section className="rounded-2xl border border-cyan-500/30 bg-gradient-to-br from-cyan-500/15 via-gray-950 to-black p-8 mb-8">
          <div className="flex flex-wrap items-center justify-between gap-6">
            <div className="max-w-2xl">
              <p className="text-cyan-400 font-bold uppercase tracking-widest text-sm">General Admission Experience</p>
              <h1 className="text-4xl md:text-5xl font-black mt-2">Colorado Spartans GA Tickets</h1>
              <p className="text-gray-300 mt-4 text-lg">
                One ticket gets you in. Sit anywhere in the arena. Bring your crew and choose between a single GA
                ticket or a family four-pack.
              </p>
              <div className="mt-6 flex flex-wrap gap-4">
                <div className="px-4 py-2 rounded-full border border-cyan-500/40 text-cyan-300">Single GA: $35</div>
                <div className="px-4 py-2 rounded-full border border-emerald-500/40 text-emerald-300">Family 4-Pack: $100</div>
              </div>
            </div>
            <img src="/spartans-logo.png" alt="Spartans logo" className="w-28 h-28 object-contain" />
          </div>
        </section>

        <section className="grid lg:grid-cols-2 gap-8">
          <div className="space-y-6">
            <div className="bg-gray-950 rounded-xl border border-gray-800 p-6">
              <h2 className="text-xl font-bold mb-2">Pick Your Game</h2>
              <p className="text-gray-400 mb-4">General admission applies to all open seats in the arena.</p>
              <select
                value={selectedGameId}
                onChange={(e) => setSelectedGameId(e.target.value)}
                className="w-full bg-gray-900 border border-gray-700 rounded-lg px-4 py-3"
              >
                {GAMES.map((game) => (
                  <option key={game.id} value={game.id}>
                    {game.dateDisplay} vs {game.opponent} - {game.time}
                  </option>
                ))}
              </select>
            </div>

            <div className="bg-gray-950 rounded-xl border border-gray-800 p-6">
              <h2 className="text-xl font-bold mb-3">Arena Access</h2>
              <p className="text-gray-300">
                This event is <span className="text-cyan-400 font-bold">general admission</span>. You are not locked
                into a specific section or seat.
              </p>
              <p className="text-gray-400 mt-2">Use this seating chart as a visual guide. Entry is first-come, first-served.</p>
              <div className="mt-5 rounded-lg border border-gray-700 bg-gray-900 p-4">
                <svg viewBox="0 0 440 260" className="w-full">
                  <ellipse cx="220" cy="130" rx="185" ry="105" fill="none" stroke="#164e63" strokeWidth="2" />
                  <ellipse cx="220" cy="130" rx="135" ry="75" fill="none" stroke="#155e75" strokeWidth="2" />
                  <rect x="145" y="95" width="150" height="70" rx="10" fill="#166534" stroke="#22c55e" strokeWidth="2" />
                  <text x="220" y="136" textAnchor="middle" fill="#ffffff" fontSize="16" fontWeight="700">
                    FIELD
                  </text>
                  <text x="220" y="24" textAnchor="middle" fill="#22d3ee" fontSize="12">
                    GENERAL ADMISSION - SIT ANYWHERE
                  </text>
                </svg>
              </div>
            </div>
          </div>

          <form onSubmit={handleCheckout} className="bg-gray-950 rounded-xl border border-gray-800 p-6 space-y-5">
            <h2 className="text-2xl font-bold">Checkout</h2>

            <div className="space-y-4">
              <div className="rounded-lg border border-cyan-600/40 bg-cyan-500/10 p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-bold">Single GA Ticket</p>
                    <p className="text-sm text-gray-400">$35 each</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <button type="button" className="w-8 h-8 rounded bg-gray-800" onClick={() => updateQuantity(setSingleQty, singleQty - 1)}>-</button>
                    <span className="w-6 text-center">{singleQty}</span>
                    <button type="button" className="w-8 h-8 rounded bg-gray-800" onClick={() => updateQuantity(setSingleQty, singleQty + 1)}>+</button>
                  </div>
                </div>
              </div>

              <div className="rounded-lg border border-emerald-600/40 bg-emerald-500/10 p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-bold">Family 4-Pack</p>
                    <p className="text-sm text-gray-400">$100 per pack (4 tickets)</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <button type="button" className="w-8 h-8 rounded bg-gray-800" onClick={() => updateQuantity(setFamilyQty, familyQty - 1)}>-</button>
                    <span className="w-6 text-center">{familyQty}</span>
                    <button type="button" className="w-8 h-8 rounded bg-gray-800" onClick={() => updateQuantity(setFamilyQty, familyQty + 1)}>+</button>
                  </div>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm text-gray-400 mb-1">First Name *</label>
                <input
                  type="text"
                  value={formData.firstName}
                  onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                  className="w-full px-4 py-3 bg-gray-900 border border-gray-700 rounded-lg focus:outline-none focus:border-cyan-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm text-gray-400 mb-1">Last Name *</label>
                <input
                  type="text"
                  value={formData.lastName}
                  onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                  className="w-full px-4 py-3 bg-gray-900 border border-gray-700 rounded-lg focus:outline-none focus:border-cyan-500"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm text-gray-400 mb-1">Email *</label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full px-4 py-3 bg-gray-900 border border-gray-700 rounded-lg focus:outline-none focus:border-cyan-500"
                required
              />
            </div>

            <div>
              <label className="block text-sm text-gray-400 mb-1">Phone</label>
              <input
                type="tel"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className="w-full px-4 py-3 bg-gray-900 border border-gray-700 rounded-lg focus:outline-none focus:border-cyan-500"
                placeholder="(555) 123-4567"
              />
            </div>

            <div className="rounded-lg border border-gray-800 bg-black/30 p-4 space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-400">Tickets</span>
                <span>{totalTickets}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-400">Subtotal</span>
                <span>${(subtotal / 100).toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-400">Processing Fee</span>
                <span>${(PROCESSING_FEE / 100).toFixed(2)}</span>
              </div>
              <div className="border-t border-gray-700 pt-2 flex justify-between font-bold text-lg">
                <span>Total</span>
                <span className="text-cyan-400">${(total / 100).toFixed(2)}</span>
              </div>
            </div>

            {error && <p className="text-red-400 text-sm">{error}</p>}

            <button
              type="submit"
              disabled={!canCheckout || loading}
              className="w-full py-4 bg-cyan-500 hover:bg-cyan-400 disabled:bg-gray-700 text-black font-bold rounded-lg transition flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Processing...
                </>
              ) : (
                <>
                  <CreditCard className="w-5 h-5" />
                  Checkout GA Tickets
                </>
              )}
            </button>

            <div className="grid sm:grid-cols-2 gap-3 text-xs text-gray-400">
              <p className="flex items-center gap-2"><Ticket className="w-4 h-4 text-cyan-400" /> Instant confirmation after payment</p>
              <p className="flex items-center gap-2"><ShieldCheck className="w-4 h-4 text-cyan-400" /> Secure checkout powered by Stripe</p>
            </div>
          </form>
        </section>
      </main>
    </div>
  );
}
