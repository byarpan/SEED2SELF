import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/pages/api/auth/[...nextauth]";
import { GetServerSideProps } from "next";
import Head from "next/head";
import { ArrowLeftRight, Lock, CheckCircle2, ShieldCheck, RefreshCw } from "lucide-react";

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:5000";

export default function AdminPaymentsEscrow() {
  const [payments, setPayments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchPayments = async () => {
    try {
      setLoading(true);
      const res = await fetch(`${BACKEND_URL}/api/v1/admin/payments`);
      if (res.ok) {
        const json = await res.json();
        setPayments(json.data || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPayments();
  }, []);

  return (
    <div className="min-h-screen bg-stone-950 text-stone-100 font-sans pb-24 pt-6 px-4 sm:px-6 lg:px-8 relative z-20">
      <Head>
        <title>Payments & Escrow | Admin Engine | Seed2Shelf</title>
      </Head>

      <div className="max-w-7xl mx-auto space-y-7">
        
        {/* HEADER */}
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-stone-800/80 pb-4">
          <div className="flex items-center gap-3.5">
            <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl text-emerald-400 shrink-0">
              <ArrowLeftRight className="h-7 w-7" />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
                Payments & Escrow Protection Monitor
              </h1>
              <p className="text-xs text-stone-400 font-medium">Inspect all locked escrow accounts, settled transactions, and on-chain payment contracts</p>
            </div>
          </div>

          <button 
            onClick={fetchPayments}
            className="p-2.5 bg-stone-900 hover:bg-stone-800 border border-stone-800 rounded-xl text-stone-300 transition cursor-pointer flex items-center gap-2 text-xs font-bold"
          >
            <RefreshCw className={`w-4 h-4 text-[#00d26a] ${loading ? "animate-spin" : ""}`} />
            <span>Refresh Escrows</span>
          </button>
        </div>

        {/* PAYMENTS TABLE */}
        <div className="bg-stone-900/90 border border-stone-800 rounded-3xl overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-stone-800 bg-stone-950/60 text-stone-400 uppercase tracking-wider font-bold">
                  <th className="py-3.5 px-4">Escrow ID</th>
                  <th className="py-3.5 px-4">Order / Reference</th>
                  <th className="py-3.5 px-4">Buyer & Seller</th>
                  <th className="py-3.5 px-4">Locked Amount</th>
                  <th className="py-3.5 px-4">Escrow Status</th>
                  <th className="py-3.5 px-4">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-800/60">
                {payments.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-8 text-center text-stone-500 font-medium">
                      No escrow payments recorded yet.
                    </td>
                  </tr>
                ) : (
                  payments.map((p) => (
                    <tr key={p._id || p.id} className="hover:bg-stone-800/30 transition">
                      <td className="py-3.5 px-4 font-mono font-bold text-[#00d26a]">
                        {p.escrowId || p._id}
                      </td>
                      <td className="py-3.5 px-4 text-white font-bold">
                        {p.orderId || p.referenceId || "N/A"}
                      </td>
                      <td className="py-3.5 px-4 text-stone-300">
                        <div><strong>Buyer:</strong> {p.buyerId || "Processor"}</div>
                        <div><strong>Seller:</strong> {p.sellerId || "Farmer"}</div>
                      </td>
                      <td className="py-3.5 px-4 font-bold text-white text-sm">
                        ₹ {(p.rawAmount || p.amount || 0).toLocaleString("en-IN")}
                      </td>
                      <td className="py-3.5 px-4">
                        <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase border ${
                          p.status === "RELEASED" ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/30" : "bg-amber-500/10 text-amber-400 border-amber-500/30"
                        }`}>
                          {p.status || "LOCKED"}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-stone-400">
                        {new Date(p.createdAt || Date.now()).toLocaleDateString("en-IN")}
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
