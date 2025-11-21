import React, { useState } from 'react';
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { ChevronLeft, ChevronRight } from "lucide-react";

const Sidebar = ({ currentPage, setCurrentPage, handleLogout, isOpen, onClose, onCollapse, user }) => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  

  const toggleCollapse = () => {
    const newState = !isCollapsed;
    setIsCollapsed(newState);
    if (onCollapse) onCollapse(newState); // 🔥 notify parent
  };

  // Get user initials for avatar
  const getUserInitials = () => {
    if (user?.firstName && user?.lastName) {
      return `${user.firstName.charAt(0)}${user.lastName.charAt(0)}`.toUpperCase();
    } else if (user?.email) {
      return user.email.charAt(0).toUpperCase();
    }
    return 'U'; // Default fallback
  };

  // Get user display name
  const getUserDisplayName = () => {
    if (user?.firstName && user?.lastName) {
      return `${user.firstName} ${user.lastName}`;
    } else if (user?.email) {
      return user.email.split('@')[0]; // Use email username part
    }
    return 'MAO Staff';
  };

  // Get user role with proper formatting
  const getUserRole = () => {
    if (user?.role) {
      return user.role.charAt(0).toUpperCase() + user.role.slice(1);
    }
    return 'MAO Staff';
  };

  // Get avatar color based on role
  const getAvatarColor = () => {
    switch (user?.role?.toLowerCase()) {
      case 'admin':
        return 'bg-red-600';
      case 'moderator':
        return 'bg-blue-600';
      case 'user':
        return 'bg-green-600';
      default:
        return 'bg-purple-600';
    }
  };

  // RBAC: Define navigation items based on user role
  const getNavigationItems = () => {
    const allNavItems = [
      { name: 'Dashboard', icon: 'fas fa-tachometer-alt', page: 'dashboard', roles: ['admin', 'moderator', 'user'] },
      { name: 'User Management', icon: 'fas fa-users', page: 'users', roles: ['admin'] },
      { name: 'RSBSA Records', icon: 'fas fa-database', page: 'records', roles: ['admin', 'moderator', 'user'] },
      { name: 'Register', icon: 'fas fa-user-plus', page: 'register', roles: ['admin', 'moderator', 'user'] },
      { name: 'GIS Map', icon: 'fas fa-map-marked-alt', page: 'map', roles: ['admin', 'moderator', 'user'] },
      { name: 'Import/Export', icon: 'fas fa-file-export', page: 'import', roles: ['admin', 'moderator'] },
      { name: 'History', icon: 'fas fa-history', page: 'history', roles: ['admin', 'moderator'] },
    ];

    // Get user role, default to 'user' if not specified
    const userRole = user?.role?.toLowerCase() || 'user';

    // Filter navigation items based on user role
    return allNavItems.filter(item => item.roles.includes(userRole));
  };

  return (
    <div
      className={`
        bg-[#1a1a1a] 
        ${isCollapsed ? 'w-16' : 'w-50'} 
        z-50 
        transform transition-all duration-300 ease-in-out 
        fixed inset-y-0 left-0 
        ${isOpen ? 'translate-x-0' : '-translate-x-full'} 
        md:translate-x-0 md:static md:block
        flex flex-col
      `}
    >
      {/* Header with Logo and Toggle Button */}
      <div className="flex items-center justify-between h-16 border-b border-[#333333] px-4">
        {!isCollapsed && (
          <div className="flex items-center">
            <img
              src="https://readdy.ai/api/search-image?query=Modern%20minimalist%20agriculture%20and%20fisheries%20logo%20design%20with%20a%20stylized%20leaf%20and%20fish%20icon%20in%20gradient%20green%20and%20blue%20colors%20on%20a%20dark%20background%2C%20professional%20and%20clean%20design%2C%20suitable%20for%20government%20agency&width=40&height=40&seq=14&orientation=squarish"
              alt="AgriTech Logo"
              className="h-8 w-8 mr-2"
            />
            <h1 className="text-lg font-bold text-white ml-2">AgriTech</h1>
          </div>
        )}
        {isCollapsed && (
          <img
            src="https://readdy.ai/api/search-image?query=Modern%20minimalist%20agriculture%20and%20fisheries%20logo%20design%20with%20a%20stylized%20leaf%20and%20fish%20icon%20in%20gradient%20green%20and%20blue%20colors%20on%20a%20dark%20background%2C%20professional%20and%20clean%20design%2C%20suitable%20for%20government%20agency&width=40&height=40&seq=14&orientation=squarish"
            alt="AgriTech Logo"
            className="h-8 w-8"
          />
        )}
        <button
          onClick={toggleCollapse}
          className="text-gray-400 hover:text-white p-2 rounded-md"
        >
          {isCollapsed ? <ChevronRight className="h-5 w-5" /> : <ChevronLeft className="h-5 w-5" />}
        </button>
      </div>

      {/* Navigation Menu with RBAC */}
      <div className="flex-1 overflow-y-auto py-4">
        <nav className="px-2 space-y-2">
          {getNavigationItems().map((item) => (
            <button
              key={item.page}
              onClick={() => {
                setCurrentPage(item.page); // This now calls navigate() internally
                if (isOpen) onClose(); // Close sidebar on mobile after selection
              }}
              className={`
                w-full flex items-center px-3 py-3 text-sm font-medium rounded-md cursor-pointer transition-colors
                ${currentPage === item.page ? 'bg-[#333333] text-white' : 'text-gray-300 hover:bg-[#252525] hover:text-white'}
                ${isCollapsed ? 'justify-center' : 'justify-start'}
              `}
              title={isCollapsed ? item.name : ''} // Tooltip for collapsed state
            >
              <i
                className={`
                  ${item.icon} 
                  ${isCollapsed ? 'text-lg' : 'mr-3 text-lg'}
                  ${currentPage === item.page ? 'text-blue-400' : 'text-gray-400'}
                `}
              ></i>
              {!isCollapsed && <span>{item.name}</span>}
            </button>
          ))}
        </nav>

        
      </div>

      {/* User Section - Updated to show real user data */}
      <div className="p-4 border-t border-[#333333]">
        <div className={`flex ${isCollapsed ? 'flex-col items-center space-y-3' : 'items-center'}`}>
          <Avatar className="h-8 w-8">
            <AvatarFallback className={`${getAvatarColor()} text-white text-xs font-semibold`}>
              {getUserInitials()}
            </AvatarFallback>
          </Avatar>
          {!isCollapsed && (
            <div className="ml-2 flex-1 min-w-0">
              <p className="text-sm font-medium text-white break-words leading-tight max-w-full" title={getUserDisplayName()}>
                {getUserDisplayName()}
              </p>
              <div className="flex items-center space-x-2">
                {user?.role === 'user' && (
                  <span className="text-xs bg-green-600 text-green-100 px-1 rounded" title="MAO Staff">
                    MAO Staff
                  </span>
                )}
                {user?.role === 'admin' && (
                  <span className="text-xs bg-red-600 text-red-100 px-1 rounded" title="Administrator">
                    Admin
                  </span>
                )}
              </div>
            </div>
          )}
          <button
            onClick={handleLogout}
            className={`text-gray-400 hover:text-red-400 cursor-pointer transition-colors ${isCollapsed ? '' : 'ml-auto'}`}
            title={isCollapsed ? 'Logout' : 'Logout'}
          >
            <i className="fas fa-sign-out-alt"></i>
          </button>
        </div>
      
      </div>
    </div>
  );
};

export default Sidebar;