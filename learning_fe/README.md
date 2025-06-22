# Learning Platform - Frontend

This is the frontend for the Learning Platform, a modern React application built with TypeScript, Material-UI, and a comprehensive authentication system. It provides a user-friendly interface for students to find and enroll in courses, and for NGOs to manage their projects and volunteers.

## 🚀 Features

- **Modern Stack**: React 18, TypeScript, Vite
- **UI Framework**: Material-UI (MUI) with a custom theme
- **User Roles**: Separate dashboards and functionalities for Students and NGOs.
- **Course Enrollment**: Students can browse and enroll in available courses.
- **ONG Project Management**: NGOs can create, update, and delete their projects.
- **Authentication**: JWT-based authentication with secure token management.
- **State Management**: Zustand for efficient and lightweight state management.
- **Form Handling**: React Hook Form with Yup for robust validation.
- **Routing**: React Router for seamless navigation and protected routes.
- **Professional Structure**: Clean and scalable architecture with a clear separation of concerns.

## 📁 Project Structure

```
src/
├── api/                 # API service definitions
├── components/          # Reusable UI components
│   ├── ong/             # Components specific to ONG features
│   ├── student/         # Components specific to Student features
│   └── ui/              # Generic UI components
├── hooks/               # Custom React hooks
├── pages/               # Page components for different routes
├── services/            # API services
├── store/               # Zustand state management stores
├── theme/               # MUI theme configuration
├── types/               # TypeScript type definitions
└── App.tsx              # Main application component
```

## 🛠️ Technologies Used

- **React 18** - For building the user interface.
- **TypeScript** - For type-safe development.
- **Material-UI (MUI)** - For a professional and consistent UI.
- **Vite** - As a fast build tool and development server.
- **React Router** - For client-side routing.
- **React Hook Form & Yup** - For efficient and validated forms.
- **Zustand** - For lightweight global state management.
- **Axios** - As the HTTP client for API communication.

## 🚀 Getting Started

### Prerequisites

- Node.js 16+
- npm or yarn

### Installation

1.  **Install dependencies:**
    ```bash
    npm install
    ```

2.  **Set up environment variables:**

    Create a `.env` file in the root of the `learning_fe` directory and add the following, pointing to your running backend instance:

    ```env
    VITE_API_URL=http://localhost:8000/api
    VITE_APP_NAME=Learning Platform
    ```

### Development

1.  **Start the development server:**
    ```bash
    npm run dev
    ```

2.  The application will be available at `http://localhost:5173`.

### Building for Production

To create a production build, run:

```bash
npm run build
```

This will generate a `dist` folder with the optimized and minified assets, ready for deployment.

## Backend Documentation

For instructions on how to set up the backend server, please refer to the `../learning_be/README.md` file.
