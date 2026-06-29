import { useEffect, useState } from "react";

interface DbTransaction {
  id: number;
  date: string;
  description: string;
  amount: string;
  category_name: string;
}

export default function Dashboard() {
  const [transactions, setTransactions] = useState<DbTransaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch('http://localhost:5000/api/dashboard')
      .then((res) => {
        if (!res.ok) throw new Error('Failed to fetch transactions');
        return res.json();
      })
      .then((data) => setTransactions(data))
      .catch((err) => {
        console.error('Fetch error:', err);
        setError('Could not load transactions.');
      })
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <p>Loading transactions...</p>;
  if (error) return <p>{error}</p>;

  return (
    <div className="max-w-3xl mx-auto px-6 py-12">
        <h1 className="font-display text-3xl">Ledger</h1>
        <p className="text-stone-500 mb-8">Every transaction, in order.</p>

        {transactions.length === 0 ? (
        <p>Nothing recorded yet. Add a transaction to get started.</p>
        ) : (
        <table className="w-full border-collapse">
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
        )}
    </div>
    );
}