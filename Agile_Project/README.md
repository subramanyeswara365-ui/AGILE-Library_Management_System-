# Smart Academic Library Management System (Smart LMS)

> **Semester-8 Agile Project** • **Frontend:** React JS • **Backend:** Spring Boot 3 (Java 21) • **Database:** MySQL ORM (Hibernate) + Embedded Zero-Config Profile

An end-to-end, enterprise-grade Smart Academic Library Management & Knowledge Sharing System developed for **VIT-AP University**, implementing the complete **20 Product Backlog User Stories (PB-01 to PB-20)** prioritized across a 3-sprint release plan.

---

## 📋 Product Backlog & Feature Traceability Matrix

| ID | Feature / User Story | Acceptance Criteria | Implementation Status | Risk Level |
|---|---|---|---|---|
| **PB-01** | **College Email + OTP Login** | Valid college email sends OTP; valid OTP logs in; invalid/expired OTP is rejected. | ✅ Implemented in `AuthController`, `OtpService`, `AuthModal.jsx` | Critical |
| **PB-02** | **College Email-Based Identity** | Profile linked to official college email, verified identity badge, roll number & dept. | ✅ Implemented in `User`, `ProfileModal.jsx`, `Navbar.jsx` | High |
| **PB-03** | **QR Code Book Borrowing** | Scans QR code, verifies availability/eligibility, and creates borrowing record instantly. | ✅ Implemented in `QrCodeService` (ZXing), `BorrowService`, `QrScannerModal.jsx` | High |
| **PB-04** | **Book Search & Filtering** | Search/filter returns relevant books by title, author, subject, category or ISBN. | ✅ Implemented in `BookController`, `BookRepository`, `CatalogTab.jsx` | High |
| **PB-05** | **Book Availability & Details** | Details show accurate availability, physical shelf location, title, author & category/ISBN. | ✅ Implemented in `Book` entity, `CatalogTab.jsx` (Live shelf tags) | Medium |
| **PB-06** | **AI-Based Book Recommendation** | Student submits natural language query; AI recommends relevant books available in library with rationale. | ✅ Implemented in `RecommendationService`, `AiRecommendationTab.jsx` | High |
| **PB-07** | **Real-Time Reading Room Seat Reservation** | Available seats displayed in visual floor grid; double-booking prevented atomically. | ✅ Implemented in `SeatReservation`, `SeatService`, `SeatReservationTab.jsx` | High |
| **PB-08** | **PYQ Question Paper Upload** | Student uploads exam papers with course details (CAT-1, CAT-2, FAT); enters pending queue. | ✅ Implemented in `PaperSubmission`, `PaperController`, `QuestionPaperTab.jsx` | Medium |
| **PB-09** | **Librarian Document Verification** | Librarian reviews, approves or rejects uploaded papers; only approved become public. | ✅ Implemented in `PaperSubmissionService`, `AdminPortalTab.jsx` (Queue) | High |
| **PB-10** | **Academic Resource Repository** | Students search/download approved papers, PPTs and notes; pending/rejected stay hidden. | ✅ Implemented in `PaperController`, `QuestionPaperTab.jsx` | Medium |
| **PB-11** | **Academic Discussion Platform** | Students create academic posts, reply, and report inappropriate content. | ✅ Implemented in `DiscussionThread`, `DiscussionService`, `DiscussionForumTab.jsx` | High |
| **PB-12** | **Senior-Junior Knowledge Sharing** | Junior students interact with senior students (4th year badges) for academic guidance. | ✅ Implemented in `User.studentType`, Senior Badges in Forum | Medium |
| **PB-13** | **Academic File & PPT Sharing** | Supported academic files and lecture PPT links shared within posts and replies. | ✅ Implemented in `DiscussionThread.attachmentUrl`, `DiscussionReply` | Medium |
| **PB-14** | **Answer Rating / Helpful Votes** | Students mark answers helpful; live count updates and boosts reputation score. | ✅ Implemented in `Upvote`, `DiscussionService.upvoteReply` | Low |
| **PB-15** | **Verified Academic Information** | Faculty/Librarian approved guidance displays a clear verified shield label. | ✅ Implemented in `DiscussionReply.isFacultyVerified`, `ShieldCheck` badge | High |
| **PB-16** | **Library Notifications & Reminders**| Notifications generated for due dates, seat confirmations, approvals, and replies. | ✅ Implemented in `NotificationService`, Interactive Bell Dropdown | Medium |
| **PB-17** | **Book Return & Renewal** | Return updates record; renewal (+14 days) works only when rules permit (not overdue). | ✅ Implemented in `BorrowService.returnBook` / `renewBook`, `MyLoansTab.jsx` | High |
| **PB-18** | **Fine & Borrowing History** | History, due dates, returns and applicable fines (₹5/day) display; simulated online payment receipt. | ✅ Implemented in `FineService`, `PaymentService`, `MyLoansTab.jsx` | Medium |
| **PB-19** | **Librarian/Admin Dashboard** | Centralized dashboard: manage books, students, loans, resources, and moderation. | ✅ Implemented in `AdminController`, `AdminPortalTab.jsx` | High |
| **PB-20** | **Security, Access Control & Data Protection** | Role permissions enforced (`STUDENT`, `LIBRARIAN`, `ADMIN`); BCrypt encryption. | ✅ Implemented in `CurrentUser`, `BCryptPasswordEncoder`, Protected endpoints | Critical |

---

## 🏗️ Architecture & Technology Stack

