# My Backyard USA Web Application

My Backyard USA is a web platform that connects users with local businesses and services in their area. The application provides a seamless experience for users to discover, interact with, and subscribe to premium features that enhance their local business discovery experience.

## Features

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
- **State Management**: Pinia
- **Routing**: Vue Router
- **HTTP Client**: Axios
- **Authentication**: JWT (JSON Web Tokens)
- **API Integration**: RESTful API

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
├── public/               # Public static files
└── package.json         # Project dependencies
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
