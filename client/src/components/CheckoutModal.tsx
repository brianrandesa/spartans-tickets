import { useState, useEffect } from 'react';
import { X, CreditCard, Loader2 } from 'lucide-react';
import type { CartItem, Game } from '../types';

interface CheckoutModalProps {
  items: CartItem[];
  itemsByGame: Record<string, { game: Game; items: CartItem[] }>;
  total: number;
  onClose: () => void;
  onComplete: (data: CheckoutData) => void;
}

export interface CheckoutData {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  items: CartItem[];
  couponCode?: string;
}

// Get coupons from localStorage
function getCoupons(): Record<string, { discount: number; discountType: 'fixed' | 'percent'; label: string }> {
  const saved = localStorage.getItem('spartans-coupons');
  if (!saved) {
    return { 'LOCAL455': { discount: 1000, discountType: 'fixed', label: '$10 off per ticket' } };
  }
  const coupons = JSON.parse(saved);
  const result: Record<string, { discount: number; discountType: 'fixed' | 'percent'; label: string }> = {};
  coupons.filter((c: any) => c.active).forEach((c: any) => {
    result[c.code] = {
      discount: c.discount,
      discountType: c.discountType,
      label: c.discountType === 'fixed' ? `$${(c.discount / 100).toFixed(0)} off per ticket` : `${c.discount}% off`
    };
  });
  return result;
}

