import React, { useState, useEffect } from 'react';
import {
  MessageSquare, ThumbsUp, ShieldCheck, Flag, Plus, Send,
  Paperclip, Tag, CheckCircle2, User, Sparkles, AlertCircle
} from 'lucide-react';
import { api } from '../api/client';
import confetti from 'canvas-confetti';

export default function DiscussionForumTab({ user }) {
  const [threads, setThreads] = useState([]);
  const [selectedThread, setSelectedThread] = useState(null);
  const [replies, setReplies] = useState([]);
  const [category, setCategory] = useState('ALL');
  const [loading, setLoading] = useState(true);
  const [isNewThreadOpen, setIsNewThreadOpen] = useState(false);
  const [actionMsg, setActionMsg] = useState('');

  // New thread form
  const [newTitle, setNewTitle] = useState('');
  const [newBody, setNewBody] = useState('');
  const [newCategory, setNewCategory] = useState('Course Help');
  const [newTags, setNewTags] = useState('');
  const [newAttachment, setNewAttachment] = useState('');

  // Reply form
  const [replyBody, setReplyBody] = useState('');
  const [replyAttachment, setReplyAttachment] = useState('');
  const [submittingReply, setSubmittingReply] = useState(false);

  const categories = ['ALL', 'Course Help', 'Placement Prep', 'Senior Guidance', 'Exam Review', 'General'];

  const fetchThreads = async () => {
    setLoading(true);
    try {
      const data = await api.getThreads(category);
      setThreads(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchThreadDetails = async (id) => {
    try {
      const data = await api.getThreadDetails(id);
      setSelectedThread(data.thread);
      setReplies(data.replies);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchThreads();
  }, [category]);

  const handleCreateThread = async (e) => {
    e.preventDefault();
    if (!user) {
      setActionMsg('Please log in with your college account to start a discussion.');
      return;
    }
    try {
      await api.createThread({
        title: newTitle,
        body: newBody,
        category: newCategory,
        tags: newTags,
        attachmentUrl: newAttachment || null,
      });
      confetti({ particleCount: 60, spread: 50, origin: { y: 0.7 } });
      setActionMsg('Discussion thread created successfully (+5 Reputation points)!');
      setIsNewThreadOpen(false);
      setNewTitle('');
      setNewBody('');
      setNewTags('');
      setNewAttachment('');
      fetchThreads();
    } catch (err) {
      setActionMsg(err.message || 'Failed to create thread');
    }
  };

  const handlePostReply = async (e) => {
    e.preventDefault();
    if (!user) {
      setActionMsg('Please log in to participate in academic discussions.');
      return;
    }
    if (!replyBody.trim()) return;
    setSubmittingReply(true);
    try {
      await api.replyToThread(selectedThread.id, {
        body: replyBody,
        attachmentUrl: replyAttachment || null,
      });
      setReplyBody('');
      setReplyAttachment('');
      fetchThreadDetails(selectedThread.id);
      setActionMsg('Reply posted (+10 Reputation points)!');
    } catch (err) {
      setActionMsg(err.message || 'Failed to post reply');
    } finally {
      setSubmittingReply(false);
    }
  };

  const handleUpvoteThread = async (threadId) => {
    if (!user) {
      setActionMsg('Please log in to vote.');
      return;
    }
    try {
      await api.upvoteThread(threadId);
      if (selectedThread && selectedThread.id === threadId) {
        fetchThreadDetails(threadId);
      }
      fetchThreads();
    } catch (err) {
      console.error(err);
    }
  };

  const handleUpvoteReply = async (replyId) => {
    if (!user) {
      setActionMsg('Please log in to mark helpful.');
      return;
    }
    try {
      await api.upvoteReply(replyId);
      fetchThreadDetails(selectedThread.id);
    } catch (err) {
      console.error(err);
    }
  };

  const handleVerifyReply = async (replyId) => {
    try {
      await api.verifyReply(replyId);
      fetchThreadDetails(selectedThread.id);
      setActionMsg('Answer marked as Faculty Verified Academic Information! (PB-15)');
    } catch (err) {
      setActionMsg(err.message || 'Verification failed');
    }
  };

  const handleReport = async (type, id) => {
    if (!window.confirm('Report this content to the academic moderator?')) return;
    try {
      if (type === 'thread') {
        await api.reportThread(id);
      } else {
        await api.reportReply(id);
      }
      setActionMsg('Content flagged for moderator review. Thank you for keeping the portal safe.');
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-purple-100 text-purple-800 text-xs font-bold mb-2">
            <Sparkles className="w-3.5 h-3.5 text-purple-600" />
            <span>Senior-Junior Peer Guidance Forum (PB-11, 12, 13, 14, 15)</span>
          </div>
          <h2 className="text-2xl font-bold text-slate-900 tracking-tight">
            Academic Discussion & Knowledge Sharing Platform
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Ask course queries, get verified guidance from senior students and faculty, share PPTs and study notes.
          </p>
        </div>

        <div>
          {user && (
            <button
              onClick={() => setIsNewThreadOpen(true)}
              className="btn btn-primary text-xs"
            >
              <Plus className="w-4 h-4" />
              <span>Ask Academic Question</span>
            </button>
          )}
        </div>
      </div>

      {actionMsg && (
        <div className="p-3.5 rounded-xl text-xs font-semibold bg-blue-50 text-blue-900 border border-blue-200 flex items-center justify-between">
          <span>{actionMsg}</span>
          <button onClick={() => setActionMsg('')} className="underline text-[11px] ml-3">Dismiss</button>
        </div>
      )}

      {/* Category Pills */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => { setCategory(cat); setSelectedThread(null); }}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
              category === cat
                ? 'bg-purple-600 text-white shadow-sm'
                : 'bg-slate-100 hover:bg-slate-200 text-slate-600'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Main Forum Body: Threads List or Thread Detail View */}
      {selectedThread ? (
        /* Thread Detail View */
        <div className="space-y-4">
          <button
            onClick={() => setSelectedThread(null)}
            className="text-xs font-bold text-purple-600 hover:text-purple-700 flex items-center gap-1"
          >
            ← Back to Discussions
          </button>

          {/* Original Question Card */}
          <div className="lms-card p-6 space-y-4 border-l-4 border-l-purple-600">
            <div className="flex items-start justify-between gap-4">
              <div>
                <span className="badge badge-purple text-[10px] mb-2">{selectedThread.category}</span>
                <h3 className="text-lg font-bold text-slate-900">{selectedThread.title}</h3>
                <div className="flex items-center gap-2 mt-2 text-xs text-slate-500">
                  <span className="font-semibold text-slate-800">{selectedThread.author?.fullName}</span>
                  {/* Senior / Junior Badge (PB-12) */}
                  <span className={`badge ${
                    selectedThread.author?.yearOfStudy >= 3 ? 'badge-blue' : 'badge-slate'
                  } text-[10px]`}>
                    {selectedThread.author?.studentType || 'Student'}
                  </span>
                  <span>• {new Date(selectedThread.createdAt).toLocaleDateString()}</span>
                </div>
              </div>

              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => handleUpvoteThread(selectedThread.id)}
                  className="btn btn-secondary text-xs py-1 px-3 flex items-center gap-1 hover:border-purple-300"
                >
                  <ThumbsUp className="w-3.5 h-3.5 text-purple-600" />
                  <span>{selectedThread.upvotes} Helpful</span>
                </button>
                <button
                  onClick={() => handleReport('thread', selectedThread.id)}
                  className="p-1.5 text-slate-300 hover:text-red-500 rounded-lg"
                  title="Report inappropriate content (PB-11)"
                >
                  <Flag className="w-4 h-4" />
                </button>
              </div>
            </div>

            <p className="text-xs sm:text-sm text-slate-700 leading-relaxed whitespace-pre-wrap">
              {selectedThread.body}
            </p>

            {/* Tags & Attachment */}
            <div className="flex flex-wrap items-center gap-2 pt-3 border-t border-slate-100">
              {selectedThread.tags && selectedThread.tags.split(',').map((t, idx) => (
                <span key={idx} className="badge badge-slate text-[10px]">
                  #{t.trim()}
                </span>
              ))}
              {selectedThread.attachmentUrl && (
                <a
                  href={selectedThread.attachmentUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1 text-[11px] text-blue-600 font-semibold bg-blue-50 px-2.5 py-1 rounded-lg"
                >
                  <Paperclip className="w-3 h-3" />
                  <span>Shared Attachment / Notes</span>
                </a>
              )}
            </div>
          </div>

          {/* Answers & Replies List (PB-11, PB-14, PB-15) */}
          <div className="space-y-3 pt-2">
            <h4 className="font-bold text-sm text-slate-800">
              {replies.length} Academic Responses & Guidance
            </h4>

            {replies.length === 0 ? (
              <div className="p-8 text-center lms-card text-xs text-slate-400">
                No answers posted yet. Senior students and faculty are notified.
              </div>
            ) : (
              replies.map((reply) => {
                const isAuthorSenior = reply.author?.yearOfStudy >= 3;
                return (
                  <div
                    key={reply.id}
                    className={`lms-card p-4 sm:p-5 space-y-3 ${
                      reply.facultyVerified ? 'border-2 border-emerald-400 bg-emerald-50/20' : ''
                    }`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-full bg-purple-600 text-white font-bold text-xs flex items-center justify-center">
                          {reply.author?.fullName.charAt(0)}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-xs text-slate-900">{reply.author?.fullName}</span>
                            {/* Senior / Junior Badge (PB-12) */}
                            <span className={`badge ${isAuthorSenior ? 'badge-blue' : 'badge-slate'} text-[9px]`}>
                              🎓 {reply.author?.studentType || 'Student'}
                            </span>
                            <span className="text-[10px] text-slate-400">⭐ {reply.author?.reputationScore} Rep</span>
                          </div>
                          <span className="text-[10px] text-slate-400">{new Date(reply.createdAt).toLocaleDateString()}</span>
                        </div>
                      </div>

                      {/* Official Faculty Verification Badge (PB-15) */}
                      {reply.facultyVerified ? (
                        <span className="badge badge-green text-[10px] font-bold flex items-center gap-1 shadow-sm">
                          <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                          <span>Official Faculty Verified</span>
                        </span>
                      ) : (
                        user && (user.role === 'ADMIN' || user.role === 'LIBRARIAN') && (
                          <button
                            onClick={() => handleVerifyReply(reply.id)}
                            className="btn btn-secondary text-[11px] py-1 px-2 border-emerald-400 text-emerald-700 hover:bg-emerald-50"
                            title="Verify as faculty approved academic guidance"
                          >
                            <ShieldCheck className="w-3.5 h-3.5" />
                            <span>Mark Faculty Verified</span>
                          </button>
                        )
                      )}
                    </div>

                    <p className="text-xs sm:text-sm text-slate-700 leading-relaxed whitespace-pre-wrap">
                      {reply.body}
                    </p>

                    {/* Shared Attachment (PB-13) */}
                    {reply.attachmentUrl && (
                      <div className="pt-2">
                        <a
                          href={reply.attachmentUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center gap-1 text-[11px] text-blue-600 font-semibold bg-blue-50 px-2.5 py-1 rounded-lg"
                        >
                          <Paperclip className="w-3 h-3" />
                          <span>Download Shared PPT / Notes</span>
                        </a>
                      </div>
                    )}

                    {/* Reply Upvote / Rating Action (PB-14) */}
                    <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-xs">
                      <button
                        onClick={() => handleUpvoteReply(reply.id)}
                        className="flex items-center gap-1.5 text-slate-600 hover:text-purple-600 font-semibold transition-colors"
                      >
                        <ThumbsUp className="w-3.5 h-3.5 text-purple-600" />
                        <span>{reply.upvotes} Marked Helpful</span>
                      </button>

                      <button
                        onClick={() => handleReport('reply', reply.id)}
                        className="text-slate-300 hover:text-red-500"
                        title="Report inappropriate content (PB-11)"
                      >
                        <Flag className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                );
              })
            )}

            {/* Post Reply Box */}
            {user ? (
              <form onSubmit={handlePostReply} className="lms-card p-4 sm:p-5 space-y-3">
                <h5 className="font-bold text-xs text-slate-700">Write an Academic Guidance Reply</h5>
                <textarea
                  rows={3}
                  required
                  placeholder="Share your academic explanation, textbook chapter reference, or problem solution..."
                  value={replyBody}
                  onChange={(e) => setReplyBody(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:outline-none"
                />
                <div className="flex flex-col sm:flex-row items-center justify-between gap-2">
                  <div className="relative w-full sm:w-80">
                    <Paperclip className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
                    <input
                      type="url"
                      placeholder="Optional link to PPT / Study Notes URL..."
                      value={replyAttachment}
                      onChange={(e) => setReplyAttachment(e.target.value)}
                      className="w-full pl-8 pr-3 py-1.5 text-[11px] border border-slate-200 rounded-lg focus:outline-none"
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={submittingReply}
                    className="btn btn-primary text-xs py-2 px-5 bg-purple-600 hover:bg-purple-700 w-full sm:w-auto"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>{submittingReply ? 'Posting...' : 'Post Reply (+10 Rep)'}</span>
                  </button>
                </div>
              </form>
            ) : (
              <div className="p-4 rounded-xl bg-slate-100 text-center text-xs text-slate-500 font-semibold">
                Please log in with your college credentials to participate in this discussion.
              </div>
            )}
          </div>
        </div>
      ) : (
        /* Threads List View */
        <div className="space-y-3">
          {loading ? (
            <div className="py-16 text-center text-xs text-slate-400">Loading forum threads...</div>
          ) : threads.length === 0 ? (
            <div className="py-16 text-center lms-card p-6">
              <MessageSquare className="w-10 h-10 text-slate-300 mx-auto mb-2" />
              <h4 className="font-bold text-sm text-slate-800">No discussions in this category</h4>
              <p className="text-xs text-slate-500 mt-1">Be the first student to post an academic question!</p>
            </div>
          ) : (
            threads.map((thread) => {
              const isAuthorSenior = thread.author?.yearOfStudy >= 3;
              return (
                <div
                  key={thread.id}
                  onClick={() => fetchThreadDetails(thread.id)}
                  className="lms-card p-4 sm:p-5 cursor-pointer hover:border-purple-300 transition-all flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 group"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="badge badge-purple text-[10px]">{thread.category}</span>
                      <span className="text-[11px] font-semibold text-slate-500">
                        By {thread.author?.fullName}
                      </span>
                      {/* Senior / Junior Badge (PB-12) */}
                      <span className={`badge ${isAuthorSenior ? 'badge-blue' : 'badge-slate'} text-[9px]`}>
                        🎓 {thread.author?.studentType || 'Student'}
                      </span>
                    </div>

                    <h4 className="font-bold text-sm text-slate-900 group-hover:text-purple-600 transition-colors">
                      {thread.title}
                    </h4>

                    <p className="text-xs text-slate-500 line-clamp-2 mt-1">
                      {thread.body}
                    </p>

                    <div className="flex items-center gap-2 mt-2 text-[11px] text-slate-400">
                      <span>{new Date(thread.createdAt).toLocaleDateString()}</span>
                      {thread.tags && <span>• Tags: {thread.tags}</span>}
                    </div>
                  </div>

                  <div className="flex sm:flex-col items-center gap-2 sm:gap-1 text-xs shrink-0 self-end sm:self-center">
                    <span className="flex items-center gap-1 font-bold text-purple-700 bg-purple-50 px-2.5 py-1 rounded-lg">
                      <ThumbsUp className="w-3.5 h-3.5" />
                      <span>{thread.upvotes}</span>
                    </span>
                    <span className="text-[11px] text-slate-400">Click to view</span>
                  </div>
                </div>
              );
            })
          )}
        </div>
      )}

      {/* New Question Modal (PB-11, PB-13) */}
      {isNewThreadOpen && (
        <div className="modal-backdrop">
          <div className="modal-content p-6 sm:p-8 max-w-lg">
            <h3 className="text-lg font-bold text-slate-900 mb-1">Ask an Academic Question</h3>
            <p className="text-xs text-slate-500 mb-4">
              Get peer guidance from seniors and library reference materials. Keep discussions academic and courteous.
            </p>

            <form onSubmit={handleCreateThread} className="space-y-3.5">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Category</label>
                <select
                  value={newCategory}
                  onChange={(e) => setNewCategory(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:outline-none bg-white font-semibold"
                >
                  <option value="Course Help">Course Help</option>
                  <option value="Placement Prep">Placement Prep</option>
                  <option value="Senior Guidance">Senior Guidance</option>
                  <option value="Exam Review">Exam Review</option>
                  <option value="General">General</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Question Title</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. How to solve Page Replacement LRU numericals in OS?"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Detailed Description</label>
                <textarea
                  rows={4}
                  required
                  placeholder="Provide context, formulas, code snippets, or specific doubts..."
                  value={newBody}
                  onChange={(e) => setNewBody(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Subject Tags (comma-separated)</label>
                <input
                  type="text"
                  placeholder="e.g. OperatingSystems, Paging, CAT2"
                  value={newTags}
                  onChange={(e) => setNewTags(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Shared Study Material URL / PPT (Optional)</label>
                <input
                  type="url"
                  placeholder="https://drive.google.com/... or lecture notes link"
                  value={newAttachment}
                  onChange={(e) => setNewAttachment(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:outline-none"
                />
              </div>

              <div className="mt-5 pt-3 border-t border-slate-100 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsNewThreadOpen(false)}
                  className="btn btn-secondary text-xs"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn btn-primary text-xs bg-purple-600 hover:bg-purple-700"
                >
                  Publish Question (+5 Rep)
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
