# AIML Class ERP - Android App

<div align="center">

![Acharya Logo](acharya_logo.png)

**A mobile-ready Android application for AIML Class Management**

[![React](https://img.shields.io/badge/React-19.2.0-blue.svg)](https://reactjs.org/)
[![Capacitor](https://img.shields.io/badge/Capacitor-6.1.2-blue.svg)](https://capacitorjs.com/)
[![Vite](https://img.shields.io/badge/Vite-7.2.7-purple.svg)](https://vitejs.dev/)

</div>

---

## 📱 About

This is the Android version of the AIML Class ERP web application, converted using Capacitor. It provides students and faculty with easy access to:

- 📊 Dashboard with class overview
- 👥 Student lists and mentor allocations
- 📅 Weekly timetable
- 📞 Faculty contact information

---

## 🚀 Quick Start

### Prerequisites

- Node.js (v16+)
- Android Studio
- Java JDK (v11+)

### Installation

```bash
# Install dependencies
npm install

# Build the web app
npm run build

# Sync with Android
npx cap sync android

# Open in Android Studio
npx cap open android
```

---

## 📦 Building the APK

See [BUILD_INSTRUCTIONS.md](BUILD_INSTRUCTIONS.md) for detailed instructions on building the APK.

**Quick Build:**

```bash
cd android
.\gradlew assembleDebug
```

APK will be at: `android/app/build/outputs/apk/debug/app-debug.apk`

---

## 🛠️ Development

### Run Development Server

```bash
npm run dev
```

### Make Changes

1. Edit files in `src/`
2. Test in browser with `npm run dev`
3. Build with `npm run build`
4. Sync with `npx cap sync android`
5. Rebuild APK

---

## 📂 Project Structure

```
ERP_APP/
├── src/                    # React source code
│   ├── App.jsx            # Main app component
│   ├── main.jsx           # Entry point
│   └── index.css          # Global styles
├── public/                 # Static assets
├── android/                # Native Android project
├── dist/                   # Built web app (generated)
├── capacitor.config.json   # Capacitor configuration
├── package.json            # Dependencies
└── vite.config.js          # Build configuration
```

---

## 🎨 App Icon

The app uses the official Acharya logo as its icon, configured for all Android screen densities.

---

## 📄 License

See [LICENSE](LICENSE) file for details.

---

## 🤝 Contributing

This project is maintained for Acharya AIML students. For issues or suggestions, please contact the development team.

---

**Built with ❤️ for Acharya Institute**
