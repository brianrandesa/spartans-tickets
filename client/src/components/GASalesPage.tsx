import { useEffect, useMemo, useState } from 'react';
import { ArrowLeft, CreditCard, Loader2, ShieldCheck, Ticket } from 'lucide-react';
import { GAMES } from './SeatMap';

interface GASalesPageProps {
  onBackToHome: () => void;
}

const SINGLE_GA_PRICE = 3500;
const FAMILY_PACK_PRICE = 10000;
const PROCESSING_FEE = 499;

interface GameSelection {
  gameId: string;
  singleQty: number;
  familyQty: number;
}

export function GASalesPage({ onBackToHome }: GASalesPageProps) {
  const [selections, setSelections] = useState<GameSelection[]>(
    GAMES.map((game, idx) => ({
      gameId: game.id,
      singleQty: idx === 0 ? 1 : 0,
      familyQty: 0,
    }))
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    ticketName: '',
    email: '',
    phone: '',
  });

  useEffect(() => {
    const rawLead = sessionStorage.getItem('spartans-ga-lead');
    if (!rawLead) return;
    try {
      const parsed = JSON.parse(rawLead) as { ticketName?: string; email?: string; phone?: string };
      setFormData((prev) => ({
        ticketName: parsed.ticketName || prev.ticketName,
        email: parsed.email || prev.email,
        phone: parsed.phone || prev.phone,
      }));
    } catch {
      // ignore invalid session data
    }
  }, []);

  const selectionWithGames = useMemo(() => {
    return selections.map((selection) => ({
      ...selection,
      game: GAMES.find((game) => game.id === selection.gameId)!,
    }));
  }, [selections]);

  const activeSelections = useMemo(() => {
    return selectionWithGames.filter((selection) => selection.singleQty > 0 || selection.familyQty > 0);
  }, [selectionWithGames]);

  const subtotal = useMemo(() => {
    return activeSelections.reduce((sum, selection) => {
      return sum + (selection.singleQty * SINGLE_GA_PRICE) + (selection.familyQty * FAMILY_PACK_PRICE);
    }, 0);
  }, [activeSelections]);

  const totalTickets = useMemo(() => {
    return activeSelections.reduce((sum, selection) => {
      return sum + selection.singleQty + (selection.familyQty * 4);
    }, 0);
  }, [activeSelections]);

  const total = subtotal + PROCESSING_FEE;
  const canCheckout = activeSelections.length > 0 && !!formData.ticketName && !!formData.email && !!formData.phone;

  const updateQuantity = (gameId: string, key: 'singleQty' | 'familyQty', delta: number) => {
    setSelections((prev) =>
      prev.map((selection) => {
        if (selection.gameId !== gameId) return selection;
        const nextQty = Math.max(0, selection[key] + delta);
        return { ...selection, [key]: nextQty };
      })
    );
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
          selections: activeSelections.map((selection) => ({
            game: selection.game,
            singleQty: selection.singleQty,
            familyQty: selection.familyQty,
          })),
          customer: {
            name: formData.ticketName,
            email: formData.email,
            phone: formData.phone,
          },
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
      <main className="container mx-auto px-4 py-8 text-center">
        <button
          onClick={onBackToHome}
          className="inline-flex items-center gap-2 text-gray-300 hover:text-cyan-400 transition-colors mb-6"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Main Page
        </button>

        <section className="rounded-2xl border border-cyan-500/30 bg-gradient-to-br from-cyan-500/15 via-gray-950 to-black p-8 mb-8">
          <div className="flex flex-wrap items-center justify-center gap-6">
            <div className="max-w-2xl mx-auto">
              <p className="text-cyan-400 font-bold uppercase tracking-widest text-sm">Official GA Sales Page</p>
              <h1 className="text-4xl md:text-5xl font-black mt-2">Sit Anywhere In The Stadium</h1>
              <p className="text-gray-300 mt-4 text-lg">
                Every ticket is general admission. No section selection and no assigned seats. Buy your pass and choose
                any open seat when you arrive.
              </p>
              <p className="text-cyan-300 mt-4 font-semibold">Choose one game or multiple games in a single checkout.</p>
              <div className="mt-6 flex flex-wrap gap-4 justify-center">
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
              <h2 className="text-xl font-bold mb-2">General Admission Only</h2>
              <p className="text-gray-300">
                This page sells GA tickets only. There is no seat picking flow and no section-by-section checkout.
              </p>
              <p className="text-gray-400 mt-3">Choose quantities by game below and complete one checkout for all selected games.</p>
            </div>

            <div className="bg-gray-950 rounded-xl border border-gray-800 p-6">
              <h2 className="text-xl font-bold mb-3">How GA Seating Works</h2>
              <p className="text-gray-300">
                This event is <span className="text-cyan-400 font-bold">general admission</span>. You are not locked
                into a specific section or seat.
              </p>
              <p className="text-gray-400 mt-2">Entry is first-come, first-served. Arrive early for the best seat location.</p>
            </div>

            <div className="bg-cyan-500/10 border border-cyan-500/30 rounded-xl p-6">
              <h3 className="font-bold text-cyan-300 mb-2">What You Get</h3>
              <ul className="text-gray-200 space-y-2 list-disc list-inside text-left">
                <li>Fast GA entry for your whole group</li>
                <li>Freedom to sit anywhere in the arena</li>
                <li>Mobile-friendly checkout in under a minute</li>
              </ul>
            </div>
          </div>

          <form onSubmit={handleCheckout} className="bg-gray-950 rounded-xl border border-gray-800 p-6 space-y-5">
            <h2 className="text-2xl font-bold">Checkout</h2>

            <div className="space-y-4">
              {selectionWithGames.map((selection) => (
                <div key={selection.gameId} className="rounded-lg border border-gray-800 bg-black/30 p-4">
                  <div className="mb-3">
                    <p className="font-bold text-cyan-300">vs {selection.game.opponent}</p>
                    <p className="text-sm text-gray-400">{selection.game.dateDisplay} • {selection.game.time}</p>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="rounded-lg border border-cyan-600/40 bg-cyan-500/10 p-3">
                      <p className="font-semibold">Single GA</p>
                      <p className="text-xs text-gray-400 mb-2">$35 each</p>
                      <div className="flex items-center gap-2 justify-center">
                        <button type="button" className="w-7 h-7 rounded bg-gray-800" onClick={() => updateQuantity(selection.gameId, 'singleQty', -1)}>-</button>
                        <span className="w-6 text-center">{selection.singleQty}</span>
                        <button type="button" className="w-7 h-7 rounded bg-gray-800" onClick={() => updateQuantity(selection.gameId, 'singleQty', 1)}>+</button>
                      </div>
                    </div>
                    <div className="rounded-lg border border-emerald-600/40 bg-emerald-500/10 p-3">
                      <p className="font-semibold">Family 4-Pack</p>
                      <p className="text-xs text-gray-400 mb-2">$100 per pack</p>
                      <div className="flex items-center gap-2 justify-center">
                        <button type="button" className="w-7 h-7 rounded bg-gray-800" onClick={() => updateQuantity(selection.gameId, 'familyQty', -1)}>-</button>
                        <span className="w-6 text-center">{selection.familyQty}</span>
                        <button type="button" className="w-7 h-7 rounded bg-gray-800" onClick={() => updateQuantity(selection.gameId, 'familyQty', 1)}>+</button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div>
              <label className="block text-sm text-gray-400 mb-1">What name are we putting on these tickets? *</label>
              <input
                type="text"
                value={formData.ticketName}
                onChange={(e) => setFormData({ ...formData, ticketName: e.target.value })}
                className="w-full px-4 py-3 bg-gray-900 border border-gray-700 rounded-lg text-center focus:outline-none focus:border-cyan-500"
                placeholder="Full name"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm text-gray-400 mb-1">Email *</label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full px-4 py-3 bg-gray-900 border border-gray-700 rounded-lg text-center focus:outline-none focus:border-cyan-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm text-gray-400 mb-1">Phone *</label>
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="w-full px-4 py-3 bg-gray-900 border border-gray-700 rounded-lg text-center focus:outline-none focus:border-cyan-500"
                  required
                />
              </div>
            </div>

            {activeSelections.length > 0 && (
              <div className="rounded-lg border border-gray-800 bg-black/30 p-4">
                <p className="text-sm font-semibold text-cyan-300 mb-2">Selected Games</p>
                <ul className="text-sm text-gray-300 space-y-1">
                  {activeSelections.map((selection) => (
                    <li key={selection.gameId} className="text-center">
                      {selection.game.dateDisplay} vs {selection.game.opponent} - {selection.singleQty} single, {selection.familyQty} family
                    </li>
                  ))}
                </ul>
              </div>
            )}

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
                  Secure Your Ticket
                </>
              )}
            </button>

            <div className="grid sm:grid-cols-2 gap-3 text-xs text-gray-400">
              <p className="flex items-center justify-center gap-2"><Ticket className="w-4 h-4 text-cyan-400" /> Instant confirmation after payment</p>
              <p className="flex items-center justify-center gap-2"><ShieldCheck className="w-4 h-4 text-cyan-400" /> Secure checkout powered by Stripe</p>
            </div>
          </form>
        </section>
      </main>
    </div>
  );
}
