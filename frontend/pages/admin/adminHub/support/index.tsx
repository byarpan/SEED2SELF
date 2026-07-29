import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/pages/api/auth/[...nextauth]";
import { GetServerSideProps } from "next";
import Head from "next/head";
import { 
  HelpCircle, 
  MessageSquare, 
  Send, 
  CheckCircle2, 
  Clock, 
  AlertTriangle, 
  User, 
  RefreshCw,
  Tag,
  Filter
} from "lucide-react";

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:5000";

export default function AdminSupportCenter() {
  const { data: session } = useSession();
  const [tickets, setTickets] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [priorityFilter, setPriorityFilter] = useState("ALL");
  const [selectedTicket, setSelectedTicket] = useState<any | null>(null);
  const [replyText, setReplyText] = useState("");
  const [actionLoading, setActionLoading] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const fetchTickets = async () => {
    try {
      setLoading(true);
      const res = await fetch(`${BACKEND_URL}/api/v1/admin/support/tickets?status=${statusFilter}&priority=${priorityFilter}`);
      if (res.ok) {
        const json = await res.json();
        setTickets(json.data || []);
      }
    } catch (err) {
      console.error(err);
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
      const res = await fetch(`${BACKEND_URL}/api/v1/admin/support/tickets/${selectedTicket._id}/reply`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: replyText }),
      });

      if (res.ok) {
        setMessage({ type: "success", text: "Reply sent to user successfully!" });
        setReplyText("");
        fetchTickets();
        setSelectedTicket(null);
      } else {
        const json = await res.json();
        setMessage({ type: "error", text: json.message || "Failed to send reply." });
      }
    } catch (err) {
      setMessage({ type: "error", text: "Server error occurred." });
    } finally {
      setActionLoading(false);
    }
  };

  const handleUpdateStatus = async (ticketId: string, status: string) => {
    try {
      setActionLoading(true);
      const res = await fetch(`${BACKEND_URL}/api/v1/admin/support/tickets/${ticketId}/status`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      if (res.ok) {
        setMessage({ type: "success", text: `Ticket status changed to ${status}.` });
        fetchTickets();
        if (selectedTicket?._id === ticketId) {
          setSelectedTicket({ ...selectedTicket, status });
        }
      }
    } catch (err) {
      console.error(err);
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-stone-950 text-stone-100 font-sans pb-24 pt-6 px-4 sm:px-6 lg:px-8 relative z-20">
      <Head>
        <title>Support Center | Admin Engine | Seed2Shelf</title>
      </Head>

      <div className="max-w-7xl mx-auto space-y-7">
        
        {/* HEADER */}
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-stone-800/80 pb-4">
          <div className="flex items-center gap-3.5">
            <div className="p-3 bg-cyan-500/10 border border-cyan-500/20 rounded-2xl text-cyan-400 shrink-0">
              <HelpCircle className="h-7 w-7" />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
                Platform Support Center
              </h1>
              <p className="text-xs text-stone-400 font-medium">Manage support tickets, assign priorities, reply to users, & close or reopen issues</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="bg-stone-950 border border-stone-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-[#00d26a]"
            >
              <option value="ALL">All Ticket Statuses</option>
              <option value="OPEN">Open</option>
              <option value="WAITING_FOR_USER">Waiting for User</option>
              <option value="RESOLVED">Resolved</option>
              <option value="CLOSED">Closed</option>
            </select>

            <select
              value={priorityFilter}
              onChange={(e) => setPriorityFilter(e.target.value)}
              className="bg-stone-950 border border-stone-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-[#00d26a]"
            >
              <option value="ALL">All Priorities</option>
              <option value="CRITICAL">Critical</option>
              <option value="HIGH">High</option>
              <option value="MEDIUM">Medium</option>
              <option value="LOW">Low</option>
            </select>

            <button 
              onClick={fetchTickets}
              className="p-2.5 bg-stone-900 hover:bg-stone-800 border border-stone-800 rounded-xl text-stone-300 transition cursor-pointer flex items-center gap-2 text-xs font-bold"
            >
              <RefreshCw className={`w-4 h-4 text-[#00d26a] ${loading ? "animate-spin" : ""}`} />
              <span>Refresh</span>
            </button>
          </div>
        </div>

        {message && (
          <div className={`p-4 rounded-2xl border text-xs font-bold flex items-center gap-2 ${message.type === "success" ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-400" : "bg-red-500/10 border-red-500/20 text-red-400"}`}>
            {message.type === "success" ? <CheckCircle2 className="w-5 h-5 shrink-0" /> : <AlertTriangle className="w-5 h-5 shrink-0" />}
            <span>{message.text}</span>
          </div>
        )}

        {/* TICKETS & CONVERSATION SPLIT VIEW */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          {/* TICKETS LIST (5 COLUMNS) */}
          <div className="lg:col-span-5 bg-stone-900/90 border border-stone-800 rounded-3xl p-4 space-y-3 shadow-sm max-h-[75vh] overflow-y-auto custom-scrollbar">
            <h3 className="text-xs font-black uppercase text-stone-400 tracking-wider">Tickets List ({tickets.length})</h3>
            
            {tickets.length === 0 ? (
              <p className="text-xs text-stone-500 py-6 text-center">No support tickets found.</p>
            ) : (
              tickets.map((t) => (
                <div
                  key={t._id}
                  onClick={() => setSelectedTicket(t)}
                  className={`p-4 rounded-2xl border transition cursor-pointer space-y-2 ${
                    selectedTicket?._id === t._id ? "bg-[#00d26a]/10 border-[#00d26a]/40" : "bg-stone-950/80 border-stone-800 hover:border-stone-700"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-mono text-emerald-400 font-bold">{t.ticketNumber || t._id}</span>
                    <span className={`px-2 py-0.5 rounded-full text-[9px] font-black uppercase border ${
                      t.priority === "CRITICAL" || t.priority === "HIGH" ? "bg-red-500/10 text-red-400 border-red-500/30" : "bg-stone-800 text-stone-300 border-stone-700"
                    }`}>
                      {t.priority}
                    </span>
                  </div>
                  <h4 className="font-bold text-white text-xs line-clamp-1">{t.subject}</h4>
                  <p className="text-[11px] text-stone-400 line-clamp-2">{t.description}</p>
                  <div className="flex items-center justify-between text-[10px] text-stone-500 pt-1 border-t border-stone-800/60">
                    <span>{t.userId?.fullName || t.userId?.name || "User"} ({t.role})</span>
                    <span className="font-bold text-cyan-400">{t.status}</span>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* TICKET DETAILS & REPLY PANEL (7 COLUMNS) */}
          <div className="lg:col-span-7 bg-stone-900/90 border border-stone-800 rounded-3xl p-6 space-y-5 shadow-sm">
            {selectedTicket ? (
              <div className="space-y-5">
                
                <div className="flex items-start justify-between border-b border-stone-800 pb-4">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs font-bold text-emerald-400">{selectedTicket.ticketNumber}</span>
                      <span className="px-2 py-0.5 bg-stone-800 border border-stone-700 text-stone-300 rounded text-[10px] uppercase font-bold">{selectedTicket.category}</span>
                    </div>
                    <h2 className="text-lg font-extrabold text-white mt-1">{selectedTicket.subject}</h2>
                    <p className="text-xs text-stone-400 mt-0.5">Submitted by: {selectedTicket.userId?.fullName || selectedTicket.userId?.email} ({selectedTicket.role})</p>
                  </div>

                  <div className="flex items-center gap-2">
                    {selectedTicket.status !== "RESOLVED" && (
                      <button
                        disabled={actionLoading}
                        onClick={() => handleUpdateStatus(selectedTicket._id, "RESOLVED")}
                        className="px-3 py-1.5 bg-emerald-600/20 hover:bg-emerald-600/30 border border-emerald-500/30 text-emerald-400 text-xs font-bold rounded-xl transition cursor-pointer"
                      >
                        Mark Resolved
                      </button>
                    )}
                    {selectedTicket.status !== "CLOSED" && (
                      <button
                        disabled={actionLoading}
                        onClick={() => handleUpdateStatus(selectedTicket._id, "CLOSED")}
                        className="px-3 py-1.5 bg-stone-950 hover:bg-stone-800 border border-stone-800 text-stone-400 text-xs font-bold rounded-xl transition cursor-pointer"
                      >
                        Close
                      </button>
                    )}
                  </div>
                </div>

                {/* ORIGINAL ISSUE */}
                <div className="p-4 bg-stone-950 border border-stone-800 rounded-2xl space-y-2 text-xs">
                  <span className="font-bold text-stone-400 uppercase text-[10px] tracking-wider block">Original Ticket Description</span>
                  <p className="text-stone-200 whitespace-pre-wrap">{selectedTicket.description}</p>
                </div>

                {/* THREAD REPLIES */}
                <div className="space-y-3 max-h-60 overflow-y-auto custom-scrollbar">
                  <h4 className="text-xs font-bold text-stone-400 uppercase tracking-wider">Conversation History</h4>
                  {(selectedTicket.replies || []).length === 0 ? (
                    <p className="text-xs text-stone-500 italic">No replies yet.</p>
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
                    <Send className="w-4 h-4" />
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
