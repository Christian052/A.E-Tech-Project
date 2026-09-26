require("dotenv").config();
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const { connectDB } = require("../config/db");
const Service = require("../models/Service");
const SiteSettings = require("../models/SiteSettings");
const User = require("../models/User");
const TrainingProgram = require("../models/TrainingProgram");

const GalleryItem = require("../models/GalleryItem");

const services = [
  {
    slug: "computer-repair",
    name: "Computer Repair and Maintenance",
    category: "Hardware & Systems",
    shortDescription: "Complete diagnostic and repair services for laptops, desktops, and workstations. From motherboard soldering to OS reinstallations and screen replacements.",
    fullDescription:
      "We diagnose and repair hardware faults (motherboards, GPUs, power issues), fix software problems (OS reinstalls, virus removal, slow performance), and offer preventive maintenance plans for individuals and businesses.",
    features: [
      "Hardware diagnostics & motherboard repair",
      "Screen, battery & keyboard replacement",
      "Operating system reinstall & malware cleanup",
      "Thermal cleaning & cooling fan servicing",
    ],
    order: 1,
    isActive: true,
  },
  {
    slug: "cctv-installation",
    name: "CCTV Installation",
    category: "Security & Safety",
    shortDescription: "Turnkey security camera installations for commercial premises, residential compounds, and retail shops with 24/7 mobile monitoring.",
    fullDescription:
      "Complete CCTV solutions: site assessment, camera and DVR/NVR supply, installation, remote-viewing setup, and after-sales support for homes, shops, and offices.",
    features: [
      "High-definition IP & analog night-vision cameras",
      "Real-time remote smartphone monitoring",
      "DVR/NVR storage configuration & backup",
      "Structured cabling & conduit cable management",
    ],
    order: 2,
    isActive: true,
  },
  {
    slug: "training-internship",
    name: "Professional Training & Internship",
    category: "Education & Career",
    shortDescription: "Hands-on, project-based technical training in computer maintenance, networking, and security installations designed for students and aspiring technicians.",
    fullDescription:
      "Structured, hands-on programs covering computer repair, networking, and CCTV installation, designed for students and job-seekers who want practical, real-world IT experience.",
    features: [
      "Practical bench workshop with real hardware",
      "PC assembly, troubleshooting & OS deployment",
      "CCTV camera termination & network config",
      "Official certificate & internship placement",
    ],
    order: 3,
    isActive: true,
  },
  {
    slug: "networking-internet",
    name: "Networking & Internet Setup",
    category: "Infrastructure",
    shortDescription: "Robust office and residential Wi-Fi networks, structured Ethernet cabling, patch panel installations, and reliable bandwidth optimization.",
    fullDescription:
      "We design and install wired and wireless networks, configure routers and access points, run structured cabling, and troubleshoot connectivity issues for homes and businesses.",
    features: [
      "CAT6 structured cabling & cable management",
      "Router, firewall & access point setup",
      "Wi-Fi dead zone elimination & mesh systems",
      "Office LAN sharing & printer networking",
    ],
    order: 4,
    isActive: true,
  },
  {
    slug: "printer-photocopier-repair",
    name: "Printer & Photocopier Repair",
    category: "Office Equipment",
    shortDescription: "Maintenance, diagnostics, and repairs for office printers, scanners, and photocopiers. Genuine toner replacements and roller servicing.",
    fullDescription:
      "From paper jams to print-quality issues and full servicing, we keep your office printers and photocopiers running with genuine and compatible parts.",
    features: [
      "Paper feed roller & pickup gear repair",
      "Toner cartridge, drum & fuser unit replacement",
      "Network printer installation & driver config",
      "Scheduled preventive maintenance contracts",
    ],
    order: 5,
    isActive: true,
  },
  {
    slug: "other-tech-services",
    name: "Other Tech Services",
    category: "Data & Performance",
    shortDescription: "Emergency data recovery from corrupted or formatted drives, high-speed SSD/RAM upgrades, software licensing, and general technical support.",
    fullDescription:
      "General IT support covering software installation and licensing, data backup and recovery, hardware upgrades (RAM/SSD), and ad-hoc troubleshooting.",
    features: [
      "Data recovery from damaged or formatted drives",
      "High-speed NVMe/SATA SSD upgrades & cloning",
      "RAM memory expansion & speed optimization",
      "Genuine software installation & license setup",
    ],
    order: 6,
    isActive: true,
  },
];

