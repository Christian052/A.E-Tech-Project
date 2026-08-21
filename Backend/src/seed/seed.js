require("dotenv").config();
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const { connectDB } = require("../config/db");
const Service = require("../models/Service");
const SiteSettings = require("../models/SiteSettings");
const User = require("../models/User");
const TrainingProgram = require("../models/TrainingProgram");

const services = [
  {
    slug: "computer-repair",
    name: "Computer Repair and Maintenance",
    shortDescription: "Diagnostics, hardware repair, software fixes, and preventive maintenance for laptops and desktops.",
    fullDescription:
      "We diagnose and repair hardware faults (motherboards, GPUs, power issues), fix software problems (OS reinstalls, virus removal, slow performance), and offer preventive maintenance plans for individuals and businesses.",
    order: 1,
  },
  {
    slug: "printer-photocopier-repair",
    name: "Printer & Photocopier Repair",
    shortDescription: "Servicing and repair for printers and photocopiers, including toner and part replacement.",
    fullDescription:
      "From paper jams to print-quality issues and full servicing, we keep your office printers and photocopiers running with genuine and compatible parts.",
    order: 2,
  },
  {
    slug: "networking-internet",
    name: "Networking & Internet Setup",
    shortDescription: "Home and office network design, Wi-Fi setup, structured cabling, and troubleshooting.",
    fullDescription:
      "We design and install wired and wireless networks, configure routers and access points, run structured cabling, and troubleshoot connectivity issues for homes and businesses.",
    order: 3,
  },
  {
    slug: "cctv-installation",
    name: "CCTV Installation",
    shortDescription: "Design, supply, and installation of CCTV systems for homes and businesses.",
    fullDescription:
      "Complete CCTV solutions: site assessment, camera and DVR/NVR supply, installation, remote-viewing setup, and after-sales support for homes, shops, and offices.",
    order: 4,
  },
  {
    slug: "training-internship",
    name: "Professional Training & Internship",
    shortDescription: "Hands-on IT training and internship placement for students and job-seekers.",
    fullDescription:
      "Structured, hands-on programs covering computer repair, networking, and CCTV installation, designed for students and job-seekers who want practical, real-world IT experience.",
    order: 5,
  },
  {
    slug: "other-tech-services",
    name: "Other Tech Services",
    shortDescription: "Software installation, data recovery, system upgrades, and general IT support.",
    fullDescription:
      "General IT support covering software installation and licensing, data backup and recovery, hardware upgrades (RAM/SSD), and ad-hoc troubleshooting.",
    order: 6,
  },
];

async function seed() {
  await connectDB();

  // 1. Seed Services
  for (const svc of services) {
    await Service.findOneAndUpdate(
      { slug: svc.slug },
      svc,
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );
  }
  console.log(`[seed] Upserted ${services.length} services.`);

  // 2. Ensure SiteSettings Singleton
  await SiteSettings.getSingleton();
  console.log("[seed] Ensured siteSettings singleton exists.");

  // 3. Seed Sample Training Program
  await TrainingProgram.findOneAndUpdate(
    { title: "Networking & CCTV Internship" },
    {
      title: "Networking & CCTV Internship",
      description: "3-month hands-on internship covering structured cabling, Wi-Fi setup, and CCTV installation.",
      durationWeeks: 12,
      seatsAvailable: 5,
      isActive: true,
    },
    { upsert: true, new: true, setDefaultsOnInsert: true }
  );
  console.log("[seed] Ensured sample training program exists.");

  // 4. Seed Standard Admin User
  const adminEmail = (process.env.SEED_ADMIN_EMAIL || "admin@aetech.rw").toLowerCase();
  const existingAdmin = await User.findOne({ email: adminEmail });
  if (!existingAdmin) {
    const passwordHash = await bcrypt.hash(process.env.SEED_ADMIN_PASSWORD || "ChangeMe123!", 10);
    await User.create({
      name: process.env.SEED_ADMIN_NAME || "Augustin",
      email: adminEmail,
      passwordHash,
      role: "admin",
      isActive: true,
    });
    console.log(`[seed] Created admin user: ${adminEmail}`);
  } else {
    console.log(`[seed] Admin user already exists: ${adminEmail}`);
  }

  // 5. Seed Super-Admin User
  const superAdminEmail = "doctorshavu@gmail.com";
  const existingSuperAdmin = await User.findOne({ email: superAdminEmail });
  if (!existingSuperAdmin) {
    const hashedPassword = await bcrypt.hash("Christian@2026", 10);
    await User.create({
      name: "D.Christian",
      email: superAdminEmail,
      passwordHash: hashedPassword,
      role: "super-admin",
      isActive: true,
    });
    console.log(`[seed] Created super-admin user: ${superAdminEmail}`);
  } else {
    console.log(`[seed] Super-admin user already exists: ${superAdminEmail}`);
  }

  await mongoose.connection.close();
  console.log("[seed] Execution completed successfully.");
}

seed().catch((err) => {
  console.error("[seed] Failed:", err);
  process.exit(1);
});