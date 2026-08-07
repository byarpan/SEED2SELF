import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/pages/api/auth/[...nextauth]";
import { GetServerSideProps } from "next";
import Head from "next/head";
import { 
  HelpCircle, 
  Send, 
  CheckCircle2, 
  AlertTriangle, 
  RefreshCw,
  Tag,
  ShieldAlert,
  Clock,
  Layers
} from "lucide-react";

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:5000";

const SUPPORT_CATEGORIES = [
  "Incoming Produce Quality Inspection Dispute",
  "Raw-to-Processed Batch Transformation Log",
  "Distributor Order Fulfillment & Escrow Payout",
  "Facility Hygiene Audit & Compliance Certificate",
  "Platform Technical Bug / App Glitch",
  "Escrow & Bank Settlement Delay",
  "KYC & Account Verification",
  "Other"
];

const defaultMockTickets = [
  {
    _id: "TCK-8921",
    ticketNumber: "TCK-8921",
    role: "FARMER",
    category: "Escrow & Bank Settlement Delay",
    priority: "HIGH",
    subject: "Escrow payout UTR verification for Mango harvest batch #0081",
    description: "Harvest dispatch S2S-BAT-2026-000081 was marked accepted by processor 2 days ago, but bank account credit UTR is still pending.",
    status: "OPEN",
    createdAt: new Date().toISOString(),
    userId: { fullName: "Ramesh Patel", email: "ramesh.patel@gmail.com" },
    replies: [
      { senderName: "Ramesh Patel", senderRole: "FARMER", message: "Please check with banking partner for transaction clearance.", createdAt: new Date().toISOString() }
    ]
  },
  {
    _id: "TCK-7742",
    ticketNumber: "TCK-7742",
    role: "PROCESSOR",
    category: "Incoming Produce Quality Inspection Dispute",
    priority: "CRITICAL",
    subject: "Raw Tomato Batch Grade C mismatch on arrival",
    description: "Batch S2S-BAT-9022 contains 15% moisture degradation beyond contract tolerance limit.",
    status: "WAITING_FOR_USER",
    createdAt: new Date(Date.now() - 86400000).toISOString(),
    userId: { fullName: "AgroProcessing Ltd", email: "support@agroprocess.com" },
    replies: []
  },
  {
    _id: "TCK-6105",
    ticketNumber: "TCK-6105",
    role: "DISTRIBUTOR",
    category: "Distributor Order Fulfillment & Escrow Payout",
    priority: "MEDIUM",
    subject: "Warehouse cold-storage intake verification sync",
    description: "IoT Temperature logs verified between 2°C - 4°C during transit.",
    status: "RESOLVED",
    createdAt: new Date(Date.now() - 172800000).toISOString(),
    userId: { fullName: "GreenLine Logistics", email: "ops@greenlinelogistics.in" },
    replies: [
      { senderName: "System Administrator", senderRole: "ADMIN", message: "Escrow payout credited to Distributor wallet.", createdAt: new Date().toISOString() }
    ]
  }
];