async function seed() {
  await connectDB();

  // 1. Seed Services
  // Clean up any temporary or test services
  await Service.deleteMany({ slug: { $in: ["jhkgjckvj", "test-service"] } });

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

  // 3. Seed Sample Training Programs
  const samplePrograms = [
    {
      title: "Networking & CCTV Security Internship",
      description: "Hands-on, project-based technical internship covering structured cabling, commercial Wi-Fi deployment, and turnkey IP/analog CCTV surveillance setup.",
      level: "Intermediate / Job-Seekers",
      durationWeeks: 12,
      seatsAvailable: 6,
      startDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
      topics: [
        "CAT6 structured cabling & patch panel termination",
        "IP & analog night-vision camera installation",
        "NVR/DVR storage configuration & smartphone remote viewing",
        "Enterprise router, firewall & access point setup",
      ],
      isActive: true,
    },
    {
      title: "Computer Hardware & Laptop Repair Masterclass",
      description: "Intensive bench workshop covering component-level diagnostics, power rail troubleshooting, screen replacements, and operating system deployment.",
      level: "Beginner to Intermediate",
      durationWeeks: 8,
      seatsAvailable: 8,
      startDate: new Date(Date.now() + 21 * 24 * 60 * 60 * 1000),
      topics: [
        "Motherboard fault isolation & multimeter circuit testing",
        "Laptop screen, hinge, keyboard & battery replacement",
        "Thermal system servicing & cooling fan maintenance",
        "Operating system deployment, malware removal & data recovery",
      ],
      isActive: true,
    },
  ];

  for (const prog of samplePrograms) {
    await TrainingProgram.findOneAndUpdate(
      { title: prog.title },
      prog,
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );
  }
  console.log(`[seed] Ensured ${samplePrograms.length} training programs exist.`);

  // 3b. Seed Customer Testimonials
  const Testimonial = require("../models/Testimonial");
  const sampleTestimonials = [
    {
      name: "Eric N.",
      role: "Retail Shop Owner",
      location: "Nyarugenge, Kigali",
      serviceTaken: "CCTV Installation",
      quote: "They installed eight HD night-vision cameras in my retail shop in a single day and set up live viewing on my smartphone. Very neat conduit cabling and honest pricing!",
      rating: 5,
      isPublished: true,
    },
    {
      name: "Wivine U.",
      role: "University Student",
      location: "Huye / Kigali",
      serviceTaken: "Laptop Motherboard Repair",
      quote: "My Dell laptop wouldn't turn on right before final exams. Another shop told me to buy a new motherboard, but AUGU Tech repaired the power rail circuit within 24 hours. Saved all my coursework!",
      rating: 5,
      isPublished: true,
    },
    {
      name: "Jean M.",
      role: "Support Technician",
      location: "Kicukiro",
      serviceTaken: "IT Training & Internship",
      quote: "The hands-on internship put me on real client jobs from week one: PC hardware diagnostics, CCTV termination, and router setups. I got hired two months after finishing.",
      rating: 5,
      isPublished: true,
    },
    {
      name: "Patrick K.",
      role: "Operations Lead",
      location: "Remera, Kigali",
      serviceTaken: "Networking & Wi-Fi Setup",
      quote: "AUGU Tech wired our two-story office with CAT6 structured cabling, eliminated all Wi-Fi dead spots, and connected all our network printers seamlessly. Transparent quote upfront.",
      rating: 5,
      isPublished: true,
    },
    {
      name: "Clarisse M.",
      role: "Pharmacy Manager",
      location: "Nyamirambo",
      serviceTaken: "Printer Repair",
      quote: "Our heavy-duty receipt and prescription printer had continuous roller jams. They diagnosed the gear mechanism and replaced the fuser unit the very same afternoon.",
      rating: 5,
      isPublished: true,
    },
    {
      name: "Samuel B.",
      role: "Studio Director",
      location: "Gasabo, Kigali",
      serviceTaken: "Data Recovery & SSD Upgrade",
      quote: "They successfully recovered over 500GB of client project files from a corrupted external hard drive and cloned our main OS to a fast NVMe SSD. Exceptional technical expertise.",
      rating: 5,
      isPublished: true,
    },
  ];

  for (const t of sampleTestimonials) {
    await Testimonial.findOneAndUpdate(
      { name: t.name, serviceTaken: t.serviceTaken },
      t,
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );
  }
  console.log(`[seed] Ensured ${sampleTestimonials.length} customer testimonials exist.`);

  // 3c. Seed Workshop Gallery Items
  const sampleGallery = [
    {
      title: "Laptop Motherboard Circuit Testing Bench",
      imageUrl: "/A.E TECH 001.jpg",
      category: "computer-repair",
    },
    {
      title: "Commercial High-Definition CCTV Installation",
      imageUrl: "/A.E TECH 001.png",
      category: "cctv",
    },
    {
      title: "CAT6 Structured Cabling & Rack Setup",
      imageUrl: "/A.E TECH 002.png",
      category: "networking",
    },
    {
      title: "Practical Hardware Diagnostics Apprenticeship",
      imageUrl: "/A.E TECH 001.jpg",
      category: "training",
    },
    {
      title: "Laser Printer Roller & Fuser Unit Replacement",
      imageUrl: "/A.E TECH 002.png",
      category: "printer-repair",
    },
    {
      title: "Karama Workshop & Electronic Repair Equipment",
      imageUrl: "/A.E TECH 001.png",
      category: "general",
    },
  ];

  for (const g of sampleGallery) {
    await GalleryItem.findOneAndUpdate(
      { title: g.title },
      g,
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );
  }
  console.log(`[seed] Ensured ${sampleGallery.length} gallery items exist.`);

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