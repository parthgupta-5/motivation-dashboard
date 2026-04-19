import { useState, useEffect } from "react";
import "./App.css";

function App() {

  const [quote, setQuote] = useState("");
  const [isReframing, setIsReframing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [likedQuotes, setLikedQuotes] = useState(() => {
    const saved = localStorage.getItem("likedQuotes");
    return saved ? JSON.parse(saved) : [];
  });
  const [selectedQuotes, setSelectedQuotes] = useState([]);

  useEffect(() => {
    localStorage.setItem("likedQuotes", JSON.stringify(likedQuotes));
  }, [likedQuotes]);

  async function getQuote() {
    setLoading(true);
    setIsReframing(false);

    try {
      const res = await fetch("https://api.adviceslip.com/advice");
      const data = await res.json();
      setQuote(data.slip.advice);
    } catch {
      setQuote("Unable to load quote.");
    }

    setLoading(false);
  }

  useEffect(() => {
    getQuote();
  }, []);

  function likeQuote() {
    if (!likedQuotes.includes(quote) && quote.trim() !== '') {
      setLikedQuotes(prev => [...prev, quote]);
      getQuote(); // Automatically fetch new quote
    }
  }

  function deleteQuote(index) {
    setLikedQuotes(prev => prev.filter((_, i) => i !== index));
    setSelectedQuotes([]); // Clear selections to avoid index mismatch
  }

  function toggleSelect(index) {
    setSelectedQuotes(prev => 
      prev.includes(index) 
        ? prev.filter(i => i !== index) 
        : [...prev, index]
    );
  }

  function toggleSelectAll() {
    if (selectedQuotes.length === likedQuotes.length && likedQuotes.length > 0) {
      setSelectedQuotes([]);
    } else {
      setSelectedQuotes(likedQuotes.map((_, i) => i));
    }
  }

  function deleteSelected() {
    setLikedQuotes(prev => prev.filter((_, i) => !selectedQuotes.includes(i)));
    setSelectedQuotes([]);
  }

  function downloadQuotes() {
    if (likedQuotes.length === 0) return;
    const element = document.createElement("a");
    const file = new Blob([likedQuotes.join('\n\n')], {type: 'text/plain'});
    element.href = URL.createObjectURL(file);
    element.download = "liked_quotes.txt";
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  }

  useEffect(() => {
    function handleKeyDown(e) {
      if (document.activeElement.tagName === 'INPUT' || document.activeElement.tagName === 'TEXTAREA') {
        return;
      }
      if (e.key === "ArrowLeft" && !loading) {
        getQuote();
      } else if (e.key === "ArrowRight" && !loading && quote) {
        likeQuote();
      }
    }
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [quote, loading, likedQuotes]);

  return (
    <div className="app">

      <div className="card">

        <h1 className="title">Daily Motivation</h1>

        {loading ? (
          <p className="loading">Loading quote...</p>
        ) : isReframing ? (
          <textarea
            className="reframe-input"
            value={quote}
            onChange={(e) => setQuote(e.target.value)}
            autoFocus
          />
        ) : (
          <p className="quote">"{quote}"</p>
        )}

        <div className="buttons">

          <button onClick={getQuote} disabled={loading}>
            New Quote
          </button>

          <button onClick={() => setIsReframing(!isReframing)} disabled={loading}>
            {isReframing ? "Done" : "Reframe"}
          </button>

          <button onClick={likeQuote} disabled={loading || isReframing}>
            Like
          </button>

        </div>

        <div className="liked-section">

          <div className="liked-header">
            <h3>Liked Quotes ({likedQuotes.length})</h3>
            
            {likedQuotes.length > 0 && (
              <div className="liked-actions">
                <label className="select-all-label">
                  <input 
                    type="checkbox" 
                    checked={selectedQuotes.length === likedQuotes.length && likedQuotes.length > 0}
                    onChange={toggleSelectAll} 
                  />
                  Select All
                </label>
                {selectedQuotes.length > 0 && (
                  <button className="delete-selected-btn" onClick={deleteSelected}>
                    Delete Selected
                  </button>
                )}
                <button className="download-btn" onClick={downloadQuotes} title="Download Quotes">
                  ↓ Download
                </button>
              </div>
            )}
          </div>

          <div className="liked-list">
            {likedQuotes.map((q, i) => (
              <div key={i} className="liked-item">
                <input 
                  type="checkbox" 
                  className="quote-checkbox"
                  checked={selectedQuotes.includes(i)}
                  onChange={() => toggleSelect(i)}
                />
                <p>• {q}</p>
                <button className="delete-btn" onClick={() => deleteQuote(i)} title="Delete Quote">
                  ✕
                </button>
              </div>
            ))}
          </div>

        </div>
        
        <div className="keyboard-shortcuts">
          <p><strong>Shortcuts:</strong> &larr; New Quote &nbsp; | &nbsp; Like Quote &rarr;</p>
        </div>

      </div>

    </div>
  );
}

export default App;