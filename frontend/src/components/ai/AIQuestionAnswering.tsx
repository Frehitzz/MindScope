import React, { useState } from 'react';

/**
 * AIQuestionAnswering Component
 * Q&A interface for interacting with the dataset
 */
const AIQuestionAnswering = () => {
  const [query, setQuery] = useState('');

  return (
    <div className="flex flex-col gap-2 p-4 border rounded-xl bg-white shadow-sm">
      <h3 className="font-semibold">Ask about the data</h3>
      <div className="flex gap-2">
        <input 
          type="text" 
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="e.g., Which age group has the highest stress levels?"
          className="flex-1 border rounded px-3 py-2 outline-none focus:ring-2 focus:ring-blue-500"
        />
        <button className="bg-slate-800 text-white px-4 py-2 rounded">
          Ask
        </button>
      </div>
      <div className="mt-2 text-sm text-slate-500 min-h-[50px] border-t pt-2">
        AI response will appear here...
      </div>
    </div>
  );
};

export default AIQuestionAnswering;
