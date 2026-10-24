import React, { useState, useEffect } from 'react';
import { Sparkles, BookOpen, MapPin, Send, Zap, Bookmark, Award, CheckCircle } from 'lucide-react';
import { api } from '../api/client';
import confetti from 'canvas-confetti';

export default function AiRecommendationTab({ user, defaultQuery, onBorrowSuccess }) {
  const [query, setQuery] = useState(defaultQuery || '');
  const [recommendations, setRecommendations] = useState([]);
  const [personalizedRecs, setPersonalizedRecs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  const [borrowingId, setBorrowingId] = useState(null);
  const [message, setMessage] = useState('');

  const samplePrompts = [
    'I want to master Spring Boot, microservices and REST APIs for software engineering jobs',
    'Best reference textbooks for Operating Systems FAT exam: memory paging and process scheduling',
    'Data Structures & Algorithms preparation for high-frequency placement interviews',
    'Distributed systems, consensus algorithms, and database scaling',
    'Artificial intelligence and machine learning basics for computer science undergraduates'
  ];

  useEffect(() => {
    if (defaultQuery) {
      setQuery(defaultQuery);
      handleSearch(defaultQuery);
    } else {
      // Auto-load catalog recommendations or personalized
      fetchPersonalized();
    }
  }, [defaultQuery]);

  const fetchPersonalized = async () => {
    try {
      const data = await api.getPersonalizedRecommendations();
      setPersonalizedRecs(data);
    } catch (err) {
      console.error(err);
    }
  };

  const handleSearch = async (queryText) => {
    const q = queryText || query;
    if (!q.trim()) return;

    setLoading(true);
    setSearched(true);
    setMessage('');
    try {
      const results = await api.getAiRecommendations(q);
      setRecommendations(results);
    } catch (err) {
      setMessage(err.message || 'AI recommendation engine error');
    } finally {
      setLoading(false);
    }
  };

  const handleBorrow = async (book) => {
    if (!user) {
      setMessage('Please log in with your college account to borrow books.');
      return;
    }
    setBorrowingId(book.id);
    setMessage('');
    try {
      await api.borrowBook(book.id);
      confetti({ particleCount: 75, spread: 60, origin: { y: 0.7 } });
      setMessage(`Success! You have borrowed "${book.title}".`);
      if (onBorrowSuccess) onBorrowSuccess();
    } catch (err) {
      setMessage(err.message || 'Borrow failed');
    } finally {
      setBorrowingId(null);
    }
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Header */}
      <div className="text-center space-y-2 max-w-2xl mx-auto">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-50 border border-indigo-200 text-indigo-700 text-xs font-bold">
          <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
          <span>AI Academic Curriculum Advisor (PB-06)</span>
        </div>
        <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
          Intelligent Book Recommendations Grounded in Library Catalog
        </h2>
        <p className="text-xs sm:text-sm text-slate-500">
          Describe your academic goal, semester exam topic, or technical career interest in natural language. Our AI analyzes textbook contents to find the exact books on our library shelves.
        </p>
      </div>

      {/* Query Input Box */}
      <div className="lms-card p-4 sm:p-6 shadow-md border-indigo-100">
        <form
          onSubmit={(e) => { e.preventDefault(); handleSearch(); }}
          className="flex flex-col sm:flex-row gap-3"
        >
          <div className="relative flex-1">
            <input
              type="text"
              placeholder="e.g. 'I want to prepare for fullstack Java and system design interviews...'"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="w-full px-4 py-3 text-xs sm:text-sm border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-none"
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="btn bg-indigo-600 hover:bg-indigo-700 text-white text-xs sm:text-sm py-3 px-6 shadow-md shadow-indigo-500/20 whitespace-nowrap"
          >
            <Sparkles className="w-4 h-4 text-yellow-300" />
            <span>{loading ? 'Analyzing Stacks...' : 'Ask AI'}</span>
          </button>
        </form>

        {/* Prompt Chips */}
        <div className="mt-4 pt-3 border-t border-slate-100">
          <span className="text-[11px] font-bold text-slate-400 block mb-2">Try asking:</span>
          <div className="flex flex-wrap gap-2">
            {samplePrompts.map((p, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => { setQuery(p); handleSearch(p); }}
                className="text-[11px] text-slate-600 bg-slate-100 hover:bg-indigo-50 hover:text-indigo-700 hover:border-indigo-200 border border-transparent px-3 py-1.5 rounded-lg text-left transition-all"
              >
                {p}
              </button>
            ))}
          </div>
        </div>
      </div>

      {message && (
        <div className={`p-4 rounded-xl text-xs font-semibold ${
          message.includes('Success') ? 'bg-emerald-50 text-emerald-800 border border-emerald-200' : 'bg-red-50 text-red-800 border border-red-200'
        }`}>
          {message}
        </div>
      )}

      {/* AI Recommendation Results */}
      {loading ? (
        <div className="py-16 text-center space-y-3">
          <div className="w-10 h-10 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="text-xs text-slate-500">Scanning catalog topics, shelf locations, and learning paths...</p>
        </div>
      ) : recommendations.length > 0 ? (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-sm text-slate-900 flex items-center gap-2">
              <Zap className="w-4 h-4 text-amber-500" />
              <span>Grounded Recommendations for "{query}"</span>
            </h3>
            <span className="text-xs text-slate-400">{recommendations.length} curated matches</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {recommendations.map((item, idx) => {
              const book = item.book;
              return (
                <div key={book.id} className="lms-card p-5 flex flex-col justify-between border-l-4 border-l-indigo-600 relative group">
                  <div>
                    {/* Header: Score & Level */}
                    <div className="flex items-center justify-between gap-2 mb-3">
                      <span className="badge badge-purple font-bold">
                        ⭐ {item.matchPercentage}% Relevance
                      </span>
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-100 text-slate-700 uppercase">
                        {item.learningLevel} Level
                      </span>
                    </div>

                    <h4 className="font-bold text-base text-slate-900 group-hover:text-indigo-600 transition-colors">
                      {book.title}
                    </h4>
                    <p className="text-xs text-slate-500 mt-0.5">{book.author} • {book.category}</p>

                    {/* AI Rationale Box */}
                    <div className="my-3 p-3 rounded-xl bg-indigo-50/60 border border-indigo-100 text-xs text-indigo-950 leading-relaxed">
                      <span className="font-bold text-indigo-900 block text-[11px] mb-0.5 flex items-center gap-1">
                        <Sparkles className="w-3 h-3 text-indigo-600" />
                        AI Recommendation Rationale:
                      </span>
                      {item.rationale}
                    </div>

                    {/* Metadata */}
                    <div className="flex items-center justify-between text-xs text-slate-600 pt-2 border-t border-slate-100">
                      <div className="flex items-center gap-1">
                        <MapPin className="w-3.5 h-3.5 text-blue-500" />
                        <span>{book.shelfLocation}</span>
                      </div>
                      <span className={`font-semibold ${book.availableCopies > 0 ? 'text-emerald-600' : 'text-red-500'}`}>
                        {book.availableCopies} available
                      </span>
                    </div>
                  </div>

                  <div className="mt-4 pt-3 flex items-center justify-end gap-2">
                    <button
                      onClick={() => handleBorrow(book)}
                      disabled={book.availableCopies <= 0 || borrowingId === book.id}
                      className="btn btn-primary text-xs py-1.5 px-4"
                    >
                      <Bookmark className="w-3.5 h-3.5" />
                      <span>{borrowingId === book.id ? 'Borrowing...' : 'Borrow Book'}</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ) : searched ? (
        <div className="py-12 text-center lms-card p-6">
          <BookOpen className="w-10 h-10 text-slate-300 mx-auto mb-2" />
          <h4 className="font-bold text-slate-800 text-sm">No direct catalog matches found</h4>
          <p className="text-xs text-slate-500 mt-1">Try querying general subjects such as "Algorithms", "Operating Systems", or "Databases".</p>
        </div>
      ) : null}

      {/* Personalized Recommendations Section */}
      {personalizedRecs.length > 0 && (
        <div className="mt-10 pt-6 border-t border-slate-200 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-bold text-base text-slate-900">Personalized Reading Trajectory</h3>
              <p className="text-xs text-slate-500">Curated based on your department, year, and borrow history.</p>
            </div>
            <span className="badge badge-blue">Academic Path</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {personalizedRecs.map((item) => (
              <div key={item.book.id} className="lms-card p-4 flex flex-col justify-between">
                <div>
                  <span className="badge badge-slate text-[10px] mb-2">{item.book.category}</span>
                  <h4 className="font-bold text-xs text-slate-900 line-clamp-2">{item.book.title}</h4>
                  <p className="text-[11px] text-slate-500 mt-0.5">{item.book.author}</p>
                  <p className="text-[11px] text-slate-600 mt-2 line-clamp-3 bg-slate-50 p-2 rounded-lg">
                    {item.rationale}
                  </p>
                </div>
                <button
                  onClick={() => handleBorrow(item.book)}
                  disabled={item.book.availableCopies <= 0}
                  className="btn btn-secondary text-xs w-full mt-3 py-1.5"
                >
                  Borrow
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
