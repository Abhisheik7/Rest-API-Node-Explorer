import React, { useState } from 'react';
import { ChevronRight, ChevronDown, AlertCircle } from 'lucide-react';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

function TreeNode({ name, children }) {
  const [isOpen, setIsOpen] = useState(true);
  const childNodes = Object.keys(children || {});
  const hasChildren = childNodes.length > 0;

  return (
    <div className="tree-node">
      <div 
        className="tree-node-content" 
        onClick={() => hasChildren && setIsOpen(!isOpen)}
        style={{ cursor: hasChildren ? 'pointer' : 'default' }}
      >
        {hasChildren ? (
          isOpen ? <ChevronDown className="node-icon" /> : <ChevronRight className="node-icon" />
        ) : (
          <span style={{ width: 16, display: 'inline-block' }}></span>
        )}
        <span className="node-label">{name}</span>
      </div>
      {isOpen && hasChildren && (
        <div className="tree-children">
          {childNodes.map(childName => (
            <TreeNode key={childName} name={childName} children={children[childName]} />
          ))}
        </div>
      )}
    </div>
  );
}

function HierarchyCard({ hierarchy: h }) {
  return (
    <div className="hierarchy-card">
      <div className="hierarchy-header">
        <div className="hierarchy-root">Root: {h.root}</div>
        {h.has_cycle ? (
          <div className="badge badge-cycle">⚠ Cycle Detected</div>
        ) : (
          <div className="badge badge-depth">Depth: {h.depth}</div>
        )}
      </div>
      {!h.has_cycle && (
        <div className="tree-container" style={{ marginLeft: '-20px' }}>
          {/* h.tree has the root as the first key, e.g., { "A": { "B": {} } } */}
          <TreeNode name={h.root} children={h.tree[h.root]} />
        </div>
      )}
    </div>
  );
}

function App() {
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [input, setInput] = useState('');

  const handleSubmit = async () => {
    setLoading(true);
    setError('');
    setResult(null);
    try {
      const raw = input.trim();
      if (!raw) {
        setLoading(false);
        return;
      }
      const items = raw.split(/[\n,]+/).map(s => s.trim()).filter(Boolean);
      const res = await fetch(`${API_URL}/bfhl`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ data: items })
      });
      if (!res.ok) throw new Error(`HTTP error ${res.status}`);
      const json = await res.json();
      setResult(json);
    } catch (err) {
      setError('API call failed: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleClear = () => {
    setInput('');
    setResult(null);
    setError('');
  };

  return (
    <div className="app-container">
      <header className="header">
        <h1>BFHL Node Explorer</h1>
        <p>Visualise node hierarchies, detect cycles, and explore tree structures.</p>
      </header>

      <div className="input-section">
        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Enter nodes here (e.g. A->B, A->C, B->D, X->Y, Y->Z, Z->X)"
          disabled={loading}
        />
        <div className="button-group">
          <button className="btn-secondary" onClick={handleClear} disabled={loading}>
            Clear
          </button>
          <button className="btn-primary" onClick={handleSubmit} disabled={loading}>
            {loading ? <span className="spinner"></span> : 'Submit'}
          </button>
        </div>
      </div>

      {error && (
        <div className="error-banner">
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <AlertCircle size={20} />
            <span>{error}</span>
          </div>
        </div>
      )}

      {result && (
        <div className="results-container">
          {/* Identity Card */}
          <div className="identity-card">
            <div className="identity-item">
              <span className="identity-label">USER ID</span>
              <span className="identity-value">{result.user_id}</span>
            </div>
            <div className="identity-item">
              <span className="identity-label">EMAIL ID</span>
              <span className="identity-value">{result.email_id}</span>
            </div>
            <div className="identity-item">
              <span className="identity-label">ROLL NUMBER</span>
              <span className="identity-value">{result.college_roll_number}</span>
            </div>
          </div>

          {/* Hierarchies */}
          {result.hierarchies && result.hierarchies.length > 0 && (
            <>
              <h2 className="section-title">Hierarchies</h2>
              <div className="hierarchy-grid">
                {result.hierarchies.map((h, i) => (
                  <HierarchyCard key={i} hierarchy={h} />
                ))}
              </div>
            </>
          )}

          {/* Invalid Entries */}
          {result.invalid_entries && result.invalid_entries.length > 0 && (
            <div className="pill-section">
              <h2 className="section-title">Invalid Entries</h2>
              <div className="pill-wrap">
                {result.invalid_entries.map((e, i) => (
                  <span key={i} className="pill pill-red">{e}</span>
                ))}
              </div>
            </div>
          )}

          {/* Duplicate Edges */}
          {result.duplicate_edges && result.duplicate_edges.length > 0 && (
            <div className="pill-section">
              <h2 className="section-title">Duplicate Edges</h2>
              <div className="pill-wrap">
                {result.duplicate_edges.map((e, i) => (
                  <span key={i} className="pill pill-amber">{e}</span>
                ))}
              </div>
            </div>
          )}

          {/* Summary */}
          {result.summary && (
            <div className="summary-bar">
              <div className="stat-block">
                <span className="stat-value">{result.summary.total_trees}</span>
                <div className="stat-label">TOTAL TREES</div>
              </div>
              <div className="stat-block">
                <span className="stat-value">{result.summary.total_cycles}</span>
                <div className="stat-label">TOTAL CYCLES</div>
              </div>
              <div className="stat-block">
                <span className="stat-value">{result.summary.largest_tree_root || '-'}</span>
                <div className="stat-label">LARGEST TREE ROOT</div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default App;
