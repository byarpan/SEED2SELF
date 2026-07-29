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
  const adminId = (session?.user as any)?.adminId || "S2S-ADM-000001";

  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [searchResults, setSearchResults] = useState<any>(null);

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

  return (
    <div className="min-h-screen bg-stone-950 text-stone-100 font-sans pb-24 pt-6 px-4 sm:px-6 lg:px-8 relative z-20">
      <Head>
        <title>Admin Engine Dashboard | Seed2Shelf</title>
      </Head>

      <div className="fixed inset-0 bg-stone-950 z-[-1] pointer-events-none" />

      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* TOP HEADER */}
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-stone-800/80 pb-5">
          <div className="flex items-center gap-3.5">
            <div className="p-3 bg-[#00d26a]/10 border border-[#00d26a]/20 rounded-2xl text-[#00d26a] shrink-0 shadow-inner">
              <ShieldCheck className="h-8 w-8" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
                  Admin Platform Engine
                </h1>
                <span className="px-2.5 py-0.5 bg-[#00d26a]/15 text-[#00d26a] border border-[#00d26a]/30 rounded-full text-[10px] font-black uppercase tracking-wider">
                  {adminId}
                </span>
              </div>
              <p className="text-xs text-stone-400 font-medium">System governance, universal KYC verification, & ecosystem control</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button 
              onClick={fetchStats}
              className="p-2.5 bg-stone-900 hover:bg-stone-800 border border-stone-800 rounded-xl text-stone-300 transition cursor-pointer flex items-center gap-2 text-xs font-bold"
            >
              <RefreshCw className={`w-4 h-4 text-[#00d26a] ${loading ? "animate-spin" : ""}`} />
              <span>Refresh Metrics</span>
            </button>
          </div>
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

        {/* METRICS CARDS (EXACT FARMER DASHBOARD UI DESIGN) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          
          {/* Card 1: Users */}
          <div className="p-5 bg-stone-900/90 border border-stone-800 rounded-2xl space-y-3 hover:border-[#00d26a]/30 transition duration-300 shadow-sm">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-black text-stone-400 uppercase tracking-wider">Ecosystem Users</span>
              <div className="p-2 bg-stone-950 border border-stone-800 rounded-xl text-[#00d26a]">
                <Users className="w-4 h-4" />
              </div>
            </div>
            <div>
              <p className="text-3xl font-extrabold text-white tracking-tight">{stats?.users?.total || 0}</p>
              <div className="text-[11px] text-stone-400 mt-1 flex flex-wrap gap-2">
                <span>Farmers: <strong className="text-white">{stats?.users?.farmers || 0}</strong></span>
                <span>Processors: <strong className="text-white">{stats?.users?.processors || 0}</strong></span>
              </div>
            </div>
          </div>

          {/* Card 2: Universal KYC */}
          <div className="p-5 bg-stone-900/90 border border-stone-800 rounded-2xl space-y-3 hover:border-[#00d26a]/30 transition duration-300 shadow-sm">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-black text-stone-400 uppercase tracking-wider">Pending KYC</span>
              <div className="p-2 bg-amber-500/10 border border-amber-500/20 rounded-xl text-amber-400">
                <Clock className="w-4 h-4" />
              </div>
            </div>
            <div>
              <p className="text-3xl font-extrabold text-amber-400 tracking-tight">{stats?.kyc?.pending || 0}</p>
              <div className="text-[11px] text-stone-400 mt-1 flex gap-2">
                <span>Approved: <strong className="text-emerald-400">{stats?.kyc?.approved || 0}</strong></span>
                <span>Rejected: <strong className="text-red-400">{stats?.kyc?.rejected || 0}</strong></span>
              </div>
            </div>
          </div>

          {/* Card 3: Active Operations */}
          <div className="p-5 bg-stone-900/90 border border-stone-800 rounded-2xl space-y-3 hover:border-[#00d26a]/30 transition duration-300 shadow-sm">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-black text-stone-400 uppercase tracking-wider">Active Operations</span>
              <div className="p-2 bg-stone-950 border border-stone-800 rounded-xl text-[#00d26a]">
                <Truck className="w-4 h-4" />
              </div>
            </div>
            <div>
              <p className="text-3xl font-extrabold text-white tracking-tight">{stats?.operations?.activeOrders || 0}</p>
              <div className="text-[11px] text-stone-400 mt-1 flex gap-2">
                <span>In-Transit Shipments: <strong className="text-white">{stats?.operations?.activeShipments || 0}</strong></span>
              </div>
            </div>
          </div>

          {/* Card 4: Escrow & Wallets */}
          <div className="p-5 bg-stone-900/90 border border-stone-800 rounded-2xl space-y-3 hover:border-[#00d26a]/30 transition duration-300 shadow-sm">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-black text-stone-400 uppercase tracking-wider">Locked Escrow</span>
              <div className="p-2 bg-stone-950 border border-stone-800 rounded-xl text-[#00d26a]">
                <ArrowLeftRight className="w-4 h-4" />
              </div>
            </div>
            <div>
              <p className="text-3xl font-extrabold text-[#00d26a] tracking-tight">₹ {(stats?.operations?.totalEscrowLocked || 0).toLocaleString("en-IN")}</p>
              <div className="text-[11px] text-stone-400 mt-1">
                <span>Platform Wallet Total: <strong className="text-white">₹ {(stats?.operations?.totalWalletBalance || 0).toLocaleString("en-IN")}</strong></span>
              </div>
            </div>
          </div>

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

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            
            <Link href="/admin/adminHub/users" className="p-4 bg-stone-950/80 hover:bg-stone-900 border border-stone-800 hover:border-[#00d26a]/40 rounded-2xl space-y-2 transition cursor-pointer group">
              <div className="p-2.5 bg-[#00d26a]/10 text-[#00d26a] rounded-xl w-fit">
                <Users className="w-5 h-5" />
              </div>
              <h3 className="text-sm font-bold text-white group-hover:text-[#00d26a] transition">User Management</h3>
              <p className="text-[11px] text-stone-400">View, filter, disable, enable, or suspend user accounts across all roles.</p>
            </Link>

            <Link href="/admin/adminHub/kyc" className="p-4 bg-stone-950/80 hover:bg-stone-900 border border-stone-800 hover:border-[#00d26a]/40 rounded-2xl space-y-2 transition cursor-pointer group">
              <div className="p-2.5 bg-amber-500/10 text-amber-400 rounded-xl w-fit">
                <UserCheck2 className="w-5 h-5" />
              </div>
              <h3 className="text-sm font-bold text-white group-hover:text-[#00d26a] transition">KYC Verification</h3>
              <p className="text-[11px] text-stone-400">Universal KYC verification for Farmers, Processors, Distributors, & Retailers.</p>
            </Link>

            <Link href="/admin/adminHub/orders" className="p-4 bg-stone-950/80 hover:bg-stone-900 border border-stone-800 hover:border-[#00d26a]/40 rounded-2xl space-y-2 transition cursor-pointer group">
              <div className="p-2.5 bg-blue-500/10 text-blue-400 rounded-xl w-fit">
                <ClipboardList className="w-5 h-5" />
              </div>
              <h3 className="text-sm font-bold text-white group-hover:text-[#00d26a] transition">Orders & Shipments</h3>
              <p className="text-[11px] text-stone-400">Monitor active orders, dispatch statuses, and supply chain logistics.</p>
            </Link>

            <Link href="/admin/adminHub/payments" className="p-4 bg-stone-950/80 hover:bg-stone-900 border border-stone-800 hover:border-[#00d26a]/40 rounded-2xl space-y-2 transition cursor-pointer group">
              <div className="p-2.5 bg-emerald-500/10 text-emerald-400 rounded-xl w-fit">
                <ArrowLeftRight className="w-5 h-5" />
              </div>
              <h3 className="text-sm font-bold text-white group-hover:text-[#00d26a] transition">Payments & Escrow</h3>
              <p className="text-[11px] text-stone-400">Inspect locked escrow protection funds and payment gateways.</p>
            </Link>

            <Link href="/admin/adminHub/wallets" className="p-4 bg-stone-950/80 hover:bg-stone-900 border border-stone-800 hover:border-[#00d26a]/40 rounded-2xl space-y-2 transition cursor-pointer group">
              <div className="p-2.5 bg-purple-500/10 text-purple-400 rounded-xl w-fit">
                <WalletIcon className="w-5 h-5" />
              </div>
              <h3 className="text-sm font-bold text-white group-hover:text-[#00d26a] transition">Wallets Monitor</h3>
              <p className="text-[11px] text-stone-400">Audit user balances, on-chain wallet addresses, & transactions.</p>
            </Link>

            <Link href="/admin/adminHub/support" className="p-4 bg-stone-950/80 hover:bg-stone-900 border border-stone-800 hover:border-[#00d26a]/40 rounded-2xl space-y-2 transition cursor-pointer group">
              <div className="p-2.5 bg-cyan-500/10 text-cyan-400 rounded-xl w-fit">
                <HelpCircle className="w-5 h-5" />
              </div>
              <h3 className="text-sm font-bold text-white group-hover:text-[#00d26a] transition">Support Center</h3>
              <p className="text-[11px] text-stone-400">Manage user support tickets, respond to inquiries, & assign priorities.</p>
            </Link>

            <Link href="/admin/adminHub/reports" className="p-4 bg-stone-950/80 hover:bg-stone-900 border border-stone-800 hover:border-[#00d26a]/40 rounded-2xl space-y-2 transition cursor-pointer group">
              <div className="p-2.5 bg-red-500/10 text-red-400 rounded-xl w-fit">
                <FileText className="w-5 h-5" />
              </div>
              <h3 className="text-sm font-bold text-white group-hover:text-[#00d26a] transition">Reports & Complaints</h3>
              <p className="text-[11px] text-stone-400">Handle reported users, fraud alerts, & supply chain disputes.</p>
            </Link>

            <Link href="/admin/adminHub/analytics" className="p-4 bg-stone-950/80 hover:bg-stone-900 border border-stone-800 hover:border-[#00d26a]/40 rounded-2xl space-y-2 transition cursor-pointer group">
              <div className="p-2.5 bg-indigo-500/10 text-indigo-400 rounded-xl w-fit">
                <BarChart3 className="w-5 h-5" />
              </div>
              <h3 className="text-sm font-bold text-white group-hover:text-[#00d26a] transition">Analytics & Charts</h3>
              <p className="text-[11px] text-stone-400">View real-time ecosystem analytics, user growth, & revenue trends.</p>
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
