import React, { useEffect, useState } from "react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import { ScrollArea } from "@/components/ui/scroll-area";

const TopNavigation = ({
  toggleSidebar,
  currentPage,
  showCalendar,
  setShowCalendar,
  date,
  setDate,
  showNotifications,
  setShowNotifications,
  unreadNotifications,
  handleLogout,
  setCurrentPage,
  user,
}) => {
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // Get user initials for avatar
  const getUserInitials = () => {
    if (user?.firstName && user?.lastName) {
      return `${user.firstName.charAt(0)}${user.lastName.charAt(
        0
      )}`.toUpperCase();
    } else if (user?.email) {
      return user.email.charAt(0).toUpperCase();
    }
    return "U"; // Default fallback
  };

  // Get user display name
  const getUserDisplayName = () => {
    if (user?.firstName && user?.lastName) {
      return `${user.firstName} ${user.lastName}`;
    } else if (user?.email) {
      return user.email.split("@")[0]; // Use email username part
    }
    return "User";
  };

  // Get avatar color based on role
  const getAvatarColor = () => {
    switch (user?.role?.toLowerCase()) {
      case "admin":
        return "bg-gradient-to-br from-red-600 to-red-700";
      case "moderator":
        return "bg-gradient-to-br from-blue-600 to-blue-700";
      case "user":
        return "bg-gradient-to-br from-green-600 to-green-700";
      default:
        return "bg-gradient-to-br from-green-700 to-blue-700";
    }
  };

  return (
    <header className="h-16 bg-[#1a1a1a] border-b border-[#333333] flex items-center justify-between px-4">
      <div className="flex items-center md:hidden">
        <button
          onClick={toggleSidebar}
          className="md:hidden text-white text-xl"
        >
          <i className="fas fa-bars"></i>
        </button>
        <img
          src="https://readdy.ai/api/search-image?query=Modern%20minimalist%20agriculture%20and%20fisheries%20logo%20design%20with%20a%20stylized%20leaf%20and%20fish%20icon%20in%20gradient%20green%20and%20blue%20colors%20on%20a%20dark%20background%2C%20professional%20and%20clean%20design%2C%20suitable%20for%20government%20agency&width=32&height=32&seq=15&orientation=squarish"
          alt="AgriTech Logo"
          className="h-8 w-8 ml-3"
        />
      </div>
      <div className="hidden md:flex items-center"></div>
      <div className="flex items-center space-x-4">
        <div className="relative">
          {showNotifications && (
            <div className="absolute right-0 mt-2 w-80 z-10 bg-[#252525] border border-[#333333] rounded-md shadow-lg">
              <div className="p-3 border-b border-[#333333] flex items-center justify-between">
                <h3 className="font-medium text-white">Notifications</h3>
                <button className="text-xs text-blue-400 hover:text-blue-300">
                  Mark all as read
                </button>
              </div>
              <ScrollArea className="h-64">
                <div className="p-2">
                  {[
                    {
                      title: "New Registration",
                      message: "Juan Dela Cruz registered as a farmer",
                      time: "5 hours ago",
                      read: false,
                    },
                    {
                      title: "Export Completed",
                      message: "Your data export is ready for download",
                      time: "1 day ago",
                      read: false,
                    },
                    {
                      title: "Import Completed",
                      message: "Successfully imported 120 records",
                      time: "2 days ago",
                      read: true,
                    },
                    {
                      title: "User Created",
                      message: "New user Maria Santos was created",
                      time: "3 days ago",
                      read: true,
                    },
                  ].map((notification, index) => (
                    <div
                      key={index}
                      className={`p-2 hover:bg-[#333333] rounded-md mb-1 cursor-pointer ${
                        notification.read ? "" : "bg-[#1e293b]/30"
                      }`}
                    >
                      <div className="flex items-start">
                        <div
                          className={`h-8 w-8 rounded-full flex items-center justify-center mr-2 ${
                            notification.read
                              ? "bg-[#333333]"
                              : "bg-blue-900/50"
                          }`}
                        >
                          <i
                            className={`fas ${
                              notification.title.includes("Pinmark")
                                ? "fa-map-marker-alt text-orange-400"
                                : notification.title.includes("Registration")
                                ? "fa-user-plus text-green-400"
                                : notification.title.includes("Export")
                                ? "fa-file-export text-blue-400"
                                : notification.title.includes("Import")
                                ? "fa-file-import text-purple-400"
                                : notification.title.includes("System")
                                ? "fa-cog text-gray-400"
                                : notification.title.includes("User")
                                ? "fa-user text-yellow-400"
                                : "fa-chart-bar text-red-400"
                            }`}
                          ></i>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-white">
                            {notification.title}
                          </p>
                          <p className="text-xs text-gray-400">
                            {notification.message}
                          </p>
                          <p className="text-xs text-gray-500 mt-1">
                            {notification.time}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>
              <div className="p-2 border-t border-[#333333] text-center">
                <button className="text-sm text-blue-400 hover:text-blue-300">
                  View all notifications
                </button>
              </div>
            </div>
          )}
        </div>
        <div className="text-gray-400 text-sm hidden md:block">
          <span className="mr-2">
            {currentTime.toLocaleDateString("en-US", {
              weekday: "short",
              month: "short",
              day: "numeric",
              year: "numeric",
            })}
          </span>
          <span>
            {currentTime.toLocaleTimeString("en-US", {
              hour: "2-digit",
              minute: "2-digit",
            })}
          </span>
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="cursor-pointer">
              <Avatar className="h-8 w-8 outline-1 outline-gray-400">
                <AvatarFallback
                  className={`${getAvatarColor()} text-white text-xs font-semibold`}
                >
                  {getUserInitials()}
                </AvatarFallback>
              </Avatar>
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-56 bg-[#252525] border-[#333333] text-white">
            <div className="p-2 border-b border-[#333333]">
              <p className="font-medium break-words leading-tight">
                {getUserDisplayName()}
              </p>
              <p className="text-xs text-gray-400 break-all">
                {user?.email || "No email"}
              </p>
              <div className="flex items-center space-x-2 mt-1">
                {user?.role === "admin" && (
                  <span className="text-xs bg-red-600 text-red-100 px-1 rounded">
                    Admin
                  </span>
                )}
              </div>
            </div>
            <DropdownMenuItem className="cursor-pointer hover:bg-[#333333]">
              <i className="fas fa-user mr-2 text-gray-400"></i>
              <span>Profile</span>
            </DropdownMenuItem>
            <DropdownMenuItem
              className="cursor-pointer hover:bg-[#333333]"
              onClick={() => {
                setCurrentPage("settings"); // Navigate to Help page
              }}
            >
              <i className="fas fa-cog mr-2 text-gray-400"></i>
              <span>Settings</span>
            </DropdownMenuItem>
            <DropdownMenuItem
              className="cursor-pointer hover:bg-[#333333]"
              onClick={() => {
                setCurrentPage("help"); // Navigate to Help page
              }}
            >
              <i className="fas fa-question-circle mr-2 text-gray-400"></i>
              <span>Help</span>
            </DropdownMenuItem>
            <DropdownMenuItem
              className="cursor-pointer hover:bg-[#333333]"
              onClick={handleLogout}
            >
              <i className="fas fa-sign-out-alt mr-2 text-gray-400"></i>
              <span>Logout</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
};

export default TopNavigation;
