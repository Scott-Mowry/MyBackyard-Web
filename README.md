# My Backyard USA Web Application

My Backyard USA is a web platform that connects users with local businesses and services in their area. The application provides a seamless experience for users to discover, interact with, and subscribe to premium features that enhance their local business discovery experience. The application is available as both a web platform and native mobile apps for iOS and Android, built using Quasar Framework with Capacitor for native mobile capabilities.

## Features

### Cross-Platform Support

- Web application
- iOS native app (via Quasar/Capacitor)
- Android native app (via Quasar/Capacitor)
- Shared codebase using Quasar Framework
- Native device features integration
- Single codebase for all platforms

### User Management

- User registration and authentication
- Profile management
- Secure login system with email verification
- Password recovery functionality

### Subscription System

- Multiple subscription plans with different features
- Secure payment processing
- Credit card management
- Subscription status tracking
- Plan upgrade/downgrade capabilities

### Payment Integration

- Secure credit card processing
- Payment method management
- Subscription billing
- Payment history tracking

### User Interface

- Modern, responsive design using Quasar Framework
- Intuitive navigation
- Mobile-friendly interface
- Real-time notifications

## Technical Stack

- **Frontend Framework**: Vue.js 3 with Composition API
- **UI Framework**: Quasar Framework
- **Mobile Build**: Quasar/Capacitor
- **State Management**: Pinia
- **Routing**: Vue Router
- **HTTP Client**: Axios
- **Authentication**: JWT (JSON Web Tokens)
- **API Integration**: RESTful API
- **Mobile Build Tools**:
  - iOS: Xcode
  - Android: Android Studio

## Project Structure

```
my-backyard-usa-web/
├── src/
│   ├── boot/              # Application boot files
│   ├── components/        # Reusable Vue components
│   ├── layouts/           # Page layouts
│   ├── pages/            # Application pages
│   ├── router/           # Vue Router configuration
│   ├── stores/           # Pinia stores
│   └── assets/           # Static assets
├── src-capacitor/        # Capacitor specific files
│   ├── capacitor.config.ts # Capacitor configuration
│   ├── android/          # Android project files
│   └── ios/              # iOS project files
├── public/               # Public static files
└── package.json         # Project dependencies
```

## Mobile App Development

### Prerequisites for Mobile Development

- **iOS Development**:

  - macOS operating system
  - Xcode 14 or higher
  - iOS 13 or higher
  - CocoaPods

- **Android Development**:
  - Android Studio
  - JDK 11 or higher
  - Android SDK
  - Gradle

### Mobile App Setup

1. Add Capacitor mode to your Quasar project:

```bash
quasar mode add capacitor
```

2. Add platforms:

```bash
# Add Android
quasar capacitor add android

# Add iOS
quasar capacitor add ios
```

3. Install required Capacitor plugins:

```bash
# Core plugins
npm install @capacitor/core @capacitor/cli

# Device features
npm install @capacitor/camera
npm install @capacitor/geolocation
npm install @capacitor/push-notifications
npm install @capacitor/app
npm install @capacitor/haptics
npm install @capacitor/keyboard
npm install @capacitor/status-bar
npm install @capacitor/storage
```

### Mobile App Development Workflow

1. Development with live reload:

```bash
# For Android
quasar dev -m capacitor -T android

# For iOS
quasar dev -m capacitor -T ios
```

2. Build for production:

```bash
# For Android
quasar build -m capacitor -T android

# For iOS
quasar build -m capacitor -T ios
```

3. Run on device/emulator:

```bash
# For Android
quasar capacitor run android

# For iOS
quasar capacitor run ios
```

### Mobile-Specific Features

- Push Notifications
- Camera access
- Geolocation services
- Native device storage
- Biometric authentication
- Deep linking
- App store integration
- Native device features through Capacitor APIs

### Building for Production

#### Android

1. Update version in `src-capacitor/capacitor.config.ts`
2. Generate signed APK/Bundle:

```bash
quasar build -m capacitor -T android --release
```

3. Test the release build
4. Submit to Google Play Store

#### iOS

1. Update version in `src-capacitor/capacitor.config.ts`
2. Build for production:

```bash
quasar build -m capacitor -T ios --release
```

3. Open Xcode and archive the app
4. Submit to App Store

### Environment Setup

Create a `.env` file with mobile-specific variables:

```env
VUE_APP_API_URL=https://admin.mybackyardusa.com/public/api
VUE_APP_MOBILE=true
VUE_APP_PUSH_NOTIFICATIONS=true
```

### Mobile App Configuration

The `src-capacitor/capacitor.config.ts` file contains important mobile app settings:

```typescript
import { CapacitorConfig } from '@capacitor/cli'

const config: CapacitorConfig = {
  appId: 'com.mybackyardusa.app',
  appName: 'My Backyard USA',
  webDir: 'dist/spa',
  server: {
    androidScheme: 'https',
    iosScheme: 'https',
  },
  plugins: {
    PushNotifications: {
      presentationOptions: ['badge', 'sound', 'alert'],
    },
    SplashScreen: {
      launchShowDuration: 3000,
      backgroundColor: '#FFFFFF',
      androidSplashResourceName: 'splash',
      androidScaleType: 'CENTER_CROP',
      showSpinner: true,
      spinnerColor: '#999999',
    },
    Camera: {
      permissions: ['camera'],
    },
    Geolocation: {
      permissions: ['location'],
    },
  },
  android: {
    minWebViewVersion: 55,
  },
  ios: {
    contentInset: 'always',
  },
}

export default config
```

## Key Features Implementation

### Authentication Flow

- JWT-based authentication
- Secure token storage
- Automatic token refresh
- Protected routes

### Subscription Management

- Plan selection and comparison
- Secure payment processing
- Subscription status tracking
- Plan upgrade/downgrade options

### Payment Processing

- Credit card validation
- Secure payment method storage
- Subscription billing
- Payment history

## Getting Started

### Prerequisites

- Node.js (v14 or higher)
- npm or yarn
- Modern web browser

### Installation

1. Clone the repository:

```bash
git clone https://github.com/your-username/my-backyard-usa-web.git
cd my-backyard-usa-web
```

2. Install dependencies:

```bash
npm install
# or
yarn install
```

3. Create a `.env` file in the root directory and add necessary environment variables:

```env
VUE_APP_API_URL=https://admin.mybackyardusa.com/public/api
```

4. Start the development server:

```bash
npm run dev
# or
yarn dev
```

### Building for Production

```bash
npm run build
# or
yarn build
```

## API Integration

The application integrates with the My Backyard USA API for:

- User authentication
- Subscription management
- Payment processing
- Profile management

API endpoints are configured in the `boot/axios.js` file.

## Security Features

- JWT-based authentication
- Secure password handling
- HTTPS enforcement
- XSS protection
- CSRF protection
- Input validation
- Secure payment processing

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License

This project is proprietary software. All rights reserved.

## Support

For support, please contact the development team or refer to the internal documentation.

## Acknowledgments

- Quasar Framework team for the excellent UI framework
- Vue.js team for the amazing frontend framework
- All contributors who have helped shape this project
