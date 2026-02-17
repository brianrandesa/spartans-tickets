import { useState, useEffect, useCallback } from 'react';
import type { Section, Seat } from '../types';

interface ApiSection extends Section {
  total_seats: number;
  available_seats: number;
}

export function useSeats() {
  const [sections, setSections] = useState<Section[]>([]);
  const [seats, setSeats] = useState<Map<string, Seat[]>>(new Map());
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    try {
      // Fetch sections and seats in parallel
      const [sectionsRes, seatsRes] = await Promise.all([
        fetch('/api/sections'),
        fetch('/api/seats')
      ]);

      if (!sectionsRes.ok || !seatsRes.ok) {
        throw new Error('Failed to fetch data');
      }

      const sectionsData = await sectionsRes.json() as ApiSection[];
      const seatsData = await seatsRes.json() as Record<string, Seat[]>;

      // Transform sections
      const transformedSections: Section[] = sectionsData.map(s => ({
        id: s.id,
        name: s.name,
        level: s.level,
        price: s.price,
        totalSeats: s.total_seats,
        availableSeats: s.available_seats,
      }));

      // Get locally stored sold seats
      const soldSeatsJson = localStorage.getItem('spartans-sold-seats');
      const soldSeats: Set<string> = new Set(soldSeatsJson ? JSON.parse(soldSeatsJson) : []);

      // Convert seats object to Map, checking against local sold seats
      const seatsMap = new Map<string, Seat[]>();
      for (const [sectionId, sectionSeats] of Object.entries(seatsData)) {
        // Mark any locally sold seats as sold
        const updatedSeats = sectionSeats.map((seat: Seat): Seat => {
          const soldKey = `${sectionId}-${seat.row}-${seat.number}`;
          if (soldSeats.has(soldKey)) {
            return { ...seat, status: 'sold' as const };
          }
          return seat;
        });
        seatsMap.set(sectionId, updatedSeats);
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
  }, []);

  useEffect(() => {
    fetchData();

    // Poll for updates every 30 seconds
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