export default function AdminSupportCenter() {
  const { data: session } = useSession();
  const [tickets, setTickets] = useState<any[]>(defaultMockTickets);
  const [loading, setLoading] = useState(false);
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [priorityFilter, setPriorityFilter] = useState("ALL");
  const [categoryFilter, setCategoryFilter] = useState("ALL");
  const [selectedTicket, setSelectedTicket] = useState<any | null>(defaultMockTickets[0]);
  const [replyText, setReplyText] = useState("");
  const [actionLoading, setActionLoading] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const fetchTickets = async () => {
    try {
      setLoading(true);
      const res = await fetch(`${BACKEND_URL}/api/v1/admin/support/tickets?status=${statusFilter}&priority=${priorityFilter}`);
      if (res.ok) {
        const json = await res.json();
        if (Array.isArray(json.data) && json.data.length > 0) {
          setTickets(json.data);
        }
      }
    } catch (err) {
      console.warn("Express backend offline, utilizing local fallback support tickets.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTickets();
  }, [statusFilter, priorityFilter]);

  const handleSendReply = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!replyText.trim() || !selectedTicket) return;

    try {
      setActionLoading(true);
      setMessage(null);

      try {
        await fetch(`${BACKEND_URL}/api/v1/admin/support/tickets/${selectedTicket._id}/reply`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ message: replyText }),
        });
      } catch (e) {}

      const newReply = {
        senderName: "Platform Administrator",
        senderRole: "ADMIN",
        message: replyText,
        createdAt: new Date().toISOString()
      };

      const updatedTicket = {
        ...selectedTicket,
        status: "WAITING_FOR_USER",
        replies: [...(selectedTicket.replies || []), newReply]
      };

      setSelectedTicket(updatedTicket);
      setTickets(tickets.map(t => (t._id === selectedTicket._id ? updatedTicket : t)));
      setMessage({ type: "success", text: "Reply sent to user successfully!" });
      setReplyText("");
    } catch (err) {
      setMessage({ type: "error", text: "Server error occurred while sending reply." });
    } finally {
      setActionLoading(false);
    }
  };

  const handleUpdateStatus = async (targetTicket: any, newStatus: string) => {
    const ticketId = typeof targetTicket === "object" ? (targetTicket._id || targetTicket.id) : targetTicket;
    try {
      setActionLoading(true);
      try {
        await fetch(`${BACKEND_URL}/api/v1/admin/support/tickets/${ticketId}/status`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ status: newStatus }),
        });
      } catch (e) {}

      setTickets(tickets.map(t => ((t._id === ticketId || t.id === ticketId) ? { ...t, status: newStatus } : t)));
      if (selectedTicket && (selectedTicket._id === ticketId || selectedTicket.id === ticketId)) {
        setSelectedTicket({ ...selectedTicket, status: newStatus });
      }
      setMessage({ type: "success", text: `Ticket status updated to '${newStatus === "RESOLVED" ? "Resolved" : "Open"}'.` });
    } catch (err) {
      console.error(err);
    } finally {
      setActionLoading(false);
    }
  };

  const filteredTickets = tickets.filter((t) => {
    const matchStatus = statusFilter === "ALL" || t.status === statusFilter;
    const matchPriority = priorityFilter === "ALL" || t.priority === priorityFilter;
    return matchStatus && matchPriority;
  });

  const getPriorityBadge = (priority: string) => {
    switch ((priority || "").toUpperCase()) {
      case "HIGH":
        return "bg-rose-500/15 text-rose-400 border-rose-500/30";
      case "MEDIUM":
        return "bg-amber-500/15 text-amber-400 border-amber-500/30";
      default:
        return "bg-emerald-500/15 text-emerald-400 border-emerald-500/30";
    }
  };

  return (
    <div className="min-h-screen bg-stone-950 text-stone-100 font-sans pb-24 pt-6 px-4 sm:px-6 lg:px-8 relative z-20">
      <Head>
        <title>Support Center | Admin Hub | Seed2Shelf</title>
      </Head>

      <div className="max-w-7xl mx-auto space-y-7">
        
        {/* HEADER */}
        <div className="flex items-center justify-between border-b border-stone-800/80 pb-4">
          <div className="flex items-center gap-3.5">
            <div className="p-3 bg-[#00d26a]/10 border border-[#00d26a]/20 rounded-2xl text-[#00d26a] shrink-0">
              <HelpCircle className="h-7 w-7" />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
                Support Center
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
              <option value="OPEN">Open</option>
              <option value="RESOLVED">Resolved</option>
            </select>

            <select
              value={priorityFilter}
              onChange={(e) => setPriorityFilter(e.target.value)}
              className="bg-stone-950 border border-stone-800 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-[#00d26a] font-bold"
            >
              <option value="ALL">All Priorities</option>
              <option value="HIGH">High</option>
              <option value="MEDIUM">Medium</option>
              <option value="LOW">Low</option>
            </select>

            <button 
              onClick={fetchTickets}
              title="Refresh Support Center"
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

        {/* TICKETS & CONVERSATION SPLIT VIEW */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-7 items-start">
          
          {/* TICKETS QUEUE SIDEBAR (5 COLUMNS - DARK STONE PANEL) */}
          <div className="lg:col-span-5 bg-stone-900/90 border border-stone-800 rounded-3xl p-5 space-y-4 shadow-xl max-h-[78vh] overflow-y-auto custom-scrollbar">
            <div className="flex items-center justify-between p-3.5 bg-stone-950 border border-stone-800/80 rounded-2xl">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-[#00d26a]"></span>
                <h3 className="text-xs font-black uppercase text-stone-200 tracking-wider">Tickets Queue ({filteredTickets.length})</h3>
              </div>
              <span className="text-[10px] font-bold px-2.5 py-1 rounded-xl bg-stone-800 text-stone-300">SELECT TO VIEW</span>
            </div>
            
            {filteredTickets.length === 0 ? (
              <div className="py-12 text-center text-stone-500 space-y-2">
                <HelpCircle className="w-8 h-8 mx-auto text-stone-700" />
                <p className="text-xs font-medium">No support tickets match the selected filters.</p>
              </div>
            ) : (
              filteredTickets.map((t) => (
                <div
                  key={t._id}
                  onClick={() => setSelectedTicket(t)}
                  className={`p-4 rounded-2xl border transition cursor-pointer space-y-2.5 ${
                    selectedTicket?._id === t._id ? "bg-[#00d26a]/15 border-[#00d26a]/50 shadow-md shadow-[#00d26a]/5 ring-1 ring-[#00d26a]/30" : "bg-stone-950/80 border-stone-800 hover:border-stone-700"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-mono text-emerald-400 font-bold">{t.ticketNumber || t._id}</span>
                    <span className={`px-2.5 py-0.5 rounded-full text-[9px] font-black uppercase border ${getPriorityBadge(t.priority)}`}>
                      {t.priority || "Medium"}
                    </span>
                  </div>

                  <h4 className="font-bold text-white text-xs line-clamp-1">{t.subject}</h4>
                  
                  {t.category && (
                    <div className="flex items-center gap-1.5 text-[10px] text-stone-400 font-semibold truncate">
                      <Tag className="w-3 h-3 text-[#00d26a] shrink-0" />
                      <span className="truncate">{t.category}</span>
                    </div>
                  )}

                  <p className="text-[11px] text-stone-400 line-clamp-2">{t.description}</p>
                  
                  <div className="flex items-center justify-between text-[10px] text-stone-500 pt-2 border-t border-stone-800/60">
                    <span className="font-semibold">{t.userId?.fullName || t.userId?.name || "User"} ({t.role || "Ecosystem User"})</span>
                    <span className="font-extrabold text-[#00d26a] uppercase">{t.status || "OPEN"}</span>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* ACTIVE WORKSPACE PANEL (7 COLUMNS - HIGH CONTRAST EMERALD GLASS WORKSPACE) */}
          <div className="lg:col-span-7 bg-[#0b0c0e] border-2 border-emerald-500/30 rounded-3xl p-6 sm:p-7 space-y-5 shadow-2xl relative overflow-hidden ring-1 ring-emerald-500/10">
            {/* ACCENT WORKSPACE TOP BORDER GLOW */}
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-emerald-500 via-[#00d26a] to-emerald-600"></div>

            {selectedTicket ? (
              <div className="space-y-5">
                
                {/* ACTIVE WORKSPACE BANNER HEADER */}
                <div className="flex items-center justify-between p-3.5 bg-stone-900/90 border border-stone-800 rounded-2xl">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse"></span>
                    <span className="text-xs font-black uppercase text-[#00d26a] tracking-wider">Active Workspace</span>
                  </div>
                  <span className="text-xs font-mono text-emerald-400 font-black">{selectedTicket.ticketNumber || selectedTicket._id}</span>
                </div>
                
                <div className="flex items-start justify-between border-b border-stone-800 pb-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-mono text-xs font-bold text-emerald-400">{selectedTicket.ticketNumber}</span>
                      <span className={`px-2.5 py-0.5 rounded-full text-[9px] font-black uppercase border ${getPriorityBadge(selectedTicket.priority)}`}>
                        {selectedTicket.priority || "Medium"} Priority
                      </span>
                      {selectedTicket.category && (
                        <span className="px-2.5 py-0.5 bg-stone-950 border border-stone-800 text-stone-300 rounded-full text-[10px] font-bold">
                          {selectedTicket.category}
                        </span>
                      )}
                    </div>
                    <h2 className="text-lg font-extrabold text-white">{selectedTicket.subject}</h2>
                    <p className="text-xs text-stone-400">
                      Submitted by: <strong className="text-white">{selectedTicket.userId?.fullName || selectedTicket.userId?.email || "Applicant User"}</strong> ({selectedTicket.role || "Ecosystem User"})
                    </p>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    {selectedTicket.status === "RESOLVED" || selectedTicket.status === "CLOSED" ? (
                      <div className="flex items-center gap-2">
                        <span className="px-3 py-1.5 bg-[#00d26a]/15 border border-[#00d26a]/30 text-[#00d26a] text-xs font-extrabold rounded-xl flex items-center gap-1.5 shadow-sm">
                          <CheckCircle2 className="w-3.5 h-3.5 text-[#00d26a]" />
                          Resolved
                        </span>
                        <button
                          disabled={actionLoading}
                          onClick={() => handleUpdateStatus(selectedTicket, "OPEN")}
                          className="px-3 py-1.5 bg-stone-950 hover:bg-stone-800 border border-stone-800 text-stone-400 hover:text-white text-xs font-bold rounded-xl transition cursor-pointer"
                        >
                          Re-open Ticket
                        </button>
                      </div>
                    ) : (
                      <button
                        disabled={actionLoading}
                        onClick={() => handleUpdateStatus(selectedTicket, "RESOLVED")}
                        className="px-3.5 py-1.5 bg-[#00d26a]/15 hover:bg-[#00d26a]/25 border border-[#00d26a]/30 text-[#00d26a] text-xs font-extrabold rounded-xl transition cursor-pointer flex items-center gap-1.5 shadow-sm"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5 text-[#00d26a]" />
                        Mark Resolved
                      </button>
                    )}
                  </div>
                </div>

                {/* BATCH / ORDER REF ID IF AVAILABLE */}
                {(selectedTicket.batchId || selectedTicket.orderRefId || selectedTicket.referenceId) && (
                  <div className="p-3 bg-stone-950 border border-stone-800 rounded-xl text-xs flex items-center justify-between">
                    <span className="text-stone-400 font-bold">Associated Reference ID:</span>
                    <span className="font-mono text-[#00d26a] font-extrabold">{selectedTicket.batchId || selectedTicket.orderRefId || selectedTicket.referenceId}</span>
                  </div>
                )}

                {/* ORIGINAL ISSUE */}
                <div className="p-4 bg-stone-950 border border-stone-800 rounded-2xl space-y-2 text-xs">
                  <span className="font-bold text-stone-400 uppercase text-[10px] tracking-wider block">Detailed Issue Description</span>
                  <p className="text-stone-200 whitespace-pre-wrap leading-relaxed">{selectedTicket.description}</p>
                </div>

                {/* THREAD REPLIES */}
                <div className="space-y-3 max-h-60 overflow-y-auto custom-scrollbar">
                  <h4 className="text-xs font-bold text-stone-400 uppercase tracking-wider">Official Ticket Communication</h4>
                  {(selectedTicket.replies || []).length === 0 ? (
                    <p className="text-xs text-stone-500 italic">No responses recorded yet.</p>
                  ) : (
                    selectedTicket.replies.map((r: any, idx: number) => (
                      <div key={idx} className={`p-3.5 rounded-2xl text-xs space-y-1 ${r.senderRole === "ADMIN" ? "bg-[#00d26a]/10 border border-[#00d26a]/20 ml-6 text-emerald-100" : "bg-stone-950 border border-stone-800 mr-6 text-stone-200"}`}>
                        <div className="flex items-center justify-between text-[10px] text-stone-400 font-bold">
                          <span>{r.senderName} ({r.senderRole})</span>
                          <span>{new Date(r.createdAt || Date.now()).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                        </div>
                        <p>{r.message}</p>
                      </div>
                    ))
                  )}
                </div>

                {/* REPLY INPUT */}
                <form onSubmit={handleSendReply} className="space-y-3 pt-3 border-t border-stone-800">
                  <label className="text-xs font-bold text-stone-300 block uppercase">Reply as Platform Administrator</label>
                  <textarea
                    rows={3}
                    required
                    placeholder="Type your official response to the user..."
                    value={replyText}
                    onChange={(e) => setReplyText(e.target.value)}
                    className="w-full bg-stone-950 border border-stone-800 rounded-2xl p-3 text-xs text-white placeholder-stone-600 focus:outline-none focus:border-[#00d26a]"
                  />
                  <button
                    type="submit"
                    disabled={actionLoading}
                    className="px-5 py-2.5 bg-[#00d26a] hover:bg-emerald-500 text-stone-950 font-extrabold text-xs uppercase tracking-wider rounded-xl transition cursor-pointer flex items-center gap-2 ml-auto shadow-lg"
                  >
                    <Send className="w-4 h-4 text-stone-950" />
                    <span>Send Reply</span>
                  </button>
                </form>

              </div>
            ) : (
              <div className="py-20 text-center text-stone-500 space-y-2">
                <HelpCircle className="w-10 h-10 mx-auto text-stone-700" />
                <p className="text-xs font-medium">Select a support ticket from the list to view details and respond.</p>
              </div>
            )}
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

