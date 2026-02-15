import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { LayoutDashboard, Users, Droplets, FileText, Settings, BarChart2 } from 'lucide-react';
import clsx from 'clsx';
import { useAuth } from '../context/AuthContext';

interface SidebarProps {
  onClose?: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ onClose }) => {
  const location = useLocation();

  const { user } = useAuth();
  
  const navItems = [
    { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard, roles: ['Admin', 'Reader'] },
    { name: 'Customers', path: '/customers', icon: Users, roles: ['Admin', 'Reader'] },
    { name: 'Readings', path: '/readings', icon: Droplets, roles: ['Admin', 'Reader'] },
    { name: 'Bills', path: '/bills', icon: FileText, roles: ['Admin', 'Reader'] },
    { name: 'Reports', path: '/reports', icon: BarChart2, roles: ['Admin'] },
    { name: 'Settings', path: '/settings', icon: Settings, roles: ['Admin'] },
  ];

  const filteredNavItems = navItems.filter(item => {
    if (!user || !user.role) return false;
    // Assuming user.role is an object with a name property based on types/index.ts
    // or if it's just a string in some contexts, we should handle both.
    // Based on User interface: role: { id, name }
    const userRole = typeof user.role === 'string' ? user.role : user.role.name;
    return item.roles.includes(userRole);
  });

  return (
    <div className="flex flex-col w-full h-full bg-blue-800/90 md:bg-white/10 backdrop-blur-md border-r border-white/20">
      <div className="flex items-center justify-between md:justify-center h-16 border-b border-white/20 px-4 md:px-0">
        <span className="text-2xl font-bold text-white tracking-wider">WSMS</span>
        {/* Close button for mobile */}
        {onClose && (
           <button onClick={onClose} className="md:hidden text-white">
             <span className="sr-only">Close sidebar</span>
             <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
               <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
             </svg>
           </button>
        )}
      </div>
      <div className="flex flex-col flex-1 overflow-y-auto">
        <nav className="flex-1 px-2 py-4 space-y-2">
          {filteredNavItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname.startsWith(item.path);
            return (
              <Link
                key={item.name}
                to={item.path}
                onClick={onClose} // Close sidebar on navigation on mobile
                className={clsx(
                  'flex items-center px-4 py-2 text-sm font-medium rounded-xl group transition-all duration-200',
                  isActive
                    ? 'bg-blue-500 text-white shadow-lg shadow-blue-500/30'
                    : 'text-blue-100 hover:bg-white/10 hover:text-white'
                )}
              >
                <Icon className={clsx('mr-3 h-5 w-5', isActive ? 'text-white' : 'text-blue-300 group-hover:text-white')} />
                {item.name}
              </Link>
            );
          })}
        </nav>
      </div>
    </div>
  );
};

export default Sidebar;
