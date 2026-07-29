import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/pages/api/auth/[...nextauth]";
import { GetServerSideProps } from "next";
import Head from "next/head";
import { Wallet as WalletIcon, RefreshCw, CheckCircle2, Search } from "lucide-react";

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:5000";

export default function AdminWalletsMonitor() {
  const [wallets, setWallets] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchWallets = async () => {
    try {
      setLoading(true);
      const res = await fetch(`${BACKEND_URL}/api/v1/admin/wallets`);
      if (res.ok) {
        const json = await res.json();
        setWallets(json.data || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWallets();
  }, []);

  return (
    <div className="min-h-screen bg-stone-950 text-stone-100 font-sans pb-24 pt-6 px-4 sm:px-6 lg:px-8 relative z-20">
      <Head>
        <title>Wallets Monitor | Admin Engine | Seed2Shelf</title>
      </Head>

      <div className="max-w-7xl mx-auto space-y-7">
        
        {/* HEADER */}
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-stone-800/80 pb-4">
          <div className="flex items-center gap-3.5">
            <div className="p-3 bg-purple-500/10 border border-purple-500/20 rounded-2xl text-purple-400 shrink-0">
              <WalletIcon className="h-7 w-7" />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
                Platform Wallets & Balances Monitor
              </h1>
              <p className="text-xs text-stone-400 font-medium">Audit on-chain wallet addresses, user balances, & platform liquidity</p>
            </div>
          </div>

          <button 
            onClick={fetchWallets}
            className="p-2.5 bg-stone-900 hover:bg-stone-800 border border-stone-800 rounded-xl text-stone-300 transition cursor-pointer flex items-center gap-2 text-xs font-bold"
          >
            <RefreshCw className={`w-4 h-4 text-[#00d26a] ${loading ? "animate-spin" : ""}`} />
            <span>Refresh Wallets</span>
          </button>
        </div>

        {/* WALLETS TABLE */}
        <div className="bg-stone-900/90 border border-stone-800 rounded-3xl overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-stone-800 bg-stone-950/60 text-stone-400 uppercase tracking-wider font-bold">
                  <th className="py-3.5 px-4">User Account</th>
                  <th className="py-3.5 px-4">Role & ID</th>
                  <th className="py-3.5 px-4">Wallet Address</th>
                  <th className="py-3.5 px-4">Available Balance</th>
                  <th className="py-3.5 px-4">Locked Escrow</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-800/60">
                {wallets.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="py-8 text-center text-stone-500 font-medium">
                      No user wallet records found.
                    </td>
                  </tr>
                ) : (
                  wallets.map((w) => {
                    const u = w.userId || {};
                    return (
                      <tr key={w._id || w.id} className="hover:bg-stone-800/30 transition">
                        <td className="py-3.5 px-4">
                          <div className="font-bold text-white text-sm">{u.fullName || u.name || "User Account"}</div>
                          <div className="text-stone-400 text-[11px]">{u.email}</div>
                        </td>
                        <td className="py-3.5 px-4">
                          <span className="px-2 py-0.5 bg-stone-800 text-stone-200 border border-stone-700 rounded-md font-bold text-[10px] uppercase block w-fit">
                            {u.role || "USER"}
                          </span>
                          <span className="text-[11px] text-emerald-400 font-mono mt-1 block">
                            {u.farmerId || u.processorId || u._id}
                          </span>
                        </td>
                        <td className="py-3.5 px-4 font-mono text-purple-400">
                          {w.walletAddress || u.walletAddress || "0x0000...0000"}
                        </td>
                        <td className="py-3.5 px-4 font-bold text-emerald-400 text-sm">
                          ₹ {(w.balance || 0).toLocaleString("en-IN")}
                        </td>
                        <td className="py-3.5 px-4 font-bold text-amber-400 text-sm">
                          ₹ {(w.escrowLocked || 0).toLocaleString("en-IN")}
                        </td>
                      </tr>
                    );
                  })
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
