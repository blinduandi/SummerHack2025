# Professional TypeScript React Authentication App

A modern, professional React application built with TypeScript, Material-UI, and comprehensive authentication system.

## 🚀 Features

- **Modern Stack**: React 18, TypeScript, Vite
- **UI Framework**: Material-UI (MUI) with custom theme
- **Landing Page**: Beautiful, responsive landing page with hero section
- **Navigation**: Professional navigation bar with mobile support
- **Authentication**: JWT-based authentication with token management
- **State Management**: Zustand for efficient state management
- **Form Handling**: React Hook Form with Yup validation
- **Routing**: React Router with protected routes
- **Professional Structure**: Clean architecture with separation of concerns

## 📁 Project Structure

```
src/
├── components/          # Reusable UI components
│   ├── ui/             # Basic UI components
│   │   ├── LoadingButton.tsx
│   │   ├── AuthCard.tsx
│   │   ├── Navigation.tsx
│   │   └── ProtectedRoute.tsx
│   ├── forms/          # Form components
│   │   └── FormInput.tsx
│   └── Layout.tsx      # Main layout component
├── pages/              # Page components
│   ├── auth/          # Authentication pages
│   │   ├── LoginPage.tsx
│   │   └── RegisterPage.tsx
│   ├── DashboardPage.tsx
│   └── LandingPage.tsx
├── store/              # Zustand state management
│   └── authStore.ts
├── services/           # API services
│   └── api.ts
├── types/              # TypeScript type definitions
│   └── auth.ts
├── hooks/              # Custom React hooks
│   └── useAuth.ts
├── theme/              # MUI theme configuration
│   └── index.ts
├── utils/              # Utility functions
│   └── index.ts
└── App.tsx            # Main app component
```

## 🛠️ Technologies Used

- **React 18** - Modern React with hooks
- **TypeScript** - Type-safe development
- **Material-UI (MUI)** - Professional UI components
- **Vite** - Fast build tool and dev server
- **React Router** - Client-side routing
- **React Hook Form** - Efficient form handling
- **Yup** - Schema validation
- **Zustand** - Lightweight state management
- **Axios** - HTTP client for API calls

## 🚀 Getting Started

### Prerequisites

- Node.js 16+ 
- npm or yarn

### Installation

1. Install dependencies:
   ```bash
   npm install
   ```

2. Copy environment variables:
   ```bash
   cp .env.example .env
   ```

3. Update the `.env` file with your API configuration:
   ```env
   VITE_API_URL=http://localhost:3001/api
   VITE_APP_NAME=Professional Auth App
   ```

### Development

Start the development server:
```bash
npm run dev
```

The application will be available at `http://localhost:5173`

### Building for Production

Build the application:
```bash
npm run build
```

Preview the production build:
```bash
npm run preview
```

## 🔐 Authentication System

### Features

- **User Registration** - Create new accounts with validation
- **User Login** - Secure JWT-based authentication
- **Token Management** - Automatic token refresh and storage
- **Protected Routes** - Route-level authentication guards
- **Persistent Sessions** - Stay logged in across browser sessions

### API Integration

The app expects a REST API with the following endpoints:

- `POST /auth/login` - User login
- `POST /auth/register` - User registration
- `POST /auth/refresh` - Token refresh
- `POST /auth/logout` - User logout
- `GET /auth/profile` - Get user profile

### User Roles

The system supports multiple user roles:
- `admin` - Full system access
- `user` - Standard user access
- `moderator` - Moderation privileges

## 🎨 UI/UX Features

- **Responsive Design** - Works on all devices
- **Professional Styling** - Modern, clean interface
- **Loading States** - Proper loading indicators
- **Error Handling** - User-friendly error messages
- **Form Validation** - Real-time validation with helpful messages

## 📱 Pages

### Landing Page
- **Hero Section** - Eye-catching introduction with call-to-action
- **Features Section** - Highlight key features and benefits
- **Statistics** - Display impressive numbers and social proof
- **Responsive Design** - Beautiful layout on all devices

### Authentication Pages
- **Login Page** - Clean login form with validation
- **Register Page** - Comprehensive registration form

### Navigation
- **Responsive Navigation** - Works on desktop and mobile
- **User Menu** - Profile dropdown with user actions
- **Route Highlighting** - Active page indication

### Dashboard
- **User Dashboard** - Personalized user dashboard
- **Profile Information** - Display user details
- **Quick Actions** - Common user actions

## 🚀 Development

The development server is running at `http://localhost:5173`

### Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

## 📄 License

This project is licensed under the MIT License.
