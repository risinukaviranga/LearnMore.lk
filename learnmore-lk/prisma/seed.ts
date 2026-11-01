import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();
const SAMPLE_PDF = "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf";

async function user(name: string, email: string, password: string, role: "ADMIN" | "INSTRUCTOR" | "STUDENT") {
  return prisma.user.upsert({
    where: { email },
    update: {},
    create: { name, email, role, passwordHash: await bcrypt.hash(password, 10) },
  });
}

const inDays = (d: number, hour: number) => {
  const t = new Date();
  t.setDate(t.getDate() + d);
  t.setHours(hour, 0, 0, 0);
  return t;
};

async function main() {
  const admin = await user("Admin User", "admin@learnmore.lk", "Admin@123", "ADMIN");
  const teacher = await user("Nimali Perera", "teacher@learnmore.lk", "Teacher@123", "INSTRUCTOR");
  const teacher2 = await user("Kasun Fernando", "kasun@learnmore.lk", "Teacher@123", "INSTRUCTOR");
  const student = await user("Sahan Silva", "student@learnmore.lk", "Student@123", "STUDENT");

  if ((await prisma.eBook.count()) === 0) {
    await prisma.eBook.createMany({
      data: [
        { title: "O/L Mathematics Complete Study Pack", author: "Nimali Perera", subject: "Mathematics", price: 1500, description: "Full syllabus notes with worked examples and 300 practice problems for Grade 10-11.", fileUrl: SAMPLE_PDF, createdById: teacher.id },
        { title: "Science Revision Guide - Grade 10", author: "Kasun Fernando", subject: "Science", price: 1200, description: "Concise revision notes covering physics, chemistry and biology units with diagrams.", fileUrl: SAMPLE_PDF, createdById: teacher2.id },
        { title: "English Grammar Essentials", author: "Nimali Perera", subject: "English", price: 800, description: "A practical grammar workbook with exercises and model answers for O/L students.", fileUrl: SAMPLE_PDF, createdById: teacher.id },
        { title: "ICT Practical Handbook", author: "Kasun Fernando", subject: "ICT", price: 950, description: "Step by step guide to spreadsheets, databases and web design practicals.", fileUrl: SAMPLE_PDF, createdById: teacher2.id },
        { title: "A/L Physics Mechanics Notes", author: "Kasun Fernando", subject: "Physics", price: 2200, description: "Detailed mechanics notes with derivations and past-paper style questions.", fileUrl: SAMPLE_PDF, createdById: teacher2.id },
        { title: "History of Sri Lanka - Short Notes", author: "Nimali Perera", subject: "History", price: 0, description: "Free short notes covering key periods of Sri Lankan history for Grade 9-11.", fileUrl: SAMPLE_PDF, createdById: teacher.id },
        { title: "Commerce Basics for Beginners", author: "Nimali Perera", subject: "Commerce", price: 700, description: "Introductory commerce concepts explained with local business examples.", fileUrl: SAMPLE_PDF, createdById: teacher.id },
        { title: "Biology Diagrams Workbook", author: "Kasun Fernando", subject: "Biology", price: 1100, description: "Labelled diagrams and practice drawing exercises for A/L Biology.", fileUrl: SAMPLE_PDF, createdById: teacher2.id },
      ],
    });
  }

  if ((await prisma.paper.count()) === 0) {
    const papers = [
      ["Mathematics", 11, 2024, 1, false],
      ["Mathematics", 11, 2024, 2, true],
      ["Mathematics", 11, 2023, 3, false],
      ["Science", 11, 2024, 1, false],
      ["Science", 11, 2023, 2, true],
      ["English", 10, 2024, 3, false],
      ["ICT", 11, 2023, 1, false],
      ["Physics", 13, 2024, 2, true],
      ["Chemistry", 13, 2023, 1, false],
      ["History", 9, 2022, 2, false],
    ] as const;
    await prisma.paper.createMany({
      data: papers.map(([subject, grade, year, term, isPremium]) => ({
        title: `${subject} Grade ${grade} - ${year} Term ${term} Paper`,
        subject, grade, year, term, isPremium,
        fileUrl: SAMPLE_PDF,
        markingSchemeUrl: SAMPLE_PDF,
        uploaderId: teacher.id,
      })),
    });
  }

  if ((await prisma.classSession.count()) === 0) {
    const classes = await Promise.all([
      prisma.classSession.create({ data: { title: "Algebra Masterclass", subject: "Mathematics", grade: 11, description: "Quadratic equations, simultaneous equations and inequalities with exam tips.", startsAt: inDays(1, 18), durationMin: 90, meetingUrl: "https://zoom.us/j/1234567890", instructorId: teacher.id } }),
      prisma.classSession.create({ data: { title: "Physics: Electricity Revision", subject: "Science", grade: 10, description: "Circuits, Ohm's law and electrical energy - full revision with past paper questions.", startsAt: inDays(2, 17), durationMin: 60, meetingUrl: "https://zoom.us/j/2234567890", instructorId: teacher2.id } }),
      prisma.classSession.create({ data: { title: "English Essay Writing", subject: "English", grade: 10, description: "Structure, linking words and sample essays for the O/L English paper.", startsAt: inDays(4, 16), durationMin: 75, meetingUrl: "https://zoom.us/j/3234567890", instructorId: teacher.id } }),
      prisma.classSession.create({ data: { title: "ICT Database Practical", subject: "ICT", grade: 11, description: "Designing tables and writing queries - live demonstration.", startsAt: inDays(6, 19), durationMin: 60, meetingUrl: "https://zoom.us/j/4234567890", instructorId: teacher2.id } }),
      prisma.classSession.create({ data: { title: "Geometry Recap (past class)", subject: "Mathematics", grade: 10, description: "Recorded recap of circle theorems and constructions.", startsAt: inDays(-5, 18), durationMin: 60, meetingUrl: "https://zoom.us/j/5234567890", instructorId: teacher.id } }),
    ]);
    await prisma.enrollment.create({ data: { userId: student.id, classId: classes[0].id } });
    await prisma.enrollment.create({ data: { userId: student.id, classId: classes[4].id, attended: true, attendedAt: inDays(-5, 18) } });
  }

  console.log("Seed complete. Admin:", admin.email);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
