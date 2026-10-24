import React, { useState, useEffect } from 'react';
import { FileText, Upload, Download, Search, CheckCircle, Clock, AlertCircle, ShieldCheck, Filter } from 'lucide-react';
import { api } from '../api/client';
import confetti from 'canvas-confetti';

export default function QuestionPaperTab({ user }) {
  const [papers, setPapers] = useState([]);
  const [mySubmissions, setMySubmissions] = useState([]);
  const [courseCode, setCourseCode] = useState('');
  const [examType, setExamType] = useState('ALL');
  const [year, setYear] = useState('');
  const [loading, setLoading] = useState(true);
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [viewTab, setViewTab] = useState('repository'); // 'repository' | 'my-uploads'
  const [actionMsg, setActionMsg] = useState('');

  // Upload form states
  const [uCourseName, setUCourseName] = useState('');
  const [uCourseCode, setUCourseCode] = useState('');
  const [uSemester, setUSemester] = useState('Fall Semester');
  const [uExamType, setUExamType] = useState('FAT');
  const [uYear, setUYear] = useState(2025);
  const [uFacultyName, setUFacultyName] = useState('');
  const [uFile, setUFile] = useState(null);
  const [uploading, setUploading] = useState(false);

  const examTypes = ['ALL', 'CAT-1', 'CAT-2', 'FAT'];

  const fetchApprovedPapers = async () => {
    setLoading(true);
    try {
      const data = await api.getApprovedPapers(courseCode, examType, year);
      setPapers(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchMySubmissions = async () => {
    if (!user) return;
    try {
      const data = await api.getMySubmissions();
      setMySubmissions(data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchApprovedPapers();
    if (user) fetchMySubmissions();
  }, [courseCode, examType, year]);

  const handleUploadSubmit = async (e) => {
    e.preventDefault();
    if (!uFile) {
      setActionMsg('Please attach a question paper document.');
      return;
    }
    setUploading(true);
    setActionMsg('');
    try {
      const formData = new FormData();
      formData.append('courseName', uCourseName);
      formData.append('courseCode', uCourseCode);
      formData.append('semester', uSemester);
      formData.append('examType', uExamType);
      formData.append('academicYear', uYear);
      formData.append('facultyName', uFacultyName);
      formData.append('file', uFile);

      await api.uploadPaper(formData);
      confetti({ particleCount: 70, spread: 60, origin: { y: 0.7 } });
      setActionMsg('Paper uploaded successfully! It has been submitted to the Chief Librarian for verification (PB-09).');
      setIsUploadOpen(false);
      // Reset form
      setUCourseName('');
      setUCourseCode('');
      setUFacultyName('');
      setUFile(null);
      fetchMySubmissions();
      setViewTab('my-uploads');
    } catch (err) {
      setActionMsg(err.message || 'Failed to upload paper');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-blue-100 text-blue-800 text-xs font-bold mb-2">
            <ShieldCheck className="w-3.5 h-3.5 text-blue-600" />
            <span>Academic Resource Repository (PB-08, PB-09, PB-10)</span>
          </div>
          <h2 className="text-2xl font-bold text-slate-900 tracking-tight">
            Previous-Year University Question Papers (PYQ)
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Verified CAT-1, CAT-2, and FAT exam papers reviewed and approved by university library faculty.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {user && (
            <button
              onClick={() => setIsUploadOpen(true)}
              className="btn btn-primary text-xs"
            >
              <Upload className="w-4 h-4" />
              <span>Contribute PYQ Paper</span>
            </button>
          )}
        </div>
      </div>

      {actionMsg && (
        <div className="p-4 rounded-xl text-xs font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200 flex items-center justify-between">
          <span>{actionMsg}</span>
          <button onClick={() => setActionMsg('')} className="underline text-[11px] ml-3">Dismiss</button>
        </div>
      )}

      {/* Downloadable source papers supplied for this project demo */}
      <section className="lms-card p-5 sm:p-6 space-y-4">
        <div className="flex items-start justify-between gap-3">
          <div>
            <div className="text-xs font-bold uppercase tracking-wider text-blue-600">CSE3001 · Agile Development Process</div>
            <h3 className="text-lg font-bold text-slate-900 mt-1">Downloadable Previous-Year Papers & Study Material</h3>
            <p className="text-xs text-slate-500 mt-1">Original PDFs provided for this project are available here for direct download.</p>
          </div>
          <div className="hidden sm:flex w-11 h-11 rounded-xl bg-blue-50 text-blue-600 items-center justify-center"><FileText className="w-5 h-5" /></div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {[
            { name: 'CAT-1 · Fall 2022 · Set 1', file: 'CSE3001_CAT1_Fall_2022_Set1.pdf', detail: 'CSE3001 question paper · 5 pages' },
            { name: 'CAT-1 · Winter 2022 · Sets 2 & 4', file: 'CSE3001_CAT1_Winter_2022_Set2.pdf', detail: 'CSE3001 question paper · 2 pages' },
            { name: 'CAT-2 · Winter 2022', file: 'CSE3001_CAT2_Winter_2022.pdf', detail: 'CSE3001 question paper · 4 pages' },
            { name: 'Agile Project Management Notes', file: 'Agile_Project_Management_Notes.pdf', detail: 'Agile project management study material · 30 pages' },
            { name: 'Agile Tools Study Material', file: 'Agile_Tools_Study_Material.pdf', detail: 'Agile tools study material · 55 pages' },
          ].map((paper) => (
            <div key={paper.file} className="flex items-center gap-3 rounded-xl border border-slate-200 bg-white p-3 hover:border-blue-300 hover:shadow-sm transition-all">
              <div className="w-10 h-10 shrink-0 rounded-lg bg-rose-50 text-rose-600 flex items-center justify-center"><FileText className="w-5 h-5" /></div>
              <div className="min-w-0 flex-1">
                <div className="text-sm font-semibold text-slate-800">{paper.name}</div>
                <div className="text-xs text-slate-500 mt-0.5">{paper.detail}</div>
              </div>
              <a href={`/papers/${paper.file}`} download className="inline-flex shrink-0 items-center gap-1.5 rounded-lg bg-blue-600 px-3 py-2 text-xs font-bold text-white hover:bg-blue-700"><Download className="w-3.5 h-3.5" /> Download</a>
            </div>
          ))}
        </div>
        <p className="text-[11px] text-slate-400">These are the supplied original files. They are provided as course resources and are separate from the librarian-approved upload workflow.</p>
      </section>

      {/* View Switcher: Public Repository vs My Uploads */}
      {user && (
        <div className="flex rounded-xl bg-slate-100 p-1 w-full sm:w-80">
          <button
            onClick={() => setViewTab('repository')}
            className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition-all ${
              viewTab === 'repository' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-900'
            }`}
          >
            Approved Repository ({papers.length})
          </button>
          <button
            onClick={() => { setViewTab('my-uploads'); fetchMySubmissions(); }}
            className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition-all ${
              viewTab === 'my-uploads' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-900'
            }`}
          >
            My Uploads ({mySubmissions.length})
          </button>
        </div>
      )}

      {/* Tab 1: Public Approved Repository (PB-10) */}
      {viewTab === 'repository' && (
        <div className="space-y-4">
          {/* Filters */}
          <div className="lms-card p-4 sm:p-5 flex flex-col sm:flex-row gap-3 items-center justify-between">
            <div className="relative w-full sm:w-80">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
              <input
                type="text"
                placeholder="Search course code e.g. CSE2005..."
                value={courseCode}
                onChange={(e) => setCourseCode(e.target.value)}
                className="w-full pl-9 pr-3 py-2 text-xs border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto">
              <span className="text-xs font-bold text-slate-600">Exam:</span>
              <div className="flex gap-1">
                {examTypes.map((t) => (
                  <button
                    key={t}
                    onClick={() => setExamType(t)}
                    className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all ${
                      examType === t ? 'bg-blue-600 text-white' : 'bg-slate-100 hover:bg-slate-200 text-slate-600'
                    }`}
                  >
                    {t}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Papers Grid */}
          {loading ? (
            <div className="py-16 text-center text-xs text-slate-400">Loading approved question papers...</div>
          ) : papers.length === 0 ? (
            <div className="py-16 text-center lms-card p-6">
              <FileText className="w-10 h-10 text-slate-300 mx-auto mb-2" />
              <h4 className="font-bold text-sm text-slate-800">No question papers found</h4>
              <p className="text-xs text-slate-500 mt-1">Be the first student to upload a verified paper for this course!</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {papers.map((paper) => (
                <div key={paper.id} className="lms-card p-5 flex flex-col justify-between border-l-4 border-l-emerald-500">
                  <div>
                    <div className="flex items-center justify-between gap-2 mb-2">
                      <span className="badge badge-green font-bold flex items-center gap-1">
                        <CheckCircle className="w-3 h-3 text-emerald-600" />
                        <span>Faculty Verified</span>
                      </span>
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-100 text-slate-700 font-mono">
                        {paper.examType} • {paper.academicYear}
                      </span>
                    </div>

                    <h4 className="font-bold text-base text-slate-900">{paper.courseCode} — {paper.courseName}</h4>
                    <p className="text-xs text-slate-500 mt-0.5">{paper.semester} • Faculty: {paper.facultyName || 'Department Faculty'}</p>

                    <div className="mt-3 p-2.5 rounded-xl bg-slate-50 border border-slate-100 text-[11px] text-slate-600 flex items-center justify-between">
                      <span className="truncate max-w-[220px] font-mono">{paper.fileName}</span>
                      <span>Contributed by: <span className="font-semibold text-slate-800">{paper.uploadedBy?.fullName?.split(' ')[0]}</span></span>
                    </div>
                  </div>

                  <div className="mt-4 pt-3 flex items-center justify-end">
                    <a
                      href={`/api/papers/${paper.id}/download`}
                      download={paper.fileName}
                      className="btn btn-primary text-xs py-1.5 px-4"
                    >
                      <Download className="w-3.5 h-3.5" />
                      <span>Download PDF</span>
                    </a>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Tab 2: Student's Own Uploads (PB-08, PB-09) */}
      {viewTab === 'my-uploads' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-sm text-slate-900">Your Question Paper Submissions</h3>
            <span className="text-xs text-slate-500">{mySubmissions.length} uploads tracked</span>
          </div>

          {mySubmissions.length === 0 ? (
            <div className="py-12 text-center lms-card p-6">
              <Upload className="w-10 h-10 text-slate-300 mx-auto mb-2" />
              <h4 className="font-bold text-sm text-slate-800">No uploads yet</h4>
              <p className="text-xs text-slate-500 mt-1">Upload CAT or FAT question papers to earn academic reputation points!</p>
            </div>
          ) : (
            <div className="space-y-3">
              {mySubmissions.map((paper) => {
                const isPending = paper.status === 'PENDING';
                const isApproved = paper.status === 'APPROVED';
                const isRejected = paper.status === 'REJECTED';

                return (
                  <div key={paper.id} className="lms-card p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-bold text-sm text-slate-900">{paper.courseCode} — {paper.courseName}</span>
                        <span className={`badge ${
                          isApproved ? 'badge-green' : isPending ? 'badge-yellow' : 'badge-red'
                        }`}>
                          {isApproved ? 'Approved & Published' : isPending ? 'Pending Librarian Review' : 'Rejected'}
                        </span>
                      </div>
                      <p className="text-xs text-slate-500">
                        {paper.examType} • {paper.semester} {paper.academicYear} • Uploaded on {new Date(paper.createdAt).toLocaleDateString()}
                      </p>
                      {isRejected && paper.rejectionReason && (
                        <p className="text-xs text-red-600 mt-1 font-semibold">
                          Rejection Reason: {paper.rejectionReason}
                        </p>
                      )}
                    </div>

                    {isApproved && (
                      <a
                        href={`/api/papers/${paper.id}/download`}
                        download={paper.fileName}
                        className="btn btn-secondary text-xs py-1.5"
                      >
                        <Download className="w-3.5 h-3.5" />
                        <span>Download</span>
                      </a>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Upload Paper Modal (PB-08) */}
      {isUploadOpen && (
        <div className="modal-backdrop">
          <div className="modal-content p-6 sm:p-8 max-w-lg">
            <div className="text-center mb-5">
              <div className="w-12 h-12 rounded-2xl bg-blue-100 text-blue-600 flex items-center justify-center mx-auto mb-2 shadow-inner">
                <Upload className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold text-slate-900">Upload Previous-Year Paper</h3>
              <p className="text-xs text-slate-500 mt-1">
                Paper will be queued for Chief Librarian review before being published. Approved papers earn +25 Reputation!
              </p>
            </div>

            <form onSubmit={handleUploadSubmit} className="space-y-3.5">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Course Code</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. CSE2005"
                    value={uCourseCode}
                    onChange={(e) => setUCourseCode(e.target.value)}
                    className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none uppercase font-mono"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Exam Type</label>
                  <select
                    value={uExamType}
                    onChange={(e) => setUExamType(e.target.value)}
                    className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none bg-white font-semibold"
                  >
                    <option value="CAT-1">CAT-1 (Continuous Assessment)</option>
                    <option value="CAT-2">CAT-2 (Continuous Assessment)</option>
                    <option value="FAT">FAT (Final Assessment Test)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Course Title</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Operating Systems"
                  value={uCourseName}
                  onChange={(e) => setUCourseName(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Semester</label>
                  <select
                    value={uSemester}
                    onChange={(e) => setUSemester(e.target.value)}
                    className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none bg-white"
                  >
                    <option value="Fall Semester">Fall Semester</option>
                    <option value="Winter Semester">Winter Semester</option>
                    <option value="Summer Semester">Summer Semester</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Academic Year</label>
                  <input
                    type="number"
                    min={2020}
                    max={2030}
                    value={uYear}
                    onChange={(e) => setUYear(e.target.value)}
                    className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Faculty / Instructor Name</label>
                <input
                  type="text"
                  placeholder="e.g. Dr. Rajesh Kumar"
                  value={uFacultyName}
                  onChange={(e) => setUFacultyName(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Paper Document (PDF / DOCX)</label>
                <input
                  type="file"
                  required
                  accept=".pdf,.doc,.docx"
                  onChange={(e) => setUFile(e.target.files[0])}
                  className="w-full text-xs text-slate-500 file:mr-3 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                />
              </div>

              <div className="mt-5 pt-3 border-t border-slate-100 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsUploadOpen(false)}
                  className="btn btn-secondary text-xs"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={uploading}
                  className="btn btn-primary text-xs"
                >
                  {uploading ? 'Submitting...' : 'Submit for Verification'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
