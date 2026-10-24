import React, { useState } from 'react';
import { X, QrCode, Camera, Check, AlertCircle, BookOpen, Sparkles } from 'lucide-react';
import { api } from '../api/client';
import confetti from 'canvas-confetti';

export default function QrScannerModal({ isOpen, onClose, onBorrowSuccess, user }) {
  const [qrInput, setQrInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successResult, setSuccessResult] = useState(null);

  if (!isOpen) return null;

  const handleScanSubmit = async (payload) => {
    const code = payload || qrInput;
    if (!code) {
      setError('Please provide QR code data');
      return;
    }
    if (!user) {
      setError('Please sign in to borrow books');
      return;
    }
    setError('');
    setLoading(true);
    try {
      const record = await api.borrowByQr(code);
      confetti({ particleCount: 90, spread: 70, origin: { y: 0.6 } });
      setSuccessResult(record);
      if (onBorrowSuccess) onBorrowSuccess();
    } catch (err) {
      setError(err.message || 'QR Borrow failed');
    } finally {
      setLoading(false);
    }
  };

  const sampleBookQrs = [
    { title: 'Algorithms (CLRS)', qr: 'LMS:BOOK:1' },
    { title: 'Clean Code (Agile)', qr: 'LMS:BOOK:2' },
    { title: 'Spring Boot in Action', qr: 'LMS:BOOK:3' },
    { title: 'Operating System Concepts', qr: 'LMS:BOOK:4' },
    { title: 'Database Concepts', qr: 'LMS:BOOK:5' },
    { title: 'Designing Data-Intensive Apps', qr: 'LMS:BOOK:6' }
  ];

  return (
    <div className="modal-backdrop">
      <div className="modal-content p-6 sm:p-8 max-w-md relative">
        <button
          onClick={onClose}
          className="absolute top-5 right-5 text-slate-400 hover:text-slate-600 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="text-center mb-5">
          <div className="w-12 h-12 rounded-2xl bg-indigo-100 text-indigo-600 flex items-center justify-center mx-auto mb-3 shadow-inner">
            <QrCode className="w-6 h-6" />
          </div>
          <h3 className="text-xl font-bold text-slate-900">Scan & Borrow Book</h3>
          <p className="text-xs text-slate-500 mt-1">
            Point your device camera at the physical book QR barcode or select a quick scan token.
          </p>
        </div>

        {error && (
          <div className="mb-4 p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {successResult ? (
          <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-center space-y-3">
            <div className="w-10 h-10 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto">
              <Check className="w-5 h-5" />
            </div>
            <div>
              <h4 className="font-bold text-sm text-emerald-900">Borrow Confirmed!</h4>
              <p className="text-xs text-emerald-700 mt-0.5">
                "{successResult.book?.title}" has been issued to your college account.
              </p>
            </div>
            <div className="p-2.5 rounded-xl bg-white border border-emerald-100 text-[11px] text-slate-600 font-mono text-left space-y-1">
              <div>Borrow Date: <span className="font-semibold">{new Date(successResult.borrowDate).toLocaleDateString()}</span></div>
              <div>Return Due: <span className="font-bold text-blue-600">{new Date(successResult.dueDate).toLocaleDateString()}</span></div>
              <div>Shelf: <span className="font-semibold">{successResult.book?.shelfLocation}</span></div>
            </div>
            <button
              onClick={() => { setSuccessResult(null); onClose(); }}
              className="btn btn-primary w-full text-xs"
            >
              Done
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {/* Visual Scanner Mock / Viewfinder */}
            <div className="h-44 rounded-2xl bg-slate-950 flex flex-col items-center justify-center text-slate-400 relative overflow-hidden border border-slate-800">
              <div className="absolute inset-0 bg-gradient-to-b from-transparent via-blue-500/10 to-transparent animate-pulse"></div>
              {/* Corner scan lines */}
              <div className="w-32 h-32 border-2 border-blue-400/80 rounded-xl relative flex items-center justify-center shadow-lg shadow-blue-500/20">
                <Camera className="w-8 h-8 text-blue-400 animate-bounce" />
              </div>
              <span className="text-[10px] text-slate-400 mt-2 font-mono">Camera Viewfinder Active</span>
            </div>

            {/* Manual QR string / Code Input */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Scanned QR Data / Book Identifier
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="e.g. LMS:BOOK:1 or ISBN"
                  value={qrInput}
                  onChange={(e) => setQrInput(e.target.value)}
                  className="flex-1 px-3 py-2 text-xs border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
                <button
                  type="button"
                  onClick={() => handleScanSubmit(qrInput)}
                  disabled={loading}
                  className="btn btn-primary text-xs px-4 whitespace-nowrap"
                >
                  {loading ? 'Processing...' : 'Issue Book'}
                </button>
              </div>
            </div>

            {/* Quick Demo Simulator Buttons */}
            <div className="pt-2 border-t border-slate-100">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-2">
                Simulate Camera Scan (Click to Scan Book):
              </span>
              <div className="grid grid-cols-2 gap-1.5">
                {sampleBookQrs.map((item) => (
                  <button
                    key={item.qr}
                    type="button"
                    onClick={() => { setQrInput(item.qr); handleScanSubmit(item.qr); }}
                    className="p-2 text-left rounded-xl border border-slate-200 hover:border-blue-400 hover:bg-blue-50 transition-all text-xs"
                  >
                    <span className="font-semibold text-slate-800 block truncate">{item.title}</span>
                    <span className="text-[10px] text-slate-400 font-mono">{item.qr}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
