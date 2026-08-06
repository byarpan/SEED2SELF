import Link from "next/link";
import { useSession, signOut } from "next-auth/react";
import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import { motion, AnimatePresence } from "framer-motion";
import AuthModal from "../Modal/AuthModal";
import Sidebar from "../Sidebar/Sidebar";
import { 
  X, 
  Menu, 
  ChevronDown, 
  Home, 
  User, 
  Wallet as WalletIcon, 
  Sprout, 
  LogOut, 
  Package, 
  ClipboardList, 
  Truck, 
  BarChart3,
  LayoutDashboard,
  FileText,
  GitBranch,
  ShieldCheck,
  Bell,
  ArrowLeftRight,
  HelpCircle,
  Receipt
} from "lucide-react";

const getHubConfig = (role: string) => {
  switch (role) {
    case "FARMER":
      return {
        title: "Farmer Hub",
        basePath: "/farmer/farmerHub/dashboard",
        items: [
          { name: "Dashboard", url: "/farmer/farmerHub/dashboard", icon: LayoutDashboard },
          { name: "Harvest Hub", url: "/farmer/farmerHub/harvestHub", icon: Sprout },
          { name: "Orders", url: "/farmer/farmerHub/orders", icon: ClipboardList },
          { name: "Shipments", url: "/farmer/farmerHub/shipments", icon: Truck },
          { name: "Reports", url: "/farmer/farmerHub/reports", icon: FileText },
          { name: "Trace Produce", url: "/home/trace-product", icon: GitBranch }
        ]
      };
    case "PROCESSOR":
      return {
        title: "Processor Hub",
        basePath: "/processor/processorHub/dashboard",
        items: [
          { name: "Processor Dashboard", url: "/processor/processorHub/dashboard", icon: LayoutDashboard },
          { name: "Marketplace", url: "/processor/processorHub/marketplace", icon: Sprout },
          { name: "Production Hub", url: "/processor/processorHub/processedInventory", icon: Package },
          { name: "Incoming Orders", url: "/processor/processorHub/orders", icon: ClipboardList },
          { name: "Trace Produce", url: "/home/trace-product", icon: GitBranch }
        ]
      };
    case "ADMIN":
      return {
        title: "Admin Engine",
        basePath: "/admin/adminHub/dashboard",
        items: [
          { name: "Admin Dashboard", url: "/admin/adminHub/dashboard", icon: LayoutDashboard },
          { name: "User Management", url: "/admin/adminHub/users", icon: User },
          { name: "KYC Verification", url: "/admin/adminHub/kyc", icon: ShieldCheck },
          { name: "Orders & Shipments", url: "/admin/adminHub/orders", icon: ClipboardList },
          { name: "Payments & Escrow", url: "/admin/adminHub/payments", icon: ArrowLeftRight },
          { name: "Wallets Monitor", url: "/admin/adminHub/wallets", icon: WalletIcon },
          { name: "Support Center", url: "/admin/adminHub/support", icon: HelpCircle },
          { name: "Reports & Complaints", url: "/admin/adminHub/reports", icon: FileText },
          { name: "Analytics & Charts", url: "/admin/adminHub/analytics", icon: BarChart3 },
          { name: "System Audit Logs", url: "/admin/adminHub/audit-logs", icon: Receipt }
        ]
      };
    case "DISTRIBUTOR":
      return {
        title: "Distributor Hub",
        basePath: "/distributor",
        items: [
          { name: "Logistics Portal", hash: "", icon: Truck },
          { name: "Marketplace", url: "/customer/marketplace", icon: Package },
          { name: "In Transit Inventory", hash: "#inventory", icon: ClipboardList },
          { name: "Trace Lineage", url: "/home/trace-product", icon: GitBranch }
        ]
      };
    case "RETAILER":
      return {
        title: "Retailer Hub",
        basePath: "/retailer",
        items: [
          { name: "Retail Storefront", hash: "", icon: Home },
          { name: "Marketplace", url: "/customer/marketplace", icon: Package },
          { name: "Inventory", hash: "#inventory", icon: ClipboardList },
          { name: "Trace Lineage", url: "/home/trace-product", icon: GitBranch }
        ]
      };
    default:
      return null;
  }
};

