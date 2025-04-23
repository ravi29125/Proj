import React, { useState } from 'react';

function App() {
  const [domain, setDomain] = useState('');
  const [attributes, setAttributes] = useState([]);
  const [newAttribute, setNewAttribute] = useState({ name: '', type: 'string' });
  const [recordCount, setRecordCount] = useState(100);
  const [seed, setSeed] = useState('');
  const [generatedData, setGeneratedData] = useState(null);
  const [viewMode, setViewMode] = useState('table');

  const addAttribute = () => {
    if (!newAttribute.name) return;
    setAttributes([...attributes, newAttribute]);
    setNewAttribute({ name: '', type: 'string' });
  };

  const removeAttribute = (index) => {
    setAttributes(attributes.filter((_, i) => i !== index));
  };

  const generateDataset = async () => {
    const attrPrompt = attributes.map(attr => `${attr.name} (${attr.type})`).join(', ');
    const prompt = `Domain: ${domain}, Attributes: ${attrPrompt}, Records: ${recordCount}, Seed: ${seed}`;
    const formData = new FormData();
    formData.append('str', prompt);
    formData.append('num', recordCount);  

    try {
      const res = await fetch('http://127.0.0.1:5000/', {
        method: 'POST',
        body: formData,
      });
      const data = await res.json();
      setGeneratedData(data);
    } catch (err) {
      console.error('Error generating data:', err);
    }
  };

  const downloadJSON = () => {
    const blob = new Blob([JSON.stringify(generatedData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'synthetic_data.json';
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white p-6">
      <div className="max-w-3xl mx-auto space-y-6">
        <h1 className="text-3xl font-bold text-center text-blue-400">Synthetic Data Generator</h1>

        <div className="bg-gray-800 p-6 rounded-xl shadow space-y-4">
          {/* Domain */}
          <div>
            <label>Domain</label>
            <input
              type="text"
              value={domain}
              onChange={(e) => setDomain(e.target.value)}
              className="w-full mt-1 p-2 rounded bg-gray-700"
              placeholder="e.g., Employee"
            />
          </div>

          {/* Attributes */}
          <div>
            <label>Attributes</label>
            <div className="flex gap-2 mt-1">
              <input
                type="text"
                value={newAttribute.name}
                onChange={(e) => setNewAttribute(prev => ({ ...prev, name: e.target.value }))}
                placeholder="Attribute Name"
                className="flex-1 p-2 rounded bg-gray-700"
              />
              <select
                value={newAttribute.type}
                onChange={(e) => setNewAttribute(prev => ({ ...prev, type: e.target.value }))}
                className="p-2 rounded bg-gray-700"
              >
                <option value="string">String</option>
                <option value="number">Number</option>
                <option value="boolean">Boolean</option>
                <option value="date">Date</option>
              </select>
              <button onClick={addAttribute} className="bg-blue-500 px-4 py-2 rounded hover:bg-blue-600">Add</button>
            </div>
            <ul className="mt-2 space-y-1">
              {attributes.map((attr, i) => (
                <li key={i} className="flex justify-between bg-gray-700 p-2 rounded">
                  <span>{attr.name} ({attr.type})</span>
                  <button onClick={() => removeAttribute(i)} className="text-red-400 hover:text-red-200">Remove</button>
                </li>
              ))}
            </ul>
          </div>

          {/* Record Count */}
          <div>
            <label>Number of Records</label>
            <input
              type="number"
              value={recordCount}
              onChange={(e) => setRecordCount(Number(e.target.value))}
              className="w-full mt-1 p-2 rounded bg-gray-700"
            />
          </div>

          {/* Seed */}
          <div>
            <label>Seed (optional)</label>
            <input
              type="text"
              value={seed}
              onChange={(e) => setSeed(e.target.value)}
              className="w-full mt-1 p-2 rounded bg-gray-700"
            />
          </div>

          {/* Generate Button */}
          <button
            onClick={generateDataset}
            disabled={!domain || attributes.length === 0}
            className="w-full bg-green-600 py-3 rounded hover:bg-green-700 disabled:bg-gray-500 disabled:cursor-not-allowed"
          >
            Generate Dataset
          </button>
        </div>

        {/* Results */}
        {generatedData && (
          <div className="bg-gray-800 p-6 rounded-xl space-y-4">
            <div className="flex justify-between items-center">
              <div className="space-x-2">
                <button
                  onClick={() => setViewMode('table')}
                  className={`px-4 py-2 rounded ${viewMode === 'table' ? 'bg-blue-500' : 'bg-gray-700'}`}
                >
                  Table View
                </button>
                <button
                  onClick={() => setViewMode('json')}
                  className={`px-4 py-2 rounded ${viewMode === 'json' ? 'bg-blue-500' : 'bg-gray-700'}`}
                >
                  JSON View
                </button>
              </div>
              <button
                onClick={downloadJSON}
                className="bg-yellow-600 px-4 py-2 rounded hover:bg-yellow-700"
              >
                Download JSON
              </button>
            </div>

            {viewMode === 'json' ? (
              <pre className="text-sm bg-gray-900 p-4 rounded overflow-auto max-h-[400px]">
                {JSON.stringify(generatedData, null, 2)}
              </pre>
            ) : (
              <div className="overflow-auto max-h-[400px]">
                <table className="w-full text-left">
                  <thead>
                    <tr>
                      {Object.keys(generatedData[0]).map((key, i) => (
                        <th key={i} className="px-3 py-2 bg-gray-700">{key}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {generatedData.map((row, i) => (
                      <tr key={i} className="border-b border-gray-700">
                        {Object.values(row).map((val, j) => (
                          <td key={j} className="px-3 py-2">{val}</td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default App;
