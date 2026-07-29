import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/pages/api/auth/[...nextauth]";
import { GetServerSideProps } from "next";
import Head from "next/head";
import { 
  ShieldCheck, 
  User, 
  MapPin, 
  Sprout, 
  CheckCircle2, 
  XCircle, 
  AlertCircle, 
  Eye, 
  ExternalLink,
  ChevronRight,
  UserCheck2,
  Download,
  Clock,
  RotateCcw,
  RefreshCw,
  AlertTriangle
} from "lucide-react";

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:5000";

export default function UniversalKYCVerification() {
  const { data: session } = useSession();
  const [kycList, setKycList] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [selectedKyc, setSelectedKyc] = useState<any | null>(null);
  const [rejectionReason, setRejectionReason] = useState("");
  const [actionNotes, setActionNotes] = useState("");
  const [actionLoading, setActionLoading] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const fetchKycList = async () => {
    try {
      setLoading(true);
      let items: any[] = [];

      // 1. Fetch from local Next.js API (SQLite database)
      try {
        const localRes = await fetch('/api/admin/kyc');
        if (localRes.ok) {
          const data = await localRes.json();
          items = Array.isArray(data) ? data : [];
        }
      } catch (e) {
        console.error("Local KYC API fetch error", e);
      }

      // 2. Fetch from Express Backend (MongoDB) if available
      try {
        const backendRes = await fetch(`${BACKEND_URL}/api/v1/admin/kyc?status=${statusFilter}`);
        if (backendRes.ok) {
          const json = await backendRes.json();
          const mongoItems = json.data || [];
          const existingIds = new Set(items.map((i: any) => i.id || i._id));
          for (const m of mongoItems) {
            if (!existingIds.has(m.id || m._id)) {
              items.push(m);
            }
          }
        }
      } catch (e) {
        // Express backend optional
      }

      // 3. Filter by selected status
      if (statusFilter !== "ALL") {
        items = items.filter((item: any) => {
          const st = (item.kycStatus || item.verificationStatus || "").toUpperCase();
          if (statusFilter === "PENDING") return st.includes("PENDING") || (!st.includes("VERIFIED") && !st.includes("APPROVED") && !st.includes("REJECTED"));
          if (statusFilter === "APPROVED" || statusFilter === "VERIFIED") return st.includes("VERIFIED") || st.includes("APPROVED");
          if (statusFilter === "REJECTED") return st.includes("REJECTED");
          return true;
        });
      }

      setKycList(items);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchKycList();
  }, [statusFilter]);

  const handleDecision = async (userObj: any, decision: "APPROVED" | "REJECTED" | "RE_UPLOAD_REQUESTED") => {
    const targetId = userObj?.id || userObj?._id || (typeof userObj?.userId === "object" ? (userObj.userId?._id || userObj.userId?.id) : userObj?.userId);

    if (!targetId) {
      setMessage({ type: "error", text: "Invalid user ID for KYC evaluation." });
      return;
    }

    if (decision === "REJECTED" && !rejectionReason.trim()) {
      setMessage({ type: "error", text: "Please provide a rejection reason." });
      return;
    }

    try {
      setActionLoading(true);
      setMessage(null);

      const actionName = decision === "APPROVED" ? "APPROVE" : decision === "RE_UPLOAD_REQUESTED" ? "RE_UPLOAD" : "REJECT";

      // 1. Update local Next.js API (SQLite database)
      const localRes = await fetch("/api/admin/kyc", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: targetId,
          action: actionName,
          reason: decision === "REJECTED" ? rejectionReason : actionNotes || rejectionReason,
        }),
      });

      // 2. Update Express Backend (MongoDB)
      try {
        await fetch(`${BACKEND_URL}/api/v1/admin/kyc/verify`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            userId: targetId,
            decision,
            rejectionReason: decision === "REJECTED" ? rejectionReason : null,
            notes: actionNotes,
          }),
        });
      } catch (e) {}

      if (localRes.ok) {
        setMessage({ type: "success", text: `KYC evaluation submitted as '${decision}' successfully!` });
        setSelectedKyc(null);
        setRejectionReason("");
        setActionNotes("");
        fetchKycList();
      } else {
        const json = await localRes.json();
        setMessage({ type: "error", text: json.message || "Failed to submit decision." });
      }
    } catch (err) {
      setMessage({ type: "error", text: "Server error during KYC verification." });
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-stone-950 text-stone-100 font-sans pb-24 pt-6 px-4 sm:px-6 lg:px-8 relative z-20">
      <Head>
        <title>Universal KYC Verification | Admin Engine | Seed2Shelf</title>
      </Head>

      <div className="max-w-7xl mx-auto space-y-7">
        
        {/* HEADER */}
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-stone-800/80 pb-4">
          <div className="flex items-center gap-3.5">
            <div className="p-3 bg-amber-500/10 border border-amber-500/20 rounded-2xl text-amber-400 shrink-0">
              <UserCheck2 className="h-7 w-7" />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
                Universal KYC Verification
              </h1>
              <p className="text-xs text-stone-400 font-medium">Verify Aadhaar, PAN, farm credentials, and business licenses for Farmers, Processors, Distributors, & Retailers</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="bg-stone-950 border border-stone-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-[#00d26a]"
            >
              <option value="ALL">All KYC Statuses</option>
              <option value="PENDING">Pending</option>
              <option value="APPROVED">Approved</option>
              <option value="REJECTED">Rejected</option>
            </select>
            <button 
              onClick={fetchKycList}
              className="p-2.5 bg-stone-900 hover:bg-stone-800 border border-stone-800 rounded-xl text-stone-300 transition cursor-pointer flex items-center gap-2 text-xs font-bold"
            >
              <RefreshCw className={`w-4 h-4 text-[#00d26a] ${loading ? "animate-spin" : ""}`} />
              <span>Refresh KYC</span>
            </button>
          </div>
        </div>

        {message && (
          <div className={`p-4 rounded-2xl border text-xs font-bold flex items-center gap-2 ${message.type === "success" ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-400" : "bg-red-500/10 border-red-500/20 text-red-400"}`}>
            {message.type === "success" ? <CheckCircle2 className="w-5 h-5 shrink-0" /> : <AlertTriangle className="w-5 h-5 shrink-0" />}
            <span>{message.text}</span>
          </div>
        )}

        {/* KYC APPLICATIONS LIST */}
        <div className="bg-stone-900/90 border border-stone-800 rounded-3xl overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-stone-800 bg-stone-950/60 text-stone-400 uppercase tracking-wider font-bold">
                  <th className="py-3.5 px-4">Applicant</th>
                  <th className="py-3.5 px-4">Role & ID</th>
                  <th className="py-3.5 px-4">Aadhaar / ID</th>
                  <th className="py-3.5 px-4">Submission Date</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-800/60">
                {kycList.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-8 text-center text-stone-500 font-medium">
                      No KYC applications found for this filter.
                    </td>
                  </tr>
                ) : (
                  kycList.map((k) => {
                    const u = k.userId || {};
                    return (
                      <tr key={k._id || k.id} className="hover:bg-stone-800/30 transition">
                        <td className="py-3.5 px-4">
                          <div className="font-bold text-white text-sm">{u.fullName || u.name || k.fullName || "Applicant"}</div>
                          <div className="text-stone-400 text-[11px]">{u.email}</div>
                        </td>
                        <td className="py-3.5 px-4">
                          <span className="px-2 py-0.5 bg-stone-800 text-stone-200 border border-stone-700 rounded-md font-bold text-[10px] uppercase block w-fit">
                            {u.role || k.role || "FARMER"}
                          </span>
                          <span className="text-[11px] text-emerald-400 font-mono mt-1 block">
                            {u.farmerId || u.processorId || u.adminId || u._id}
                          </span>
                        </td>
                        <td className="py-3.5 px-4 text-stone-300 font-mono">
                          {k.aadhaarNumber || k.idNumber || "XXXX-XXXX-XXXX"}
                        </td>
                        <td className="py-3.5 px-4 text-stone-400">
                          {new Date(k.createdAt || Date.now()).toLocaleDateString("en-IN")}
                        </td>
                        <td className="py-3.5 px-4">
                          <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase border ${
                            k.verificationStatus === "APPROVED" ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/30" :
                            k.verificationStatus === "REJECTED" ? "bg-red-500/10 text-red-400 border-red-500/30" :
                            "bg-amber-500/10 text-amber-400 border-amber-500/30"
                          }`}>
                            {k.verificationStatus || "PENDING"}
                          </span>
                        </td>
                        <td className="py-3.5 px-4 text-right">
                          <button
                            onClick={() => setSelectedKyc(k)}
                            className="px-3.5 py-1.5 bg-[#00d26a]/10 hover:bg-[#00d26a]/20 border border-[#00d26a]/30 rounded-xl text-[#00d26a] font-bold transition flex items-center gap-1.5 ml-auto cursor-pointer"
                          >
                            <Eye className="w-3.5 h-3.5 text-[#00d26a]" />
                            <span>Review KYC</span>
                          </button>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* FULL KYC REVIEW MODAL */}
        {selectedKyc && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-950/85 backdrop-blur-md overflow-y-auto">
            <div className="bg-stone-900 border border-stone-800 rounded-3xl p-6 sm:p-7 max-w-3xl w-full space-y-6 shadow-2xl relative max-h-[90vh] overflow-y-auto custom-scrollbar">
              
              <div className="flex items-center justify-between border-b border-stone-800 pb-4">
                <div>
                  <h3 className="text-xl font-extrabold text-white flex items-center gap-2">
                    <ShieldCheck className="w-6 h-6 text-[#00d26a]" />
                    KYC Verification Review
                  </h3>
                  <p className="text-xs text-stone-400">Applicant: {selectedKyc.userId?.fullName || selectedKyc.fullName || "User"}</p>
                </div>
                <button onClick={() => setSelectedKyc(null)} className="text-stone-400 hover:text-white p-1">✕</button>
              </div>

              {/* DOCUMENTS & DETAILS GRID */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs text-stone-300">
                
                <div className="space-y-3 bg-stone-950/80 p-4 border border-stone-800 rounded-2xl">
                  <h4 className="font-extrabold text-emerald-400 uppercase tracking-wider text-[11px]">Personal & Contact Info</h4>
                  <p><strong>Name:</strong> {selectedKyc.userId?.fullName || selectedKyc.fullName}</p>
                  <p><strong>Email:</strong> {selectedKyc.userId?.email}</p>
                  <p><strong>Phone:</strong> {selectedKyc.userId?.phone || selectedKyc.phone || "N/A"}</p>
                  <p><strong>Role:</strong> {selectedKyc.userId?.role || selectedKyc.role}</p>
                  <p><strong>Aadhaar / ID Number:</strong> <span className="font-mono text-white">{selectedKyc.aadhaarNumber || "N/A"}</span></p>
                  <p><strong>Permanent Address:</strong> {selectedKyc.permanentAddress || "N/A"}</p>
                </div>

                <div className="space-y-3 bg-stone-950/80 p-4 border border-stone-800 rounded-2xl">
                  <h4 className="font-extrabold text-emerald-400 uppercase tracking-wider text-[11px]">Farm & Business Details</h4>
                  <p><strong>Farm / Business Name:</strong> {selectedKyc.farmName || "N/A"}</p>
                  <p><strong>Location:</strong> {selectedKyc.farmLocation || selectedKyc.state || "N/A"}</p>
                  <p><strong>Land Area / Capacity:</strong> {selectedKyc.landArea || "N/A"}</p>
                  <p><strong>Main Crops / Products:</strong> {selectedKyc.mainCrops || "N/A"}</p>
                </div>

              </div>

              {/* DOCUMENT IMAGES */}
              <div className="space-y-3">
                <h4 className="font-extrabold text-white text-xs uppercase tracking-wider">Uploaded Identity Documents</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  
                  {selectedKyc.aadhaarFrontUrl || selectedKyc.aadhaarFront ? (
                    <div className="p-3 bg-stone-950 border border-stone-800 rounded-2xl space-y-2">
                      <span className="text-[11px] font-bold text-stone-400 block">ID Front Document</span>
                      <img 
                        src={selectedKyc.aadhaarFrontUrl || selectedKyc.aadhaarFront} 
                        alt="ID Front" 
                        className="w-full h-44 object-cover rounded-xl border border-stone-800"
                      />
                      <a 
                        href={selectedKyc.aadhaarFrontUrl || selectedKyc.aadhaarFront} 
                        target="_blank" 
                        rel="noreferrer" 
                        className="text-[11px] text-[#00d26a] hover:underline font-bold flex items-center gap-1"
                      >
                        <Download className="w-3.5 h-3.5" /> Full Resolution Image
                      </a>
                    </div>
                  ) : (
                    <div className="p-4 bg-stone-950 border border-stone-800 rounded-2xl text-stone-500 text-xs">No Front ID image uploaded.</div>
                  )}

                  {selectedKyc.aadhaarBackUrl || selectedKyc.aadhaarBack ? (
                    <div className="p-3 bg-stone-950 border border-stone-800 rounded-2xl space-y-2">
                      <span className="text-[11px] font-bold text-stone-400 block">ID Back Document</span>
                      <img 
                        src={selectedKyc.aadhaarBackUrl || selectedKyc.aadhaarBack} 
                        alt="ID Back" 
                        className="w-full h-44 object-cover rounded-xl border border-stone-800"
                      />
                      <a 
                        href={selectedKyc.aadhaarBackUrl || selectedKyc.aadhaarBack} 
                        target="_blank" 
                        rel="noreferrer" 
                        className="text-[11px] text-[#00d26a] hover:underline font-bold flex items-center gap-1"
                      >
                        <Download className="w-3.5 h-3.5" /> Full Resolution Image
                      </a>
                    </div>
                  ) : (
                    <div className="p-4 bg-stone-950 border border-stone-800 rounded-2xl text-stone-500 text-xs">No Back ID image uploaded.</div>
                  )}

                </div>
              </div>

              {/* ACTION INPUTS */}
              <div className="space-y-3 pt-3 border-t border-stone-800">
                <div>
                  <label className="text-xs font-bold text-stone-300 block mb-1">Verification Notes (Internal Audit)</label>
                  <input
                    type="text"
                    placeholder="Add verification notes..."
                    value={actionNotes}
                    onChange={(e) => setActionNotes(e.target.value)}
                    className="w-full bg-stone-950 border border-stone-800 rounded-xl px-3 py-2 text-xs text-white placeholder-stone-600 focus:outline-none focus:border-[#00d26a]"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-stone-300 block mb-1">Rejection Reason (If rejecting)</label>
                  <input
                    type="text"
                    placeholder="Enter reason for rejection..."
                    value={rejectionReason}
                    onChange={(e) => setRejectionReason(e.target.value)}
                    className="w-full bg-stone-950 border border-stone-800 rounded-xl px-3 py-2 text-xs text-white placeholder-stone-600 focus:outline-none focus:border-red-500"
                  />
                </div>

                {/* DECISION BUTTONS */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
                  <button
                    disabled={actionLoading}
                    onClick={() => handleDecision(selectedKyc, "APPROVED")}
                    className="py-3 bg-[#00d26a]/15 hover:bg-[#00d26a]/25 text-[#00d26a] border border-[#00d26a]/30 font-bold text-xs rounded-xl transition cursor-pointer flex items-center justify-center gap-2 shadow-sm disabled:opacity-50"
                  >
                    <CheckCircle2 className="w-4 h-4 text-[#00d26a]" />
                    Approve KYC
                  </button>

                  <button
                    disabled={actionLoading}
                    onClick={() => handleDecision(selectedKyc, "RE_UPLOAD_REQUESTED")}
                    className="py-3 bg-amber-500/15 hover:bg-amber-500/25 text-amber-400 border border-amber-500/30 font-bold text-xs rounded-xl transition cursor-pointer flex items-center justify-center gap-2 shadow-sm disabled:opacity-50"
                  >
                    <RotateCcw className="w-4 h-4 text-amber-400" />
                    Request Re-upload
                  </button>

                  <button
                    disabled={actionLoading}
                    onClick={() => handleDecision(selectedKyc, "REJECTED")}
                    className="py-3 bg-red-500/15 hover:bg-red-500/25 text-red-400 border border-red-500/30 font-bold text-xs rounded-xl transition cursor-pointer flex items-center justify-center gap-2 shadow-sm disabled:opacity-50"
                  >
                    <XCircle className="w-4 h-4 text-red-400" />
                    Reject KYC
                  </button>
                </div>
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
