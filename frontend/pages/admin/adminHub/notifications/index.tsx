import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/pages/api/auth/[...nextauth]";
import { GetServerSideProps } from "next";
import Head from "next/head";
import { Bell, RefreshCw, CheckCircle2 } from "lucide-react";

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:5000";

export default function AdminNotifications() {
  const [notifications, setNotifications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const res = await fetch(`${BACKEND_URL}/api/v1/admin/notifications`);
      if (res.ok) {
        const json = await res.json();
        setNotifications(json.data || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  return (
    <div className="min-h-screen bg-stone-950 text-stone-100 font-sans pb-24 pt-6 px-4 sm:px-6 lg:px-8 relative z-20">
      <Head>
        <title>Notifications | Admin Engine | Seed2Shelf</title>
      </Head>

      <div className="max-w-7xl mx-auto space-y-7">
        
        {/* HEADER */}
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-stone-800/80 pb-4">
          <div className="flex items-center gap-3.5">
            <div className="p-3 bg-amber-500/10 border border-amber-500/20 rounded-2xl text-amber-400 shrink-0">
              <Bell className="h-7 w-7" />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
                Admin Engine System Alerts & Notifications
              </h1>
              <p className="text-xs text-stone-400 font-medium">Real-time alerts for new KYC submissions, support tickets, payment failures, & fraud flags</p>
            </div>
          </div>

          <button 
            onClick={fetchNotifications}
            className="p-2.5 bg-stone-900 hover:bg-stone-800 border border-stone-800 rounded-xl text-stone-300 transition cursor-pointer flex items-center gap-2 text-xs font-bold"
          >
            <RefreshCw className={`w-4 h-4 text-[#00d26a] ${loading ? "animate-spin" : ""}`} />
            <span>Refresh Alerts</span>
          </button>
        </div>

        {/* NOTIFICATIONS LIST */}
        <div className="bg-stone-900/90 border border-stone-800 rounded-3xl p-6 space-y-3 shadow-sm">
          {notifications.length === 0 ? (
            <div className="py-12 text-center text-stone-500 space-y-2">
              <Bell className="w-10 h-10 mx-auto text-stone-700" />
              <p className="text-xs font-medium">No system notifications currently queued.</p>
            </div>
          ) : (
            notifications.map((n) => (
              <div key={n._id || n.id} className="p-4 bg-stone-950 border border-stone-800 rounded-2xl space-y-1">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-white text-xs">{n.title}</span>
                  <span className="text-[10px] text-stone-500">{new Date(n.createdAt || Date.now()).toLocaleString("en-IN")}</span>
                </div>
                <p className="text-xs text-stone-400">{n.message}</p>
              </div>
            ))
          )}
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
