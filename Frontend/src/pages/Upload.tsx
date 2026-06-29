import { useState } from "react";
import Papa from 'papaparse';

export default function UploadPage(){

    interface Transaction{
        description: string;
        amount: string;
        date: string;
    }

    const [description, setDescription] = useState('');
    const [amount, setAmount] = useState('');
    const [date, setDate] = useState('');
    const [result, setResult] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const [file, setFile] = useState<File| null>(null);
    const [csvResult, setCsvResult] = useState<string | null>(null);
    const [csvLoading, setCsvLoading] = useState(false);


    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setResult(null);

        try{
            const res = await fetch('http://localhost:5000/api/categorizer', {
                method: 'POST',
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify({ description, amount: parseFloat(amount), date }),
            })

            const data = await res.json();

             if (!res.ok) {
                setResult(`Error: ${data.error}`);
            } else {
                setResult(`Saved! Categorized as: ${data.category_name}`);
                setDescription('');
                setAmount('');
                setDate('');
            }
        } catch (err) {
            console.error('Submit error:', err);
            setResult('Something went wrong submitting the transaction.');
        } finally {
            setLoading(false);
        }
    }

    const handleCSVUpload = () => {
       if(!file) return;

       setCsvLoading(true);
       setResult(null);

       Papa.parse<Transaction>(file, {
            header: true,
            skipEmptyLines: true,
            complete: async (results) => {
                try{
                    const transactions = results.data.map((row)=>({
                        description: row.description,
                        amount: parseFloat(row.amount),
                        date: row.date
                    }))

                    console.log(transactions)

                    const res = await fetch('http://localhost:5000/api/categorizerBatch', {
                        method: 'POST',
                        headers: {'Content-type': 'application/json'},
                        body: JSON.stringify({transactions})
                    })

                    const data = await res.json();

                    if (!res.ok) {
                        setCsvResult(`Error: ${data.error}`);
                    } else {
                        setCsvResult(data.message);
                        setFile(null);
                    }


                }
                catch(error){
                    console.error('CSV upload error:', error);
                    setCsvResult('Something went wrong uploading the CSV.');
                }
                finally{
                    setCsvLoading(false);
                }
            },
            error: (error) => {
                console.error('There was a parsing error', error);
                setCsvResult('Failed to parse CSV file.');
                setCsvLoading(false);
            }
       })
    }


    return (
        <div className="max-w-md mx-auto px-6 py-12">
            <h1 className="font-display text-3xl mb-8">New Entry</h1>

            <form onSubmit={handleSubmit} className="flex flex-col gap-5">
            <div>
                <label className="block text-xs text-stone-500 mb-1">DESCRIPTION</label>
                <input
                required
                type="text"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full border-b border-rule bg-transparent py-1.5 focus:outline-none focus:border-b-2 focus:border-accent"
                />
            </div>

            <div>
                <label className="block text-xs text-stone-500 mb-1">AMOUNT</label>
                <input
                required
                type="number"
                step="0.01"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="font-mono w-full border-b border-rule bg-transparent py-1.5 focus:outline-none focus:border-b-2 focus:border-accent"
                />
            </div>

            <div>
                <label className="block text-xs text-stone-500 mb-1">DATE</label>
                <input
                required
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="font-mono w-full border-b border-rule bg-transparent py-1.5 focus:outline-none focus:border-b-2 focus:border-accent"
                />
            </div>

            <button
                type="submit"
                disabled={loading}
                className="mt-2 bg-ink text-paper py-2.5 px-5 hover:bg-accent disabled:bg-rule disabled:cursor-not-allowed transition-colors"
            >
                {loading ? 'Recording…' : 'Record entry'}
            </button>

            {result && <p className="text-sm">{result}</p>}
            </form>

            <hr className="border-rule my-10" />

            <h2 className="font-display text-xl mb-4">Import CSV</h2>
            <input
            type="file"
            accept=".csv"
            onChange={(e) => setFile(e.target.files?.[0] ?? null)}
            className="mb-3 block text-sm"
            />
            <button
            type="button"
            onClick={handleCSVUpload}
            disabled={csvLoading || !file}
            className="bg-ink text-paper py-2.5 px-5 hover:bg-accent disabled:bg-rule disabled:cursor-not-allowed transition-colors"
            >
            {csvLoading ? 'Importing…' : 'Import'}
            </button>

            {csvResult && <p className="text-sm mt-3">{csvResult}</p>}
        </div>
    );
}