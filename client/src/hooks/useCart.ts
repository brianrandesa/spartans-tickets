import { useState, useCallback } from 'react';
import type { Seat, Section, CartItem, Game } from '../types';

export function useCart() {
  const [items, setItems] = useState<CartItem[]>([]);

  const addSeat = useCallback((seat: Seat, section: Section, game: Game) => {
    setItems(prev => {
      // Don't add if already in cart (same seat + same game)
      if (prev.some(item => item.seat.id === seat.id && item.game.id === game.id)) {
        return prev;
      }
      return [...prev, { seat, section, game }];
    });
  }, []);

  const removeSeat = useCallback((seatId: string, gameId: string) => {
    setItems(prev => prev.filter(item => !(item.seat.id === seatId && item.game.id === gameId)));
  }, []);

  const toggleSeat = useCallback((seat: Seat, section: Section, game: Game) => {
    setItems(prev => {
      const exists = prev.some(item => item.seat.id === seat.id && item.game.id === game.id);
      if (exists) {
        return prev.filter(item => !(item.seat.id === seat.id && item.game.id === game.id));
      }
      return [...prev, { seat, section, game }];
    });
  }, []);

  const clearCart = useCallback(() => {
    setItems([]);
  }, []);

  const isInCart = useCallback((seatId: string, gameId: string) => {
    return items.some(item => item.seat.id === seatId && item.game.id === gameId);
  }, [items]);

  // Group items by game for display
  const itemsByGame = items.reduce((acc, item) => {
    const gameId = item.game.id;
    if (!acc[gameId]) {
      acc[gameId] = { game: item.game, items: [] };
    }
    acc[gameId].items.push(item);
    return acc;
  }, {} as Record<string, { game: Game; items: CartItem[] }>);

  const total = items.reduce((sum, item) => sum + item.section.price, 0);
  const count = items.length;

  return {
    items,
    itemsByGame,
    addSeat,
    removeSeat,
    toggleSeat,
    clearCart,
    isInCart,
    total,
    count
  };
}
