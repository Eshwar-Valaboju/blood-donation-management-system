import React, { useState } from 'react';
import { Droplet, LogOut, Bell, User } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import NotificationPanel from '../notifications/NotificationPanel';

interface UserLayoutProps {
  children: React.ReactNode;
  title: string;
}

const UserLayout: React.FC<UserLayoutProps> = ({ children, title }) => {
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const { logout, authState } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center">
              <Droplet className="h-8 w-8 text-red-600" />
              <h1 className="ml-2 text-xl font-bold text-gray-900">Blood Donation System</h1>
            </div>
            <div className="flex items-center space-x-4">
              <button 
                onClick={() => setNotificationsOpen(!notificationsOpen)} 
                className="text-gray-500 hover:text-gray-700 relative"
              >
                <Bell className="h-6 w-6" />
                <span className="absolute top-0 right-0 block h-2 w-2 rounded-full bg-red-600"></span>
              </button>
              <div className="flex items-center">
                <div className="flex items-center">
                  <div className="bg-gray-200 rounded-full p-2">
                    <User className="h-5 w-5 text-gray-600" />
                  </div>
                  <div className="ml-2 hidden md:block">
                    <p className="text-sm font-medium text-gray-700">{authState.user?.name}</p>
                    <p className="text-xs text-gray-500">{authState.user?.email}</p>
                  </div>
                </div>
                <button
                  onClick={handleLogout}
                  className="ml-4 text-red-600 hover:text-red-700 flex items-center"
                >
                  <LogOut className="h-5 w-5" />
                  <span className="ml-1 hidden md:block">Logout</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-semibold text-gray-900">{title}</h2>
        </div>
        {notificationsOpen && (
          <div className="fixed right-4 top-20 z-50 w-full max-w-sm">
            <NotificationPanel onClose={() => setNotificationsOpen(false)} />
          </div>
        )}
        {children}
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200 py-4">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <p className="text-center text-sm text-gray-500">
            © {new Date().getFullYear()} Blood Donation Management System. Demo Version.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default UserLayout;