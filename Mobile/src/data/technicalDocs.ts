export interface TechnicalDoc {
  id: string;
  slug: string;
  title: string;
  category: "Hardware Diagnostics" | "CCTV & Security" | "Networking & Optical" | "Printer Maintenance";
  summary: string;
  keywords: string[];
  readTime: string;
  content: string;
}

export const TECHNICAL_DOCS: TechnicalDoc[] = [
  {
    id: "doc-mb-diagnostic",
    slug: "motherboard-diagnostic-guide",
    title: "Laptop Motherboard Power Rail & Short Circuit Diagnostic Guide",
    category: "Hardware Diagnostics",
    summary: "Systematic step-by-step bench diagnostics for 19V primary rails, 3.3V/5V standby coils, and micro-soldering short isolation.",
    keywords: ["motherboard", "micro-soldering", "short circuit", "19v rail", "standby rail", "laptop repair", "power issue", "multimeter"],
    readTime: "6 min read",
    content: `### Overview
Laptop power failures typically originate in the primary DC-in power stage, standby supply rails (3.3V / 5V), or power management ICs (PMIC).

### Step 1: Visual Inspection & Resistance to Ground
1. Disconnect battery and DC charger.
2. Set digital multimeter to resistance mode (Ohms) or diode check.
3. Check resistance to ground on:
   - Primary 19V rail (current sense resistor): Should read in kilo-ohms or mega-ohms. A low reading (< 5 ohms) indicates a primary short.
   - 3.3V ALW coil & 5V ALW coil: Normal readings are typically > 100 ohms. Low values (< 10 ohms) suggest shorted IO controller (EC) or PCH.

### Step 2: Thermal Camera & Voltage Injection
- Never inject 19V into a shorted rail. Start with 1.0V with current limited to 1.5A to safely identify hot decoupling capacitors or shorted high-side MOSFETs.

### Step 3: Bios & EC Firmware Flashing
- Corrupt SPI flash chips frequently cause 'no POST / fan spin then shutdown'. Read existing chip backup with an external programmer (e.g., RT809F / CH341A) before flashing verified dumps.`,
  },
  {
    id: "doc-cctv-ip-deployment",
    slug: "cctv-ip-camera-nvr-configuration",
    title: "Commercial CCTV IP Camera & NVR Configuration Manual",
    category: "CCTV & Security",
    summary: "Complete blueprint for deploying PoE IP security cameras, subnet isolation, ONVIF discovery, and mobile remote streaming setup.",
    keywords: ["cctv", "ip camera", "nvr", "poe", "onvif", "surveillance", "security", "remote streaming", "hikvision", "dahua"],
    readTime: "8 min read",
    content: `### Architecture
Commercial surveillance requires separating surveillance video traffic from enterprise workstation traffic to avoid bandwidth congestion.

### 1. VLAN & Subnet Isolation
- Place all PoE IP cameras on a dedicated camera VLAN (e.g., 192.168.10.0/24).
- Configure the NVR dual NICs: Port 1 for local Camera LAN switch; Port 2 for client LAN / WAN router.

### 2. Camera Addressing & ONVIF
- Assign static IP addresses or DHCP reservations per camera.
- Enable ONVIF Profile S/T and create a dedicated administrative service user.
- Set H.265 / H.265+ smart video compression to conserve NVR HDD storage by up to 50%.

### 3. Remote Cloud Access & Mobile App
- Enable P2P Cloud streaming (Hik-Connect / DMSS / XMeye) with two-factor stream encryption.
- Verify NTP time synchronization across all channels so watermarks match legal court standards.`,
  },
  {
    id: "doc-structured-cabling",
    slug: "structured-cabling-cat6-standards",
    title: "Structured Cabling (CAT6/CAT6A) & Patch Panel Termination Standard",
    category: "Networking & Optical",
    summary: "Standard operating procedures for T568B punch-downs, keystone jacks, conduit runs, and certification testing.",
    keywords: ["cat6", "cat6a", "ethernet", "networking", "patch panel", "keystone", "t568b", "fluke tester", "cabling", "lan"],
    readTime: "5 min read",
    content: `### Termination Wiring Scheme: T568B
At AUGU SMART, all enterprise structured installations standardize strictly on T-568B color codes:
1. White-Orange
2. Orange
3. White-Green
4. Blue
5. White-Blue
6. Green
7. White-Brown
8. Brown

### Installation Rules
- Maintain twist up to within 0.5 inches of the keystone punch-down teeth to preserve Near-End Crosstalk (NEXT) suppression.
- Never exceed 90 meters for solid copper horizontal link runs (plus 10 meters combined patch cords).
- Support bundles with velcro ties instead of tight zip-ties to avoid dielectric crushing.
- Certify wiremaps, length, propagation delay, and return loss using a calibrated wire tester.`,
  },
  {
    id: "doc-laserjet-fuser",
    slug: "laserjet-fuser-roller-servicing",
    title: "LaserJet Printer & Photocopier Fuser Film & Pickup Roller Servicing",
    category: "Printer Maintenance",
    summary: "Resolving ghosting prints, 50.x fuser errors, paper jams, and pickup assembly wear in HP, Canon, and Kyocera laser systems.",
    keywords: ["printer", "laserjet", "photocopier", "fuser film", "pickup roller", "paper jam", "hp", "canon", "kyocera", "toner"],
    readTime: "7 min read",
    content: `### Common Symptoms
- Paper jams occurring precisely at tray pickup: Worn rubber D-roller / separation pad.
- Smudged text that wipes off easily: Fuser ceramic heater failure or torn Teflon film sleeve.
- Repetitive vertical streaks: Scratched OPC drum or contaminated laser scanner mirror.

### Servicing Steps
1. **Fuser Teardown**: Power down, cool assembly for 20 minutes, disconnect thermistor cables.
2. Clean ceramic heating element with 99% isopropyl alcohol.
3. Apply high-temperature fuser grease evenly along ceramic strip before sliding new Teflon sleeve on.
4. **Pickup Roller**: Clean with rubber renue or install genuine OEM replacement. Inspect torque limiter springs.`,
  },
  {
    id: "doc-ssd-nvme-data-recovery",
    slug: "nvme-ssd-emergency-data-recovery",
    title: "Emergency Data Recovery & NVMe Drive Clone Procedures",
    category: "Hardware Diagnostics",
    summary: "Hardware-level imaging of failing storage drives, bad sector mitigation, and raw partition recovery.",
    keywords: ["data recovery", "nvme", "ssd", "hard drive", "clone", "bad sectors", "backup", "bitlocker"],
    readTime: "6 min read",
    content: `### Critical First Rule
Never run CHKDSK or system repair utilities on an unstable or clicking drive. Immediate read attempts can irreversibly degrade media surface.

### Procedure
1. Mount drive in read-only write-blocker mode via hardware bridge.
2. Create bit-by-bit raw disk image using ddrescue with reverse pass for bad sector isolation.
3. Perform all file carving and partition table reconstructions (MFT, ext4 superblock) solely on the clone image.`,
  },
];
