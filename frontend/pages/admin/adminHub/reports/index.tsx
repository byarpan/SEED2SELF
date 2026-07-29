import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/pages/api/auth/[...nextauth]";
import { GetServerSideProps } from "next";
import Head from "next/head";
import { FileText, AlertTriangle, CheckCircle2, RefreshCw, ShieldAlert, Eye } from "lucide-react";

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:5000";

export default function AdminReportsComplaints() {
  const [reports, setReports] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
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
        setReports(json.data || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReports();
  }, [statusFilter]);

  const handleUpdateReportStatus = async (reportId: string, status: "RESOLVED" | "DISMISSED") => {
    try {
      setActionLoading(true);
      setMessage(null);
      const res = await fetch(`${BACKEND_URL}/api/v1/admin/reports/${reportId}/status`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status, notes: resolutionNotes }),
      });

      if (res.ok) {
        setMessage({ type: "success", text: `Report status updated to ${status}.` });
        fetchReports();
        setSelectedReport(null);
        setResolutionNotes("");
      }
    } catch (err) {
      setMessage({ type: "error", text: "Server error updating report." });
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-stone-950 text-stone-100 font-sans pb-24 pt-6 px-4 sm:px-6 lg:px-8 relative z-20">
      <Head>
        <title>Reports & Complaints | Admin Engine | Seed2Shelf</title>
      </Head>

      <div className="max-w-7xl mx-auto space-y-7">
        
        {/* HEADER */}
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-stone-800/80 pb-4">
          <div className="flex items-center gap-3.5">
            <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-2xl text-red-400 shrink-0">
              <FileText className="h-7 w-7" />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
                Reports & Complaints Management
              </h1>
              <p className="text-xs text-stone-400 font-medium">Investigate reported users, order complaints, product disputes, & fraud alerts</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="bg-stone-950 border border-stone-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-[#00d26a]"
            >
              <option value="ALL">All Report Statuses</option>
              <option value="PENDING">Pending</option>
              <option value="RESOLVED">Resolved</option>
              <option value="DISMISSED">Dismissed</option>
            </select>

            <button 
              onClick={fetchReports}
              className="p-2.5 bg-stone-900 hover:bg-stone-800 border border-stone-800 rounded-xl text-stone-300 transition cursor-pointer flex items-center gap-2 text-xs font-bold"
            >
              <RefreshCw className={`w-4 h-4 text-[#00d26a] ${loading ? "animate-spin" : ""}`} />
              <span>Refresh Reports</span>
            </button>
          </div>
        </div>

        {message && (
          <div className={`p-4 rounded-2xl border text-xs font-bold flex items-center gap-2 ${message.type === "success" ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-400" : "bg-red-500/10 border-red-500/20 text-red-400"}`}>
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
                {reports.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-8 text-center text-stone-500 font-medium">
                      No reports or complaints recorded.
                    </td>
                  </tr>
                ) : (
                  reports.map((r) => (
                    <tr key={r._id || r.id} className="hover:bg-stone-800/30 transition">
                      <td className="py-3.5 px-4 font-mono font-bold text-red-400">
                        {r.reportNumber || r._id}
                      </td>
                      <td className="py-3.5 px-4">
                        <div className="font-bold text-white text-sm">{r.reporterName}</div>
                        <div className="text-stone-400 text-[11px]">{r.reporterRole}</div>
                      </td>
                      <td className="py-3.5 px-4">
                        <span className="px-2 py-0.5 bg-stone-800 text-stone-200 border border-stone-700 rounded-md font-bold text-[10px] uppercase block w-fit">
                          {r.reportType}
                        </span>
                        <span className="text-[11px] text-stone-400 font-mono mt-1 block">
                          Target: {r.targetId}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 font-bold text-stone-200">
                        {r.subject}
                      </td>
                      <td className="py-3.5 px-4">
                        <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase border ${
                          r.status === "RESOLVED" ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/30" : "bg-red-500/10 text-red-400 border-red-500/30"
                        }`}>
                          {r.status || "PENDING"}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <button
                          onClick={() => setSelectedReport(r)}
                          className="px-3 py-1.5 bg-stone-950 hover:bg-stone-800 border border-stone-800 rounded-xl text-stone-300 font-bold transition flex items-center gap-1 ml-auto cursor-pointer"
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

        {/* INVESTIGATE MODAL */}
        {selectedReport && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-950/80 backdrop-blur-md">
            <div className="bg-stone-900 border border-stone-800 rounded-3xl p-6 max-w-lg w-full space-y-4 shadow-2xl relative">
              <div className="flex items-center justify-between border-b border-stone-800 pb-3">
                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                  <ShieldAlert className="w-5 h-5 text-red-400" />
                  Investigate Report #{selectedReport.reportNumber}
                </h3>
                <button onClick={() => setSelectedReport(null)} className="text-stone-400 hover:text-white">✕</button>
              </div>

              <div className="space-y-2 text-xs text-stone-300 bg-stone-950 p-4 border border-stone-800 rounded-2xl">
                <p><strong>Reporter:</strong> {selectedReport.reporterName} ({selectedReport.reporterRole})</p>
                <p><strong>Report Type:</strong> {selectedReport.reportType}</p>
                <p><strong>Target ID:</strong> {selectedReport.targetId}</p>
                <p><strong>Subject:</strong> {selectedReport.subject}</p>
                <p><strong>Description:</strong> {selectedReport.description}</p>
              </div>

              <div>
                <label className="text-xs font-bold text-stone-400 block mb-1">Resolution Notes</label>
                <textarea
                  rows={3}
                  placeholder="Enter resolution details..."
                  value={resolutionNotes}
                  onChange={(e) => setResolutionNotes(e.target.value)}
                  className="w-full bg-stone-950 border border-stone-800 rounded-xl p-3 text-xs text-white placeholder-stone-600 focus:outline-none focus:border-[#00d26a]"
                />
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  disabled={actionLoading}
                  onClick={() => handleUpdateReportStatus(selectedReport._id, "RESOLVED")}
                  className="flex-1 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-stone-950 font-black text-xs uppercase tracking-wider rounded-xl transition cursor-pointer"
                >
                  Resolve Report
                </button>
                <button
                  disabled={actionLoading}
                  onClick={() => handleUpdateReportStatus(selectedReport._id, "DISMISSED")}
                  className="flex-1 py-2.5 bg-stone-950 hover:bg-stone-800 border border-stone-800 text-stone-400 font-bold text-xs uppercase tracking-wider rounded-xl transition cursor-pointer"
                >
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