export default function Navbar() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isSignUpMode, setIsSignUpMode] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);
  const [showLogoutModal, setShowLogoutModal] = useState(false);

  const userRole = session?.user?.role;
  const isFarmer = userRole === "FARMER" || router.pathname.startsWith("/farmer");
  const isProcessor = userRole === "PROCESSOR" || router.pathname.startsWith("/processor");
  const isAdmin = userRole === "ADMIN" || router.pathname.startsWith("/admin");
  const isDistributor = userRole === "DISTRIBUTOR" || router.pathname.startsWith("/distributor");
  const isRetailer = userRole === "RETAILER" || router.pathname.startsWith("/retailer");
  const isPortalUser = isFarmer || isProcessor || isAdmin || isDistributor || isRetailer;
  const hubConfig = userRole ? getHubConfig(userRole) : null;
  const profileId = (session?.user as any)?.farmerId || (session?.user as any)?.processorId || (session?.user as any)?.adminId || session?.user?.id;
  const isAuthenticated = status === "authenticated";

  const [profilePhotoUrl, setProfilePhotoUrl] = useState<string | null>(null);

  useEffect(() => {
    const userId = session?.user?.id || session?.user?.email;
    if (userId) {
      if (session?.user?.image) {
        setProfilePhotoUrl(session.user.image);
      }

      const fetchUserData = async () => {
        try {
          const res = await fetch(`/api/users/${userId}`);
          if (res.ok) {
            const data = await res.json();
            if (data?.profilePhoto) {
              setProfilePhotoUrl(data.profilePhoto);
            }
          }
        } catch (err) {
          console.error("Error loading user profile photo:", err);
        }
      };

      fetchUserData();

      const handleProfileUpdate = (e: Event) => {
        const customEvent = e as CustomEvent;
        if (customEvent?.detail?.profilePhoto) {
          setProfilePhotoUrl(customEvent.detail.profilePhoto);
        } else {
          fetchUserData();
        }
      };

      window.addEventListener("profileUpdated", handleProfileUpdate);

      return () => {
        window.removeEventListener("profileUpdated", handleProfileUpdate);
      };
    }
  }, [session?.user?.id, session?.user?.email, session?.user?.image]);

  const [isVisible, setIsVisible] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;

      if (currentScrollY < 10) {
        setIsVisible(true);
      } else {
        if (currentScrollY > lastScrollY && currentScrollY > 50) {
          setIsVisible(false);
        } else if (currentScrollY < lastScrollY) {
          setIsVisible(true);
        }
      }

      setLastScrollY(currentScrollY);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, [lastScrollY]);

  const openModal = (signUp: boolean) => {
    setIsSignUpMode(signUp);
    setIsAuthModalOpen(true);
  };

  const handleLogoutConfirm = async () => {
    try {
      setShowLogoutModal(false);
      await signOut({ callbackUrl: "/" });
    } catch (err) {
      window.location.href = "/";
    }
  };

  return (
    <>
      <nav className={`fixed top-0 left-0 right-0 z-50 glass-navbar transition-transform duration-300 ease-in-out ${isVisible ? "translate-y-0" : "-translate-y-full"}`}>
        <div className="w-full px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            
            {/* Far Left Side: SaaS Logo Image */}
            <Link href={isAdmin ? "/admin/adminHub/dashboard" : isFarmer ? "/farmer" : isProcessor ? "/processor" : "/"} className="flex items-center group select-none">
              <img 
                src="/assets/icons/logo.png" 
                alt="Seed2Shelf Logo" 
                className="h-8 sm:h-9 md:h-10 w-auto object-contain transition-transform duration-200 group-hover:scale-[1.03]" 
              />
            </Link>

            {/* Middle Navigation - Rendered ONLY when authenticated and NOT Portal User */}
            {isAuthenticated && !isPortalUser && (
              <div className="hidden md:flex items-center gap-6 text-sm font-medium">
                <Link href="/" className={`transition-colors ${router.pathname === "/" ? "text-[#00d26a]" : "text-stone-300 hover:text-white"}`}>
                  Home
                </Link>

                <Link href="/customer/marketplace" className={`transition-colors ${router.pathname.includes("marketplace") ? "text-[#00d26a]" : "text-stone-300 hover:text-white"}`}>
                  Marketplace
                </Link>

                <Link href="/home/trace-product" className={`transition-colors ${router.pathname.includes("trace") ? "text-[#00d26a]" : "text-stone-300 hover:text-white"}`}>
                  Trace Produce
                </Link>

                {/* Dynamic Hub Link */}
                {hubConfig && (
                  <div className="relative">
                    <button 
                      onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                      className="flex items-center gap-1.5 text-stone-300 hover:text-white transition-colors py-2 cursor-pointer"
                    >
                      <span>{hubConfig.title}</span>
                      <ChevronDown className={`w-4 h-4 transition-transform ${isDropdownOpen ? "rotate-180" : ""}`} />
                    </button>

                    <AnimatePresence>
                      {isDropdownOpen && (
                        <motion.div 
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: 10 }}
                          className="absolute right-0 mt-2 w-56 bg-[#141415] border border-white/10 rounded-2xl shadow-2xl p-2 z-50 text-xs"
                        >
                          <Link 
                            href={hubConfig.basePath} 
                            onClick={() => setIsDropdownOpen(false)}
                            className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-stone-200 hover:bg-white/5 font-bold transition"
                          >
                            <Home className="w-4 h-4 text-[#00d26a]" />
                            <span>Dashboard Overview</span>
                          </Link>
                          
                          <div className="my-1 border-t border-white/5" />

                          {hubConfig.items.map((item, idx) => {
                            const Icon = item.icon;
                            const targetUrl = item.url || `${hubConfig.basePath}${item.hash}`;
                            return (
                              <Link 
                                key={idx} 
                                href={targetUrl}
                                onClick={() => setIsDropdownOpen(false)}
                                className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-stone-400 hover:text-stone-100 hover:bg-white/5 transition"
                              >
                                <Icon className="w-4 h-4 text-stone-400" />
                                <span>{item.name}</span>
                              </Link>
                            );
                          })}
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                )}

                {/* Admin Portal Link */}
                {userRole === "ADMIN" && (
                  <Link href="/admin" className="flex items-center gap-1 text-[#00d26a] font-bold hover:underline">
                    <ShieldCheck className="w-4 h-4" />
                    Admin KYC
                  </Link>
                )}
              </div>
            )}

            {/* Right Side Controls */}
            {isPortalUser ? (
              /* Portal Top Navbar Controls: ONLY Hamburger + Bell + Profile Avatar */
              <div className="flex items-center gap-3">
                
                {/* Hamburger Menu (Opens Right Drawer) */}
                <button
                  onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                  className="p-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-stone-300 hover:text-white transition cursor-pointer"
                  title="Open Navigation Menu"
                >
                  <Menu className="w-5 h-5 text-[#00d26a]" />
                </button>

                {/* Notification Bell */}
                <NotificationBell
                  userId={session?.user?.id || (session?.user as any)?.farmerId || (session?.user as any)?.processorId || "S2S-USR-000001"}
                  isOpen={isNotificationOpen}
                  onToggle={() => setIsNotificationOpen(!isNotificationOpen)}
                  onClose={() => setIsNotificationOpen(false)}
                />

                {/* Profile Avatar (For Farmer & Processor ONLY, NOT Admin) */}
                {!isAdmin && (
                  <Link
                    href={isAdmin ? "/admin" : isProcessor ? "/processor/profile" : isDistributor ? "/distributor/profile" : isRetailer ? "/retailer/profile" : "/farmer/profile"}
                    className="flex items-center gap-2 p-1 rounded-full border-2 border-[#00d26a]/40 hover:border-[#00d26a] transition cursor-pointer"
                    title="Profile"
                  >
                    <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-[#162a1e] to-[#254d33] flex items-center justify-center font-black text-sm text-[#00d26a] overflow-hidden">
                      {profilePhotoUrl ? (
                        <img src={profilePhotoUrl} alt="" className="w-full h-full object-cover" />
                      ) : session?.user?.image ? (
                        <img src={session.user.image} alt="" className="w-full h-full object-cover" />
                      ) : (
                        session?.user?.name ? session.user.name[0].toUpperCase() : "U"
                      )}
                    </div>
                  </Link>
                )}

              </div>
            ) : (
              /* Non-Farmer Top Navbar Controls */
              <div className="flex items-center gap-4">
                {status === "authenticated" && session?.user ? (
                  <div className="flex items-center gap-3">
                    <Link 
                      href={userRole ? `/${userRole.toLowerCase()}/wallet` : "/farmer/wallet"}
                      className="flex items-center gap-1.5 bg-white/5 hover:bg-white/10 border border-white/10 px-3 py-1.5 rounded-xl text-xs font-bold text-stone-200 transition"
                    >
                      <WalletIcon className="w-3.5 h-3.5 text-[#00d26a]" />
                      <span>Wallet</span>
                    </Link>

                    {profileId && userRole !== "ADMIN" && (
                      <Link 
                        href={userRole ? `/${userRole.toLowerCase()}/profile` : `/profile/${profileId}`}
                        className="flex items-center gap-1.5 bg-white/5 hover:bg-white/10 border border-white/10 px-3 py-1.5 rounded-xl text-xs font-bold text-stone-200 transition"
                      >
                        <User className="w-3.5 h-3.5 text-stone-300" />
                        <span>Profile</span>
                      </Link>
                    )}

                    <button 
                      onClick={() => setShowLogoutModal(true)}
                      className="flex items-center gap-1.5 bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20 px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer"
                    >
                      <LogOut className="w-3.5 h-3.5" />
                      <span>Logout</span>
                    </button>
                  </div>
                ) : (
                  /* Single Segmented Pill Control for Authentication */
                  <div className="bg-white/5 border border-white/10 p-1 rounded-full flex items-center shadow-inner">
                    <button 
                      onClick={() => openModal(false)}
                      className="px-4 py-1.5 rounded-full text-xs font-bold text-stone-300 hover:text-white transition cursor-pointer"
                    >
                      Log In
                    </button>
                    <span className="text-white/20 text-xs font-light px-0.5">|</span>
                    <button 
                      onClick={() => openModal(true)}
                      className="px-4 py-1.5 rounded-full text-xs font-extrabold bg-[#00d26a] hover:bg-[#00b25a] text-black transition shadow-md shadow-[#00d26a]/20 cursor-pointer"
                    >
                      Sign Up
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* Mobile Hamburger (for Non-Farmer) */}
            {!isFarmer && (
              <div className="md:hidden flex items-center">
                <button 
                  onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                  className="text-stone-300 hover:text-white p-2"
                >
                  {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
                </button>
              </div>
            )}

          </div>
        </div>
      </nav>

      {/* Render Portal Sidebar (Farmer & Processor) */}
      {isPortalUser && (
        <Sidebar
          isOpen={isSidebarOpen}
          onClose={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Auth Modal */}
      <AuthModal 
        isOpen={isAuthModalOpen} 
        onClose={() => setIsAuthModalOpen(false)} 
        initialModeIsSignUp={isSignUpMode} 
      />

      {/* Logout Confirmation Modal */}
      <AnimatePresence>
        {showLogoutModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowLogoutModal(false)}
              className="absolute inset-0 bg-stone-950/80 backdrop-blur-xl"
            />
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="relative z-10 bg-stone-900/95 border border-stone-800 p-7 rounded-3xl max-w-sm w-full text-center space-y-5 shadow-2xl shadow-black/80 overflow-hidden"
            >
              {/* Subtle Ambient Red Glow */}
              <div className="absolute -top-12 -right-12 w-32 h-32 bg-red-500/10 rounded-full blur-3xl pointer-events-none" />

              <div className="w-14 h-14 rounded-2xl bg-red-500/10 text-red-400 border border-red-500/20 flex items-center justify-center mx-auto shadow-inner">
                <LogOut className="w-6 h-6" />
              </div>
              
              <div className="space-y-1.5">
                <h3 className="text-xl font-extrabold text-white tracking-tight">Confirm Logout</h3>
                <p className="text-stone-400 text-xs font-medium leading-relaxed">
                  Are you sure you want to end your current session?
                </p>
              </div>

              <div className="flex items-center gap-3 pt-1">
                <button
                  onClick={() => setShowLogoutModal(false)}
                  className="flex-1 py-3 px-4 bg-stone-950 hover:bg-stone-800 border border-stone-800 rounded-xl text-xs font-bold text-stone-300 transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  onClick={handleLogoutConfirm}
                  className="flex-1 py-3 px-4 bg-red-600 hover:bg-red-500 text-white rounded-xl text-xs font-black transition shadow-lg shadow-red-950/40 cursor-pointer flex items-center justify-center gap-1.5"
                >
                  <span>Yes, Log Out</span>
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:5000";

function NotificationBell({ userId, isOpen, onToggle, onClose }: { userId: string; isOpen: boolean; onToggle: () => void; onClose: () => void }) {
  const [notifications, setNotifications] = useState<any[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const res = await fetch(`${BACKEND_URL}/api/v1/notifications?userId=${userId}`);
        if (res.ok) {
          const json = await res.json();
          if (json.success && Array.isArray(json.data)) {
            setNotifications(json.data);
            setUnreadCount(json.unreadCount || 0);
          }
        }
      } catch (err) {
        console.warn("Notifications API unreachable, utilizing empty fallback", err);
      }
    };

    fetchNotifications();
    const interval = setInterval(fetchNotifications, 15000);
    return () => clearInterval(interval);
  }, [userId]);

  const handleMarkAllRead = async () => {
    try {
      setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
      setUnreadCount(0);
      await fetch(`${BACKEND_URL}/api/v1/notifications/read-all?userId=${encodeURIComponent(userId)}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId }),
      });
    } catch (err) {
      console.warn("Failed to mark all as read", err);
    }
  };

  const handleMarkSingleRead = async (id: string) => {
    try {
      setNotifications(prev => prev.map(n => n.id === id ? { ...n, isRead: true } : n));
      setUnreadCount(prev => Math.max(0, prev - 1));
      await fetch(`${BACKEND_URL}/api/v1/notifications/${id}/read?userId=${encodeURIComponent(userId)}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId }),
      });
    } catch (err) {
      console.warn("Failed to mark single notification as read", err);
    }
  };

  return (
    <div className="relative">
      <button
        onClick={onToggle}
        className="p-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-stone-300 hover:text-white transition cursor-pointer relative"
        title="Notifications"
      >
        <Bell className="w-5 h-5 text-stone-300" />
        {unreadCount > 0 && (
          <span className="absolute top-1.5 right-1.5 w-2.5 h-2.5 bg-emerald-500 rounded-full animate-pulse flex items-center justify-center text-[8px] text-black font-black">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            className="absolute right-0 mt-3 w-80 bg-[#141415] border border-white/10 rounded-2xl shadow-2xl p-4 z-50 text-xs"
          >
            <div className="flex justify-between items-center pb-2 border-b border-white/10 mb-3">
              <span className="font-bold text-white">Notifications{unreadCount > 0 ? ` (${unreadCount} Unread)` : ""}</span>
              <div className="flex items-center gap-2">
                {unreadCount > 0 && (
                  <button onClick={handleMarkAllRead} className="text-[10px] text-emerald-400 font-bold hover:underline cursor-pointer">
                    Mark All Read
                  </button>
                )}
                <button onClick={onClose} className="text-stone-400 hover:text-white cursor-pointer">
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            <div className="space-y-2.5 max-h-72 overflow-y-auto pr-1">
              {notifications.length === 0 ? (
                <div className="py-6 text-center text-stone-400 text-xs italic">
                  No notifications available.
                </div>
              ) : (
                notifications.map((n) => (
                  <div
                    key={n.id}
                    onClick={() => handleMarkSingleRead(n.id)}
                    className={`p-3 rounded-xl border transition cursor-pointer ${
                      n.isRead ? "bg-stone-950 border-stone-800/80 text-stone-400" : "bg-stone-900 border-emerald-500/30 text-white font-medium hover:border-emerald-500/60"
                    }`}
                  >
                    <div className="flex items-center justify-between font-bold text-xs mb-1">
                      <span>{n.title}</span>
                      <span className="text-[9px] text-stone-500">{new Date(n.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                    </div>
                    <p className="text-[11px] text-stone-300 leading-snug">{n.message}</p>
                  </div>
                ))
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
