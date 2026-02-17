import type { CartItem, Game } from '../types';

interface CartProps {
  items: CartItem[];
  itemsByGame: Record<string, { game: Game; items: CartItem[] }>;
  onRemove: (seatId: string, gameId: string) => void;
  onCheckout: () => void;
  total: number;
}

export function Cart({ items, itemsByGame, onRemove, onCheckout, total }: CartProps) {
  if (items.length === 0) {
    return (
      <div className="bg-gray-900 rounded-lg p-6">
        <h3 className="text-xl font-heading text-spartans-cyan mb-4">Your Cart</h3>
        <p className="text-gray-400 text-center py-8">
          Select seats from the map to add them to your cart
        </p>
      </div>
    );
  }

  return (
    <div className="bg-gray-900 rounded-lg p-6">
      <h3 className="text-xl font-heading text-spartans-cyan mb-4">
        Your Cart ({items.length} {items.length === 1 ? 'ticket' : 'tickets'})
      </h3>

      <div className="space-y-4 max-h-[400px] overflow-y-auto">
        {Object.values(itemsByGame).map(({ game, items: gameItems }) => (
          <div key={game.id} className="border border-gray-700 rounded-lg overflow-hidden">
            {/* Game Header */}
            <div className="bg-gray-800 p-3 border-b border-gray-700">
              <p className="text-cyan-400 font-bold">vs {game.opponent}</p>
              <p className="text-gray-400 text-sm">{game.dateDisplay} • {game.time}</p>
            </div>

            {/* Seats for this game */}
            <div className="p-3 space-y-2">
              {gameItems
                .sort((a, b) => a.section.name.localeCompare(b.section.name) || a.seat.row.localeCompare(b.seat.row) || a.seat.number - b.seat.number)
                .map(item => (
                  <div key={`${game.id}-${item.seat.id}`} className="flex justify-between items-center text-sm">
                    <span className="text-gray-300">
                      Sec {item.section.name}, Row {item.seat.row}, Seat {item.seat.number}
                    </span>
                    <div className="flex items-center gap-3">
                      <span className="text-gray-500">${(item.section.price / 100).toFixed(2)}</span>
                      <button
                        onClick={() => onRemove(item.seat.id, game.id)}
                        className="text-red-400 hover:text-red-300 transition text-xs"
                      >
                        ✕
                      </button>
                    </div>
                  </div>
                ))}
              <div className="text-right text-xs text-gray-500 pt-1 border-t border-gray-800">
                {gameItems.length} ticket{gameItems.length !== 1 ? 's' : ''} • ${(gameItems.reduce((sum, item) => sum + item.section.price, 0) / 100).toFixed(2)}
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="border-t border-gray-700 mt-4 pt-4">
        <div className="flex justify-between items-center text-lg mb-4">
          <span className="font-bold">Total</span>
          <span className="text-spartans-cyan font-bold">
            ${(total / 100).toFixed(2)}
          </span>
        </div>

        <button
          onClick={onCheckout}
          className="w-full py-3 bg-spartans-cyan hover:bg-[#0096c7] text-black font-bold rounded transition"
        >
          Proceed to Checkout
        </button>
      </div>
    </div>
  );
}
