import { useState, useEffect, useCallback } from 'react';
import type { Section, Seat } from '../types';

interface ApiSection extends Section {
  total_seats: number;
  available_seats: number;
}

export function useSeats(gameId: string = '1') {
  const [sections, setSections] = useState<Section[]>([]);
  const [seats, setSeats] = useState<Map<string, Seat[]>>(new Map());
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    try {
      const [sectionsRes, seatsRes] = await Promise.all([
        fetch(`/api/sections?gameId=${encodeURIComponent(gameId)}`),
        fetch(`/api/seats?gameId=${encodeURIComponent(gameId)}`)
      ]);

      if (!sectionsRes.ok || !seatsRes.ok) {
        throw new Error('Failed to fetch data');
      }

      const sectionsData = await sectionsRes.json() as ApiSection[];
      const seatsData = await seatsRes.json() as Record<string, Seat[]>;

      const transformedSections: Section[] = sectionsData.map(s => ({
        id: s.id,
        name: s.name,
        level: s.level,
        price: s.price,
        totalSeats: s.total_seats,
        availableSeats: s.available_seats,
      }));

      const seatsMap = new Map<string, Seat[]>();
      for (const [sectionId, sectionSeats] of Object.entries(seatsData)) {
        seatsMap.set(sectionId, sectionSeats);
      }

      setSections(transformedSections);
      setSeats(seatsMap);
      setError(null);
    } catch (err) {
      console.error('Error fetching seats:', err);
      setError(err instanceof Error ? err.message : 'Failed to load seats');
    } finally {
      setLoading(false);
    }
  }, [gameId]);

  useEffect(() => {
    setLoading(true);
    fetchData();

    const interval = setInterval(fetchData, 30000);
    return () => clearInterval(interval);
  }, [fetchData]);

  return {
    sections,
    seats,
    loading,
    error,
    refresh: fetchData
  };
}
