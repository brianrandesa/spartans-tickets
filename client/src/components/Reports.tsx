import { useState, useEffect } from 'react';

interface SoldTicket {
  id: string;
  section_id: string;
  row: string;
  number: number;
  order_id: string;
  customer_email: string;
  sold_at: string;
  price: number;
}

interface ReportData {
  tickets: SoldTicket[];
  totalRevenue: number;
  totalTickets: number;
  bySection: Record<string, number>;
}

export function Reports({ onBack }: { onBack: () => void }) {
  const [data, setData] = useState<ReportData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/reports/sold-tickets')
      .then(res => res.json())
      .then(setData)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="text-center py-12">
        <div className="text-cyan-400 text-xl">Loading reports...</div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="text-center py-12">
        <div className="text-red-400">Failed to load reports</div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-6xl mx-auto">
      <div className="flex items-center gap-4 mb-6">
        <button
          onClick={onBack}
          className="px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded text-white transition"
        >
          ← Back to Seat Map
        </button>
        <h1 className="text-2xl font-bold text-cyan-400">Sales Reports</h1>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <div className="bg-gray-900 rounded-lg p-6 border border-gray-800">
          <div className="text-gray-400 text-sm">Total Tickets Sold</div>
          <div className="text-3xl font-bold text-cyan-400">{data.totalTickets}</div>
        </div>
        <div className="bg-gray-900 rounded-lg p-6 border border-gray-800">
          <div className="text-gray-400 text-sm">Total Revenue</div>
          <div className="text-3xl font-bold text-green-400">${(data.totalRevenue / 100).toFixed(2)}</div>
        </div>
        <div className="bg-gray-900 rounded-lg p-6 border border-gray-800">
          <div className="text-gray-400 text-sm">Sections with Sales</div>
          <div className="text-3xl font-bold text-cyan-400">{Object.keys(data.bySection).length}</div>
        </div>
      </div>

      {/* Sales by Section */}
      <div className="bg-gray-900 rounded-lg p-6 border border-gray-800 mb-8">
        <h2 className="text-xl font-bold text-white mb-4">Sales by Section</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-2">
          {Object.entries(data.bySection)
            .sort((a, b) => b[1] - a[1])
            .map(([section, count]) => (
              <div key={section} className="bg-gray-800 rounded p-3 text-center">
                <div className="text-cyan-400 font-bold">{section}</div>
                <div className="text-white">{count} tickets</div>
              </div>
            ))}
        </div>
      </div>

      {/* Tickets Table */}
      <div className="bg-gray-900 rounded-lg border border-gray-800 overflow-hidden">
        <h2 className="text-xl font-bold text-white p-6 border-b border-gray-800">
          All Sold Tickets ({data.tickets.length})
        </h2>
        <div className="overflow-x-auto max-h-96">
          <table className="w-full">
            <thead className="bg-gray-800 sticky top-0">
              <tr>
                <th className="text-left p-3 text-gray-400">Section</th>
                <th className="text-left p-3 text-gray-400">Row</th>
                <th className="text-left p-3 text-gray-400">Seat</th>
                <th className="text-left p-3 text-gray-400">Customer</th>
                <th className="text-left p-3 text-gray-400">Order ID</th>
                <th className="text-left p-3 text-gray-400">Date</th>
                <th className="text-right p-3 text-gray-400">Price</th>
              </tr>
            </thead>
            <tbody>
              {data.tickets.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center py-8 text-gray-500">
                    No tickets sold yet
                  </td>
                </tr>
              ) : (
                data.tickets.map((ticket) => (
                  <tr key={ticket.id} className="border-t border-gray-800 hover:bg-gray-800/50">
                    <td className="p-3 text-cyan-400 font-bold">{ticket.section_id}</td>
                    <td className="p-3 text-white">{ticket.row}</td>
                    <td className="p-3 text-white">{ticket.number}</td>
                    <td className="p-3 text-gray-300">{ticket.customer_email || '-'}</td>
                    <td className="p-3 text-gray-500 text-sm">{ticket.order_id || '-'}</td>
                    <td className="p-3 text-gray-400 text-sm">
                      {ticket.sold_at ? new Date(ticket.sold_at).toLocaleDateString() : '-'}
                    </td>
                    <td className="p-3 text-right text-green-400">${(ticket.price / 100).toFixed(2)}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Export Button */}
      <div className="mt-6 flex justify-end">
        <button
          onClick={() => {
            const csv = [
              ['Section', 'Row', 'Seat', 'Customer', 'Order ID', 'Date', 'Price'].join(','),
              ...data.tickets.map(t => [
                t.section_id,
                t.row,
                t.number,
                t.customer_email || '',
                t.order_id || '',
                t.sold_at || '',
                (t.price / 100).toFixed(2)
              ].join(','))
            ].join('\n');
            const blob = new Blob([csv], { type: 'text/csv' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `spartans-tickets-report-${new Date().toISOString().split('T')[0]}.csv`;
            a.click();
          }}
          className="bg-cyan-500 hover:bg-cyan-400 text-black font-bold py-2 px-6 rounded-lg transition-colors"
        >
          Export CSV
        </button>
      </div>
    </div>
  );
}
