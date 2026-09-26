const { isDbConnected } = require("../config/db");

// In-memory fallback data for graceful offline operation
const mockServices = [
  {
    _id: "srv-001",
    slug: "computer-repair",
    name: "Computer Repair and Maintenance",
    shortDescription: "Diagnostics, hardware repair, software fixes, and preventive maintenance for laptops and desktops.",
    fullDescription: "We diagnose and repair hardware faults (motherboards, GPUs, power issues), fix software problems (OS reinstalls, virus removal, slow performance), and offer preventive maintenance plans for individuals and businesses.",
    features: [
      "Hardware fault diagnostics & board repair",
      "Screen, keyboard & battery replacements",
      "OS installation & malware cleanup",
      "Thermal maintenance & dusting"
    ],
    order: 1,
    isActive: true,
  },
  {
    _id: "srv-002",
    slug: "printer-photocopier-repair",
    name: "Printer & Photocopier Repair",
    shortDescription: "Servicing and repair for printers and photocopiers, including toner and part replacement.",
    fullDescription: "From paper jams to print-quality issues and full servicing, we keep your office printers and photocopiers running with genuine and compatible parts.",
    features: [
      "Roller & drum replacement",
      "Toner & ink cartridge servicing",
      "Laser and inkjet printer calibration",
      "Error code diagnosis & firmware updates"
    ],
    order: 2,
    isActive: true,
  },
  {
    _id: "srv-003",
    slug: "networking-internet",
    name: "Networking & Internet Setup",
    shortDescription: "Home and office network design, Wi-Fi setup, structured cabling, and troubleshooting.",
    fullDescription: "We design and install wired and wireless networks, configure routers and access points, run structured cabling, and troubleshoot connectivity issues for homes and businesses.",
    features: [
      "Cat6/Cat6A structured cabling",
      "Wi-Fi access point deployment & coverage mesh",
      "Router & switch configuration",
      "LAN speed optimization & packet loss fix"
    ],
    order: 3,
    isActive: true,
  },
  {
    _id: "srv-004",
    slug: "cctv-installation",
    name: "CCTV Installation",
    shortDescription: "Design, supply, and installation of CCTV systems for homes and businesses.",
    fullDescription: "Complete CCTV solutions: site assessment, camera and DVR/NVR supply, installation, remote-viewing setup, and after-sales support for homes, shops, and offices.",
    features: [
      "IP & HD-Analog camera installation",
      "DVR/NVR configuration with storage backup",
      "Remote smartphone/PC live-view setup",
      "Night vision & motion detection tuning"
    ],
    order: 4,
    isActive: true,
  },
  {
    _id: "srv-005",
    slug: "training-internship",
    name: "Professional Training & Internship",
    shortDescription: "Hands-on IT training and internship placement for students and job-seekers.",
    fullDescription: "Structured, hands-on programs covering computer repair, networking, and CCTV installation, designed for students and job-seekers who want practical, real-world IT experience.",
    features: [
      "Hands-on workshop bench practice",
      "Live field installations & client visits",
      "Mentorship from certified engineers",
      "Completion certificate & job reference"
    ],
    order: 5,
    isActive: true,
  },
  {
    _id: "srv-006",
    slug: "other-tech-services",
    name: "Other Tech Services",
    shortDescription: "Software installation, data recovery, system upgrades, and general IT support.",
    fullDescription: "General IT support covering software installation and licensing, data backup and recovery, hardware upgrades (RAM/SSD), and ad-hoc troubleshooting.",
    features: [
      "HDD to high-speed SSD cloning",
      "RAM upgrade & performance boost",
      "Corrupted drive data recovery",
      "Licensed software setup & drivers"
    ],
    order: 6,
    isActive: true,
  },
];

const mockSettings = {
  businessName: "AUGU SMART ELECTRONIC SERVICE LTD",
  brandTagline: "Computer Universe",
  address: "Kigali - Nyarugenge - Norvege (Karama, Kigali)",
  phone: "+250 783 432 438",
  whatsapp: "+250 725 900 732",
  email: "augstintech2015@gmail.com",
  hours: {
    open: "10:00",
    close: "18:00",
    days: "Mon-Fri",
  },
  socialLinks: {
    facebook: "",
    instagram: "",
    twitter: "",
  },
};

