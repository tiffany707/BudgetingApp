import { useState, useEffect } from "react";

interface Category {
  id: number;
  name: string;
}

interface FilteredTransaction {
  id: number;
  date: string;
  amount: string;
  description: string;
  category_name: string;
}

export default function TransactionFilter() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategoryIds, setSelectedCategoryIds] = useState<number[]>([]);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [transactions, setTransactions] = useState<FilteredTransaction[]>([]);
  const [total, setTotal] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Load all categories once, on mount
  useEffect(() => {
    fetch('http://localhost:5000/api/categories')
      .then((res) => res.json())
      .then((data) => setCategories(data))
      .catch((err) => console.error('Failed to load categories:', err));
  }, []);

  const toggleCategory = (id: number) => {
    setSelectedCategoryIds((prev) =>
      prev.includes(id) ? prev.filter((c) => c !== id) : [...prev, id]
    );
  };

  const handleFilter = async () => {
    if (!startDate || !endDate) {
      setError('Please select both a start and end date.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const params = new URLSearchParams({ startDate, endDate });
      if (selectedCategoryIds.length > 0) {
        params.set('categoryIds', selectedCategoryIds.join(','));
      }

      const res = await fetch(`http://localhost:5000/api/dashboard/filter?${params}`);
      const data = await res.json();

      if (!res.ok) throw new Error(data.error || 'Failed to filter transactions');

      setTransactions(data.transactions);
      setTotal(data.total);

    } catch (err) {
      console.error('Filter error:', err);
      setError('Could not load filtered transactions.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto px-6 py-12">
      <h1 className="font-display text-3xl mb-8">Filter</h1>

      <div className="flex gap-6 mb-6">
        <div>
          <label className="block text-xs text-stone-500 mb-1">START DATE</label>
          <input
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            className="font-mono border-b border-rule bg-transparent py-1.5 focus:outline-none focus:border-b-2 focus:border-accent"
          />
        </div>
        <div>
          <label className="block text-xs text-stone-500 mb-1">END DATE</label>
          <input
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            className="font-mono border-b border-rule bg-transparent py-1.5 focus:outline-none focus:border-b-2 focus:border-accent"
          />
        </div>
      </div>

      <div className="mb-6">
        <label className="block text-xs text-stone-500 mb-2">CATEGORIES (leave unchecked for all)</label>
        <div className="flex flex-wrap gap-3">
          {categories.map((cat) => (
            <label key={cat.id} className="flex items-center gap-1.5 text-sm">
              <input
                type="checkbox"
                checked={selectedCategoryIds.includes(cat.id)}
                onChange={() => toggleCategory(cat.id)}
              />
              {cat.name}
            </label>
          ))}
        </div>
      </div>

      <button onClick={handleFilter} disabled={loading} className="bg-ink text-paper py-2.5 px-5 hover:bg-accent disabled:bg-rule disabled:cursor-not-allowed transition-colors">
        {loading ? 'Filtering…' : 'Apply filter'}
      </button>

      {error && <p className="text-debit text-sm mt-3">{error}</p>}

      {total !== null && (
        <div className="mt-10">
          <p className="text-sm text-stone-500 mb-1">TOTAL</p>
          <p className={`font-mono text-3xl ${total < 0 ? 'text-debit' : 'text-credit'}`}>
            {total < 0 ? '-' : ''}${Math.abs(total).toFixed(2)}
          </p>

          <table className="w-full border-collapse mt-8">
            <thead>
              <tr className="border-b-2 border-ink">
                <th className="text-left py-2 px-1 text-xs font-medium text-stone-500">DATE</th>
                <th className="text-left py-2 px-1 text-xs font-medium text-stone-500">DESCRIPTION</th>
                <th className="text-left py-2 px-1 text-xs font-medium text-stone-500">CATEGORY</th>
                <th className="text-right py-2 px-1 text-xs font-medium text-stone-500">AMOUNT</th>
              </tr>
            </thead>
            <tbody>
              {transactions.map((tx) => {
                const value = parseFloat(tx.amount);
                return (
                  <tr key={tx.id} className="border-b border-rule">
                    <td className="font-mono text-sm py-3 px-1">{tx.date}</td>
                    <td className="py-3 px-1">{tx.description}</td>
                    <td className="text-sm text-stone-500 py-3 px-1">{tx.category_name}</td>
                    <td className={`font-mono text-right py-3 px-1 ${value < 0 ? 'text-debit' : 'text-credit'}`}>
                      {value < 0 ? '-' : ''}${Math.abs(value).toFixed(2)}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}