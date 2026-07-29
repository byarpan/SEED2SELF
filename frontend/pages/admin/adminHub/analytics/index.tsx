import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/pages/api/auth/[...nextauth]";
import { GetServerSideProps } from "next";
import Head from "next/head";
import { BarChart3, TrendingUp, Users, RefreshCw } from "lucide-react";

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:5000";

export default function AdminAnalytics() {
  const [analytics, setAnalytics] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      const res = await fetch(`${BACKEND_URL}/api/v1/admin/analytics`);
      if (res.ok) {
        const json = await res.json();
        setAnalytics(json.data || {});
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalytics();
  }, []);

  return (
    <div className="min-h-screen bg-stone-950 text-stone-100 font-sans pb-24 pt-6 px-4 sm:px-6 lg:px-8 relative z-20">
      <Head>
        <title>Analytics & Charts | Admin Engine | Seed2Shelf</title>
      </Head>

      <div className="max-w-7xl mx-auto space-y-7">
        
        {/* HEADER */}
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-stone-800/80 pb-4">
          <div className="flex items-center gap-3.5">
            <div className="p-3 bg-indigo-500/10 border border-indigo-500/20 rounded-2xl text-indigo-400 shrink-0">
              <BarChart3 className="h-7 w-7" />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
                Platform Analytics & System Trends
              </h1>
              <p className="text-xs text-stone-400 font-medium">Real-time metrics for user growth, order volumes, revenue, & support activity</p>
            </div>
          </div>

          <button 
            onClick={fetchAnalytics}
            className="p-2.5 bg-stone-900 hover:bg-stone-800 border border-stone-800 rounded-xl text-stone-300 transition cursor-pointer flex items-center gap-2 text-xs font-bold"
          >
            <RefreshCw className={`w-4 h-4 text-[#00d26a] ${loading ? "animate-spin" : ""}`} />
            <span>Refresh Charts</span>
          </button>
        </div>

        {/* ANALYTICS GRID */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          
          <div className="p-6 bg-stone-900/90 border border-stone-800 rounded-3xl space-y-4 shadow-sm">
            <h3 className="text-sm font-extrabold text-white flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-[#00d26a]" /> User Registration Trend (30 Days)
            </h3>
            <div className="space-y-2">
              {(analytics?.userTrends || []).length === 0 ? (
                <p className="text-xs text-stone-500 py-6 text-center">No trend data available.</p>
              ) : (
                analytics.userTrends.map((t: any, idx: number) => (
                  <div key={idx} className="flex items-center justify-between text-xs p-2 bg-stone-950 rounded-xl border border-stone-800">
                    <span className="text-stone-400">{t._id}</span>
                    <span className="font-bold text-emerald-400">+{t.count} New Users</span>
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="p-6 bg-stone-900/90 border border-stone-800 rounded-3xl space-y-4 shadow-sm">
            <h3 className="text-sm font-extrabold text-white flex items-center gap-2">
              <BarChart3 className="w-4 h-4 text-[#00d26a]" /> Order Dispatch Volume Trend
            </h3>
            <div className="space-y-2">
              {(analytics?.orderTrends || []).length === 0 ? (
                <p className="text-xs text-stone-500 py-6 text-center">No order trend data available.</p>
              ) : (
                analytics.orderTrends.map((o: any, idx: number) => (
                  <div key={idx} className="flex items-center justify-between text-xs p-2 bg-stone-950 rounded-xl border border-stone-800">
                    <span className="text-stone-400">{o._id}</span>
                    <span className="font-bold text-blue-400">{o.count} Orders</span>
                  </div>
                ))
              )}
            </div>
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