const mockPrograms = [
  {
    _id: "tr-001",
    title: "Networking & CCTV Internship",
    description: "3-month hands-on internship covering structured cabling, Wi-Fi setup, and CCTV installation on real client sites.",
    durationWeeks: 12,
    seatsAvailable: 5,
    level: "All Levels",
    isActive: true,
  },
  {
    _id: "tr-002",
    title: "Computer Hardware & Diagnostics",
    description: "Practical training on motherboard repair, soldering, screen replacement, and OS installation.",
    durationWeeks: 8,
    seatsAvailable: 4,
    level: "Intermediate",
    isActive: true,
  },
];

const mockTestimonials = [
  {
    _id: "test-001",
    name: "Eric N.",
    role: "Shop Owner, Nyarugenge",
    quote: "They installed six cameras in my shop in one day and showed me how to view them on my phone. Very clear work!",
    rating: 5,
    isPublished: true,
  },
  {
    _id: "test-002",
    name: "Wivine U.",
    role: "Student",
    quote: "My laptop would not boot and I thought I lost everything. They recovered all my files the same week!",
    rating: 5,
    isPublished: true,
  },
  {
    _id: "test-003",
    name: "Jean M.",
    role: "Training graduate",
    quote: "The internship put me on real jobs from week one. I got hired two months after finishing.",
    rating: 5,
    isPublished: true,
  },
];

const mockGallery = [
  {
    _id: "gal-001",
    title: "Workshop Bench & Soldering Station",
    category: "computer-repair",
    imageUrl: "/A.E TECH 001.jpg",
    createdAt: new Date().toISOString(),
  },
  {
    _id: "gal-002",
    title: "AUGU Tech Service Logo & Brand",
    category: "general",
    imageUrl: "/A.E TECH 002.png",
    createdAt: new Date().toISOString(),
  },
];

const mockInquiries = [];
const mockApplications = [];

function dbGuard(req, res, next) {
  if (isDbConnected()) {
    return next();
  }

  // Graceful offline mock handling
  const path = req.path;
  const method = req.method;

  if (method === "GET" && (path === "" || path === "/")) {
    if (req.baseUrl.endsWith("/services")) return res.json({ services: mockServices });
    if (req.baseUrl.endsWith("/settings")) return res.json({ settings: mockSettings });
    if (req.baseUrl.endsWith("/training-programs")) return res.json({ programs: mockPrograms });
    if (req.baseUrl.endsWith("/testimonials")) return res.json({ testimonials: mockTestimonials });
    if (req.baseUrl.endsWith("/gallery")) return res.json({ success: true, items: mockGallery });
    if (req.baseUrl.endsWith("/applications")) return res.json({ applications: mockApplications });
  }

  if (method === "GET" && req.baseUrl.endsWith("/services")) {
    const slug = path.replace(/^\//, "");
    const s = mockServices.find((item) => item.slug === slug || item._id === slug);
    if (s) return res.json({ service: s });
  }

  if (method === "POST" && req.baseUrl.endsWith("/contact")) {
    const inquiry = { _id: `inq-${Date.now()}`, ...req.body, createdAt: new Date() };
    mockInquiries.push(inquiry);
    return res.status(201).json({
      success: true,
      message: "Thanks! We'll contact you within 24 hours.",
      inquiryId: inquiry._id,
    });
  }

  if (method === "GET" && req.baseUrl.endsWith("/contact") && path.includes("inquiries")) {
    return res.json({ success: true, inquiries: mockInquiries });
  }

  if (method === "POST" && req.baseUrl.endsWith("/applications")) {
    const app = { _id: `app-${Date.now()}`, ...req.body, createdAt: new Date() };
    mockApplications.push(app);
    return res.status(201).json({
      success: true,
      message: "Application received! We'll be in touch soon.",
      applicationId: app._id,
    });
  }

  if (method === "PATCH" && req.baseUrl.endsWith("/settings")) {
    Object.assign(mockSettings, req.body);
    return res.json({ settings: mockSettings });
  }

  // If none matched, pass through or fallback
  next();
}

module.exports = dbGuard;
