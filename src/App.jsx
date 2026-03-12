import { useState, useEffect } from "react";
import "./App.css";

function App() {

  const [quote, setQuote] = useState("");
  const [loading, setLoading] = useState(true);
  const [likedQuotes, setLikedQuotes] = useState(() => {
    const saved = localStorage.getItem("likedQuotes");
    return saved ? JSON.parse(saved) : [];
  });

  useEffect(() => {
    localStorage.setItem("likedQuotes", JSON.stringify(likedQuotes));
  }, [likedQuotes]);

  async function getQuote() {
    setLoading(true);

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
    if (!likedQuotes.includes(quote)) {
      setLikedQuotes([...likedQuotes, quote]);
    }
  }

  function clearLikes() {
    setLikedQuotes([]);
  }

  return (
    <div className="app">

      <div className="card">

        <h1 className="title">Daily Motivation</h1>

        {loading ? (
          <p className="loading">Loading quote...</p>
        ) : (
          <p className="quote">"{quote}"</p>
        )}

        <div className="buttons">

          <button onClick={getQuote} disabled={loading}>
            New Quote
          </button>

          <button onClick={likeQuote} disabled={loading}>
            Like
          </button>

        </div>

        <div className="liked-section">

          <h3>Liked Quotes ({likedQuotes.length})</h3>

          <div className="liked-list">
            {likedQuotes.map((q, i) => (
              <p key={i}>• {q}</p>
            ))}
          </div>

          {likedQuotes.length > 0 && (
            <button className="clear-btn" onClick={clearLikes}>
              Clear Likes
            </button>
          )}

        </div>

      </div>

    </div>
  );
}

export default App;