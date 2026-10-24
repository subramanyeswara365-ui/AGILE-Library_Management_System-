const BASE_URL = '/api';

export async function apiRequest(endpoint, options = {}) {
  const url = `${BASE_URL}${endpoint}`;
  const headers = { ...options.headers };

  if (!(options.body instanceof FormData)) {
    headers['Content-Type'] = 'application/json';
  }

  const response = await fetch(url, {
    ...options,
    headers,
    credentials: 'include', // Sends session cookie
  });

  const isJson = response.headers.get('content-type')?.includes('application/json');
  const data = isJson ? await response.json() : await response.text();

  if (!response.ok) {
    let msg = 'Request failed';
    if (isJson && data?.error) {
      msg = data.error;
    } else if (typeof data === 'string' && data.length > 0) {
      msg = data;
    }
    const error = new Error(msg);
    error.status = response.status;
    error.data = data;
    throw error;
  }

  return data;
}

export const api = {
  // Auth (PB-01, PB-02)
  sendOtp: (email, purpose) => apiRequest('/auth/send-otp', {
    method: 'POST',
    body: JSON.stringify({ email, purpose }),
  }),
  verifyOtp: (email, code, purpose) => apiRequest('/auth/verify-otp', {
    method: 'POST',
    body: JSON.stringify({ email, code, purpose }),
  }),
  login: (email, password) => apiRequest('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  }),
  register: (payload) => apiRequest('/auth/register', {
    method: 'POST',
    body: JSON.stringify(payload),
  }),
  getMe: () => apiRequest('/auth/me'),
  logout: () => apiRequest('/auth/logout', { method: 'POST' }),

  // Books (PB-04, PB-05)
  getBooks: (query = '', category = '', availableOnly = false) => {
    const params = new URLSearchParams();
    if (query) params.append('query', query);
    if (category) params.append('category', category);
    if (availableOnly) params.append('availableOnly', 'true');
    return apiRequest(`/books?${params.toString()}`);
  },
  getBook: (id) => apiRequest(`/books/${id}`),
  createBook: (book) => apiRequest('/books', {
    method: 'POST',
    body: JSON.stringify(book),
  }),
  updateBook: (id, book) => apiRequest(`/books/${id}`, {
    method: 'PUT',
    body: JSON.stringify(book),
  }),
  deleteBook: (id) => apiRequest(`/books/${id}`, { method: 'DELETE' }),

  // Borrow & QR (PB-03, PB-17, PB-18)
  borrowBook: (bookId) => apiRequest(`/borrow/${bookId}`, { method: 'POST' }),
  borrowByQr: (qrContent) => apiRequest('/borrow/qr', {
    method: 'POST',
    body: JSON.stringify({ qrContent }),
  }),
  returnBook: (recordId) => apiRequest(`/borrow/${recordId}/return`, { method: 'POST' }),
  renewBook: (recordId) => apiRequest(`/borrow/${recordId}/renew`, { method: 'POST' }),
  getMyLoans: () => apiRequest('/borrow/my-loans'),
  getAllLoans: () => apiRequest('/borrow/all'),

  // Payments (PB-18)
  payFine: (borrowRecordId, paymentMethod = 'UPI') => apiRequest('/payments/pay-fine', {
    method: 'POST',
    body: JSON.stringify({ borrowRecordId, paymentMethod }),
  }),
  getMyPayments: () => apiRequest('/payments/my-payments'),

  // AI Recommendation (PB-06)
  getAiRecommendations: (query) => apiRequest('/recommendations/query', {
    method: 'POST',
    body: JSON.stringify({ query }),
  }),
  getPersonalizedRecommendations: () => apiRequest('/recommendations/personalized'),

  // Seat Reservation (PB-07)
  getSeats: (date, slot) => {
    const params = new URLSearchParams();
    if (date) params.append('date', date);
    if (slot) params.append('slot', slot);
    return apiRequest(`/seats?${params.toString()}`);
  },
  reserveSeat: (seatNumber, reservedDate, slot) => apiRequest('/seats/reserve', {
    method: 'POST',
    body: JSON.stringify({ seatNumber, reservedDate, slot }),
  }),
  cancelSeat: (reservationId) => apiRequest(`/seats/${reservationId}/cancel`, { method: 'POST' }),
  getMySeats: () => apiRequest('/seats/my-reservations'),

  // Question Papers (PB-08, PB-09, PB-10)
  uploadPaper: (formData) => apiRequest('/papers/upload', {
    method: 'POST',
    body: formData,
  }),
  getApprovedPapers: (courseCode = '', examType = '', year = '') => {
    const params = new URLSearchParams();
    if (courseCode) params.append('courseCode', courseCode);
    if (examType) params.append('examType', examType);
    if (year) params.append('year', year);
    return apiRequest(`/papers?${params.toString()}`);
  },
  getPendingPapers: () => apiRequest('/papers/pending'),
  getMySubmissions: () => apiRequest('/papers/my-submissions'),
  approvePaper: (id) => apiRequest(`/papers/${id}/approve`, { method: 'POST' }),
  rejectPaper: (id, reason) => apiRequest(`/papers/${id}/reject`, {
    method: 'POST',
    body: JSON.stringify({ reason }),
  }),

  // Discussions (PB-11, PB-12, PB-13, PB-14, PB-15)
  getThreads: (category = '') => {
    const params = new URLSearchParams();
    if (category) params.append('category', category);
    return apiRequest(`/discussions?${params.toString()}`);
  },
  getThreadDetails: (id) => apiRequest(`/discussions/${id}`),
  createThread: (payload) => apiRequest('/discussions', {
    method: 'POST',
    body: JSON.stringify(payload),
  }),
  replyToThread: (threadId, payload) => apiRequest(`/discussions/${threadId}/replies`, {
    method: 'POST',
    body: JSON.stringify(payload),
  }),
  upvoteThread: (id) => apiRequest(`/discussions/${id}/upvote`, { method: 'POST' }),
  upvoteReply: (id) => apiRequest(`/discussions/replies/${id}/upvote`, { method: 'POST' }),
  verifyReply: (id) => apiRequest(`/discussions/replies/${id}/verify`, { method: 'POST' }),
  reportThread: (id) => apiRequest(`/discussions/${id}/report`, { method: 'POST' }),
  reportReply: (id) => apiRequest(`/discussions/replies/${id}/report`, { method: 'POST' }),

  // Notifications (PB-16)
  getNotifications: () => apiRequest('/notifications'),
  getUnreadCount: () => apiRequest('/notifications/unread-count'),
  markNotificationRead: (id) => apiRequest(`/notifications/${id}/read`, { method: 'POST' }),
  markAllNotificationsRead: () => apiRequest('/notifications/read-all', { method: 'POST' }),

  // Admin (PB-19, PB-20)
  getAdminStats: () => apiRequest('/admin/stats'),
  getUsers: () => apiRequest('/admin/users'),
};
