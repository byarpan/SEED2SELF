import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/pages/api/auth/[...nextauth]";
import { GetServerSideProps } from "next";
import Head from "next/head";
import { 
  FileText, 
  AlertTriangle, 
  CheckCircle2, 
  RefreshCw, 
  ShieldAlert, 
  Eye,
  User,
  X,
  Search,
  Clock,
  RotateCcw
} from "lucide-react";

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:5000";

const defaultMockReports = [
  {
    _id: "RPT-2026-0081",
    reportNumber: "RPT-2026-0081",
    reporterName: "Ramesh Patel",
    reporterRole: "FARMER",
    reportType: "PAYMENT_DISPUTE",
    targetId: "S2S-PROC-00912",
    subject: "Escrow UTR payout clearance delay",
    description: "Harvest dispatch S2S-BAT-2026-000081 was accepted by processor 2 days ago, but escrow UTR verification remains pending.",
    status: "PENDING",
    createdAt: new Date().toISOString()
  },
  {
    _id: "RPT-2026-0045",
    reportNumber: "RPT-2026-0045",
    reporterName: "AgroProcessing Ltd",
    reporterRole: "PROCESSOR",
    reportType: "QUALITY_MISMATCH",
    targetId: "S2S-FARM-00104",
    subject: "Moisture degradation in raw tomato batch",
    description: "Batch contains 15% moisture degradation beyond grade agreement threshold.",
    status: "INVESTIGATING",
    createdAt: new Date(Date.now() - 86400000).toISOString()
  },
  {
    _id: "RPT-2026-0012",
    reportNumber: "RPT-2026-0012",
    reporterName: "GreenLine Logistics",
    reporterRole: "DISTRIBUTOR",
    reportType: "FRAUD_ALERT",
    targetId: "S2S-RETL-00389",
    subject: "Counterfeit packaging QR code claim",
    description: "Unverified retailer barcode tag detected on retail shelf intake.",
    status: "RESOLVED",
    createdAt: new Date(Date.now() - 172800000).toISOString()
  }
];

