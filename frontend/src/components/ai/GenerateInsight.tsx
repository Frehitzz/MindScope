import React from 'react';

/**
 * GenerateInsight Component
 * Trigger for AI-generated dashboard insights
 */
const GenerateInsight = () => {
  return (
    <div className="p-4 border rounded-lg bg-slate-50">
      <h3 className="text-lg font-bold">AI Insights</h3>
      <p className="text-sm text-slate-600 mb-4">Generate natural-language recommendations based on current data.</p>
      <button className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">
        Generate Insight
      </button>
    </div>
  );
};

export default GenerateInsight;
