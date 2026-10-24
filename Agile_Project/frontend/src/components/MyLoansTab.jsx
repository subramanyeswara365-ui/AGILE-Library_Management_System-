import React, { useState, useEffect } from 'react';
import { BookmarkCheck, RotateCcw, Clock, AlertTriangle, CreditCard, CheckCircle, Receipt, ArrowRight } from 'lucide-react';
import { api } from '../api/client';
import confetti from 'canvas-confetti';

export default function MyLoansTab({ user, onLoanAction }) {
  const [loans, setLoans] = useState([]);
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoadingId, setActionLoadingId] = useState(null);
  const [payModalRecord, setPayModalRecord] = useState(null);
  const [payMethod, setPayMethod] = useState('UPI');
  const [payReceipt, setPayReceipt] = useState(null);
  const [actionMsg, setActionMsg] = useState('');

  const fetchLoanData = async () => {
    if (!user) return;
    setLoading(true);
    try {
      const loanData = await api.getMyLoans();
      setLoans(loanData);
      const paymentData = await api.getMyPayments();
      setPayments(paymentData);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLoanData();
  }, [user]);

  const handleReturn = async (recordId, bookTitle) => {
    setActionLoadingId(recordId);
    setActionMsg('');
    try {
      const updated = await api.returnBook(recordId);
      confetti({ particleCount: 50, spread: 60, origin: { y: 0.7 } });
      if (updated.fineAmount > 0) {
        setActionMsg(`Returned "${bookTitle}". Overdue fine of ₹${updated.fineAmount} applies.`);
      } else {
        setActionMsg(`Successfully returned "${bookTitle}" on time. Thank you!`);
      }
      fetchLoanData();
      if (onLoanAction) onLoanAction();
    } catch (err) {
      setActionMsg(err.message || 'Failed to return book');
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleRenew = async (recordId, bookTitle) => {
    setActionLoadingId(recordId);
    setActionMsg('');
    try {
      const updated = await api.renewBook(recordId);
      confetti({ particleCount: 60, spread: 50, origin: { y: 0.7 } });
      setActionMsg(`Loan renewed for "${bookTitle}"! New due date is ${new Date(updated.dueDate).toLocaleDateString()}.`);
      fetchLoanData();
      if (onLoanAction) onLoanAction();
    } catch (err) {
      setActionMsg(err.message || 'Failed to renew book');
    } finally {
      setActionLoadingId(null);
    }
  };

  const handlePayFineSubmit = async (e) => {
    e.preventDefault();
    if (!payModalRecord) return;
    try {
      const receipt = await api.payFine(payModalRecord.id, payMethod);
      confetti({ particleCount: 80, spread: 60, origin: { y: 0.6 } });
      setPayReceipt(receipt);
      fetchLoanData();
      if (onLoanAction) onLoanAction();
    } catch (err) {
      setActionMsg(err.message || 'Payment processing failed');
    }
  };

  if (!user) {
    return (
      <div className="py-20 text-center lms-card p-8 max-w-md mx-auto">
        <BookmarkCheck className="w-12 h-12 text-slate-300 mx-auto mb-3" />
        <h4 className="font-bold text-slate-800">Please Sign In</h4>
        <p className="text-xs text-slate-500 mt-1">
          Log in with your official college credentials to view active book loans, return due dates, and fine receipts.
        </p>
      </div>
    );
  }

  const activeLoans = loans.filter((l) => l.status === 'BORROWED' || l.status === 'OVERDUE');
  const pastLoans = loans.filter((l) => l.status === 'RETURNED');
  const totalUnpaidFine = loans
    .filter((l) => !l.finePaid && l.fineAmount > 0)
    .reduce((sum, l) => sum + l.fineAmount, 0);

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-blue-100 text-blue-800 text-xs font-bold mb-2">
            <BookmarkCheck className="w-3.5 h-3.5 text-blue-600" />
            <span>Circulation & Fines (PB-17, PB-18)</span>
          </div>
          <h2 className="text-2xl font-bold text-slate-900 tracking-tight">
            My Borrowing History & Renewals
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Track return due dates, request +14 day renewals, and settle late return library fees online.
          </p>
        </div>

        {totalUnpaidFine > 0 && (
          <div className="p-3 rounded-2xl bg-red-50 border border-red-200 text-red-800 text-xs flex items-center gap-3">
            <div>
              <span className="font-bold block">Outstanding Fine: ₹{totalUnpaidFine.toFixed(2)}</span>
              <span className="text-[10px] text-red-600">Rate: ₹5.00 / day overdue</span>
            </div>
          </div>
        )}
      </div>

      {actionMsg && (
        <div className={`p-4 rounded-xl text-xs font-semibold ${
          actionMsg.includes('Success') || actionMsg.includes('renewed')
            ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
            : 'bg-red-50 text-red-800 border border-red-200'
        }`}>
          {actionMsg}
        </div>
      )}

      {/* Section 1: Active Borrowings (PB-17) */}
      <div className="space-y-3">
        <h3 className="font-bold text-sm text-slate-900 flex items-center justify-between">
          <span>Active Book Loans ({activeLoans.length} / 3 Allowed)</span>
          <span className="text-xs text-slate-400 font-normal">Max 2 renewals per book</span>
        </h3>

        {loading ? (
          <div className="py-12 text-center text-xs text-slate-400">Loading your borrowing records...</div>
        ) : activeLoans.length === 0 ? (
          <div className="p-8 text-center lms-card text-xs text-slate-400">
            You currently have no active book loans. Browse the catalog to borrow textbooks!
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-3">
            {activeLoans.map((loan) => {
              const isOverdue = loan.status === 'OVERDUE' || new Date(loan.dueDate) < new Date();
              const daysLeft = Math.ceil((new Date(loan.dueDate) - new Date()) / (1000 * 60 * 60 * 24));

              return (
                <div
                  key={loan.id}
                  className={`lms-card p-4 sm:p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 border-l-4 ${
                    isOverdue ? 'border-l-red-500 bg-red-50/20' : 'border-l-blue-600'
                  }`}
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <h4 className="font-bold text-sm text-slate-900">{loan.book?.title}</h4>
                      <span className={`badge ${isOverdue ? 'badge-red' : 'badge-blue'} text-[10px]`}>
                        {isOverdue ? 'OVERDUE' : `${daysLeft} Days Remaining`}
                      </span>
                    </div>
                    <p className="text-xs text-slate-500">
                      Author: {loan.book?.author} • Shelf: <span className="font-semibold text-slate-700">{loan.book?.shelfLocation}</span>
                    </p>
                    <div className="flex items-center gap-4 text-xs text-slate-600 pt-1">
                      <span>Borrowed: {new Date(loan.borrowDate).toLocaleDateString()}</span>
                      <span>Due: <span className={`font-bold ${isOverdue ? 'text-red-600' : 'text-slate-800'}`}>{new Date(loan.dueDate).toLocaleDateString()}</span></span>
                      <span>Renewals: {loan.renewalCount} / 2</span>
                    </div>

                    {isOverdue && loan.fineAmount > 0 && !loan.finePaid && (
                      <p className="text-xs font-bold text-red-600 pt-1">
                        Accrued Fine: ₹{loan.fineAmount.toFixed(2)} (Unpaid)
                      </p>
                    )}
                  </div>

                  <div className="flex items-center gap-2 self-end md:self-center shrink-0">
                    {/* Return Book Button */}
                    <button
                      onClick={() => handleReturn(loan.id, loan.book?.title)}
                      disabled={actionLoadingId === loan.id}
                      className="btn btn-secondary text-xs py-2 px-3"
                    >
                      <RotateCcw className="w-3.5 h-3.5" />
                      <span>{actionLoadingId === loan.id ? 'Processing...' : 'Return Book'}</span>
                    </button>

                    {/* Renew Book Button (Rules: not overdue, renewalCount < 2) */}
                    <button
                      onClick={() => handleRenew(loan.id, loan.book?.title)}
                      disabled={isOverdue || loan.renewalCount >= 2 || actionLoadingId === loan.id}
                      className={`btn text-xs py-2 px-3 ${
                        !isOverdue && loan.renewalCount < 2
                          ? 'btn-primary'
                          : 'bg-slate-100 text-slate-400 cursor-not-allowed border border-slate-200'
                      }`}
                      title={
                        isOverdue
                          ? 'Cannot renew overdue book'
                          : loan.renewalCount >= 2
                          ? 'Max 2 renewals reached'
                          : 'Extend loan by 14 days'
                      }
                    >
                      <Clock className="w-3.5 h-3.5" />
                      <span>Renew (+14d)</span>
                    </button>

                    {/* Pay Fine if overdue */}
                    {loan.fineAmount > 0 && !loan.finePaid && (
                      <button
                        onClick={() => { setPayModalRecord(loan); setPayReceipt(null); }}
                        className="btn btn-danger text-xs py-2 px-3"
                      >
                        <CreditCard className="w-3.5 h-3.5" />
                        <span>Pay ₹{loan.fineAmount}</span>
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Section 2: Complete Borrowing History (PB-18) */}
      <div className="space-y-3 pt-4">
        <h3 className="font-bold text-sm text-slate-900">Past Returned Records ({pastLoans.length})</h3>

        {pastLoans.length === 0 ? (
          <div className="p-6 text-center lms-card text-xs text-slate-400">
            No past returned books yet.
          </div>
        ) : (
          <div className="lms-card overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 border-b border-slate-100 text-[11px] font-bold text-slate-600 uppercase">
                  <tr>
                    <th className="p-3.5">Book Title</th>
                    <th className="p-3.5">Borrow Date</th>
                    <th className="p-3.5">Returned Date</th>
                    <th className="p-3.5">Late Fine</th>
                    <th className="p-3.5">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {pastLoans.map((loan) => (
                    <tr key={loan.id} className="hover:bg-slate-50/50">
                      <td className="p-3.5 font-bold text-slate-900">{loan.book?.title}</td>
                      <td className="p-3.5 text-slate-600">{new Date(loan.borrowDate).toLocaleDateString()}</td>
                      <td className="p-3.5 text-slate-600">
                        {loan.returnDate ? new Date(loan.returnDate).toLocaleDateString() : '—'}
                      </td>
                      <td className="p-3.5">
                        {loan.fineAmount > 0 ? (
                          <span className={loan.finePaid ? 'text-emerald-700 font-bold' : 'text-red-600 font-bold'}>
                            ₹{loan.fineAmount.toFixed(2)} ({loan.finePaid ? 'Paid' : 'Unpaid'})
                          </span>
                        ) : (
                          <span className="text-slate-400">₹0.00 (On Time)</span>
                        )}
                      </td>
                      <td className="p-3.5">
                        <span className="badge badge-green text-[10px]">RETURNED</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* Online Fine Payment Modal (PB-18) */}
      {payModalRecord && (
        <div className="modal-backdrop">
          <div className="modal-content p-6 sm:p-8 max-w-md">
            {payReceipt ? (
              /* Payment Success Receipt */
              <div className="text-center space-y-4">
                <div className="w-14 h-14 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto">
                  <CheckCircle className="w-8 h-8" />
                </div>
                <div>
                  <h3 className="font-extrabold text-lg text-slate-900">Library Fine Cleared!</h3>
                  <p className="text-xs text-slate-500 mt-1">Official digital payment transaction receipt.</p>
                </div>

                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 text-left text-xs font-mono space-y-2">
                  <div className="flex justify-between">
                    <span className="text-slate-400">Transaction ID:</span>
                    <span className="font-bold text-slate-800">{payReceipt.transactionReference}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Book:</span>
                    <span className="text-slate-700 truncate max-w-[180px]">{payReceipt.borrowRecord?.book?.title}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Amount Paid:</span>
                    <span className="font-extrabold text-emerald-700">₹{payReceipt.amount?.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Payment Mode:</span>
                    <span className="text-slate-800">{payReceipt.paymentMethod}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Timestamp:</span>
                    <span className="text-slate-800">{new Date(payReceipt.paymentDate).toLocaleString()}</span>
                  </div>
                </div>

                <button
                  onClick={() => { setPayModalRecord(null); setPayReceipt(null); }}
                  className="btn btn-primary w-full text-xs"
                >
                  Close Receipt
                </button>
              </div>
            ) : (
              /* Fine Payment Form */
              <form onSubmit={handlePayFineSubmit} className="space-y-4">
                <div className="text-center">
                  <div className="w-12 h-12 rounded-2xl bg-red-100 text-red-600 flex items-center justify-center mx-auto mb-2">
                    <Receipt className="w-6 h-6" />
                  </div>
                  <h3 className="text-lg font-bold text-slate-900">Clear Overdue Fine</h3>
                  <p className="text-xs text-slate-500 mt-0.5">"{payModalRecord.book?.title}"</p>
                </div>

                <div className="p-4 rounded-xl bg-slate-50 border border-slate-100 text-center">
                  <span className="text-[11px] text-slate-500 block uppercase font-bold tracking-wider">Total Late Fee</span>
                  <span className="text-3xl font-extrabold text-red-600">₹{payModalRecord.fineAmount?.toFixed(2)}</span>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Payment Method</label>
                  <div className="grid grid-cols-3 gap-2">
                    {['UPI', 'CAMPUS_CARD', 'NET_BANKING'].map((method) => (
                      <button
                        key={method}
                        type="button"
                        onClick={() => setPayMethod(method)}
                        className={`p-2.5 text-center rounded-xl border text-xs font-bold transition-all ${
                          payMethod === method
                            ? 'border-blue-600 bg-blue-50 text-blue-700 shadow-sm'
                            : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                        }`}
                      >
                        {method.replace('_', ' ')}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="mt-5 flex gap-2">
                  <button
                    type="button"
                    onClick={() => setPayModalRecord(null)}
                    className="btn btn-secondary w-full text-xs"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="btn btn-success w-full text-xs"
                  >
                    Authorize Payment
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
