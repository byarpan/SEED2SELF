import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/pages/api/auth/[...nextauth]";
import { GetServerSideProps } from "next";
import Head from "next/head";
import { Receipt, RefreshCw, ShieldCheck } from "lucide-react";

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:5000";

export default function AdminAuditLogs() {
  const [logs, setLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchLogs = async () => {
    try {
      setLoading(true);
      const res = await fetch(`${BACKEND_URL}/api/v1/admin/audit-logs`);
      if (res.ok) {
        const json = await res.json();
        setLogs(json.data || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, []);

  return (
    <div className="min-h-screen bg-stone-950 text-stone-100 font-sans pb-24 pt-6 px-4 sm:px-6 lg:px-8 relative z-20">
      <Head>
        <title>Audit Logs | Admin Engine | Seed2Shelf</title>
      </Head>

      <div className="max-w-7xl mx-auto space-y-7">
        
        {/* HEADER */}
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-stone-800/80 pb-4">
          <div className="flex items-center gap-3.5">
            <div className="p-3 bg-[#00d26a]/10 border border-[#00d26a]/20 rounded-2xl text-[#00d26a] shrink-0">
              <Receipt className="h-7 w-7" />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
                System Governance Audit Logs
              </h1>
              <p className="text-xs text-stone-400 font-medium">Immutable audit trail of all administrator actions, KYC approvals, & user modifications</p>
            </div>
          </div>

          <button 
            onClick={fetchLogs}
            className="p-2.5 bg-stone-900 hover:bg-stone-800 border border-stone-800 rounded-xl text-stone-300 transition cursor-pointer flex items-center gap-2 text-xs font-bold"
          >
            <RefreshCw className={`w-4 h-4 text-[#00d26a] ${loading ? "animate-spin" : ""}`} />
            <span>Refresh Audit Trail</span>
          </button>
        </div>

        {/* AUDIT LOGS TABLE */}
        <div className="bg-stone-900/90 border border-stone-800 rounded-3xl overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-stone-800 bg-stone-950/60 text-stone-400 uppercase tracking-wider font-bold">
                  <th className="py-3.5 px-4">Timestamp</th>
                  <th className="py-3.5 px-4">Admin Email</th>
                  <th className="py-3.5 px-4">Action Type</th>
                  <th className="py-3.5 px-4">Target Type</th>
                  <th className="py-3.5 px-4">Details</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-800/60">
                {logs.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="py-8 text-center text-stone-500 font-medium">
                      No admin audit logs recorded yet.
                    </td>
                  </tr>
                ) : (
                  logs.map((l) => (
                    <tr key={l._id || l.id} className="hover:bg-stone-800/30 transition">
                      <td className="py-3.5 px-4 font-mono text-stone-400">
                        {new Date(l.createdAt || Date.now()).toLocaleString("en-IN")}
                      </td>
                      <td className="py-3.5 px-4 text-white font-bold">
                        {l.adminEmail || l.adminId}
                      </td>
                      <td className="py-3.5 px-4">
                        <span className="px-2 py-0.5 bg-stone-800 text-emerald-400 border border-stone-700 rounded-md font-bold text-[10px] uppercase">
                          {l.action}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-stone-300">
                        {l.targetType} ({l.targetId})
                      </td>
                      <td className="py-3.5 px-4 text-stone-300">
                        {l.details}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
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
