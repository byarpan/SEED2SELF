import { useState } from "react";
import { useSession } from "next-auth/react";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/pages/api/auth/[...nextauth]";
import { GetServerSideProps } from "next";
import Head from "next/head";
import Link from "next/link";
import {
  ClipboardList,
  CheckCircle2,
  Clock,
  Truck,
  Building2,
  Calendar,
  Lock,
  ShieldCheck,
  Check,
  ArrowRight
} from "lucide-react";

interface DistributorOrder {
  id: string;
  batchId: string;
  productName: string;
  category: string;
  buyer: string;
  quantity: string;
  totalPrice: string;
  date: string;
  status: "PENDING" | "ACCEPTED" | "DISPATCHED";
}

export default function ProcessorOrdersPage() {
  const { data: session } = useSession();
  const [filterStatus, setFilterStatus] = useState<"ALL" | "PENDING" | "ACCEPTED">("ALL");

  const [orders, setOrders] = useState<DistributorOrder[]>([]);

  const handleAcceptOrder = (id: string) => {
    setOrders((prev) =>
      prev.map((o) => (o.id === id ? { ...o, status: "ACCEPTED" } : o))
    );
  };

  const handleStartDelivery = (id: string) => {
    setOrders((prev) =>
      prev.map((o) => (o.id === id ? { ...o, status: "DISPATCHED" } : o))
    );
  };

  const filteredOrders = orders.filter((o) => {
    if (filterStatus === "PENDING") return o.status === "PENDING";
    if (filterStatus === "ACCEPTED") return o.status === "ACCEPTED" || o.status === "DISPATCHED";
    return true;
  });

  return (
    <div className="min-h-screen bg-stone-950 text-stone-100 font-sans pb-24 pt-6 px-4 sm:px-6 lg:px-8 relative z-20">
      <Head>
        <title>Distributor Orders | Seed2Shelf Processor</title>
        <meta name="description" content="Processor B2B Order Management for Distributor Purchase Orders" />
      </Head>

      {/* Solid Dark Background Overlay */}
      <div className="fixed inset-0 bg-stone-950 z-[-1] pointer-events-none"></div>

      <div className="max-w-6xl mx-auto space-y-7">
        
        {/* HEADER WITH TITLE ON LEFT AND FILTER SWITCHER ON RIGHT */}
        <div className="flex flex-wrap items-center justify-between gap-4 border-y border-stone-800/80 py-3.5">
          <div className="flex items-center gap-3.5">
            <div className="p-2.5 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl text-emerald-400 shrink-0">
              <ClipboardList className="h-7 w-7" />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
                Purchase Orders
              </h1>
            </div>
          </div>

          {/* RIGHT FILTER SWITCHER BAR */}
          <div className="flex items-center bg-stone-950 p-1.5 rounded-full border border-stone-800 text-xs font-extrabold">
            <button
              onClick={() => setFilterStatus("ALL")}
              className={`px-4 py-1.5 rounded-full transition cursor-pointer flex items-center justify-center ${
                filterStatus === "ALL"
                  ? "bg-emerald-600 text-white shadow-md font-black"
                  : "text-stone-400 hover:text-stone-200"
              }`}
            >
              <span>All Orders</span>
            </button>

            <div className="w-[1px] h-4 bg-stone-800 mx-1.5 shrink-0"></div>

            <button
              onClick={() => setFilterStatus("PENDING")}
              className={`px-4 py-1.5 rounded-full transition cursor-pointer flex items-center justify-center ${
                filterStatus === "PENDING"
                  ? "bg-emerald-600 text-white shadow-md font-black"
                  : "text-stone-400 hover:text-stone-200"
              }`}
            >
              <span>Pending</span>
            </button>

            <div className="w-[1px] h-4 bg-stone-800 mx-1.5 shrink-0"></div>

            <button
              onClick={() => setFilterStatus("ACCEPTED")}
              className={`px-4 py-1.5 rounded-full transition cursor-pointer flex items-center justify-center ${
                filterStatus === "ACCEPTED"
                  ? "bg-emerald-600 text-white shadow-md font-black"
                  : "text-stone-400 hover:text-stone-200"
              }`}
            >
              <span>Accepted</span>
            </button>
          </div>
        </div>

        {/* ELEGANT ORDERS CARDS LIST */}
        <div className="space-y-4">
          {filteredOrders.length === 0 ? (
            <div className="bg-stone-900/90 border border-stone-800 rounded-3xl p-12 text-center space-y-3">
              <div className="w-12 h-12 rounded-full bg-stone-950 border border-stone-800 flex items-center justify-center mx-auto text-stone-500">
                <ClipboardList className="w-6 h-6" />
              </div>
              <p className="text-stone-400 text-xs font-medium">No distributor purchase orders found matching this filter.</p>
            </div>
          ) : (
            filteredOrders.map((ord) => (
              <div
                key={ord.id}
                className="bg-stone-900/90 border border-stone-800/90 rounded-3xl p-6 sm:p-7 shadow-sm transition-all duration-200 hover:border-stone-700/80 space-y-5"
              >
                {/* TOP HEADER LINE: IDs & Status Badge */}
                <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-stone-800">
                  <div className="flex items-center gap-2.5 flex-wrap">
                    <span className="text-xs text-stone-200 font-extrabold bg-stone-950 px-3 py-1 rounded-xl border border-stone-800">
                      {ord.id}
                    </span>
                    <span className="text-xs text-emerald-400 font-bold bg-emerald-500/10 px-3 py-1 rounded-xl border border-emerald-500/20 flex items-center gap-1">
                      Batch: {ord.batchId}
                    </span>
                  </div>

                  <div className="flex items-center gap-3">
                    <span className="text-[11px] text-stone-400 font-medium flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5 text-stone-500" />
                      {ord.date}
                    </span>

                    {/* Status Pill */}
                    {ord.status === "PENDING" && (
                      <span className="text-xs font-bold px-3 py-1 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/20 flex items-center gap-1.5">
                        <Clock className="w-3.5 h-3.5" /> Awaiting Acceptance
                      </span>
                    )}

                    {ord.status === "ACCEPTED" && (
                      <span className="text-xs font-bold px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center gap-1.5">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> Accepted & Escrowed
                      </span>
                    )}

                    {ord.status === "DISPATCHED" && (
                      <span className="text-xs font-bold px-3 py-1 rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/20 flex items-center gap-1.5">
                        <Truck className="w-3.5 h-3.5 text-blue-400" /> In Transit
                      </span>
                    )}
                  </div>
                </div>

                {/* MAIN CONTENT GRID */}
                <div className="grid grid-cols-1 md:grid-cols-12 gap-5 items-center">
                  
                  {/* Left Column: Product Info & Buyer Details */}
                  <div className="md:col-span-7 space-y-2.5">
                    <div>
                      <span className="text-[10px] font-bold text-stone-500 uppercase tracking-wider block">
                        {ord.category}
                      </span>
                      <h3 className="text-lg sm:text-xl font-black text-white tracking-tight">
                        {ord.productName}
                      </h3>
                    </div>

                    <div className="flex items-center gap-2 text-xs text-stone-300">
                      <Building2 className="w-4 h-4 text-emerald-400 shrink-0" />
                      <span className="font-semibold text-stone-400">Buyer:</span>
                      <span className="font-extrabold text-white">{ord.buyer}</span>
                    </div>
                  </div>

                  {/* Right Column: Quantity, Total & Escrow Status */}
                  <div className="md:col-span-5 bg-stone-950/60 border border-stone-800/80 rounded-2xl p-4 flex flex-col justify-center space-y-3">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-stone-400 font-medium">Quantity Requested:</span>
                      <span className="font-extrabold text-white text-sm">{ord.quantity}</span>
                    </div>

                    <div className="flex items-center justify-between text-xs border-t border-stone-800/60 pt-2">
                      <span className="text-stone-400 font-medium">Total Offer Amount:</span>
                      <span className="text-base font-black text-emerald-400">{ord.totalPrice}</span>
                    </div>

                    {/* Escrow Status Line */}
                    {(ord.status === "ACCEPTED" || ord.status === "DISPATCHED") && (
                      <div className="pt-1 flex items-center justify-between text-[11px]">
                        {ord.status === "ACCEPTED" && (
                          <span className="text-amber-300 font-extrabold bg-amber-500/10 border border-amber-500/20 px-2.5 py-1 rounded-lg flex items-center gap-1.5 w-full justify-center">
                            <Lock className="w-3.5 h-3.5 text-amber-400" /> Smart Contract Escrow Secured
                          </span>
                        )}

                        {ord.status === "DISPATCHED" && (
                          <span className="text-amber-300 font-extrabold bg-amber-500/10 border border-amber-500/20 px-2.5 py-1 rounded-lg flex items-center gap-1.5 w-full justify-center">
                            <Lock className="w-3.5 h-3.5 text-amber-400" /> Escrow Secured • In Transit
                          </span>
                        )}
                      </div>
                    )}
                  </div>

                </div>

                {/* BOTTOM ACTION BAR */}
                <div className="pt-3 border-t border-stone-800/70 flex items-center justify-between flex-wrap gap-3">
                  <div className="text-[11px] text-stone-400 font-medium flex items-center gap-1.5">
                    <ShieldCheck className="w-4 h-4 text-emerald-400" />
                    <span>Protected by Escrow Security Protocol</span>
                  </div>

                  <div className="flex items-center gap-2">
                    {ord.status === "PENDING" && (
                      <button
                        onClick={() => handleAcceptOrder(ord.id)}
                        className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-xs transition cursor-pointer shadow-md flex items-center justify-center gap-1.5"
                      >
                        <span>Accept Order</span>
                      </button>
                    )}

                    {ord.status === "ACCEPTED" && (
                      <button
                        onClick={() => handleStartDelivery(ord.id)}
                        className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-xs transition cursor-pointer shadow-md flex items-center gap-2"
                      >
                        <Truck className="w-4 h-4" />
                        <span>Start Delivery</span>
                      </button>
                    )}

                    {ord.status === "DISPATCHED" && (
                      <Link
                        href="/processor/processorHub/shipments"
                        className="px-4 py-2.5 rounded-xl bg-stone-800 hover:bg-stone-700 text-emerald-400 font-extrabold text-xs transition cursor-pointer border border-stone-700 flex items-center justify-center"
                      >
                        <span>View Live Shipment</span>
                      </Link>
                    )}
                  </div>
                </div>

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
  if (!session) {
    return { redirect: { destination: "/", permanent: false } };
  }
  return { props: { user: JSON.parse(JSON.stringify(session.user)) } };
};