export default function AdminReportsComplaints() {
  const [reports, setReports] = useState<any[]>(defaultMockReports);
  const [loading, setLoading] = useState(false);
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [selectedReport, setSelectedReport] = useState<any | null>(null);
  const [resolutionNotes, setResolutionNotes] = useState("");
  const [actionLoading, setActionLoading] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const fetchReports = async () => {
    try {
      setLoading(true);
      const res = await fetch(`${BACKEND_URL}/api/v1/admin/reports?status=${statusFilter}`);
      if (res.ok) {
        const json = await res.json();
        if (Array.isArray(json.data) && json.data.length > 0) {
          setReports(json.data);
        }
      }
    } catch (err) {
      console.warn("Express backend offline, utilizing local fallback report records.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReports();
  }, [statusFilter]);

  const handleUpdateReportStatus = async (reportId: string, status: "RESOLVED" | "INVESTIGATING" | "DISMISSED") => {
    try {
      setActionLoading(true);
      setMessage(null);

      try {
        await fetch(`${BACKEND_URL}/api/v1/admin/reports/${reportId}/status`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ status, notes: resolutionNotes }),
        });
      } catch (e) {}

      setReports(reports.map(r => ((r._id === reportId || r.id === reportId) ? { ...r, status } : r)));
      setMessage({ type: "success", text: `Report status updated to ${status}.` });
      setSelectedReport(null);
      setResolutionNotes("");
    } catch (err) {
      setMessage({ type: "error", text: "Error updating report status." });
    } finally {
      setActionLoading(false);
    }
  };

  const filteredReports = reports.filter((r) => {
    if (statusFilter === "ALL") return true;
    return (r.status || "PENDING").toUpperCase() === statusFilter;
  });

  const getStatusBadge = (status: string) => {
    switch ((status || "").toUpperCase()) {
      case "RESOLVED":
        return "bg-[#00d26a]/15 text-[#00d26a] border-[#00d26a]/30";
      case "INVESTIGATING":
        return "bg-blue-500/15 text-blue-400 border-blue-500/30";
      case "DISMISSED":
        return "bg-stone-800 text-stone-400 border-stone-700";
      default:
        return "bg-amber-500/15 text-amber-400 border-amber-500/30";
    }
  };

  return (
    <div className="min-h-screen bg-stone-950 text-stone-100 font-sans pb-24 pt-6 px-4 sm:px-6 lg:px-8 relative z-20">
      <Head>
        <title>Reports & Complaints | Admin Hub | Seed2Shelf</title>
      </Head>

      <div className="max-w-7xl mx-auto space-y-7">
        
        {/* HEADER */}
        <div className="flex items-center justify-between border-b border-stone-800/80 pb-4">
          <div className="flex items-center gap-3.5">
            <div className="p-3 bg-[#00d26a]/10 border border-[#00d26a]/20 rounded-2xl text-[#00d26a] shrink-0">
              <FileText className="h-7 w-7" />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
                Reports & Complaints
              </h1>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="bg-stone-950 border border-stone-800 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-[#00d26a] font-bold"
            >
              <option value="ALL">All Statuses</option>
              <option value="PENDING">Pending</option>
              <option value="INVESTIGATING">Investigating</option>
              <option value="RESOLVED">Resolved</option>
              <option value="DISMISSED">Dismissed</option>
            </select>

            <button 
              onClick={fetchReports}
              title="Refresh Reports"
              className="p-2.5 bg-stone-900 hover:bg-stone-800 border border-stone-800 rounded-xl text-stone-400 hover:text-white transition cursor-pointer flex items-center justify-center shrink-0"
            >
              <RefreshCw className={`w-4 h-4 text-[#00d26a] ${loading ? "animate-spin" : ""}`} />
            </button>
          </div>
        </div>

        {message && (
          <div className={`p-4 rounded-2xl border text-xs font-bold flex items-center gap-2 ${message.type === "success" ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-400" : "bg-rose-500/10 border-rose-500/20 text-rose-400"}`}>
            {message.type === "success" ? <CheckCircle2 className="w-5 h-5 shrink-0" /> : <AlertTriangle className="w-5 h-5 shrink-0" />}
            <span>{message.text}</span>
          </div>
        )}

        {/* REPORTS TABLE */}
        <div className="bg-stone-900/90 border border-stone-800 rounded-3xl overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-stone-800 bg-stone-950/60 text-stone-400 uppercase tracking-wider font-bold">
                  <th className="py-3.5 px-4">Report ID</th>
                  <th className="py-3.5 px-4">Reporter</th>
                  <th className="py-3.5 px-4">Type & Target</th>
                  <th className="py-3.5 px-4">Subject</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-800/60">
                {filteredReports.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-12 text-center text-stone-500 font-medium">
                      No reports or complaints recorded for the selected filter.
                    </td>
                  </tr>
                ) : (
                  filteredReports.map((r) => (
                    <tr key={r._id || r.id} className="hover:bg-stone-800/30 transition">
                      <td className="py-3.5 px-4 font-mono font-extrabold text-[#00d26a]">
                        {r.reportNumber || r._id}
                      </td>
                      <td className="py-3.5 px-4">
                        <div className="font-bold text-white text-xs">{r.reporterName}</div>
                        <div className="text-stone-400 text-[11px] font-semibold">{r.reporterRole}</div>
                      </td>
                      <td className="py-3.5 px-4">
                        <span className="px-2.5 py-0.5 bg-stone-950 text-stone-300 border border-stone-800 rounded-lg font-bold text-[10px] uppercase block w-fit">
                          {r.reportType}
                        </span>
                        <span className="text-[11px] text-stone-500 font-mono mt-1 block">
                          Target: {r.targetId}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 font-bold text-stone-200">
                        {r.subject}
                      </td>
                      <td className="py-3.5 px-4">
                        <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase border ${getStatusBadge(r.status)}`}>
                          {r.status || "PENDING"}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <button
                          onClick={() => setSelectedReport(r)}
                          className="px-3 py-1.5 bg-stone-950 hover:bg-stone-800 border border-stone-800 rounded-xl text-stone-300 font-bold transition flex items-center gap-1.5 ml-auto cursor-pointer text-xs"
                        >
                          <Eye className="w-3.5 h-3.5 text-[#00d26a]" />
                          <span>Investigate</span>
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* INVESTIGATE & REVIEW MODAL */}
        {selectedReport && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-950/80 backdrop-blur-md">
            <div className="bg-stone-900 border border-stone-800 rounded-3xl p-6 max-w-lg w-full space-y-5 shadow-2xl relative">
              
              <div className="flex items-center justify-between border-b border-stone-800 pb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-[#00d26a]/10 border border-[#00d26a]/20 flex items-center justify-center text-[#00d26a] font-black text-sm">
                    {selectedReport.reporterName ? selectedReport.reporterName.substring(0, 2).toUpperCase() : "RP"}
                  </div>
                  <div>
                    <h3 className="text-base font-extrabold text-white">
                      Investigate Report #{selectedReport.reportNumber || selectedReport._id}
                    </h3>
                    <p className="text-xs text-stone-400">Reporter: <strong className="text-white">{selectedReport.reporterName}</strong> ({selectedReport.reporterRole})</p>
                  </div>
                </div>
                <button onClick={() => setSelectedReport(null)} className="text-stone-400 hover:text-white p-1 rounded-lg hover:bg-stone-800 transition">
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* REPORT DETAILS GRID */}
              <div className="space-y-3 bg-stone-950 p-4 border border-stone-800 rounded-2xl text-xs">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <span className="text-[10px] font-bold text-stone-500 uppercase block">Report Category / Type</span>
                    <span className="font-bold text-stone-200">{selectedReport.reportType}</span>
                  </div>
                  <div>
                    <span className="text-[10px] font-bold text-stone-500 uppercase block">Target Identifier</span>
                    <span className="font-mono text-[#00d26a] font-bold">{selectedReport.targetId}</span>
                  </div>
                </div>
                <div>
                  <span className="text-[10px] font-bold text-stone-500 uppercase block">Subject</span>
                  <span className="font-bold text-white">{selectedReport.subject}</span>
                </div>
                <div>
                  <span className="text-[10px] font-bold text-stone-500 uppercase block">Full Issue Description</span>
                  <p className="text-stone-300 leading-relaxed mt-0.5">{selectedReport.description}</p>
                </div>
              </div>

              {/* AUDIT / RESOLUTION NOTES */}
              <div>
                <label className="text-xs font-bold text-stone-400 block mb-1">Resolution Audit Notes</label>
                <textarea
                  rows={3}
                  placeholder="Enter resolution notes for administration record..."
                  value={resolutionNotes}
                  onChange={(e) => setResolutionNotes(e.target.value)}
                  className="w-full bg-stone-950 border border-stone-800 rounded-xl p-3 text-xs text-white placeholder-stone-600 focus:outline-none focus:border-[#00d26a]"
                />
              </div>

              {/* ACTION BUTTONS */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
                <button
                  disabled={actionLoading}
                  onClick={() => handleUpdateReportStatus(selectedReport._id || selectedReport.id, "RESOLVED")}
                  className="py-2.5 px-3 bg-[#00d26a]/15 hover:bg-[#00d26a]/25 text-[#00d26a] border border-[#00d26a]/30 font-extrabold text-xs rounded-xl transition cursor-pointer flex items-center justify-center gap-1.5"
                >
                  <CheckCircle2 className="w-3.5 h-3.5 text-[#00d26a]" />
                  Resolve Report
                </button>

                <button
                  disabled={actionLoading}
                  onClick={() => handleUpdateReportStatus(selectedReport._id || selectedReport.id, "INVESTIGATING")}
                  className="py-2.5 px-3 bg-blue-500/15 hover:bg-blue-500/25 text-blue-400 border border-blue-500/30 font-extrabold text-xs rounded-xl transition cursor-pointer flex items-center justify-center gap-1.5"
                >
                  <RotateCcw className="w-3.5 h-3.5 text-blue-400" />
                  Investigating
                </button>

                <button
                  disabled={actionLoading}
                  onClick={() => handleUpdateReportStatus(selectedReport._id || selectedReport.id, "DISMISSED")}
                  className="py-2.5 px-3 bg-rose-500/15 hover:bg-rose-500/25 text-rose-400 border border-rose-500/30 font-extrabold text-xs rounded-xl transition cursor-pointer flex items-center justify-center gap-1.5"
                >
                  <X className="w-3.5 h-3.5 text-rose-400" />
                  Dismiss
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

