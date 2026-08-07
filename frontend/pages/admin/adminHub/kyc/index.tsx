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

  const [modalMessage, setModalMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const handleDecision = async (userObj: any, decision: "APPROVED" | "REJECTED" | "RE_UPLOAD_REQUESTED") => {
    const targetId = userObj?.id || userObj?._id || (typeof userObj?.userId === "object" ? (userObj.userId?._id || userObj.userId?.id) : userObj?.userId);

    if (!targetId) {
      setModalMessage({ type: "error", text: "Invalid user ID for KYC evaluation." });
      return;
    }

    const finalReason = (rejectionReason || actionNotes || "").trim() || (
      decision === "REJECTED"
        ? "Document verification failed. Please check your uploaded Aadhaar proof and re-submit."
        : "Please re-upload clear, unblurred Aadhaar front and back documents."
    );

    try {
      setActionLoading(true);
      setModalMessage(null);
      setMessage(null);

      const actionName = decision === "APPROVED" ? "APPROVE" : decision === "RE_UPLOAD_REQUESTED" ? "RE_UPLOAD" : "REJECT";

      // 1. Update local Next.js API (SQLite database)
      const localRes = await fetch("/api/admin/kyc", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: targetId,
          action: actionName,
          reason: finalReason,
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
            rejectionReason: finalReason,
            notes: actionNotes || finalReason,
          }),
        });
      } catch (e) {}

      if (localRes.ok) {
        const decisionText = decision === "APPROVED" ? "Approved" : decision === "RE_UPLOAD_REQUESTED" ? "Re-upload Requested" : "Rejected";
        setMessage({ type: "success", text: `KYC evaluation submitted as '${decisionText}' successfully!` });
        setSelectedKyc(null);
        setRejectionReason("");
        setActionNotes("");
        setModalMessage(null);
        fetchKycList();
      } else {
        const json = await localRes.json();
        setModalMessage({ type: "error", text: json.message || "Failed to submit decision." });
      }
    } catch (err) {
      setModalMessage({ type: "error", text: "Server error during KYC verification." });
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-stone-950 text-stone-100 font-sans pb-24 pt-6 px-4 sm:px-6 lg:px-8 relative z-20">
      <Head>
        <title>KYC Management | Seed2Shelf</title>
      </Head>

      <div className="max-w-7xl mx-auto space-y-7">
        
        {/* HEADER */}
        <div className="flex items-center justify-between border-b border-stone-800/80 pb-4">
          <div className="flex items-center gap-3.5">
            <div className="p-3 bg-[#00d26a]/10 border border-[#00d26a]/20 rounded-2xl text-[#00d26a] shrink-0">
              <UserCheck2 className="h-7 w-7" />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
                KYC Management
              </h1>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="bg-stone-950 border border-stone-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-[#00d26a] font-bold"
            >
              <option value="ALL">All KYC Statuses</option>
              <option value="PENDING">Pending</option>
              <option value="APPROVED">Approved</option>
              <option value="REJECTED">Rejected</option>
            </select>
            <button 
              onClick={fetchKycList}
              title="Refresh KYC"
              className="p-2.5 bg-stone-900 hover:bg-stone-800 border border-stone-800 rounded-2xl text-[#00d26a] hover:text-emerald-400 transition cursor-pointer flex items-center justify-center shrink-0 shadow-sm"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
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
                    const applicantName = u.fullName || u.name || k.fullName || k.name || (u.email ? u.email.split("@")[0] : "Applicant");
                    return (
                      <tr key={k._id || k.id} className="hover:bg-stone-800/30 transition">
                        <td className="py-3.5 px-4">
                          <div className="font-bold text-white text-sm">{applicantName}</div>
                          <div className="text-stone-400 text-[11px]">{u.email || k.email || ""}</div>
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
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-stone-950/85 backdrop-blur-md overflow-y-auto">
            <div className="bg-stone-900/95 border border-stone-800 rounded-3xl p-6 sm:p-8 max-w-3xl w-full space-y-6 shadow-2xl relative max-h-[92vh] overflow-y-auto custom-scrollbar">
              
              {/* MODAL HEADER */}
              <div className="flex items-center justify-between border-b border-stone-800/80 pb-5">
                <div className="flex items-center gap-3.5">
                  <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#00d26a]/20 to-emerald-500/10 border border-[#00d26a]/30 flex items-center justify-center text-[#00d26a] font-extrabold text-base shadow-inner">
                    {(selectedKyc.userId?.fullName || selectedKyc.fullName || selectedKyc.name || "U").slice(0, 2).toUpperCase()}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-xl sm:text-2xl font-extrabold text-white tracking-tight">
                        {selectedKyc.userId?.fullName || selectedKyc.fullName || selectedKyc.name || "Applicant User"}
                      </h3>
                      <span className="px-2.5 py-0.5 rounded-lg text-[10px] font-black uppercase bg-[#00d26a]/15 border border-[#00d26a]/30 text-[#00d26a] tracking-wider">
                        {selectedKyc.userId?.role || selectedKyc.role || "FARMER"}
                      </span>
                    </div>
                    <p className="text-xs text-stone-400 mt-0.5 font-medium">
                      {selectedKyc.userId?.email || selectedKyc.email || "No email provided"}
                    </p>
                  </div>
                </div>

                <button 
                  onClick={() => setSelectedKyc(null)} 
                  className="p-2 rounded-xl bg-stone-950 hover:bg-stone-800 text-stone-400 hover:text-white border border-stone-800 transition cursor-pointer"
                  title="Close modal"
                >
                  ✕
                </button>
              </div>

              {/* APPLICANT DETAILS GRID */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5 text-xs">
                
                {/* Personal & Contact Card */}
                <div className="bg-stone-950/70 border border-stone-800/90 rounded-2xl p-5 space-y-4 shadow-sm">
                  <h4 className="font-extrabold text-[#00d26a] uppercase tracking-wider text-[11px] flex items-center gap-2 border-b border-stone-800/80 pb-2.5">
                    <User className="w-4 h-4 text-[#00d26a]" />
                    Personal & Identity Details
                  </h4>
                  
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <span className="text-[10px] font-bold text-stone-500 uppercase block">Full Name</span>
                      <span className="text-white font-semibold block mt-0.5">{selectedKyc.userId?.fullName || selectedKyc.fullName || selectedKyc.name || "N/A"}</span>
                    </div>
                    <div>
                      <span className="text-[10px] font-bold text-stone-500 uppercase block">Contact Phone</span>
                      <span className="text-stone-300 font-semibold block mt-0.5">{selectedKyc.userId?.phone || selectedKyc.phone || "N/A"}</span>
                    </div>
                    <div className="col-span-2">
                      <span className="text-[10px] font-bold text-stone-500 uppercase block">Aadhaar / ID Number</span>
                      <span className="text-emerald-400 font-mono font-bold block mt-0.5 text-xs">{selectedKyc.aadhaarNumber || selectedKyc.idNumber || "N/A"}</span>
                    </div>
                  </div>

                  {/* Permanent Address Box */}
                  <div className="pt-2 border-t border-stone-800/80 space-y-1">
                    <span className="text-[10px] font-bold text-stone-500 uppercase flex items-center gap-1">
                      <MapPin className="w-3 h-3 text-[#00d26a]" />
                      Permanent Address
                    </span>
                    <div className="p-3 bg-stone-900/90 border border-stone-800 rounded-xl text-stone-200 text-xs leading-relaxed font-medium break-words overflow-hidden">
                      {selectedKyc.permanentAddress || selectedKyc.address || "N/A"}
                    </div>
                  </div>
                </div>

                {/* Farm & Business Details Card */}
                <div className="bg-stone-950/70 border border-stone-800/90 rounded-2xl p-5 space-y-4 shadow-sm">
                  <h4 className="font-extrabold text-[#00d26a] uppercase tracking-wider text-[11px] flex items-center gap-2 border-b border-stone-800/80 pb-2.5">
                    <Sprout className="w-4 h-4 text-[#00d26a]" />
                    Farm & Business Credentials
                  </h4>

                  <div className="space-y-3">
                    <div>
                      <span className="text-[10px] font-bold text-stone-500 uppercase block">Farm / Business Name</span>
                      <span className="text-white font-semibold block mt-0.5">{selectedKyc.farmName || selectedKyc.businessName || "N/A"}</span>
                    </div>
                    <div>
                      <span className="text-[10px] font-bold text-stone-500 uppercase block">Location / State</span>
                      <span className="text-stone-300 font-semibold block mt-0.5">{selectedKyc.farmLocation || selectedKyc.location || selectedKyc.state || "N/A"}</span>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <span className="text-[10px] font-bold text-stone-500 uppercase block">Land Area</span>
                        <span className="text-stone-300 font-semibold block mt-0.5">{selectedKyc.landArea || selectedKyc.capacity || "N/A"}</span>
                      </div>
                      <div>
                        <span className="text-[10px] font-bold text-stone-500 uppercase block">Main Crops</span>
                        <span className="text-stone-300 font-semibold block mt-0.5">{selectedKyc.mainCrops || selectedKyc.products || "N/A"}</span>
                      </div>
                    </div>
                  </div>
                </div>

              </div>

              {/* UPLOADED IDENTITY DOCUMENTS */}
              <div className="space-y-3 pt-2">
                <h4 className="font-extrabold text-white text-xs uppercase tracking-wider flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-[#00d26a]" />
                  Uploaded Identity Proof Documents
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  
                  {selectedKyc.aadhaarFrontUrl || selectedKyc.aadhaarFront ? (
                    <div className="p-3.5 bg-stone-950/70 border border-stone-800 rounded-2xl space-y-3 shadow-sm">
                      <div className="flex items-center justify-between">
                        <span className="text-[11px] font-extrabold text-stone-300">Front ID Document</span>
                        <span className="text-[10px] font-bold text-[#00d26a] bg-[#00d26a]/10 px-2 py-0.5 rounded-md border border-[#00d26a]/20">Aadhaar Front</span>
                      </div>
                      <div className="overflow-hidden rounded-xl border border-stone-800">
                        <img 
                          src={selectedKyc.aadhaarFrontUrl || selectedKyc.aadhaarFront} 
                          alt="ID Front" 
                          className="w-full h-48 object-cover hover:scale-105 transition duration-300"
                        />
                      </div>
                      <a 
                        href={selectedKyc.aadhaarFrontUrl || selectedKyc.aadhaarFront} 
                        target="_blank" 
                        rel="noreferrer" 
                        className="w-full py-2 bg-stone-900 hover:bg-stone-800 border border-stone-800 rounded-xl text-[#00d26a] font-extrabold text-xs flex items-center justify-center gap-1.5 transition cursor-pointer"
                      >
                        <ExternalLink className="w-3.5 h-3.5" /> Open Full Resolution
                      </a>
                    </div>
                  ) : (
                    <div className="p-5 bg-stone-950/70 border border-stone-800 rounded-2xl text-stone-500 text-xs text-center">No Front ID document uploaded.</div>
                  )}

                  {selectedKyc.aadhaarBackUrl || selectedKyc.aadhaarBack ? (
                    <div className="p-3.5 bg-stone-950/70 border border-stone-800 rounded-2xl space-y-3 shadow-sm">
                      <div className="flex items-center justify-between">
                        <span className="text-[11px] font-extrabold text-stone-300">Back ID Document</span>
                        <span className="text-[10px] font-bold text-[#00d26a] bg-[#00d26a]/10 px-2 py-0.5 rounded-md border border-[#00d26a]/20">Aadhaar Back</span>
                      </div>
                      <div className="overflow-hidden rounded-xl border border-stone-800">
                        <img 
                          src={selectedKyc.aadhaarBackUrl || selectedKyc.aadhaarBack} 
                          alt="ID Back" 
                          className="w-full h-48 object-cover hover:scale-105 transition duration-300"
                        />
                      </div>
                      <a 
                        href={selectedKyc.aadhaarBackUrl || selectedKyc.aadhaarBack} 
                        target="_blank" 
                        rel="noreferrer" 
                        className="w-full py-2 bg-stone-900 hover:bg-stone-800 border border-stone-800 rounded-xl text-[#00d26a] font-extrabold text-xs flex items-center justify-center gap-1.5 transition cursor-pointer"
                      >
                        <ExternalLink className="w-3.5 h-3.5" /> Open Full Resolution
                      </a>
                    </div>
                  ) : (
                    <div className="p-5 bg-stone-950/70 border border-stone-800 rounded-2xl text-stone-500 text-xs text-center">No Back ID document uploaded.</div>
                  )}

                </div>
              </div>

              {/* AUDIT & VERIFICATION DECISION SECTION */}
              <div className="space-y-4 pt-4 border-t border-stone-800">
                <h4 className="text-xs font-black uppercase tracking-wider text-stone-300">
                  Verification Audit & Decision
                </h4>

                <div className="space-y-3">
                  <div>
                    <label className="text-xs font-bold text-stone-400 block mb-1">Verification Notes (Internal Audit Log)</label>
                    <input
                      type="text"
                      placeholder="Add internal audit notes for verification record..."
                      value={actionNotes}
                      onChange={(e) => setActionNotes(e.target.value)}
                      className="w-full bg-stone-950 border border-stone-800 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-stone-600 focus:outline-none focus:border-[#00d26a] transition"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-bold text-stone-400 block mb-1">Rejection Reason (If rejecting application)</label>
                    <input
                      type="text"
                      placeholder="Provide detailed rejection reason for applicant notification..."
                      value={rejectionReason}
                      onChange={(e) => setRejectionReason(e.target.value)}
                      className="w-full bg-stone-950 border border-stone-800 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-stone-600 focus:outline-none focus:border-red-500 transition"
                    />
                  </div>
                </div>

                {modalMessage && (
                  <div className={`p-3.5 rounded-xl border text-xs font-bold flex items-center gap-2 ${modalMessage.type === "success" ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-400" : "bg-rose-500/10 border-rose-500/20 text-rose-400"}`}>
                    {modalMessage.type === "success" ? <CheckCircle2 className="w-4 h-4 shrink-0" /> : <AlertTriangle className="w-4 h-4 shrink-0" />}
                    <span>{modalMessage.text}</span>
                  </div>
                )}

                {/* DECISION ACTION BUTTONS */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
                  <button
                    disabled={actionLoading}
                    onClick={() => handleDecision(selectedKyc, "APPROVED")}
                    className="py-3 px-4 bg-[#00d26a]/15 hover:bg-[#00d26a]/25 text-[#00d26a] border border-[#00d26a]/30 font-extrabold text-xs rounded-xl transition cursor-pointer flex items-center justify-center gap-2 shadow-sm disabled:opacity-50"
                  >
                    <CheckCircle2 className="w-4 h-4 text-[#00d26a]" />
                    Approve KYC
                  </button>

                  <button
                    disabled={actionLoading}
                    onClick={() => handleDecision(selectedKyc, "RE_UPLOAD_REQUESTED")}
                    className="py-3 px-4 bg-blue-500/15 hover:bg-blue-500/25 text-blue-400 border border-blue-500/30 font-extrabold text-xs rounded-xl transition cursor-pointer flex items-center justify-center gap-2 shadow-sm disabled:opacity-50"
                  >
                    <RotateCcw className="w-4 h-4 text-blue-400" />
                    Request Re-upload
                  </button>

                  <button
                    disabled={actionLoading}
                    onClick={() => handleDecision(selectedKyc, "REJECTED")}
                    className="py-3 px-4 bg-rose-500/15 hover:bg-rose-500/25 text-rose-400 border border-rose-500/30 font-extrabold text-xs rounded-xl transition cursor-pointer flex items-center justify-center gap-2 shadow-sm disabled:opacity-50"
                  >
                    <XCircle className="w-4 h-4 text-rose-400" />
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
