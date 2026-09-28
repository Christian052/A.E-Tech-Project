# AUGU SMART ELECTRONIC SERVICE — React Native + Expo Mobile App

This directory contains the cross-platform mobile application for Android and iOS built with **React Native + Expo**, consuming your existing Express backend and MongoDB database.

---

## Architecture & Integration

- **Backend API**: Connects directly to the existing Express `/api/*` endpoints (`http://localhost:3000/api` or your deployed backend URL).
- **Authentication**: JWT Bearer authentication with preemptive token refresh and reactive 401 retry queue backed by `AsyncStorage`.
- **Styling & Assets**: Preserves the AUGU SMART visual identity (Deep Navy `#0A192F`, Teal Accent `#14B8A6`, Amber Highlights, and Inter typography).
- **Navigation**: Bottom Tab Navigator with nested Native Stack Navigators (Home, Services, Training, Gallery, Contact, and Staff Portal).

---

## Quick Start / Running the Mobile App

1. Navigate to the `Mobile` directory:
   ```bash
   cd Mobile
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Configure your API endpoint:
   Create or edit `.env` (or set `EXPO_PUBLIC_API_URL`):
   ```env
   EXPO_PUBLIC_API_URL=http://localhost:3000/api
   ```
   *(For physical Android devices/emulators, use your machine's LAN IP or ngrok tunnel, e.g. `http://192.168.1.100:3000/api`)*

4. Start Expo:
   ```bash
   npx expo start
   ```
   - Press `a` for Android Emulator
   - Press `i` for iOS Simulator
   - Scan the QR code using the **Expo Go** app on your physical iPhone or Android phone.

---

## Features Implemented

- **Home**: Hero banner, quick emergency contact buttons (direct WhatsApp & phone dialing), featured services, training courses highlight.
- **Services**: Complete service catalog (Computer repair, Printer/Photocopier repair, CCTV, Optical networking, chip-level diagnostics) with detailed breakdown, warranty guarantee, and 1-tap quote booking.
- **Training & Internship**: Vocational training program listing with syllabus details, duration, price in RWF, and direct admission application form.
- **Gallery**: Workshop photo showcase with category filtering (CCTV, Computer, Printer, Networking, Training).
- **Contact & Booking**: Interactive quote & repair request form + workshop business hours & map coordinates.
- **Staff / Admin Portal**: Secure login with JWT authentication, role detection, and real-time metric counter sync (inquiries, applications, active services, staff members).
