import React, { useState, useEffect } from 'react';
import {
  ShieldAlert, BookOpen, Users, FileCheck, CheckCircle2,
  XCircle, Plus, Trash2, Edit2, QrCode, AlertTriangle, Download, RefreshCw
} from 'lucide-react';
import { api } from '../api/client';
import confetti from 'canvas-confetti';

export default function AdminPortalTab({ user, onDataChanged }) {
  const [stats, setStats] = useState(null);
  const [subTab, setSubTab] = useState('verification'); // 'verification' | 'books' | 'loans' | 'users'
  const [pendingPapers, setPendingPapers] = useState([]);
  const [books, setBooks] = useState([]);
  const [allLoans, setAllLoans] = useState([]);
  const [usersList, setUsersList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionMsg, setActionMsg] = useState('');

  // Book Form Modal (Create / Edit)
  const [isBookModalOpen, setIsBookModalOpen] = useState(false);
  const [editingBookId, setEditingBookId] = useState(null);
  const [bTitle, setBTitle] = useState('');
  const [bAuthor, setBAuthor] = useState('');
  const [bIsbn, setBIsbn] = useState('');
  const [bCategory, setBCategory] = useState('Computer Science');
  const [bShelf, setBShelf] = useState('Rack CS-01, 2nd Floor');
  const [bTotalCopies, setBTotalCopies] = useState(5);
  const [bAvailableCopies, setBAvailableCopies] = useState(5);
  const [bDescription, setBDescription] = useState('');
  const [bCoverUrl, setBCoverUrl] = useState('');
  const [bPublisher, setBPublisher] = useState('VIT-AP Press');
  const [bPublishedYear, setBPublishedYear] = useState(2024);

  // Reject Modal
  const [rejectingPaperId, setRejectingPaperId] = useState(null);
  const [rejectReason, setRejectReason] = useState('');

  const fetchAdminData = async () => {
    setLoading(true);
    try {
      const statsData = await api.getAdminStats();
      setStats(statsData);
      const papersData = await api.getPendingPapers();
      setPendingPapers(papersData);
      const booksData = await api.getBooks();
      setBooks(booksData);
      const loansData = await api.getAllLoans();
      setAllLoans(loansData);
      const usersData = await api.getUsers();
      setUsersList(usersData);
    } catch (err) {
      console.error(err);
      setActionMsg(err.message || 'Failed to fetch administrative data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAdminData();
  }, []);

  const handleApprovePaper = async (paperId) => {
    try {
      await api.approvePaper(paperId);
      confetti({ particleCount: 60, spread: 50, origin: { y: 0.6 } });
      setActionMsg('Question paper verified and published to the academic repository (PB-09)!');
      fetchAdminData();
      if (onDataChanged) onDataChanged();
    } catch (err) {
      setActionMsg(err.message || 'Approval failed');
    }
  };

  const handleRejectPaper = async () => {
    if (!rejectingPaperId) return;
    try {
      await api.rejectPaper(rejectingPaperId, rejectReason);
      setActionMsg('Paper submission rejected. Uploader has been notified with the reason.');
      setRejectingPaperId(null);
      setRejectReason('');
      fetchAdminData();
    } catch (err) {
      setActionMsg(err.message || 'Rejection failed');
    }
  };

  const handleSaveBook = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        title: bTitle,
        author: bAuthor,
        isbn: bIsbn,
        category: bCategory,
        shelfLocation: bShelf,
        totalCopies: Number(bTotalCopies),
        availableCopies: Number(bAvailableCopies),
        description: bDescription,
        coverImageUrl: bCoverUrl || null,
        publisher: bPublisher,
        publishedYear: Number(bPublishedYear),
      };

      if (editingBookId) {
        await api.updateBook(editingBookId, payload);
        setActionMsg('Book updated successfully.');
      } else {
        await api.createBook(payload);
        setActionMsg('New book added to library stacks.');
      }

      setIsBookModalOpen(false);
      resetBookForm();
      fetchAdminData();
      if (onDataChanged) onDataChanged();
    } catch (err) {
      setActionMsg(err.message || 'Failed to save book');
    }
  };

  const handleDeleteBook = async (bookId, title) => {
    if (!window.confirm(`Are you sure you want to delete "${title}"?`)) return;
    try {
      await api.deleteBook(bookId);
      setActionMsg(`"${title}" deleted from catalog.`);
      fetchAdminData();
      if (onDataChanged) onDataChanged();
    } catch (err) {
      setActionMsg(err.message || 'Delete failed');
    }
  };

  const openEditBook = (book) => {
    setEditingBookId(book.id);
    setBTitle(book.title);
    setBAuthor(book.author);
    setBIsbn(book.isbn);
    setBCategory(book.category);
    setBShelf(book.shelfLocation);
    setBTotalCopies(book.totalCopies);
    setBAvailableCopies(book.availableCopies);
    setBDescription(book.description || '');
    setBCoverUrl(book.coverImageUrl || '');
    setBPublisher(book.publisher || '');
    setBPublishedYear(book.publishedYear || 2024);
    setIsBookModalOpen(true);
  };

  const resetBookForm = () => {
    setEditingBookId(null);
    setBTitle('');
    setBAuthor('');
    setBIsbn('');
    setBCategory('Computer Science');
    setBShelf('Rack CS-01, 2nd Floor');
    setBTotalCopies(5);
    setBAvailableCopies(5);
    setBDescription('');
    setBCoverUrl('');
  };

  if (!user || (user.role !== 'ADMIN' && user.role !== 'LIBRARIAN')) {
    return (
      <div className="py-20 text-center lms-card p-8 max-w-md mx-auto">
        <ShieldAlert className="w-12 h-12 text-red-400 mx-auto mb-3" />
        <h4 className="font-bold text-slate-800">Restricted Administrator Area (PB-20)</h4>
        <p className="text-xs text-slate-500 mt-1">
          Access denied. This centralized dashboard is reserved for authorized University Librarians and Administrators.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-purple-100 text-purple-800 text-xs font-bold mb-2">
            <ShieldAlert className="w-3.5 h-3.5 text-purple-600" />
            <span>Chief Librarian & Admin Portal (PB-09, PB-19, PB-20)</span>
          </div>
          <h2 className="text-2xl font-bold text-slate-900 tracking-tight">
            Centralized Library Operations & Verification Center
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Logged in as <span className="font-semibold text-purple-700">{user.fullName}</span> ({user.role})
          </p>
        </div>

        <button
          onClick={fetchAdminData}
          className="btn btn-secondary text-xs self-start sm:self-auto"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Refresh Analytics</span>
        </button>
      </div>

      {actionMsg && (
        <div className={`p-4 rounded-xl text-xs font-semibold ${
          actionMsg.includes('verified') || actionMsg.includes('updated') || actionMsg.includes('added')
            ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
            : 'bg-red-50 text-red-800 border border-red-200'
        }`}>
          {actionMsg}
        </div>
      )}

      {/* KPI Stats Cards (PB-19) */}
      {stats && (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          <div className="lms-card p-4">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Total Titles</span>
            <span className="text-2xl font-extrabold text-slate-900 mt-1 block">{stats.totalTitles}</span>
            <span className="text-[10px] text-slate-500">{stats.totalBooks} physical copies</span>
          </div>
          <div className="lms-card p-4 border-l-4 border-l-blue-600">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Active Loans</span>
            <span className="text-2xl font-extrabold text-blue-600 mt-1 block">{stats.activeLoans}</span>
            <span className="text-[10px] text-slate-500">Currently issued</span>
          </div>
          <div className="lms-card p-4 border-l-4 border-l-red-500">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Overdue Loans</span>
            <span className="text-2xl font-extrabold text-red-600 mt-1 block">{stats.overdueLoans}</span>
            <span className="text-[10px] text-red-500">₹{stats.unpaidFines?.toFixed(0)} unpaid</span>
          </div>
          <div className="lms-card p-4 border-l-4 border-l-emerald-600">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Fines Collected</span>
            <span className="text-2xl font-extrabold text-emerald-600 mt-1 block">₹{stats.totalFinesCollected?.toFixed(0)}</span>
            <span className="text-[10px] text-emerald-700">Digital receipts</span>
          </div>
          <div className="lms-card p-4 border-l-4 border-l-amber-500">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Pending PYQs</span>
            <span className="text-2xl font-extrabold text-amber-600 mt-1 block">{stats.pendingPaperApprovals}</span>
            <span className="text-[10px] text-amber-700">Needs review</span>
          </div>
          <div className="lms-card p-4">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Reading Desks</span>
            <span className="text-2xl font-extrabold text-slate-900 mt-1 block">{stats.todaySeatReservations}</span>
            <span className="text-[10px] text-slate-500">Booked today</span>
          </div>
        </div>
      )}

      {/* Sub-tab Navigation */}
      <div className="flex border-b border-slate-200 gap-6 text-xs font-bold">
        <button
          onClick={() => setSubTab('verification')}
          className={`pb-3 relative flex items-center gap-2 transition-all ${
            subTab === 'verification' ? 'text-purple-600' : 'text-slate-500 hover:text-slate-900'
          }`}
        >
          <FileCheck className="w-4 h-4" />
          <span>Paper Verification Queue</span>
          {pendingPapers.length > 0 && (
            <span className="w-5 h-5 rounded-full bg-amber-500 text-white text-[10px] font-extrabold flex items-center justify-center">
              {pendingPapers.length}
            </span>
          )}
          {subTab === 'verification' && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-purple-600 rounded"></div>}
        </button>

        <button
          onClick={() => setSubTab('books')}
          className={`pb-3 relative flex items-center gap-2 transition-all ${
            subTab === 'books' ? 'text-purple-600' : 'text-slate-500 hover:text-slate-900'
          }`}
        >
          <BookOpen className="w-4 h-4" />
          <span>Catalog & Inventory ({books.length})</span>
          {subTab === 'books' && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-purple-600 rounded"></div>}
        </button>

        <button
          onClick={() => setSubTab('loans')}
          className={`pb-3 relative flex items-center gap-2 transition-all ${
            subTab === 'loans' ? 'text-purple-600' : 'text-slate-500 hover:text-slate-900'
          }`}
        >
          <RefreshCw className="w-4 h-4" />
          <span>Campus Loan Monitoring ({allLoans.length})</span>
          {subTab === 'loans' && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-purple-600 rounded"></div>}
        </button>

        <button
          onClick={() => setSubTab('users')}
          className={`pb-3 relative flex items-center gap-2 transition-all ${
            subTab === 'users' ? 'text-purple-600' : 'text-slate-500 hover:text-slate-900'
          }`}
        >
          <Users className="w-4 h-4" />
          <span>User Directory ({usersList.length})</span>
          {subTab === 'users' && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-purple-600 rounded"></div>}
        </button>
      </div>

      {/* Sub-tab 1: Document Verification Queue (PB-09) */}
      {subTab === 'verification' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-sm text-slate-900">
              Pending Document Approvals ({pendingPapers.length})
            </h3>
            <span className="text-xs text-slate-500">Chief Librarian Review Authority</span>
          </div>

          {pendingPapers.length === 0 ? (
            <div className="py-16 text-center lms-card p-6">
              <CheckCircle2 className="w-10 h-10 text-emerald-500 mx-auto mb-2" />
              <h4 className="font-bold text-sm text-slate-800">Verification Queue Clear!</h4>
              <p className="text-xs text-slate-500 mt-1">All student contributed question papers have been reviewed.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {pendingPapers.map((paper) => (
                <div key={paper.id} className="lms-card p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 border-l-4 border-l-amber-500">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <h4 className="font-bold text-sm text-slate-900">{paper.courseCode} — {paper.courseName}</h4>
                      <span className="badge badge-yellow text-[10px]">{paper.examType}</span>
                      <span className="badge badge-slate text-[10px]">{paper.academicYear}</span>
                    </div>
                    <p className="text-xs text-slate-500">
                      Instructor: <span className="font-semibold text-slate-700">{paper.facultyName || 'Department Faculty'}</span> • {paper.semester}
                    </p>
                    <div className="flex items-center gap-4 text-xs text-slate-600 pt-1">
                      <span>Submitted by: <span className="font-bold text-blue-600">{paper.uploadedBy?.fullName}</span> ({paper.uploadedBy?.email})</span>
                      <span>File: <span className="font-mono text-slate-800">{paper.fileName}</span></span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 self-end md:self-center shrink-0">
                    <a
                      href={`/api/papers/${paper.id}/download`}
                      download={paper.fileName}
                      className="btn btn-secondary text-xs py-2 px-3"
                    >
                      <Download className="w-3.5 h-3.5" />
                      <span>Preview PDF</span>
                    </a>
                    <button
                      onClick={() => handleApprovePaper(paper.id)}
                      className="btn btn-success text-xs py-2 px-3.5"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>Approve & Publish</span>
                    </button>
                    <button
                      onClick={() => setRejectingPaperId(paper.id)}
                      className="btn btn-danger text-xs py-2 px-3.5"
                    >
                      <XCircle className="w-3.5 h-3.5" />
                      <span>Reject</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Sub-tab 2: Book Catalog & Inventory CRUD (PB-19) */}
      {subTab === 'books' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-sm text-slate-900">Library Book Titles ({books.length})</h3>
            <button
              onClick={() => { resetBookForm(); setIsBookModalOpen(true); }}
              className="btn btn-primary text-xs"
            >
              <Plus className="w-4 h-4" />
              <span>Add New Book to Stacks</span>
            </button>
          </div>

          <div className="lms-card overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 border-b border-slate-100 text-[11px] font-bold text-slate-600 uppercase">
                  <tr>
                    <th className="p-3.5">Title & Author</th>
                    <th className="p-3.5">Category</th>
                    <th className="p-3.5">Shelf Location</th>
                    <th className="p-3.5">ISBN</th>
                    <th className="p-3.5">Copies</th>
                    <th className="p-3.5 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {books.map((b) => (
                    <tr key={b.id} className="hover:bg-slate-50/50">
                      <td className="p-3.5">
                        <span className="font-bold text-slate-900 block">{b.title}</span>
                        <span className="text-[11px] text-slate-500">{b.author}</span>
                      </td>
                      <td className="p-3.5"><span className="badge badge-slate text-[10px]">{b.category}</span></td>
                      <td className="p-3.5 font-semibold text-slate-700">{b.shelfLocation}</td>
                      <td className="p-3.5 font-mono text-slate-600">{b.isbn}</td>
                      <td className="p-3.5">
                        <span className="font-bold text-slate-900">{b.availableCopies}</span> / {b.totalCopies}
                      </td>
                      <td className="p-3.5 text-right space-x-1">
                        <button
                          onClick={() => openEditBook(b)}
                          className="p-1.5 rounded-lg text-slate-500 hover:text-blue-600 hover:bg-blue-50"
                          title="Edit Book Details"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleDeleteBook(b.id, b.title)}
                          className="p-1.5 rounded-lg text-slate-500 hover:text-red-600 hover:bg-red-50"
                          title="Delete from Library"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Sub-tab 3: Campus Loan Monitoring */}
      {subTab === 'loans' && (
        <div className="space-y-4">
          <h3 className="font-bold text-sm text-slate-900">All University Active & Overdue Loans</h3>
          <div className="lms-card overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 border-b border-slate-100 text-[11px] font-bold text-slate-600 uppercase">
                  <tr>
                    <th className="p-3.5">Student</th>
                    <th className="p-3.5">Book Title</th>
                    <th className="p-3.5">Borrow Date</th>
                    <th className="p-3.5">Due Date</th>
                    <th className="p-3.5">Status</th>
                    <th className="p-3.5">Fine</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {allLoans.map((loan) => (
                    <tr key={loan.id} className="hover:bg-slate-50/50">
                      <td className="p-3.5">
                        <span className="font-bold text-slate-900 block">{loan.user?.fullName}</span>
                        <span className="text-[10px] text-slate-400 font-mono">{loan.user?.email}</span>
                      </td>
                      <td className="p-3.5 font-semibold text-slate-800">{loan.book?.title}</td>
                      <td className="p-3.5 text-slate-600">{new Date(loan.borrowDate).toLocaleDateString()}</td>
                      <td className="p-3.5 text-slate-600 font-semibold">{new Date(loan.dueDate).toLocaleDateString()}</td>
                      <td className="p-3.5">
                        <span className={`badge ${
                          loan.status === 'BORROWED' ? 'badge-blue' : loan.status === 'OVERDUE' ? 'badge-red' : 'badge-green'
                        } text-[10px]`}>
                          {loan.status}
                        </span>
                      </td>
                      <td className="p-3.5 font-bold text-slate-800">
                        {loan.fineAmount > 0 ? `₹${loan.fineAmount} (${loan.finePaid ? 'Paid' : 'Unpaid'})` : '—'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Sub-tab 4: User Directory */}
      {subTab === 'users' && (
        <div className="space-y-4">
          <h3 className="font-bold text-sm text-slate-900">Registered University Members</h3>
          <div className="lms-card overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 border-b border-slate-100 text-[11px] font-bold text-slate-600 uppercase">
                  <tr>
                    <th className="p-3.5">Name</th>
                    <th className="p-3.5">College Email</th>
                    <th className="p-3.5">Role</th>
                    <th className="p-3.5">Roll Number</th>
                    <th className="p-3.5">Reputation</th>
                    <th className="p-3.5">Identity</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {usersList.map((u) => (
                    <tr key={u.id} className="hover:bg-slate-50/50">
                      <td className="p-3.5 font-bold text-slate-900">{u.fullName}</td>
                      <td className="p-3.5 font-mono text-slate-600">{u.email}</td>
                      <td className="p-3.5">
                        <span className={`badge ${u.role === 'ADMIN' ? 'badge-purple' : 'badge-blue'} text-[10px]`}>
                          {u.role}
                        </span>
                      </td>
                      <td className="p-3.5 font-mono text-slate-700">{u.rollNumber || '—'}</td>
                      <td className="p-3.5 font-bold text-slate-800">⭐ {u.reputationScore}</td>
                      <td className="p-3.5">
                        <span className="badge badge-green text-[10px]">Verified Student ✓</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Add / Edit Book Modal */}
      {isBookModalOpen && (
        <div className="modal-backdrop">
          <div className="modal-content p-6 sm:p-8 max-w-lg">
            <h3 className="text-lg font-bold text-slate-900 mb-1">
              {editingBookId ? 'Edit Book Details' : 'Add New Book to Catalog'}
            </h3>
            <p className="text-xs text-slate-500 mb-4">Maintain physical stack inventories and shelf mappings.</p>

            <form onSubmit={handleSaveBook} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Title</label>
                <input
                  type="text"
                  required
                  value={bTitle}
                  onChange={(e) => setBTitle(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Author(s)</label>
                  <input
                    type="text"
                    required
                    value={bAuthor}
                    onChange={(e) => setBAuthor(e.target.value)}
                    className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">ISBN</label>
                  <input
                    type="text"
                    required
                    value={bIsbn}
                    onChange={(e) => setBIsbn(e.target.value)}
                    className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:outline-none font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Category</label>
                  <select
                    value={bCategory}
                    onChange={(e) => setBCategory(e.target.value)}
                    className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:outline-none bg-white font-semibold"
                  >
                    <option value="Computer Science">Computer Science</option>
                    <option value="Software Engineering">Software Engineering</option>
                    <option value="Web Development">Web Development</option>
                    <option value="Systems">Systems</option>
                    <option value="Database">Database</option>
                    <option value="Distributed Systems">Distributed Systems</option>
                    <option value="Artificial Intelligence">Artificial Intelligence</option>
                    <option value="Networking">Networking</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Shelf Location</label>
                  <input
                    type="text"
                    required
                    placeholder="Rack CS-01, 2nd Floor"
                    value={bShelf}
                    onChange={(e) => setBShelf(e.target.value)}
                    className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Total Copies</label>
                  <input
                    type="number"
                    min={1}
                    value={bTotalCopies}
                    onChange={(e) => {
                      setBTotalCopies(e.target.value);
                      if (!editingBookId) setBAvailableCopies(e.target.value);
                    }}
                    className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Available Copies</label>
                  <input
                    type="number"
                    min={0}
                    value={bAvailableCopies}
                    onChange={(e) => setBAvailableCopies(e.target.value)}
                    className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Cover Image URL (Optional)</label>
                <input
                  type="url"
                  placeholder="https://images.unsplash.com/..."
                  value={bCoverUrl}
                  onChange={(e) => setBCoverUrl(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Book Synopsis</label>
                <textarea
                  rows={2}
                  value={bDescription}
                  onChange={(e) => setBDescription(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:outline-none"
                />
              </div>

              <div className="mt-5 pt-3 border-t border-slate-100 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsBookModalOpen(false)}
                  className="btn btn-secondary text-xs"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn btn-primary text-xs"
                >
                  {editingBookId ? 'Update Book' : 'Add Book to Catalog'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Reject Reason Modal (PB-09) */}
      {rejectingPaperId && (
        <div className="modal-backdrop">
          <div className="modal-content p-6 max-w-sm">
            <h3 className="font-bold text-slate-900 text-sm">Reject Question Paper Submission</h3>
            <p className="text-xs text-slate-500 mt-1">
              Please state why this paper is being rejected so the student can rectify it.
            </p>
            <textarea
              rows={3}
              required
              placeholder="e.g. Scanned document is blurry, missing Question 4, or incorrect course code."
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:ring-2 focus:ring-red-500 focus:outline-none mt-3"
            />
            <div className="mt-4 flex gap-2">
              <button onClick={() => setRejectingPaperId(null)} className="btn btn-secondary text-xs w-full">
                Cancel
              </button>
              <button onClick={handleRejectPaper} className="btn btn-danger text-xs w-full">
                Confirm Reject
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
