import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/pages/api/auth/[...nextauth]";
import { GetServerSideProps } from "next";
import Head from "next/head";
import { ClipboardList, Truck, Package, RefreshCw, CheckCircle2, AlertTriangle } from "lucide-react";

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:5000";

export default function AdminOrdersOverview() {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("ALL");

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const res = await fetch(`${BACKEND_URL}/api/v1/admin/orders?status=${statusFilter}`);
      if (res.ok) {
        const json = await res.json();
        setOrders(json.data || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, [statusFilter]);

  return (
    <div className="min-h-screen bg-stone-950 text-stone-100 font-sans pb-24 pt-6 px-4 sm:px-6 lg:px-8 relative z-20">
      <Head>
        <title>Orders & Shipments | Admin Engine | Seed2Shelf</title>
      </Head>

      <div className="max-w-7xl mx-auto space-y-7">
        
        {/* HEADER */}
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-stone-800/80 pb-4">
          <div className="flex items-center gap-3.5">
            <div className="p-3 bg-blue-500/10 border border-blue-500/20 rounded-2xl text-blue-400 shrink-0">
              <ClipboardList className="h-7 w-7" />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
                Platform Orders & Logistics Monitoring
              </h1>
              <p className="text-xs text-stone-400 font-medium">Inspect all platform orders, dispatch statuses, and supply chain logistics</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="bg-stone-950 border border-stone-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-[#00d26a]"
            >
              <option value="ALL">All Order Statuses</option>
              <option value="PENDING">Pending</option>
              <option value="ACCEPTED">Accepted</option>
              <option value="DISPATCHED">Dispatched</option>
              <option value="DELIVERED">Delivered</option>
            </select>
            <button 
              onClick={fetchOrders}
              className="p-2.5 bg-stone-900 hover:bg-stone-800 border border-stone-800 rounded-xl text-stone-300 transition cursor-pointer flex items-center gap-2 text-xs font-bold"
            >
              <RefreshCw className={`w-4 h-4 text-[#00d26a] ${loading ? "animate-spin" : ""}`} />
              <span>Refresh Orders</span>
            </button>
          </div>
        </div>

        {/* ORDERS TABLE */}
        <div className="bg-stone-900/90 border border-stone-800 rounded-3xl overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-stone-800 bg-stone-950/60 text-stone-400 uppercase tracking-wider font-bold">
                  <th className="py-3.5 px-4">Order Number</th>
                  <th className="py-3.5 px-4">Produce Details</th>
                  <th className="py-3.5 px-4">Buyer & Seller</th>
                  <th className="py-3.5 px-4">Amount</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-4">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-800/60">
                {orders.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-8 text-center text-stone-500 font-medium">
                      No platform orders recorded yet.
                    </td>
                  </tr>
                ) : (
                  orders.map((o) => (
                    <tr key={o._id || o.id} className="hover:bg-stone-800/30 transition">
                      <td className="py-3.5 px-4 font-mono font-bold text-emerald-400">
                        {o.orderNumber || o._id}
                      </td>
                      <td className="py-3.5 px-4">
                        <div className="font-bold text-white text-sm">{o.cropName}</div>
                        <div className="text-stone-400 text-[11px]">{o.quantity} kg @ ₹{o.pricePerKg}/kg</div>
                      </td>
                      <td className="py-3.5 px-4 text-stone-300">
                        <div><strong>Buyer:</strong> {o.buyerName || o.processorId || "Processor"}</div>
                        <div><strong>Seller:</strong> {o.farmerName || o.farmerId || "Farmer"}</div>
                      </td>
                      <td className="py-3.5 px-4 font-bold text-white text-sm">
                        ₹ {(o.totalAmount || 0).toLocaleString("en-IN")}
                      </td>
                      <td className="py-3.5 px-4">
                        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase border bg-emerald-500/10 text-emerald-400 border-emerald-500/30">
                          {o.orderStatus || "PENDING"}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-stone-400">
                        {new Date(o.createdAt || Date.now()).toLocaleDateString("en-IN")}
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