```
                          ┌────────────────────────────────┐
                          │     React JS Frontend          │
                          │ (Vite, Tailwind, Lucide Icons) │
                          └───────────────┬────────────────┘
                                          │ REST API / JSON
                                          ▼
                          ┌────────────────────────────────┐
                          │    Spring Boot 3 Backend       │
                          │   (Java 21 LTS, Spring Data)   │
                          ├────────────────────────────────┤
                          │  • AuthService & OtpService    │
                          │  • QrCodeService (ZXing)       │
                          │  • RecommendationService (AI)  │
                          │  • SeatService & BorrowService │
                          │  • PaperSubmissionService      │
                          │  • DiscussionService           │
                          └───────────────┬────────────────┘
                                          │ ORM (Hibernate)
                                          ▼
                      ┌────────────────────────────────────────┐
                      │          Database Layer                │
                      │  • MySQL Server (Production)           │
                      │  • H2 Embedded Profile (Zero-Config)   │
                      └────────────────────────────────────────┘
```

---

## ⚡ Quick Start & Execution

### Pre-requisites
- **Java 21 LTS**
- **Node.js 18+** & **npm**
- **MySQL 8.0** *(Optional — system automatically includes an embedded zero-config profile!)*

---

### Option 1: Run Backend (Spring Boot)

#### A. Standard MySQL Mode:
1. Ensure MySQL is running on `localhost:3306` with username `root` and password `root` (or edit `backend/src/main/resources/application.properties`).
2. Run:
```bash
cd backend
.\mvnw.cmd spring-boot:run
```

#### B. Zero-Config Standalone Mode (No external MySQL required):
```bash
cd backend
.\mvnw.cmd spring-boot:run -Dspring-boot.run.profiles=h2
```
*Backend runs on `http://localhost:8080`.*

---

### Option 2: Run Frontend (React JS + Vite)

In a separate terminal:
```bash
cd frontend
npm run dev
```
*Frontend runs on `http://localhost:5173` with instant Hot-Module-Replacement and automatic API proxying to backend!*

---

### Option 3: Run Standalone Packaged JAR
The React frontend is already pre-built and bundled inside the Spring Boot JAR:
```bash
cd backend
java -jar target/smart-lms.jar --spring.profiles.active=h2
```
*Open `http://localhost:8080` in your browser to use the full application!*

---

## 🔑 Pre-Seeded Evaluation Accounts

The database comes pre-seeded out of the box with ready-to-test accounts:

| Role | Email | Password | Details |
|---|---|---|---|
| **Student (Junior)** | `student@vitapstudent.ac.in` | `student123` | 2nd Year CSE, active loans, seat reservations |
| **Student (Senior)** | `senior@vitapstudent.ac.in` | `student123` | 4th Year CSE, contributor badge, forum mentor |
| **Chief Librarian / Admin** | `admin@vitap.ac.in` | `admin123` | Full administrative control, document verification |

*You can also log in via OTP: click **Send OTP** on the login screen — the 6-digit dev OTP is displayed and can be auto-filled with 1 click!*

---

## 📁 Repository Directory Structure

```
Agile_Project/
├── backend/
│   ├── src/main/java/com/lms/
│   │   ├── config/            # DataSeeder (pre-seeds demo catalog & users)
│   │   ├── controller/        # REST Controllers (Auth, Books, Borrow, Seats, Papers, Discussions)
│   │   ├── dto/               # Data Transfer Objects & Payloads
│   │   ├── entity/            # JPA Hibernate Entities (Book, User, SeatReservation, etc.)
│   │   ├── repository/        # Spring Data JPA Repositories
│   │   ├── service/           # Core Business Logic & AI Recommendation Engine
│   │   └── web/               # CurrentUser, SessionKeys, GlobalExceptionHandler, WebConfig
│   ├── src/main/resources/
│   │   ├── application.properties    # MySQL ORM Database Configuration
│   │   ├── application-h2.properties # Zero-config embedded profile
│   │   └── static/                   # Pre-built React production bundle
│   └── pom.xml
│
├── frontend/
│   ├── src/
│   │   ├── api/client.js      # Centralized HTTP API client with session management
│   │   ├── components/        # Feature components:
│   │   │   ├── Navbar.jsx            # Brand, notifications, profile badge
│   │   │   ├── AuthModal.jsx         # PB-01, PB-02 (College email + OTP login)
│   │   │   ├── CatalogTab.jsx        # PB-04, PB-05 (Search, filters, shelf tags)
│   │   │   ├── QrScannerModal.jsx    # PB-03 (QR book borrowing scanner)
│   │   │   ├── AiRecommendationTab.jsx # PB-06 (Catalog-grounded AI advisor)
│   │   │   ├── SeatReservationTab.jsx  # PB-07 (Visual 24-seat reading room grid)
│   │   │   ├── QuestionPaperTab.jsx   # PB-08, PB-10 (PYQ upload & repository)
│   │   │   ├── DiscussionForumTab.jsx # PB-11 to PB-15 (Q&A, upvotes, faculty verify)
│   │   │   ├── MyLoansTab.jsx         # PB-17, PB-18 (Return, renew, fine receipts)
│   │   │   ├── AdminPortalTab.jsx     # PB-09, PB-19, PB-20 (Librarian queue & CRUD)
│   │   │   └── ProfileModal.jsx       # PB-02 (Verified official academic ID)
│   │   ├── App.jsx            # Root application state & navigation
│   │   ├── main.jsx           # React DOM mounting
│   │   └── index.css          # Design system & responsive styles
│   ├── package.json
│   └── vite.config.js
└── README.md
```


## Local demo account (updated)

- Student email: `subramnayeswara.23mic7024@vitapstudent.ac.in`
- Password: `student123`
- Fixed demo OTP: `246810`
- Year of study: 4th year (Senior)

The fixed OTP is a local demonstration convenience only and must not be used in a production deployment. Use the H2 profile for a clean local demo database. The Question Papers tab also includes the original CSE3001 papers and Agile study PDFs supplied with the project.
