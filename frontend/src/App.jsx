import React, { Suspense, lazy } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import Loading from './components/common/Loading.jsx'
import Navbar from './components/common/Navbar.jsx'
import ProtectedRoute from './components/auth/ProtectedRoute.jsx'
import { useAuth } from './hooks/useAuth.js'


// Lazy load components for better performance
const Login = lazy(() => import('./pages/Login.jsx'))
const Register = lazy(() => import('./pages/Register.jsx'))
const Jobs = lazy(() => import('./pages/Jobs.jsx'))
const JobDetails = lazy(() => import('./pages/JobDetails.jsx'))
const Profile = lazy(() => import('./pages/Profile.jsx'))
const Dashboard = lazy(() => import('./pages/Dashboard.jsx'))
const Chat = lazy(() => import('./pages/Chat.jsx'))
const ForgotPassword = lazy(() => import("./pages/ForgotPassword"))
const ResetPassword = lazy(() => import("./pages/ResetPassword"))
const PostJob = lazy(() => import('./pages/PostJob.jsx'))
const EditJob = lazy(() => import('./pages/EditJob.jsx'))
const RecruiterJobs = lazy(() => import("./pages/RecruiterJobs.jsx"));
const ViewApplications = lazy(() => import("./pages/ViewApplication.jsx"));



// Wrapper component for lazy loading with suspense
const LazyWrapper = ({ children }) => (
  <Suspense
    fallback={
      <div className="min-h-[60vh] flex items-center justify-center">
        <Loading size="large" />
      </div>
    }
  >
    {children}
  </Suspense>
)


const AppRouter = () => {
  const { user, userType } = useAuth()

  return (
    <Routes>
      {/* Public Routes */}
      <Route
        path="/"
        element={
          user ? (
            <Navigate 
              to={userType === "recruiter" ? "/recruiter/dashboard" : "/dashboard"} 
              replace 
            />
          ) : (
            <Navigate to="/login" replace />
          )
        }
      />

      <Route path="/jobs" element={<LazyWrapper><Jobs /></LazyWrapper>} />

      <Route
        path="/jobs/:id"
        element={
          <LazyWrapper>
            <JobDetails />
          </LazyWrapper>
        }
      />

      <Route path="/verify-email" element={
        <LazyWrapper>
          <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-md w-full space-y-8">
              <div>
                <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
                  Please Verify Your Email
                </h2>
                <p className="mt-2 text-center text-sm text-gray-600">
                  Check your email for a verification link. You need to verify your email before accessing this page.
                </p>
              </div>
            </div>
          </div>
        </LazyWrapper>
      } />

      <Route path="/forgot-password" element=
        {<LazyWrapper>
          <ForgotPassword />
        </LazyWrapper>
        }
      />
      <Route
        path="/reset-password/:token"
        element={
          <LazyWrapper>
            <ResetPassword />
          </LazyWrapper>
        }
      />

      {/* Auth Routes - Redirect if already logged in */}
      <Route
        path="/login"
        element={
          user ? (
            <Navigate 
              to={userType === "recruiter" ? "/recruiter/dashboard" : "/dashboard"} 
              replace 
            />
          ) : (
            <LazyWrapper>
              <Login />
            </LazyWrapper>
          )
        }
      />

      <Route
        path="/register"
        element={
          user ? <Navigate to="/dashboard" replace /> : (
            <LazyWrapper>
              <Register />
            </LazyWrapper>
          )
        }
      />

      {/* Protected Routes - Require Authentication */}
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <LazyWrapper>
              <Dashboard />
            </LazyWrapper>
          </ProtectedRoute>
        }
      />

      <Route
        path="/applications"
        element={
          <ProtectedRoute>
            <LazyWrapper>
              <ViewApplications />
            </LazyWrapper>
          </ProtectedRoute>
        }
      />

      <Route
        path="/profile"
        element={
          <ProtectedRoute>
            <LazyWrapper>
              <Profile />
            </LazyWrapper>
          </ProtectedRoute>
        }
      />

      <Route
        path="/chat"
        element={
          <ProtectedRoute>
            <LazyWrapper>
              <Chat />
            </LazyWrapper>
          </ProtectedRoute>
        }
      />

      {/* Role-based Protected Routes */}
      <Route
        path="/recruiter/jobs"
        element={
          <ProtectedRoute requiredRole="recruiter">
            <LazyWrapper>
              <RecruiterJobs />
            </LazyWrapper>
          </ProtectedRoute>
        }
      />

      <Route
        path="/recruiter/jobs/:id/applications"
        element={
          <ProtectedRoute requiredRole="recruiter">
            <LazyWrapper>
              <ViewApplications />
            </LazyWrapper>
          </ProtectedRoute>
        }
      />

      <Route
        path="/recruiter/dashboard"
        element={
          <ProtectedRoute requiredRole="recruiter">
            <LazyWrapper>
              <Dashboard />
            </LazyWrapper>
          </ProtectedRoute>
        }
      />

      <Route
        path="/recruiter/jobs/new"
        element={
          <ProtectedRoute requiredRole="recruiter">
            <LazyWrapper>
              <PostJob />
            </LazyWrapper>
          </ProtectedRoute>
        }
      />

      <Route
        path="/recruiter/jobs/:id/edit"
        element={
          <ProtectedRoute requiredRole="recruiter">
            <LazyWrapper>
              <EditJob />
            </LazyWrapper>
          </ProtectedRoute>
        }
      />
    </Routes>
  )
}

const App = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <AppRouter />
      </main>
    </div>
  );
};

export default App