# Floodsync

> A mobile-first disaster management application designed to help communities prepare for, respond to, and recover from flooding events in Myanmar.

## 🌊 Overview

Floodsync is a comprehensive mobile application built to address the critical need for accessible, real-time flood information and emergency preparedness resources. Recognizing that most people in Myanmar rely on mobile phones and that disasters can strike at any time, Floodsync was designed as a mobile-first solution that works even when internet connectivity is limited.

## 🎯 Mission

Our mission is to make flood safety information and emergency resources accessible to everyone, regardless of their location, language, or internet connectivity. We believe that disaster preparedness should not be a privilege—it should be a fundamental right accessible to all citizens, including those in rural areas and villages.

## ✨ Key Features

### 🌤️ Real-Time Weather & Flood Information

- **No Login Required**: Users can immediately access weather conditions and rainfall information based on their current location
- **Location-Based Data**: Automatic detection of user location with real-time weather updates
- **Precipitation Analysis**: Detailed rainfall data including last hour, last 24 hours, and 24-hour forecasts
- **Flood Risk Assessment**: Real-time flood risk percentage calculations for user's area

### 🌍 Multi-Language Support

- **Myanmar & English**: Full support for both Myanmar language and English
- **Inclusive Design**: Ensures that citizens from all regions, including rural areas and villages, can understand and use the app
- **Language Switching**: Easy language toggle available throughout the app

### 📚 Offline Education Resources

- **Works Without Internet**: Critical educational content accessible even when internet connection is unavailable
- **Comprehensive Guides**: Educational videos and guidelines covering:
  - Understanding flood risks
  - Emergency preparedness
  - During-flood safety procedures
  - Post-flood recovery
  - First aid and medical care
  - Waterborne disease prevention
  - Flood-proofing homes
  - And more
- **Video Content**: Pre-downloaded educational videos for offline viewing

### 🤖 AI-Powered Multi-Language Chatbot

- **Text & Image Input**: Users can type questions or upload images in any language
- **Natural Language Processing**: Understands questions in multiple languages
- **24/7 Assistance**: Available whenever users need help or have questions about flood safety

### 🔔 Instant Alert Notifications

- **Real-Time Alerts**: Push notifications when potential flood risks are detected
- **Background Monitoring**: Alerts work even when the app is not actively open
- **Risk-Based Triggers**: Automatic notifications when flood risk exceeds safe thresholds

### 🗺️ Community Safety & Resource Mapping

- **Safety Status Reporting**: Users can mark themselves as safe or unsafe in their region
- **Resource Needs Survey**: Users can report what resources they currently need (food, water, medical supplies, shelter, etc.)
- **Interactive Map Visualization**:
  - View moderate and high-risk zones
  - See regional safety statistics
  - Monitor resource needs by area
- **Regional Statistics**: Click on any region to see:
  - Percentage of users marked as safe/unsafe
  - Breakdown of resource needs in that specific zone
  - Community-reported data for better disaster response coordination

### 📊 Dashboard & Monitoring

- **Real-Time Analytics**: Monitor safety zones and resource needs across all regions
- **Data Visualization**: Comprehensive dashboard for tracking community status during disasters
- **Response Coordination**: Helps authorities and organizations identify where help is needed most

## 🏗️ Architecture

### Technology Stack

- **Framework**: React Native with Expo
- **Routing**: Expo Router (file-based routing)
- **UI Components**: Gluestack UI with NativeWind (Tailwind CSS)
- **State Management**: Zustand
- **Data Fetching**: TanStack Query (React Query)
- **Maps**: React Native Maps & Expo Maps
- **Notifications**: Expo Notifications
- **Location Services**: Expo Location
- **Internationalization**: Custom i18n implementation

### Project Structure

```
floodsync/
├── app/                    # Expo Router app directory
│   ├── (auth)/            # Authentication screens
│   └── tabs/              # Main app tabs
├── components/            # Reusable UI components
├── hooks/                 # Custom React hooks
├── lib/                   # Core libraries
│   ├── api/              # API client functions
│   ├── config/           # App configuration
│   ├── data/             # Static data (locations, etc.)
│   ├── i18n/             # Internationalization
│   └── notifications/    # Notification service
├── stores/               # Zustand state stores
└── contexts/             # React contexts
```

## 🚀 Getting Started

### Prerequisites

- Node.js (v18 or higher)
- npm or yarn
- Expo CLI
- iOS Simulator (for iOS) or Android Emulator (for Android)

### Installation

1. Clone the repository:

```bash
git clone <repository-url>
cd floodsync
```

2. Install dependencies:

```bash
npm install
# or
yarn install
```

3. Set up environment variables:
   Create a `.env` file in the root directory with your API keys and configuration.

4. Start the development server:

```bash
npm start
# or
yarn start
```

5. Run on your preferred platform:

```bash
npm run ios      # For iOS
npm run android  # For Android
npm run web      # For web
```

## 📱 Key Screens

- **Home**: Weather information, flood risk, and quick access to safety features
- **Map**: Interactive map showing risk zones, safety status, and resource needs
- **Guide**: Offline-accessible educational content and videos
- **Chat**: AI-powered multi-language assistant
- **Profile**: User settings, language preferences, and account management

## 🎨 Design Philosophy

1. **Mobile-First**: Designed specifically for mobile devices to ensure maximum accessibility
2. **Offline-Capable**: Critical features work without internet connectivity
3. **Language-Inclusive**: Multi-language support to serve all citizens
4. **Community-Driven**: Empowers users to report their status and needs
5. **Real-Time**: Instant alerts and updates for timely disaster response
6. **User-Friendly**: Simple, intuitive interface that works for users of all technical levels

## 🤝 Contributing

This project was built for a hackathon focused on disaster management and community safety. Contributions and improvements are welcome!

## 📄 License

[Add your license information here]

## 🙏 Acknowledgments

Built with the goal of making disaster preparedness accessible to everyone, especially those in rural and underserved communities in Myanmar.

---

**Floodsync** - Empowering communities to stay safe during floods, one notification at a time.
