import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/pages/api/auth/[...nextauth]";
import { GetServerSideProps } from "next";
import Head from "next/head";
import Link from "next/link";
import { 
  ShieldCheck, 
  Users, 
  UserCheck2, 
  Clock, 
  XCircle, 
  ClipboardList, 
  Truck, 
  ArrowLeftRight, 
  Wallet as WalletIcon, 
  HelpCircle, 
  BarChart3, 
  TrendingUp,
  Search,
  CheckCircle2,
  AlertTriangle,
  ChevronRight,
  RefreshCw,
  FileText
} from "lucide-react";

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:5000";

export default function AdminMainDashboard() {
  const { data: session } = useSession();

  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [searchResults, setSearchResults] = useState<any>(null);
  const [userViewMode, setUserViewMode] = useState<"OVERALL" | "ROLE_WISE">("OVERALL");
  const [selectedRoleFilter, setSelectedRoleFilter] = useState<string>("FARMER");

  const fetchStats = async () => {
    try {
      setLoading(true);
      const res = await fetch(`${BACKEND_URL}/api/v1/admin/dashboard`);
      if (res.ok) {
        const json = await res.json();
        if (json.success && json.data) {
          setStats(json.data);
        }
      }
    } catch (err) {
      console.warn("Backend metrics offline, using fallback", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
    // Poll stats every 5 seconds so when new users sign up, metrics automatically increment
    const interval = setInterval(() => {
      fetchStats();
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchTerm.trim()) {
      setSearchResults(null);
      return;
    }
    try {
      const res = await fetch(`${BACKEND_URL}/api/v1/admin/search?q=${encodeURIComponent(searchTerm)}`);
      if (res.ok) {
        const json = await res.json();
        setSearchResults(json.data);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const totalEcosystemUsers = stats?.users?.total || (
    (stats?.users?.farmers || 0) +
    (stats?.users?.processors || 0) +
    (stats?.users?.distributors || 0) +
    (stats?.users?.retailers || 0) +
    (stats?.users?.customers || 0)
  );

  const roleCardsData = [
    { key: "FARMER", label: "Farmers", count: stats?.users?.farmers || 0, desc: "Agricultural Producers", color: "text-emerald-400" },
    { key: "PROCESSOR", label: "Processors", count: stats?.users?.processors || 0, desc: "Factory & Processing Hubs", color: "text-emerald-400" },
    { key: "DISTRIBUTOR", label: "Distributors", count: stats?.users?.distributors || 0, desc: "Cold-Chain & Logistics", color: "text-blue-400" },
    { key: "RETAILER", label: "Retailers", count: stats?.users?.retailers || 0, desc: "Store & Supply Outlets", color: "text-purple-400" },
    { key: "CUSTOMER", label: "Consumers", count: stats?.users?.customers || 0, desc: "End Buyers & Consumers", color: "text-amber-400" },
  ];

  const currentRoleCard = roleCardsData.find((card) => card.key === selectedRoleFilter) || roleCardsData[0];

  return (
    <div className="min-h-screen bg-stone-950 text-stone-100 font-sans pb-24 pt-6 px-4 sm:px-6 lg:px-8 relative z-20">
      <Head>
        <title>Admin Dashboard | Seed2Shelf</title>
      </Head>

      <div className="fixed inset-0 bg-stone-950 z-[-1] pointer-events-none" />

      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* TOP HEADER */}
        <div className="flex items-center justify-between border-b border-stone-800/80 pb-5">
          <div className="flex items-center gap-3.5">
            <div className="p-3 bg-[#00d26a]/10 border border-[#00d26a]/20 rounded-2xl text-[#00d26a] shrink-0 shadow-inner">
              <ShieldCheck className="h-8 w-8" />
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              Admin Dashboard
            </h1>
          </div>

          <button 
            onClick={fetchStats}
            title="Refresh Metrics"
            className="p-2.5 bg-stone-900 hover:bg-stone-800 border border-stone-800 rounded-2xl text-[#00d26a] hover:text-emerald-400 transition cursor-pointer flex items-center justify-center shrink-0 shadow-sm"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
          </button>
        </div>

        {/* GLOBAL ADMIN SEARCH BAR */}
        <div className="bg-stone-900/90 border border-stone-800 rounded-2xl p-4 shadow-sm">
          <form onSubmit={handleSearch} className="flex gap-2">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-stone-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Global Search by Name, Email, Farmer ID, Processor ID, Order ID, Shipment ID, Wallet Address..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-stone-950 border border-stone-800 rounded-xl pl-10 pr-4 py-2.5 text-xs text-white placeholder-stone-500 focus:outline-none focus:border-[#00d26a]/50 transition"
              />
            </div>
            <button
              type="submit"
              className="px-5 py-2.5 bg-[#00d26a] hover:bg-emerald-500 text-stone-950 font-extrabold text-xs rounded-xl transition cursor-pointer"
            >
              Search
            </button>
          </form>

          {searchResults && (
            <div className="mt-4 pt-4 border-t border-stone-800/80 space-y-3 text-xs">
              <h3 className="font-bold text-emerald-400">Search Results</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
                <div className="p-3 bg-stone-950 rounded-xl border border-stone-800">
                  <span className="font-bold block text-stone-300">Users Found: {searchResults.users?.length || 0}</span>
                  {(searchResults.users || []).slice(0, 3).map((u: any, idx: number) => (
                    <div key={idx} className="mt-1 text-[11px] text-stone-400">
                      {u.fullName || u.name} ({u.role}) - {u.email}
                    </div>
                  ))}
                </div>
                <div className="p-3 bg-stone-950 rounded-xl border border-stone-800">
                  <span className="font-bold block text-stone-300">Orders Found: {searchResults.orders?.length || 0}</span>
                </div>
                <div className="p-3 bg-stone-950 rounded-xl border border-stone-800">
                  <span className="font-bold block text-stone-300">Shipments Found: {searchResults.shipments?.length || 0}</span>
                </div>
                <div className="p-3 bg-stone-950 rounded-xl border border-stone-800">
                  <span className="font-bold block text-stone-300">KYC Records: {searchResults.kycs?.length || 0}</span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* ECOSYSTEM USERS METRICS SECTION */}
        <div className="bg-stone-900/90 border border-stone-800 rounded-3xl p-6 space-y-5 shadow-sm">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-stone-800/80 pb-4">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-[#00d26a]/10 border border-[#00d26a]/20 rounded-xl text-[#00d26a]">
                <Users className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-lg font-extrabold text-white">Ecosystem Users</h2>
                <p className="text-xs text-stone-400">Registered ecosystem participants overview</p>
              </div>
            </div>

            {/* TOGGLE VIEW MODES: OVERALL vs ROLE-WISE */}
            <div className="flex flex-wrap items-center gap-2 self-start sm:self-auto">
              {userViewMode === "ROLE_WISE" && (
                <select
                  value={selectedRoleFilter}
                  onChange={(e) => setSelectedRoleFilter(e.target.value)}
                  className="bg-stone-950 border border-stone-800 rounded-xl px-3 py-1.5 text-xs text-white focus:outline-none focus:border-[#00d26a] transition font-bold"
                >
                  <option value="FARMER">Farmers</option>
                  <option value="PROCESSOR">Processors</option>
                  <option value="DISTRIBUTOR">Distributors</option>
                  <option value="RETAILER">Retailers</option>
                  <option value="CUSTOMER">Consumers</option>
                </select>
              )}

              <div className="flex items-center gap-1.5 bg-stone-950 p-1 rounded-xl border border-stone-800">
                <button
                  type="button"
                  onClick={() => setUserViewMode("OVERALL")}
                  className={`px-4 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
                    userViewMode === "OVERALL"
                      ? "bg-[#00d26a] text-stone-950 shadow-md"
                      : "text-stone-400 hover:text-white"
                  }`}
                >
                  Overall Users
                </button>
                <button
                  type="button"
                  onClick={() => setUserViewMode("ROLE_WISE")}
                  className={`px-4 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
                    userViewMode === "ROLE_WISE"
                      ? "bg-[#00d26a] text-stone-950 shadow-md"
                      : "text-stone-400 hover:text-white"
                  }`}
                >
                  Role-Wise Users
                </button>
              </div>
            </div>
          </div>

          {userViewMode === "OVERALL" ? (
            /* VIEW A: OVERALL USERS SUMMARY */
            <div className="bg-stone-950/60 border border-stone-800 rounded-2xl p-6 flex flex-col md:flex-row md:items-center justify-between gap-6">
              <div className="space-y-2">
                <span className="text-xs font-bold text-stone-400 uppercase tracking-wider block">
                  Total Active Ecosystem Users
                </span>
                <div className="text-4xl sm:text-5xl font-black text-white tracking-tight">
                  {totalEcosystemUsers}
                </div>
              </div>
            </div>
          ) : (
            /* VIEW B: ROLE-WISE SINGLE SELECTED ROLE CARD */
            <div className="space-y-4">
              <div className="max-w-md">
                <div className="p-5 bg-stone-950/60 border border-stone-800 rounded-2xl space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-extrabold text-stone-400 uppercase">{currentRoleCard.label}</span>
                    <span className={`text-[11px] font-bold ${currentRoleCard.color}`}>{currentRoleCard.desc}</span>
                  </div>
                  <div className="text-4xl font-black text-white block">
                    {currentRoleCard.count}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* QUICK NAVIGATION GRID (12 ADMIN MODULES) */}
        <div className="bg-stone-900/90 border border-stone-800 rounded-3xl p-6 space-y-5 shadow-sm">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-extrabold text-white flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-[#00d26a]" />
              Platform Administration Engine Modules
            </h2>
            <span className="text-xs text-stone-400">Strictly Non-Trading Management</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
            
            <Link href="/admin/adminHub/users" className="p-4 bg-stone-950/80 hover:bg-stone-900 border border-stone-800 hover:border-[#00d26a]/40 rounded-2xl space-y-2 transition cursor-pointer group">
              <div className="p-2.5 bg-[#00d26a]/10 text-[#00d26a] rounded-xl w-fit">
                <Users className="w-5 h-5" />
              </div>
              <h3 className="text-sm font-bold text-white group-hover:text-[#00d26a] transition">User Management</h3>
              <p className="text-[11px] text-stone-400">View, filter, disable, enable, or suspend user accounts across all roles.</p>
            </Link>

            <Link href="/admin/adminHub/kyc" className="p-4 bg-stone-950/80 hover:bg-stone-900 border border-stone-800 hover:border-[#00d26a]/40 rounded-2xl space-y-2 transition cursor-pointer group">
              <div className="p-2.5 bg-[#00d26a]/10 text-[#00d26a] rounded-xl w-fit">
                <UserCheck2 className="w-5 h-5" />
              </div>
              <h3 className="text-sm font-bold text-white group-hover:text-[#00d26a] transition">KYC Management</h3>
              <p className="text-[11px] text-stone-400">Universal KYC verification for Farmers, Processors, Distributors, & Retailers.</p>
            </Link>

            <Link href="/admin/adminHub/support" className="p-4 bg-stone-950/80 hover:bg-stone-900 border border-stone-800 hover:border-[#00d26a]/40 rounded-2xl space-y-2 transition cursor-pointer group">
              <div className="p-2.5 bg-cyan-500/10 text-cyan-400 rounded-xl w-fit">
                <HelpCircle className="w-5 h-5" />
              </div>
              <h3 className="text-sm font-bold text-white group-hover:text-[#00d26a] transition">Support Center</h3>
              <p className="text-[11px] text-stone-400">Manage user support tickets, respond to inquiries, & assign priorities.</p>
            </Link>

          </div>
        </div>

      </div>
    </div>
  );
}

export const getServerSideProps: GetServerSideProps = async (context) => {
  const session = await getServerSession(context.req, context.res, authOptions);
  if (!session || session.user.role !== "ADMIN") {
    return { redirect: { destination: "/auth/admin-login", permanent: false } };
  }
  return { props: {} };
};
