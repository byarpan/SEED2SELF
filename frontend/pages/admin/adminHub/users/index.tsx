import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/pages/api/auth/[...nextauth]";
import { GetServerSideProps } from "next";
import Head from "next/head";
import { 
  Users, 
  Search, 
  Filter, 
  ShieldCheck, 
  UserX, 
  CheckCircle2, 
  AlertTriangle, 
  Ban, 
  Eye, 
  Mail, 
  Phone, 
  Calendar,
  Lock,
  Wallet as WalletIcon,
  RefreshCw
} from "lucide-react";

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:5000";

export default function AdminUserManagement() {
  const { data: session } = useSession();
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [roleFilter, setRoleFilter] = useState("ALL");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedUser, setSelectedUser] = useState<any | null>(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const url = `${BACKEND_URL}/api/v1/admin/users?role=${roleFilter}&status=${statusFilter}&search=${encodeURIComponent(searchTerm)}`;
      const res = await fetch(url);
      if (res.ok) {
        const json = await res.json();
        setUsers(json.data || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [roleFilter, statusFilter]);

  const handleUpdateStatus = async (userId: string, newStatus: "ACTIVE" | "SUSPENDED" | "DISABLED") => {
    try {
      setActionLoading(true);
      setMessage(null);
      const res = await fetch(`${BACKEND_URL}/api/v1/admin/users/status`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, status: newStatus, reason: `Admin status update to ${newStatus}` }),
      });

      if (res.ok) {
        setMessage({ type: "success", text: `User account status updated to ${newStatus} successfully.` });
        fetchUsers();
        setSelectedUser(null);
      } else {
        const json = await res.json();
        setMessage({ type: "error", text: json.message || "Failed to update status." });
      }
    } catch (err) {
      setMessage({ type: "error", text: "Server error occurred while updating status." });
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-stone-950 text-stone-100 font-sans pb-24 pt-6 px-4 sm:px-6 lg:px-8 relative z-20">
      <Head>
        <title>User Management | Seed2Shelf</title>
      </Head>

      <div className="max-w-7xl mx-auto space-y-7">
        
        {/* HEADER */}
        <div className="flex items-center justify-between border-b border-stone-800/80 pb-4">
          <div className="flex items-center gap-3.5">
            <div className="p-3 bg-[#00d26a]/10 border border-[#00d26a]/20 rounded-2xl text-[#00d26a] shrink-0">
              <Users className="h-7 w-7" />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
                User Management
              </h1>
            </div>
          </div>

          <button 
            onClick={fetchUsers}
            title="Refresh Users"
            className="p-2.5 bg-stone-900 hover:bg-stone-800 border border-stone-800 rounded-2xl text-[#00d26a] hover:text-emerald-400 transition cursor-pointer flex items-center justify-center shrink-0 shadow-sm"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
          </button>
        </div>

        {message && (
          <div className={`p-4 rounded-2xl border text-xs font-bold flex items-center gap-2 ${message.type === "success" ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-400" : "bg-red-500/10 border-red-500/20 text-red-400"}`}>
            {message.type === "success" ? <CheckCircle2 className="w-5 h-5 shrink-0" /> : <AlertTriangle className="w-5 h-5 shrink-0" />}
            <span>{message.text}</span>
          </div>
        )}

        {/* SEARCH & FILTERS BAR */}
        <div className="flex flex-wrap items-center justify-between gap-3 bg-stone-900/90 border border-stone-800 rounded-2xl p-4 shadow-sm">
          
          {/* Search */}
          <div className="flex-1 min-w-[240px]">
            <div className="relative">
              <Search className="w-4 h-4 text-stone-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search by Name, Email, Phone, Farmer ID, Processor ID..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && fetchUsers()}
                className="w-full bg-stone-950 border border-stone-800 rounded-xl pl-10 pr-4 py-2 text-xs text-white placeholder-stone-500 focus:outline-none focus:border-[#00d26a]/50 transition"
              />
            </div>
          </div>

          {/* Role Filter */}
          <div className="flex items-center gap-2">
            <span className="text-xs text-stone-400 font-bold">Role:</span>
            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              className="bg-stone-950 border border-stone-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-[#00d26a]"
            >
              <option value="ALL">All Roles</option>
              <option value="FARMER">Farmer</option>
              <option value="PROCESSOR">Processor</option>
              <option value="DISTRIBUTOR">Distributor</option>
              <option value="RETAILER">Retailer</option>
              <option value="CUSTOMER">Customer</option>
            </select>
          </div>

          {/* Status Filter */}
          <div className="flex items-center gap-2">
            <span className="text-xs text-stone-400 font-bold">Status:</span>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="bg-stone-950 border border-stone-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-[#00d26a]"
            >
              <option value="ALL">All Statuses</option>
              <option value="ACTIVE">Active</option>
              <option value="SUSPENDED">Suspended</option>
              <option value="DISABLED">Disabled</option>
            </select>
          </div>

        </div>

        {/* USERS TABLE */}
        <div className="bg-stone-900/90 border border-stone-800 rounded-3xl overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-stone-800 bg-stone-950/60 text-stone-400 uppercase tracking-wider font-bold">
                  <th className="py-3.5 px-4">User Info</th>
                  <th className="py-3.5 px-4">Role & ID</th>
                  <th className="py-3.5 px-4">Contact</th>
                  <th className="py-3.5 px-4">KYC Status</th>
                  <th className="py-3.5 px-4">Account Status</th>
                  <th className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-800/60">
                {users.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-8 text-center text-stone-500 font-medium">
                      No matching platform users found.
                    </td>
                  </tr>
                ) : (
                  users.map((u) => (
                    <tr key={u._id || u.id} className="hover:bg-stone-800/30 transition">
                      <td className="py-3.5 px-4">
                        <div className="font-bold text-white text-sm">{u.fullName || u.name}</div>
                        <div className="text-stone-400 text-[11px]">{u.email}</div>
                      </td>
                      <td className="py-3.5 px-4">
                        <span className="px-2 py-0.5 bg-stone-800 text-stone-200 border border-stone-700 rounded-md font-bold text-[10px] uppercase block w-fit">
                          {u.role}
                        </span>
                        <span className="text-[11px] text-emerald-400 font-mono mt-1 block">
                          {u.farmerId || u.processorId || u.adminId || u.userId || u._id}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-stone-300">
                        {u.phone || u.mobileNumber || "N/A"}
                      </td>
                      <td className="py-3.5 px-4">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-black uppercase border ${
                          u.verificationStatus === "APPROVED" ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/30" :
                          u.verificationStatus === "REJECTED" ? "bg-red-500/10 text-red-400 border-red-500/30" :
                          "bg-amber-500/10 text-amber-400 border-amber-500/30"
                        }`}>
                          {u.verificationStatus || "PENDING"}
                        </span>
                      </td>
                      <td className="py-3.5 px-4">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-black uppercase border ${
                          u.status === "SUSPENDED" ? "bg-amber-500/10 text-amber-400 border-amber-500/30" :
                          u.status === "DISABLED" ? "bg-red-500/10 text-red-400 border-red-500/30" :
                          "bg-emerald-500/10 text-emerald-400 border-emerald-500/30"
                        }`}>
                          {u.status || "ACTIVE"}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <button
                          onClick={() => setSelectedUser(u)}
                          className="px-3 py-1.5 bg-stone-950 hover:bg-stone-800 border border-stone-800 rounded-xl text-stone-300 font-bold transition flex items-center gap-1 ml-auto cursor-pointer"
                        >
                          <Eye className="w-3.5 h-3.5 text-[#00d26a]" />
                          <span>Manage</span>
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* MANAGE USER MODAL */}
        {selectedUser && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-950/80 backdrop-blur-md">
            <div className="bg-stone-900 border border-stone-800 rounded-3xl p-6 max-w-lg w-full space-y-5 shadow-2xl relative">
              <div className="flex items-center justify-between border-b border-stone-800 pb-3">
                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                  <Users className="w-5 h-5 text-[#00d26a]" />
                  Manage Account: {selectedUser.fullName || selectedUser.name}
                </h3>
                <button onClick={() => setSelectedUser(null)} className="text-stone-400 hover:text-white">✕</button>
              </div>

              <div className="space-y-2 text-xs text-stone-300">
                <p><strong>Email:</strong> {selectedUser.email}</p>
                <p><strong>Role:</strong> {selectedUser.role}</p>
                <p><strong>Role ID:</strong> {selectedUser.farmerId || selectedUser.processorId || selectedUser.adminId || "N/A"}</p>
                <p><strong>Current Status:</strong> <span className="text-emerald-400 font-bold">{selectedUser.status || "ACTIVE"}</span></p>
                <p><strong>KYC Status:</strong> <span className="text-amber-400 font-bold">{selectedUser.verificationStatus || "PENDING"}</span></p>
              </div>

              <div className="pt-3 border-t border-stone-800 space-y-2">
                <label className="text-xs font-bold text-stone-400 block uppercase">Change Account Status</label>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    disabled={actionLoading}
                    onClick={() => handleUpdateStatus(selectedUser._id || selectedUser.id, "ACTIVE")}
                    className="py-2.5 bg-emerald-600/20 hover:bg-emerald-600/30 border border-emerald-500/30 rounded-xl text-emerald-400 font-bold text-xs transition cursor-pointer"
                  >
                    Enable / Active
                  </button>
                  <button
                    disabled={actionLoading}
                    onClick={() => handleUpdateStatus(selectedUser._id || selectedUser.id, "SUSPENDED")}
                    className="py-2.5 bg-amber-600/20 hover:bg-amber-600/30 border border-amber-500/30 rounded-xl text-amber-400 font-bold text-xs transition cursor-pointer"
                  >
                    Suspend
                  </button>
                  <button
                    disabled={actionLoading}
                    onClick={() => handleUpdateStatus(selectedUser._id || selectedUser.id, "DISABLED")}
                    className="py-2.5 bg-red-600/20 hover:bg-red-600/30 border border-red-500/30 rounded-xl text-red-400 font-bold text-xs transition cursor-pointer"
                  >
                    Disable / Ban
                  </button>
                </div>
              </div>

              <div className="flex justify-end pt-2">
                <button onClick={() => setSelectedUser(null)} className="px-4 py-2 bg-stone-950 border border-stone-800 rounded-xl text-stone-400 text-xs font-bold">
                  Close
                </button>
              </div>
            </div>
          </div>
        )}

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
