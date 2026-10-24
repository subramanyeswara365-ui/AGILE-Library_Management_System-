package com.lms.config;

import com.lms.entity.*;
import com.lms.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Component;

import java.nio.charset.StandardCharsets;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

@Component
@RequiredArgsConstructor
public class DataSeeder implements CommandLineRunner {

    private final UserRepository userRepository;
    private final BookRepository bookRepository;
    private final BorrowRecordRepository borrowRecordRepository;
    private final SeatReservationRepository seatReservationRepository;
    private final PaperSubmissionRepository paperRepository;
    private final DiscussionThreadRepository threadRepository;
    private final DiscussionReplyRepository replyRepository;
    private final NotificationRepository notificationRepository;

    private final BCryptPasswordEncoder passwordEncoder = new BCryptPasswordEncoder();

    @Override
    public void run(String... args) {
        if (userRepository.count() > 0) {
            return; // Data already seeded
        }

        System.out.println(">> [DATA SEEDER] Seeding initial LMS data for Agile evaluation...");

        // 1. Users
        User admin = User.builder()
                .fullName("Dr. K. Srinivas (Chief Librarian)")
                .email("admin@vitap.ac.in")
                .password(passwordEncoder.encode("admin123"))
                .role(Role.ADMIN)
                .department("Central Library & Information Services")
                .rollNumber("EMP-LIB-102")
                .yearOfStudy(null)
                .studentType("Chief Librarian")
                .emailVerified(true)
                .reputationScore(500)
                .build();
        userRepository.save(admin);

        User senior = User.builder()
                .fullName("Aarav Sharma")
                .email("senior@vitapstudent.ac.in")
                .password(passwordEncoder.encode("student123"))
                .role(Role.STUDENT)
                .department("Computer Science & Engineering")
                .rollNumber("21BCE7821")
                .yearOfStudy(4)
                .studentType("Senior (4th Year)")
                .emailVerified(true)
                .reputationScore(280)
                .build();
        userRepository.save(senior);

        User student = User.builder()
                .fullName("Subramanyeswara Rao")
                .email("subramnayeswara.23mic7024@vitapstudent.ac.in")
                .password(passwordEncoder.encode("student123"))
                .role(Role.STUDENT)
                .department("Computer Science & Engineering")
                .rollNumber("23MIC7024")
                .yearOfStudy(4)
                .studentType("Senior (4th Year)")
                .emailVerified(true)
                .reputationScore(120)
                .build();
        userRepository.save(student);

        // 2. Books
        List<Book> books = List.of(
                Book.builder()
                        .title("Introduction to Algorithms (CLRS)")
                        .author("Thomas H. Cormen, Charles E. Leiserson")
                        .isbn("978-0262033848")
                        .category("Computer Science")
                        .shelfLocation("Rack CS-01, 2nd Floor")
                        .totalCopies(8)
                        .availableCopies(6)
                        .publisher("MIT Press")
                        .publishedYear(2022)
                        .description("Comprehensive guide to algorithms, dynamic programming, graph algorithms, and complexity theory.")
                        .coverImageUrl("https://images.unsplash.com/photo-1532012164546-f432f2e3edd4?w=400&auto=format&fit=crop&q=80")
                        .build(),

                Book.builder()
                        .title("Clean Code: A Handbook of Agile Software Craftsmanship")
                        .author("Robert C. Martin")
                        .isbn("978-0132350884")
                        .category("Software Engineering")
                        .shelfLocation("Rack SE-04, 2nd Floor")
                        .totalCopies(6)
                        .availableCopies(4)
                        .publisher("Prentice Hall")
                        .publishedYear(2008)
                        .description("Even bad code can function. But if code isn't clean, it can bring a development organization to its knees.")
                        .coverImageUrl("https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=400&auto=format&fit=crop&q=80")
                        .build(),

                Book.builder()
                        .title("Spring Boot in Action")
                        .author("Craig Walls")
                        .isbn("978-1617292545")
                        .category("Web Development")
                        .shelfLocation("Rack WEB-02, 3rd Floor")
                        .totalCopies(5)
                        .availableCopies(3)
                        .publisher("Manning Publications")
                        .publishedYear(2016)
                        .description("Hands-on guide to building production-ready microservices and REST APIs with Spring Boot and Spring Data.")
                        .coverImageUrl("https://images.unsplash.com/photo-1512820790803-83ca734da794?w=400&auto=format&fit=crop&q=80")
                        .build(),

                Book.builder()
                        .title("Operating System Concepts (Dinosaur Book)")
                        .author("Abraham Silberschatz, Peter B. Galvin")
                        .isbn("978-1119800361")
                        .category("Systems")
                        .shelfLocation("Rack SYS-03, 2nd Floor")
                        .totalCopies(7)
                        .availableCopies(5)
                        .publisher("Wiley")
                        .publishedYear(2021)
                        .description("Covers processes, thread synchronization, CPU scheduling, virtual memory, file systems, and security.")
                        .coverImageUrl("https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=400&auto=format&fit=crop&q=80")
                        .build(),

                Book.builder()
                        .title("Database System Concepts")
                        .author("Abraham Silberschatz, Henry F. Korth")
                        .isbn("978-0078022159")
                        .category("Database")
                        .shelfLocation("Rack DB-01, 2nd Floor")
                        .totalCopies(6)
                        .availableCopies(4)
                        .publisher("McGraw Hill")
                        .publishedYear(2019)
                        .description("Relational database model, SQL, transactions, indexing, concurrency control, and distributed databases.")
                        .coverImageUrl("https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=400&auto=format&fit=crop&q=80")
                        .build(),

                Book.builder()
                        .title("Designing Data-Intensive Applications")
                        .author("Martin Kleppmann")
                        .isbn("978-1449373320")
                        .category("Distributed Systems")
                        .shelfLocation("Rack DS-05, 3rd Floor")
                        .totalCopies(4)
                        .availableCopies(2)
                        .publisher("O'Reilly Media")
                        .publishedYear(2017)
                        .description("The definitive book on distributed systems, replication, partitioning, stream processing, and consensus.")
                        .coverImageUrl("https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=400&auto=format&fit=crop&q=80")
                        .build(),

                Book.builder()
                        .title("Artificial Intelligence: A Modern Approach")
                        .author("Stuart Russell, Peter Norvig")
                        .isbn("978-0134610993")
                        .category("Artificial Intelligence")
                        .shelfLocation("Rack AI-01, 3rd Floor")
                        .totalCopies(5)
                        .availableCopies(5)
                        .publisher("Pearson")
                        .publishedYear(2020)
                        .description("Foundational textbook on intelligent agents, state search, probabilistic reasoning, machine learning, and NLP.")
                        .coverImageUrl("https://images.unsplash.com/photo-1620712943543-bcc4688e7485?w=400&auto=format&fit=crop&q=80")
                        .build(),

                Book.builder()
                        .title("Computer Networking: A Top-Down Approach")
                        .author("James Kurose, Keith Ross")
                        .isbn("978-0136681557")
                        .category("Networking")
                        .shelfLocation("Rack NET-02, 2nd Floor")
                        .totalCopies(6)
                        .availableCopies(5)
                        .publisher("Pearson")
                        .publishedYear(2021)
                        .description("Comprehensive guide to the Internet architecture, TCP/IP, socket programming, HTTP/3, and network security.")
                        .coverImageUrl("https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=400&auto=format&fit=crop&q=80")
                        .build()
        );
        bookRepository.saveAll(books);

        // 3. Sample Borrow Record for Student (1 active, 1 returned overdue with fine)
        BorrowRecord activeBorrow = BorrowRecord.builder()
                .user(student)
                .book(books.get(0)) // CLRS
                .borrowDate(LocalDateTime.now().minusDays(5))
                .dueDate(LocalDateTime.now().plusDays(9))
                .status(BorrowStatus.BORROWED)
                .renewalCount(0)
                .fineAmount(0.0)
                .finePaid(false)
                .build();
        borrowRecordRepository.save(activeBorrow);

        BorrowRecord overdueRecord = BorrowRecord.builder()
                .user(student)
                .book(books.get(2)) // Spring Boot in Action
                .borrowDate(LocalDateTime.now().minusDays(20))
                .dueDate(LocalDateTime.now().minusDays(6))
                .status(BorrowStatus.OVERDUE)
                .renewalCount(0)
                .fineAmount(30.0) // 6 days * 5
                .finePaid(false)
                .build();
        borrowRecordRepository.save(overdueRecord);

        // 4. Reading Room Seat Reservation for Today
        SeatReservation seatRes = SeatReservation.builder()
                .seatNumber("S-07")
                .section("AC Coding Pod")
                .reservedDate(LocalDate.now())
                .slot("09:00 - 13:00")
                .user(student)
                .status("CONFIRMED")
                .build();
        seatReservationRepository.save(seatRes);

        // 5. Previous-Year Question Papers (Approved & Pending)
        byte[] dummyPdfContent = "%PDF-1.4 sample question paper text content for academic evaluation".getBytes(StandardCharsets.UTF_8);

        PaperSubmission paper1 = PaperSubmission.builder()
                .courseName("Data Structures & Algorithms")
                .courseCode("CSE2001")
                .semester("Fall Semester")
                .examType("FAT")
                .academicYear(2025)
                .facultyName("Dr. R. Rajesh")
                .fileName("CSE2001_FAT_Winter2025.pdf")
                .fileContentType("application/pdf")
                .fileSize(102400L)
                .fileData(dummyPdfContent)
                .uploadedBy(senior)
                .status(SubmissionStatus.APPROVED)
                .createdAt(LocalDateTime.now().minusDays(15))
                .reviewedAt(LocalDateTime.now().minusDays(14))
                .build();
        paperRepository.save(paper1);

        PaperSubmission paper2 = PaperSubmission.builder()
                .courseName("Operating Systems")
                .courseCode("CSE2005")
                .semester("Winter Semester")
                .examType("CAT-2")
                .academicYear(2025)
                .facultyName("Prof. M. Anita")
                .fileName("CSE2005_CAT2_2025.pdf")
                .fileContentType("application/pdf")
                .fileSize(84200L)
                .fileData(dummyPdfContent)
                .uploadedBy(student)
                .status(SubmissionStatus.APPROVED)
                .createdAt(LocalDateTime.now().minusDays(7))
                .reviewedAt(LocalDateTime.now().minusDays(6))
                .build();
        paperRepository.save(paper2);

        PaperSubmission paper3 = PaperSubmission.builder()
                .courseName("Database Management Systems")
                .courseCode("CSE3001")
                .semester("Winter Semester")
                .examType("CAT-1")
                .academicYear(2026)
                .facultyName("Dr. S. K. Murthy")
                .fileName("CSE3001_CAT1_Sample_2026.pdf")
                .fileContentType("application/pdf")
                .fileSize(96400L)
                .fileData(dummyPdfContent)
                .uploadedBy(student)
                .status(SubmissionStatus.PENDING)
                .createdAt(LocalDateTime.now().minusHours(4))
                .build();
        paperRepository.save(paper3);

        // 6. Discussion Threads & Replies
        DiscussionThread thread1 = DiscussionThread.builder()
                .title("Best preparation strategy for CAT-2 Operating Systems (Memory Management & Paging)?")
                .body("Hello seniors! I'm preparing for the upcoming CSE2005 CAT-2 exam. Could you please share tips on how to approach numerical problems on Page Faults, LRU replacement, and TLB hit ratios?")
                .category("Course Help")
                .tags("OperatingSystems, CAT2, Paging")
                .author(student)
                .upvotes(4)
                .isReported(false)
                .isResolved(false)
                .build();
        threadRepository.save(thread1);

        DiscussionReply reply1 = DiscussionReply.builder()
                .thread(thread1)
                .author(senior)
                .body("Focus heavily on Chapter 8 & 9 of the Silberschatz book (available on Shelf SYS-03). Practice calculating Effective Access Time (EAT) with TLB hits. Also, solve the 2025 CAT-2 question paper from the Question Paper Repository tab!")
                .upvotes(5)
                .isFacultyVerified(false)
                .isReported(false)
                .build();
        replyRepository.save(reply1);

        DiscussionReply reply2 = DiscussionReply.builder()
                .thread(thread1)
                .author(admin)
                .body("Official Notice: The library has reserved 10 extra reference copies of 'Operating System Concepts' on 2nd Floor Rack SYS-03 for exam week. Question papers for past 3 years are uploaded.")
                .upvotes(8)
                .isFacultyVerified(true)
                .isReported(false)
                .build();
        replyRepository.save(reply2);

        // Additional realistic sample student conversations for the demo forum
        threadRepository.save(DiscussionThread.builder()
                .title("CSE3001 Agile CAT-1: which topics should we revise first?")
                .body("Hi everyone, I am revising the Agile Development Process syllabus. Should we prioritize the Agile Manifesto, Scrum roles, user stories, and sprint planning? Please share your revision order and useful examples.")
                .category("Course Help").tags("CSE3001, CAT1, Agile")
                .author(senior).upvotes(7).isReported(false).isResolved(false).build());
        threadRepository.save(DiscussionThread.builder()
                .title("Anyone has a good checklist for sprint planning and story points?")
                .body("Our team is preparing the LMS sprint review. We are checking dependencies, velocity, acceptance criteria, and the definition of done. What checklist do you use before finalizing a sprint backlog?")
                .category("Project Discussion").tags("Scrum, SprintPlanning, StoryPoints")
                .author(student).upvotes(5).isReported(false).isResolved(false).build());
        threadRepository.save(DiscussionThread.builder()
                .title("Library seat booking during FAT week")
                .body("Has anyone tried reserving the AC coding pod for a long study session? Please share which time slots are usually convenient and remember to cancel a reservation if you cannot attend.")
                .category("Campus Life").tags("Library, SeatReservation, FAT")
                .author(senior).upvotes(3).isReported(false).isResolved(false).build());
        threadRepository.save(DiscussionThread.builder()
                .title("Sharing notes: Agile vs Waterfall with examples")
                .body("I made a short comparison for our CSE3001 revision: Waterfall follows sequential phases, while Agile delivers in iterations and adapts using feedback. What real project examples are easiest to explain in a 10-mark answer?")
                .category("Study Resources").tags("Agile, Waterfall, ExamPrep")
                .author(student).upvotes(6).isReported(false).isResolved(false).build());

        // 7. Notifications
        notificationRepository.save(Notification.builder()
                .user(student)
                .title("Book Overdue Reminder")
                .message("Your loan for 'Spring Boot in Action' is 6 days overdue. Daily fine of ₹5 applies.")
                .type(NotificationType.DUE_REMINDER)
                .isRead(false)
                .build());

        notificationRepository.save(Notification.builder()
                .user(student)
                .title("Seat Reservation Confirmed")
                .message("Seat S-07 (AC Coding Pod) is reserved for today 09:00 - 13:00.")
                .type(NotificationType.SEAT_CONFIRMATION)
                .isRead(false)
                .build());

        System.out.println(">> [DATA SEEDER] Seeding complete! Demo accounts ready:");
        System.out.println("   Admin/Librarian: admin@vitap.ac.in (admin123)");
        System.out.println("   Student:         subramnayeswara.23mic7024@vitapstudent.ac.in (student123), Year 4");
        System.out.println("   Senior Student:  senior@vitapstudent.ac.in (student123)");
    }
}
