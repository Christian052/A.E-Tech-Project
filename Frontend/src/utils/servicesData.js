export const DEFAULT_COMPANY_SERVICES = [
  {
    _id: "default-computer-repair",
    slug: "computer-repair",
    name: "Computer Repair and Maintenance",
    category: "Hardware & Systems",
    shortDescription: "Complete diagnostic and repair services for laptops, desktops, and workstations. From motherboard soldering to OS reinstallations and screen replacements.",
    fullDescription: "We diagnose and repair hardware faults (motherboards, GPUs, power issues), fix software problems (OS reinstalls, virus removal, slow performance), and offer preventive maintenance plans for individuals and businesses.",
    features: [
      "Hardware diagnostics & motherboard repair",
      "Screen, battery & keyboard replacement",
      "Operating system reinstall & malware cleanup",
      "Thermal cleaning & cooling fan servicing"
    ],
    order: 1,
  },
  {
    _id: "default-cctv-installation",
    slug: "cctv-installation",
    name: "CCTV Installation",
    category: "Security & Safety",
    shortDescription: "Turnkey security camera installations for commercial premises, residential compounds, and retail shops with 24/7 mobile monitoring.",
    fullDescription: "Complete CCTV solutions: site assessment, camera and DVR/NVR supply, installation, remote-viewing setup on your smartphone, and after-sales support for homes, shops, and offices.",
    features: [
      "High-definition IP & analog night-vision cameras",
      "Real-time remote smartphone monitoring",
      "DVR/NVR storage configuration & backup",
      "Structured cabling & conduit cable management"
    ],
    order: 2,
  },
  {
    _id: "default-training-internship",
    slug: "training-internship",
    name: "Professional Training & Internship",
    category: "Education & Career",
    shortDescription: "Hands-on, project-based technical training in computer maintenance, networking, and security installations designed for students and aspiring technicians.",
    fullDescription: "Structured, hands-on programs covering computer repair, networking, and CCTV installation, designed for students and job-seekers who want practical, real-world IT experience.",
    features: [
      "Practical bench workshop with real hardware",
      "PC assembly, troubleshooting & OS deployment",
      "CCTV camera termination & network config",
      "Official certificate & internship placement"
    ],
    order: 3,
  },
  {
    _id: "default-networking-internet",
    slug: "networking-internet",
    name: "Networking & Internet Setup",
    category: "Infrastructure",
    shortDescription: "Robust office and residential Wi-Fi networks, structured Ethernet cabling, patch panel installations, and reliable bandwidth optimization.",
    fullDescription: "We design and install wired and wireless networks, configure routers and access points, run structured cabling, and troubleshoot connectivity issues for homes and businesses.",
    features: [
      "CAT6 structured cabling & cable management",
      "Router, firewall & access point setup",
      "Wi-Fi dead zone elimination & mesh systems",
      "Office LAN sharing & printer networking"
    ],
    order: 4,
  },
  {
    _id: "default-printer-photocopier-repair",
    slug: "printer-photocopier-repair",
    name: "Printer & Photocopier Repair",
    category: "Office Equipment",
    shortDescription: "Maintenance, diagnostics, and repairs for office printers, scanners, and photocopiers. Genuine toner replacements and roller servicing.",
    fullDescription: "From paper jams to print-quality issues and full servicing, we keep your office printers and photocopiers running with genuine and compatible parts.",
    features: [
      "Paper feed roller & pickup gear repair",
      "Toner cartridge, drum & fuser unit replacement",
      "Network printer installation & driver config",
      "Scheduled preventive maintenance contracts"
    ],
    order: 5,
  },
  {
    _id: "default-other-tech-services",
    slug: "other-tech-services",
    name: "Other Tech Services",
    category: "Data & Performance",
    shortDescription: "Emergency data recovery from corrupted or formatted drives, high-speed SSD/RAM upgrades, software licensing, and general technical support.",
    fullDescription: "General IT support covering software installation and licensing, data backup and recovery, hardware upgrades (RAM/SSD), and ad-hoc troubleshooting.",
    features: [
      "Data recovery from damaged or formatted drives",
      "High-speed NVMe/SATA SSD upgrades & cloning",
      "RAM memory expansion & speed optimization",
      "Genuine software installation & license setup"
    ],
    order: 6,
  },
];

/**
 * Returns database services directly if present; falls back to default services
 * only when the database returns an empty list or during offline state.
 */
export function mergeServicesWithDefaults(apiServices = []) {
  if (Array.isArray(apiServices) && apiServices.length > 0) {
    return apiServices
      .map((svc, idx) => ({
        ...svc,
        category: svc.category || "Hardware & Systems",
        features: Array.isArray(svc.features) && svc.features.length > 0
          ? svc.features
          : (DEFAULT_COMPANY_SERVICES.find(d => d.slug === svc.slug)?.features || []),
        shortDescription: svc.shortDescription || svc.fullDescription || "",
        fullDescription: svc.fullDescription || svc.shortDescription || "",
        order: svc.order ?? (idx + 1),
      }))
      .sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
  }

  // Fallback only if database is completely empty
  return DEFAULT_COMPANY_SERVICES;
}
