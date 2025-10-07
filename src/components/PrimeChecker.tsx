import { useState } from 'react';

export default function PrimeChecker() {
  const [number, setNumber] = useState('');
  const [result, setResult] = useState('');

  const checkPrimeNumber = () => {
    const num = parseInt(number);
    if (isNaN(num)) {
      setResult('Please enter a valid number');
      return;
    }

    if (num <= 1) {
      setResult('Not Prime');
      return;
    }

    for (let i = 2; i <= Math.sqrt(num); i++) {
      if (num % i === 0) {
        setResult('Not Prime');
        return;
      }
    }

    setResult('Prime');
  };

  return (
    <div className="max-w-md mx-auto p-6 bg-white rounded-2xl shadow-lg">
      <h2 className="text-2xl font-bold text-slate-900 mb-6">Prime Number Checker</h2>

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">
            Enter the number:
          </label>
          <input
            type="number"
            value={number}
            onChange={(e) => setNumber(e.target.value)}
            className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
            placeholder="Enter a number"
          />
        </div>

        <button
          onClick={checkPrimeNumber}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-lg transition"
        >
          Check
        </button>

        {result && (
          <div className="text-center p-4 bg-slate-50 rounded-lg">
            <p className="text-lg font-medium text-slate-900">{result}</p>
          </div>
        )}
      </div>
    </div>
  );
}
