import React from 'react';
import { useAuth } from '../context/AuthContext';
import { LogOut, User as UserIcon, Menu } from 'lucide-react';

interface HeaderProps {
  toggleSidebar: () => void;
}

const Header: React.FC<HeaderProps> = ({ toggleSidebar }) => {
  const { user, logout } = useAuth();

  return (
    <header className="flex items-center justify-between px-6 py-4 bg-white/5 backdrop-blur-md border-b border-white/20">
      <div className="flex items-center space-x-4">
        <button 
          onClick={toggleSidebar}
          className="md:hidden text-white hover:bg-white/10 p-2 rounded-lg"
        >
          <Menu className="w-6 h-6" />
        </button>
        <h2 className="text-xl font-semibold text-white">
          <span className="hidden sm:inline">Welcome back, </span>{user?.full_name || 'User'}
        </h2>
      </div>
      <div className="flex items-center space-x-4">
        <div className="hidden sm:flex items-center space-x-2 text-sm text-blue-100 bg-white/10 px-3 py-1.5 rounded-full border border-white/10">
          <UserIcon className="w-4 h-4" />
          <span>{user?.role?.name || 'Role'}</span>
        </div>
        <button
          onClick={logout}
          className="p-2 text-blue-200 hover:text-white hover:bg-white/10 rounded-full transition-all"
          title="Logout"
        >
          <LogOut className="w-5 h-5" />
        </button>
      </div>
    </header>
  );
};

export default Header;
