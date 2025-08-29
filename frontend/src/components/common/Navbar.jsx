import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';

const Navbar = () => {
  const { user, userType, logout } = useAuth();
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const jobSeekerLinks = [
    { to: '/dashboard', text: 'Dashboard' },
    { to: '/jobs', text: 'Browse Jobs' },
    { to: '/applications', text: 'My Applications' },
    { to: '/chat', text: 'Messages' },
    { to: '/profile', text: 'Profile' },
  ];

  const recruiterLinks = [
    { to: '/recruiter/dashboard', text: 'Dashboard' },
    { to: '/recruiter/jobs', text: 'My Jobs' },
    { to: '/recruiter/jobs/new', text: 'Post Job' },
    { to: '/chat', text: 'Messages' },
    { to: '/profile', text: 'Profile' },
  ];

  const activeLinks = userType === 'recruiter' ? recruiterLinks : jobSeekerLinks;

  return (
    <nav className="bg-white/80 backdrop-blur-md border-b border-gray-200 shadow-sm sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          {/* Logo */}
          <div className="flex items-center space-x-2">
            <Link
              to="/"
              className="text-2xl font-extrabold bg-gradient-to-r from-blue-600 to-indigo-600 text-transparent bg-clip-text tracking-tight"
            >
              JobSphere
            </Link>
          </div>

          {/* Desktop Links */}
          <div className="hidden sm:flex items-center space-x-6">
            {user && activeLinks.map((link) => (
              <Link
                key={link.to}
                to={link.to}
                className="text-sm font-semibold text-gray-700 hover:text-blue-600 transition duration-200"
              >
                {link.text}
              </Link>
            ))}
          </div>

          {/* Desktop Auth Buttons */}
          <div className="hidden sm:flex items-center space-x-4">
            {user ? (
              <>
                <span className="text-sm font-medium text-gray-600">Hi, <span className="font-semibold text-gray-800">{user.name}</span></span>
                <button
                  onClick={handleLogout}
                  className="bg-gradient-to-r from-red-500 to-pink-500 text-white px-4 py-2 rounded-xl text-sm font-semibold shadow hover:scale-105 hover:shadow-md transition"
                >
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link
                  to="/login"
                  className="text-sm font-semibold text-gray-700 hover:text-blue-600 transition"
                >
                  Login
                </Link>
                <Link
                  to="/register"
                  className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-4 py-2 rounded-xl text-sm font-semibold shadow hover:scale-105 hover:shadow-md transition"
                >
                  Register
                </Link>
              </>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="sm:hidden">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="p-2 rounded-md text-gray-600 hover:bg-gray-100 focus:outline-none transition"
            >
              <span className="sr-only">Toggle menu</span>
              {isMenuOpen ? (
                <svg className="h-6 w-6" viewBox="0 0 24 24" stroke="currentColor" fill="none">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              ) : (
                <svg className="h-6 w-6" viewBox="0 0 24 24" stroke="currentColor" fill="none">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMenuOpen && (
        <div className="sm:hidden px-4 pb-4">
          <div className="space-y-2 mt-2">
            {user ? (
              <>
                {activeLinks.map((link) => (
                  <Link
                    key={link.to}
                    to={link.to}
                    onClick={() => setIsMenuOpen(false)}
                    className="block w-full text-gray-700 text-base font-medium px-3 py-2 rounded-md hover:bg-blue-50 hover:text-blue-600 transition"
                  >
                    {link.text}
                  </Link>
                ))}
                <button
                  onClick={() => {
                    handleLogout();
                    setIsMenuOpen(false);
                  }}
                  className="w-full text-left text-gray-700 text-base font-medium px-3 py-2 rounded-md hover:bg-red-50 hover:text-red-600 transition"
                >
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link
                  to="/login"
                  onClick={() => setIsMenuOpen(false)}
                  className="block w-full text-gray-700 text-base font-medium px-3 py-2 rounded-md hover:bg-blue-50 hover:text-blue-600 transition"
                >
                  Login
                </Link>
                <Link
                  to="/register"
                  onClick={() => setIsMenuOpen(false)}
                  className="block w-full text-gray-700 text-base font-medium px-3 py-2 rounded-md hover:bg-indigo-50 hover:text-indigo-600 transition"
                >
                  Register
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
