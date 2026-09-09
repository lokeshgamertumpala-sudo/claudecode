# Med-Assist HealthTech Prototype

A premium React Native (Expo) application featuring glassmorphism UI, liquid animations, and three core health-tech features:
- Audio Medicine Scanner (OCR + TTS)
- Medical Report Dashboard
- Emergency SOS System

## Features

- **Deep charcoal dark mode** (`#121212` background)
- **Strict glassmorphism**: Translucent backgrounds with backdrop-filter blurs and subtle borders
- **Liquid glass animations**: Custom pulsing/breathing shadows using React Native Reanimated
- **Accessible typography**: Large, legible sans-serif fonts
- **Three-tab navigation**: Scanner, Reports, SOS

## Screens

### 1. Audio Medicine Scanner (`src/screens/ScannerScreen.js`)
- Full-screen camera view using `expo-camera`
- Glassmorphic scanning bounding box in center
- Tap to scan triggers blue liquid-glass glow animation
- Mock OCR extracts medicine information
- Mock TTS reads out the information with visual audio-wave indicators

### 2. Medical Report Dashboard (`src/screens/ReportDashboardScreen.js`)
- File upload/photo capture UI (`expo-image-picker`)
- Swipeable glass cards displaying parsed medical data
- Abnormal values highlighted with red glowing border and alert icon
- Language toggle (English/Telugu/Hindi) - mock translation state

### 3. Emergency SOS System (`src/screens/SOScreen.js`)
- Massive floating action button with deep crimson gradient
- Continuous liquid pulse animation (red)
- 3-second cancelable countdown timer UI
- Mock Twilio SOS trigger

## Components

- `GlassCard.js`: Reusable glassmorphic card for medical data
- `LanguageToggle.js`: Language switcher
- `LiquidPulse.js`: Custom liquid glass glowing effect (using react-native-reanimated)
- `ScanBox.js`: Glassmorphic scanner bounding box with scanning effect

## Utils

- `colors.js`: Glassmorphism utility function and color constants

## Setup Instructions

### Prerequisites
- Node.js (v16+ recommended)
- npm or yarn
- Expo CLI (install globally: `npm install -g expo-cli`)

### Installation
1. Clone or copy this repository to your local machine
2. Navigate to the project directory
3. Install dependencies:
   ```bash
   npm install
   ```
   *(Note: This requires internet access to download packages from npm registry)*

### Running the App
```bash
# Start Expo development server
npm start
# or
expo start
```

Then:
- Scan the QR code with the Expo Go app (iOS/Android)
- Press 'w' to open in web browser
- Press 'a' to run on Android emulator
- Press 'i' to run on iOS simulator

### Project Structure
```
src/
├── components/
│   ├── GlassCard.js
│   ├── LanguageToggle.js
│   ├── LiquidPulse.js
│   └── ScanBox.js
├── screens/
│   ├── ScannerScreen.js
│   ├── ReportDashboardScreen.js
│   └── SOScreen.js
└── utils/
    └── colors.js
App.js
```

## NPU Optimization Notes (For Final Build)

All mock functions include specific comments detailing where to inject Snapdragon NPU-accelerated models:

### ScannerScreen.js
```javascript
// NOTE: For final build, replace mock OCR with:
//   - Snapdragon NPU accelerated OCR model (Qualcomm SNPE/TFLite)
//   - Text detection (EAST/CRAFT) + recognition (CRNN)
// NOTE: Replace mock TTS with NPU accelerated TTS (FastPitch/Tacotron 2 + WaveGlow)
```

### ReportDashboardScreen.js
```javascript
// NOTE: For final build, replace mock data with:
//   - Snapdragon NPU document processing pipeline:
//     1. Document detection/cropping (segmentation model)
//     2. Perspective correction
//     3. OCR (layout-aware model like LayoutLM/Donut)
//     4. Medical entity recognition (fine-tuned BERT)
//     5. Translation (compact multilingual model like mBART-50/NLLB)
```

## Dependencies

See `package.json` for full list. Key dependencies:
- expo, expo-camera, expo-av, expo-image-picker, expo-media-library, expo-file-system
- @react-navigation/native, @react-navigation/bottom-tabs
- react-native-reanimated, react-native-gesture-handler
- @expo/vector-icons

## Notes
- Glassmorphism requires iOS 13+/Android 10+ for backdrop-filter support (fallback provided)
- Liquid pulse animations use react-native-reanimated 2+ for performance
- All assets (icons, placeholder audio) should be added to `src/assets/` directory
- For production, replace mock functions with actual NPU-accelerated models