export function CheckoutModal({ items, itemsByGame, total, onClose, onComplete }: CheckoutModalProps) {
  const [loading, setLoading] = useState(false);
  const [couponCode, setCouponCode] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState<string | null>(null);
  const [couponError, setCouponError] = useState('');
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: ''
  });

  const COUPONS = getCoupons();

  const applyCoupon = () => {
    const code = couponCode.trim().toUpperCase();
    if (COUPONS[code]) {
      setAppliedCoupon(code);
      setCouponError('');
    } else {
      setCouponError('Invalid coupon code');
      setAppliedCoupon(null);
    }
  };

  const removeCoupon = () => {
    setAppliedCoupon(null);
    setCouponCode('');
    setCouponError('');
  };

  const PROCESSING_FEE = 499; // $4.99 in cents

  const calculateDiscount = () => {
    if (!appliedCoupon || !COUPONS[appliedCoupon]) return 0;
    const coupon = COUPONS[appliedCoupon];
    if (coupon.discountType === 'fixed') {
      return coupon.discount * items.length;
    } else {
      return Math.round(total * (coupon.discount / 100));
    }
  };

  const couponDiscount = calculateDiscount();
  const subtotalAfterDiscount = total - couponDiscount;
  const finalTotal = subtotalAfterDiscount + PROCESSING_FEE;

  // Pre-fill from URL params (from GHL redirect)
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);

    setFormData({
      firstName: params.get('first_name') || params.get('firstName') || '',
      lastName: params.get('last_name') || params.get('lastName') || '',
      email: params.get('email') || '',
      phone: params.get('phone') || params.get('phone_number') || ''
    });
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    onComplete({
      ...formData,
      items,
      couponCode: appliedCoupon || undefined
    });
  };

  const isValid = formData.firstName && formData.lastName && formData.email;
  const gameCount = Object.keys(itemsByGame).length;

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
      <div className="bg-gray-900 rounded-xl border border-gray-800 w-full max-w-lg max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-800 sticky top-0 bg-gray-900">
          <h2 className="text-xl font-bold text-white">Checkout</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-800 rounded-lg transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Order Summary */}
        <div className="p-4 bg-gray-800/50 border-b border-gray-800">
          <p className="text-sm text-gray-400 mb-3">
            {items.length} ticket{items.length !== 1 ? 's' : ''} for {gameCount} game{gameCount !== 1 ? 's' : ''}
          </p>

          {Object.values(itemsByGame).map(({ game, items: gameItems }) => (
            <div key={game.id} className="bg-cyan-500/10 border border-cyan-500/30 rounded-lg p-3 mb-3">
              <p className="text-cyan-400 font-bold">vs {game.opponent}</p>
              <p className="text-gray-400 text-sm">{game.dateDisplay} • {game.time}</p>
              <p className="text-gray-300 text-sm mt-1">
                {gameItems.length} ticket{gameItems.length !== 1 ? 's' : ''}: {gameItems.map(item => `Sec ${item.section.name}`).join(', ')}
              </p>
            </div>
          ))}

          { /* Coupon Code */ }
          <div className="pt-3 border-t border-gray-700">
            {appliedCoupon ? (
              <div className="flex items-center justify-between bg-green-500/20 border border-green-500/50 rounded-lg p-2">
                <div>
                  <span className="text-green-400 font-bold">{appliedCoupon}</span>
                  <span className="text-green-300 text-sm ml-2">- {COUPONS[appliedCoupon].label}</span>
                </div>
                <button onClick={removeCoupon} className="text-green-400 hover:text-green-300 text-sm">Remove</button>
              </div>
            ) : (
              <div className="flex gap-2">
                <input
                  type="text"
                  value={couponCode}
                  onChange={(e) => { setCouponCode(e.target.value); setCouponError(''); }}
                  placeholder="Coupon code"
                  className="flex-1 px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white text-sm focus:outline-none focus:border-cyan-500"
                />
                <button
                  onClick={applyCoupon}
                  className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white text-sm rounded-lg transition"
                >
                  Apply
                </button>
              </div>
            )}
            {couponError && <p className="text-red-400 text-sm mt-1">{couponError}</p>}
          </div>

          {appliedCoupon && (
            <div className="flex justify-between text-sm pt-2">
              <span className="text-gray-400">Subtotal</span>
              <span className="text-gray-400">${(total / 100).toFixed(2)}</span>
            </div>
          )}
          {appliedCoupon && (
            <div className="flex justify-between text-sm text-green-400">
              <span>Discount ({appliedCoupon})</span>
              <span>-${(couponDiscount / 100).toFixed(2)}</span>
            </div>
          )}
          <div className="flex justify-between text-sm pt-2">
            <span className="text-gray-400">Processing Fee</span>
            <span className="text-gray-400">${(PROCESSING_FEE / 100).toFixed(2)}</span>
          </div>
          <div className="flex justify-between text-lg font-bold pt-2 border-t border-gray-700">
            <span className="text-white">Total</span>
            <span className="text-cyan-400">${(finalTotal / 100).toFixed(2)}</span>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-4 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-gray-400 mb-1">First Name *</label>
              <input
                type="text"
                value={formData.firstName}
                onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-cyan-500"
                required
              />
            </div>
            <div>
              <label className="block text-sm text-gray-400 mb-1">Last Name *</label>
              <input
                type="text"
                value={formData.lastName}
                onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-cyan-500"
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
              className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-cyan-500"
              required
            />
          </div>

          <div>
            <label className="block text-sm text-gray-400 mb-1">Phone</label>
            <input
              type="tel"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-cyan-500"
              placeholder="(555) 123-4567"
            />
          </div>

          <button
            type="submit"
            disabled={!isValid || loading}
            className="w-full py-4 bg-cyan-500 hover:bg-cyan-600 disabled:bg-gray-700 text-black font-bold rounded-lg transition flex items-center justify-center gap-2"
          >
            {loading ? (
              <><Loader2 className="w-5 h-5 animate-spin" /> Processing...</>
            ) : (
              <><CreditCard className="w-5 h-5" /> Pay ${(finalTotal / 100).toFixed(2)}</>
            )}
          </button>

          <p className="text-xs text-gray-500 text-center">
            Secure checkout powered by Stripe. You'll be redirected to complete payment.
          </p>
        </form>
      </div>
    </div>
  );
}
