import React, { useState, useEffect } from 'react';
import { Search, Filter, BookOpen, MapPin, CheckCircle, AlertTriangle, QrCode, Bookmark, Info, Sparkles } from 'lucide-react';
import { api } from '../api/client';
import confetti from 'canvas-confetti';

export default function CatalogTab({ user, onBorrowSuccess, onOpenQrScanner, onTriggerAiQuery }) {
  const [books, setBooks] = useState([]);
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('ALL');
  const [availableOnly, setAvailableOnly] = useState(false);
  const [loading, setLoading] = useState(true);
  const [selectedBook, setSelectedBook] = useState(null);
  const [qrModalBook, setQrModalBook] = useState(null);
  const [actionMsg, setActionMsg] = useState('');
  const [borrowingId, setBorrowingId] = useState(null);

  const categories = [
    'ALL',
    'Computer Science',
    'Software Engineering',
    'Web Development',
    'Systems',
    'Database',
    'Distributed Systems',
    'Artificial Intelligence',
    'Networking'
  ];

  const fetchBooks = async () => {
    setLoading(true);
    try {
      const data = await api.getBooks(search, selectedCategory, availableOnly);
      setBooks(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBooks();
  }, [search, selectedCategory, availableOnly]);

  const handleBorrow = async (book) => {
    if (!user) {
      setActionMsg('Please log in with your college credentials to borrow books.');
      return;
    }
    setBorrowingId(book.id);
    setActionMsg('');
    try {
      await api.borrowBook(book.id);
      confetti({ particleCount: 70, spread: 60, origin: { y: 0.7 } });
      setActionMsg(`Success! You have borrowed "${book.title}". Due date is in 14 days.`);
      fetchBooks();
      if (onBorrowSuccess) onBorrowSuccess();
    } catch (err) {
      setActionMsg(err.message || 'Failed to borrow book');
    } finally {
      setBorrowingId(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* Hero Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-blue-700 via-indigo-700 to-slate-900 text-white p-6 sm:p-10 shadow-xl">
        <div className="relative z-10 max-w-2xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/30 text-blue-100 text-xs font-semibold mb-4 backdrop-blur-sm border border-blue-400/20">
            <Sparkles className="w-3.5 h-3.5 text-yellow-300" />
            <span>Smart Academic Library 3.0</span>
          </div>
          <h2 className="text-2xl sm:text-4xl font-extrabold tracking-tight leading-tight">
            Discover, Borrow & Master Course Textbooks
          </h2>
          <p className="text-blue-100/90 text-sm sm:text-base mt-2.5">
            Search physical books across university stacks with real-time shelf mapping, QR code quick-borrowing, and AI curriculum recommendations.
          </p>

          <div className="flex flex-wrap items-center gap-3 mt-6">
            <button
              onClick={onOpenQrScanner}
              className="btn bg-white hover:bg-slate-100 text-blue-900 text-xs font-bold shadow-md shadow-black/10"
            >
              <QrCode className="w-4 h-4 text-blue-600" />
              <span>Scan QR to Borrow</span>
            </button>
            <button
              onClick={() => onTriggerAiQuery('Recommend textbooks for CAT preparation and placement interviews')}
              className="btn bg-blue-600/40 hover:bg-blue-600/60 text-white border border-blue-400/30 text-xs font-bold backdrop-blur-sm"
            >
              <Sparkles className="w-4 h-4 text-yellow-300" />
              <span>Ask AI Book Advisor</span>
            </button>
          </div>
        </div>
      </div>

      {/* Notifications / Alerts */}
      {actionMsg && (
        <div className={`p-4 rounded-2xl text-xs font-semibold flex items-center justify-between ${
          actionMsg.includes('Success') ? 'bg-emerald-50 text-emerald-800 border border-emerald-200' : 'bg-red-50 text-red-800 border border-red-200'
        }`}>
          <span>{actionMsg}</span>
          <button onClick={() => setActionMsg('')} className="underline text-[11px] ml-4">Dismiss</button>
        </div>
      )}

      {/* Search & Category Filter Controls (PB-04) */}
      <div className="lms-card p-4 sm:p-5 space-y-4">
        <div className="flex flex-col sm:flex-row gap-3 items-center justify-between">
          <div className="relative w-full sm:w-96">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
            <input
              type="text"
              placeholder="Search by title, author, category, or ISBN..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2 text-xs border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none"
            />
          </div>

          <label className="flex items-center gap-2 text-xs font-semibold text-slate-700 cursor-pointer self-start sm:self-auto select-none">
            <input
              type="checkbox"
              checked={availableOnly}
              onChange={(e) => setAvailableOnly(e.target.checked)}
              className="rounded text-blue-600 focus:ring-blue-500 w-4 h-4"
            />
            <span>Available in Library Only</span>
          </label>
        </div>

        {/* Category Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 pt-1 no-scrollbar">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
                selectedCategory === cat
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'bg-slate-100 hover:bg-slate-200 text-slate-600'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Book Grid (PB-04, PB-05) */}
      {loading ? (
        <div className="py-20 text-center text-xs text-slate-400">Loading library book catalog...</div>
      ) : books.length === 0 ? (
        <div className="py-20 text-center lms-card p-8">
          <BookOpen className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <h4 className="font-bold text-slate-800">No books found</h4>
          <p className="text-xs text-slate-500 mt-1">Try adjusting your search query or category filters.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {books.map((book) => {
            const isAvailable = book.availableCopies > 0;
            return (
              <div key={book.id} className="lms-card overflow-hidden flex flex-col group">
                {/* Book Cover Image */}
                <div className="h-44 overflow-hidden relative bg-slate-100 cursor-pointer" onClick={() => setSelectedBook(book)}>
                  <img
                    src={book.coverImageUrl || 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=400'}
                    onError={(e) => { e.currentTarget.onerror = null; e.currentTarget.src = '/images/algorithm-book-cover.svg'; }}
                    alt={book.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <span className="absolute top-2.5 right-2.5 px-2 py-0.5 rounded-md text-[10px] font-bold bg-white/90 text-slate-800 backdrop-blur-sm shadow-sm">
                    {book.category}
                  </span>
                </div>

                {/* Content */}
                <div className="p-4 flex-1 flex flex-col justify-between">
                  <div>
                    <h3
                      onClick={() => setSelectedBook(book)}
                      className="font-bold text-sm text-slate-900 group-hover:text-blue-600 transition-colors line-clamp-1 cursor-pointer"
                      title={book.title}
                    >
                      {book.title}
                    </h3>
                    <p className="text-xs text-slate-500 mt-0.5">{book.author}</p>

                    {/* Shelf Location & Availability (PB-05) */}
                    <div className="mt-3 space-y-1.5 text-[11px]">
                      <div className="flex items-center gap-1.5 text-slate-600">
                        <MapPin className="w-3.5 h-3.5 text-blue-500 shrink-0" />
                        <span className="truncate">{book.shelfLocation}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className={`inline-flex items-center gap-1 font-semibold ${isAvailable ? 'text-emerald-600' : 'text-red-500'}`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${isAvailable ? 'bg-emerald-500' : 'bg-red-500'}`}></span>
                          {isAvailable ? `${book.availableCopies} of ${book.totalCopies} Available` : 'Out of Stock'}
                        </span>
                        <span className="text-[10px] text-slate-400 font-mono">ISBN {book.isbn.substring(0, 10)}...</span>
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="mt-4 pt-3 border-t border-slate-100 flex items-center gap-2">
                    <button
                      onClick={() => handleBorrow(book)}
                      disabled={!isAvailable || borrowingId === book.id}
                      className={`btn flex-1 py-1.5 text-xs ${
                        isAvailable ? 'btn-primary' : 'bg-slate-100 text-slate-400 cursor-not-allowed'
                      }`}
                    >
                      <Bookmark className="w-3.5 h-3.5" />
                      <span>{borrowingId === book.id ? 'Borrowing...' : 'Borrow'}</span>
                    </button>
                    <button
                      onClick={() => setQrModalBook(book)}
                      className="p-2 rounded-lg border border-slate-200 text-slate-600 hover:text-blue-600 hover:bg-blue-50 transition-colors"
                      title="Generate Printable Book QR Code"
                    >
                      <QrCode className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Book Details Modal (PB-05) */}
      {selectedBook && (
        <div className="modal-backdrop">
          <div className="modal-content p-6 max-w-xl">
            <div className="flex items-start justify-between gap-4">
              <div>
                <span className="badge badge-blue mb-2">{selectedBook.category}</span>
                <h3 className="text-lg font-bold text-slate-900">{selectedBook.title}</h3>
                <p className="text-xs text-slate-500 mt-0.5">By {selectedBook.author}</p>
              </div>
              <button onClick={() => setSelectedBook(null)} className="text-slate-400 hover:text-slate-600">✕</button>
            </div>

            <div className="grid grid-cols-2 gap-3 my-4 p-3.5 rounded-xl bg-slate-50 border border-slate-100 text-xs">
              <div>
                <span className="text-slate-400 block text-[10px] uppercase font-bold">Shelf Location</span>
                <span className="font-semibold text-slate-800">{selectedBook.shelfLocation}</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px] uppercase font-bold">Availability</span>
                <span className={`font-bold ${selectedBook.availableCopies > 0 ? 'text-emerald-600' : 'text-red-500'}`}>
                  {selectedBook.availableCopies} available / {selectedBook.totalCopies} total
                </span>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px] uppercase font-bold">ISBN</span>
                <span className="font-mono text-slate-700">{selectedBook.isbn}</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px] uppercase font-bold">Publisher / Year</span>
                <span className="text-slate-700">{selectedBook.publisher || 'VIT-AP Press'} ({selectedBook.publishedYear || 2024})</span>
              </div>
            </div>

            <div>
              <h4 className="text-xs font-bold text-slate-700 uppercase mb-1">Synopsis & Academic Scope</h4>
              <p className="text-xs text-slate-600 leading-relaxed">{selectedBook.description}</p>
            </div>

            <div className="mt-6 flex justify-end gap-2">
              <button onClick={() => setSelectedBook(null)} className="btn btn-secondary text-xs">Close</button>
              <button
                onClick={() => { const b = selectedBook; setSelectedBook(null); handleBorrow(b); }}
                disabled={selectedBook.availableCopies <= 0}
                className="btn btn-primary text-xs"
              >
                Borrow Book Now
              </button>
            </div>
          </div>
        </div>
      )}

      {/* QR Code Printable Modal (PB-03) */}
      {qrModalBook && (
        <div className="modal-backdrop">
          <div className="modal-content p-6 text-center max-w-sm">
            <h3 className="font-bold text-slate-900 text-sm">Official Library QR Code</h3>
            <p className="text-xs text-slate-500 mt-1">{qrModalBook.title}</p>

            <div className="p-4 bg-white rounded-2xl border-2 border-dashed border-slate-200 inline-block my-4 shadow-sm">
              <img
                src={`/api/books/${qrModalBook.id}/qr`}
                alt="Book QR Code"
                className="w-48 h-48 mx-auto"
              />
              <span className="text-[10px] font-mono font-bold text-slate-400 mt-2 block">
                TOKEN: LMS:BOOK:{qrModalBook.id}
              </span>
            </div>

            <p className="text-[11px] text-slate-400">
              Students can scan this QR code with any library station camera to instantly record a borrowing.
            </p>

            <div className="mt-4 flex gap-2">
              <button onClick={() => setQrModalBook(null)} className="btn btn-secondary w-full text-xs">
                Close
              </button>
              <button
                onClick={() => {
                  const b = qrModalBook;
                  setQrModalBook(null);
                  handleBorrow(b);
                }}
                className="btn btn-primary w-full text-xs"
              >
                Borrow Via QR
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
