import { useState } from "react";
import { useSession } from "next-auth/react";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/pages/api/auth/[...nextauth]";
import { GetServerSideProps } from "next";
import Head from "next/head";
import { 
  Truck, 
  CheckCircle2, 
  Package, 
  MapPin, 
  ShieldCheck, 
  Calendar,
  XCircle,
  AlertTriangle,
  X,
  ArrowDownRight,
  ArrowUpRight,
  RotateCcw,
  History,
  Clock
} from "lucide-react";

interface ShipmentItem {
  id: string;
  batchId: string;
  productName: string;
  quantity: string;
  value: string;
  sourceOrDestination: string;
  senderName: string;
  dispatchedDate: string;
  estimatedDelivery: string;
  status: "IN_TRANSIT" | "DELIVERED" | "REJECTED";
  currentStep: number;
  rejectionReason?: string;
  rejectedDate?: string;
  acceptedDate?: string;
}

export default function ProcessorShipmentsPage() {
  const { data: session } = useSession();

  // Signal Tabs: "INCOMING" (Farmer -> Processor) vs "OUTGOING" (Processor -> Distributor)
  const [activeSignal, setActiveSignal] = useState<"INCOMING" | "OUTGOING">("INCOMING");

  // Sub-Tabs: "PENDING" (Pending Dispatches / In-Transit) vs "HISTORY" (Accepted / Rejected)
  const [subTab, setSubTab] = useState<"PENDING" | "HISTORY">("PENDING");

  // History Filter Sub-Option: "ALL" | "ACCEPTED" | "REJECTED"
  const [historyFilter, setHistoryFilter] = useState<"ALL" | "ACCEPTED" | "REJECTED">("ALL");

  // 1. INCOMING SHIPMENTS (Farmer -> Processor)
  const [incomingShipments, setIncomingShipments] = useState<ShipmentItem[]>([]);

  // 2. OUTGOING SHIPMENTS (Processor -> Distributor)
  const [outgoingShipments, setOutgoingShipments] = useState<ShipmentItem[]>([]);

  const [notification, setNotification] = useState<string | null>(null);

  // Rejection Modal State
  const [rejectModalItem, setRejectModalItem] = useState<ShipmentItem | null>(null);
  const [rejectCategory, setRejectCategory] = useState("Quality Inspection Failed");
  const [customReason, setCustomReason] = useState("");

  // Action: Accept Delivery & Release Escrow Payment
  const handleAcceptDelivery = (shpId: string) => {
    const isIncoming = activeSignal === "INCOMING";
    const updateFn = isIncoming ? setIncomingShipments : setOutgoingShipments;

    updateFn((prev) =>
      prev.map((shp) =>
        shp.id === shpId
          ? {
              ...shp,
              status: "DELIVERED",
              currentStep: 3,
              acceptedDate: new Date().toLocaleDateString() + " " + new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
            }
          : shp
      )
    );

    setNotification("Delivery accepted! Escrow payment released & moved to History.");
    setTimeout(() => setNotification(null), 5000);
  };

  // Action: Confirm Rejection & Refund Escrow Payment
  const handleConfirmReject = () => {
    if (!rejectModalItem) return;
    const details = customReason.trim();
    const finalReason = details
      ? `${rejectCategory}: ${details}`
      : `${rejectCategory}: Quality inspection failed intake standard. Cargo returned to seller.`;

    const isIncoming = activeSignal === "INCOMING";
    const updateFn = isIncoming ? setIncomingShipments : setOutgoingShipments;

    updateFn((prev) =>
      prev.map((shp) =>
        shp.id === rejectModalItem.id
          ? {
              ...shp,
              status: "REJECTED",
              currentStep: 3,
              rejectionReason: finalReason,
              rejectedDate: new Date().toLocaleDateString() + " " + new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
            }
          : shp
      )
    );

    setNotification(`Delivery rejected! Cargo returned to seller & moved to History.`);
    setTimeout(() => setNotification(null), 5000);
    setRejectModalItem(null);
    setCustomReason("");
  };

  const currentList = activeSignal === "INCOMING" ? incomingShipments : outgoingShipments;

  // Filter based on PENDING (In-Transit) vs HISTORY (Delivered / Rejected)
  const filteredList = currentList.filter((shp) => {
    if (subTab === "PENDING") {
      return shp.status === "IN_TRANSIT";
    }
    // HISTORY view
    if (shp.status === "IN_TRANSIT") return false;
    if (historyFilter === "ACCEPTED") return shp.status === "DELIVERED";
    if (historyFilter === "REJECTED") return shp.status === "REJECTED";
    return true;
  });

  const pendingCount = currentList.filter(s => s.status === "IN_TRANSIT").length;
  const historyCount = currentList.filter(s => s.status !== "IN_TRANSIT").length;

  return (
    <div className="min-h-screen bg-stone-950 text-stone-100 font-sans pb-24 pt-6 px-4 sm:px-6 lg:px-8 relative z-20">
      <Head>
        <title>Shipments & Logistics | Seed2Shelf Processor</title>
        <meta name="description" content="Processor B2B incoming farmer deliveries and outgoing distributor shipments." />
      </Head>

      {/* Solid Dark Background Overlay */}
      <div className="fixed inset-0 bg-stone-950 z-[-1] pointer-events-none"></div>

      <div className="max-w-6xl mx-auto space-y-7">
        
        {/* HEADER WITH TOP RIGHT SIGNAL TABS MATCHING FARMER LOGISTICS */}
        <div className="flex flex-wrap items-center justify-between gap-4 border-y border-stone-800/80 py-3.5">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl text-emerald-400 shrink-0">
              <Truck className="h-7 w-7" />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
                Shipments & Logistics
              </h1>
            </div>
          </div>

          {/* MAIN TAB SWITCHER IN TOP RIGHT HEADER (INCOMING vs OUTGOING) */}
          <div className="flex items-center bg-stone-950 p-1.5 rounded-2xl border border-stone-800 text-xs font-extrabold">
            <button
              onClick={() => setActiveSignal("INCOMING")}
              className={`px-4 py-2 rounded-xl transition cursor-pointer flex items-center ${
                activeSignal === "INCOMING"
                  ? "bg-emerald-600 text-white shadow-md font-black"
                  : "text-stone-400 hover:text-stone-200"
              }`}
            >
              <span>Incoming Shipments</span>
            </button>

            <div className="w-[1px] h-4 bg-stone-800 mx-1 shrink-0"></div>

            <button
              onClick={() => setActiveSignal("OUTGOING")}
              className={`px-4 py-2 rounded-xl transition cursor-pointer flex items-center ${
                activeSignal === "OUTGOING"
                  ? "bg-emerald-600 text-white shadow-md font-black"
                  : "text-stone-400 hover:text-stone-200"
              }`}
            >
              <span>Outgoing Shipments</span>
            </button>
          </div>
        </div>

        {notification && (
          <div className="p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl text-xs text-emerald-400 font-bold flex items-center gap-2 animate-in fade-in duration-300 shadow-lg">
            <CheckCircle2 className="w-5 h-5 shrink-0" />
            <span>{notification}</span>
          </div>
        )}

        {/* SUB-TABS: PENDING DISPATCHES vs HISTORY */}
        <div className="flex flex-wrap items-center justify-between gap-4 bg-stone-900/60 p-3 rounded-2xl border border-stone-800">
          
          <div className="flex items-center bg-stone-950 p-1 rounded-xl border border-stone-800 text-xs font-extrabold">
            <button
              onClick={() => setSubTab("PENDING")}
              className={`px-4 py-2 rounded-lg transition cursor-pointer flex items-center ${
                subTab === "PENDING"
                  ? "bg-emerald-600 text-white shadow-md font-black"
                  : "text-stone-400 hover:text-stone-200"
              }`}
            >
              <span>{activeSignal === "INCOMING" ? "Pending Dispatches" : "Active Dispatches"}</span>
            </button>

            <div className="w-[1px] h-4 bg-stone-800 mx-1 shrink-0"></div>

            <button
              onClick={() => setSubTab("HISTORY")}
              className={`px-4 py-2 rounded-lg transition cursor-pointer flex items-center ${
                subTab === "HISTORY"
                  ? "bg-emerald-600 text-white shadow-md font-black"
                  : "text-stone-400 hover:text-stone-200"
              }`}
            >
              <span>History</span>
            </button>
          </div>

          {/* HISTORY SUB-FILTER OPTION (VISIBLE WHEN HISTORY IS SELECTED) */}
          {subTab === "HISTORY" && (
            <div className="flex items-center bg-stone-950 p-1 rounded-xl border border-stone-800 text-[11px] font-extrabold">
              <button
                onClick={() => setHistoryFilter("ALL")}
                className={`px-3 py-1.5 rounded-lg transition cursor-pointer ${
                  historyFilter === "ALL" ? "bg-stone-800 text-white font-black" : "text-stone-400 hover:text-stone-200"
                }`}
              >
                All
              </button>

              <div className="w-[1px] h-3.5 bg-stone-800 mx-1 shrink-0"></div>

              <button
                onClick={() => setHistoryFilter("ACCEPTED")}
                className={`px-3 py-1.5 rounded-lg transition cursor-pointer ${
                  historyFilter === "ACCEPTED" ? "bg-stone-800 text-white font-black" : "text-stone-400 hover:text-stone-200"
                }`}
              >
                Accepted
              </button>

              <div className="w-[1px] h-3.5 bg-stone-800 mx-1 shrink-0"></div>

              <button
                onClick={() => setHistoryFilter("REJECTED")}
                className={`px-3 py-1.5 rounded-lg transition cursor-pointer ${
                  historyFilter === "REJECTED" ? "bg-stone-800 text-white font-black" : "text-stone-400 hover:text-stone-200"
                }`}
              >
                Rejected
              </button>
            </div>
          )}

        </div>

        {/* SHIPMENT CARDS LIST */}
        <div className="space-y-6">
          {filteredList.length === 0 ? (
            <div className="bg-stone-900/90 border border-stone-800 rounded-3xl p-12 text-center space-y-3">
              <div className="w-12 h-12 rounded-full bg-stone-950 border border-stone-800 flex items-center justify-center mx-auto text-stone-500">
                <Truck className="w-6 h-6" />
              </div>
              <p className="text-stone-400 text-xs font-medium">
                No {subTab === "PENDING" ? "pending in-transit dispatches" : "history records"} found in {activeSignal.toLowerCase()} shipments.
              </p>
            </div>
          ) : (
            filteredList.map((shp) => (
              <div
                key={shp.id}
                className={`bg-stone-900/90 border rounded-3xl p-6 sm:p-7 shadow-sm transition-all duration-200 space-y-6 ${
                  shp.status === 'REJECTED' 
                    ? 'border-red-900/50' 
                    : shp.status === 'DELIVERED' 
                    ? 'border-emerald-900/40' 
                    : 'border-stone-800'
                }`}
              >
                {/* HEADER META LINE: IDs, Dates & Status Badge */}
                <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-stone-800">
                  <div className="flex items-center gap-2.5 flex-wrap">
                    <span className="text-xs text-stone-200 font-extrabold bg-stone-950 px-3 py-1 rounded-xl border border-stone-800">
                      {shp.id}
                    </span>
                    <span className="text-xs text-emerald-400 font-bold bg-emerald-500/10 px-3 py-1 rounded-xl border border-emerald-500/20">
                      Batch: {shp.batchId}
                    </span>
                  </div>

                  <div className="flex items-center gap-3">
                    <span className="text-[11px] text-stone-400 font-medium flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5 text-stone-500" />
                      Dispatched: {shp.dispatchedDate}
                    </span>

                    {/* STATUS BADGE MATCHING USER SCREENSHOTS */}
                    <span className={`text-xs font-bold px-3 py-1 rounded-full border flex items-center gap-1.5 ${
                      shp.status === 'DELIVERED'
                        ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                        : shp.status === 'REJECTED'
                        ? 'bg-red-500/10 text-red-400 border-red-500/20'
                        : 'bg-blue-500/10 text-blue-400 border-blue-500/20 animate-pulse'
                    }`}>
                      {shp.status === 'DELIVERED' ? (
                        <>
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                          <span>ACCEPTED & PAID</span>
                        </>
                      ) : shp.status === 'REJECTED' ? (
                        <>
                          <XCircle className="w-3.5 h-3.5 text-red-400" />
                          <span>REJECTED & RETURNED</span>
                        </>
                      ) : (
                        <>
                          <Truck className="w-3.5 h-3.5 text-blue-400" />
                          <span>IN TRANSIT</span>
                        </>
                      )}
                    </span>
                  </div>
                </div>

                {/* MAIN CONTENT GRID */}
                <div className="grid grid-cols-1 md:grid-cols-12 gap-5 items-center">
                  
                  {/* Left Column: Shipment Cargo & Destination */}
                  <div className="md:col-span-7 space-y-2.5">
                    <div>
                      <span className="text-[10px] font-bold text-stone-500 uppercase tracking-wider block">Shipment Cargo</span>
                      <h3 className="text-lg sm:text-xl font-black text-white tracking-tight">
                        {shp.productName} <span className="text-stone-400 text-sm font-semibold">({shp.quantity})</span>
                      </h3>
                    </div>

                    <div className="flex items-start gap-2 text-xs text-stone-300">
                      <MapPin className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                      <div>
                        <span className="font-semibold text-stone-400">Destination: </span>
                        <span className="font-extrabold text-white">{shp.sourceOrDestination}</span>
                      </div>
                    </div>
                  </div>

                  {/* Right Column: Cargo Value & Dates */}
                  <div className="md:col-span-5 bg-stone-950/60 border border-stone-800/80 rounded-2xl p-4 flex flex-col justify-center space-y-2.5">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-stone-400 font-medium">Total Cargo Value:</span>
                      <span className="text-base font-black text-emerald-400">{shp.value}</span>
                    </div>

                    {shp.status === 'DELIVERED' && shp.acceptedDate && (
                      <div className="flex items-center justify-between text-xs border-t border-stone-800/60 pt-2">
                        <span className="text-stone-400 font-medium">Accepted Date:</span>
                        <span className="font-bold text-white font-mono">{shp.acceptedDate}</span>
                      </div>
                    )}

                    {shp.status === 'REJECTED' && shp.rejectedDate && (
                      <div className="flex items-center justify-between text-xs border-t border-stone-800/60 pt-2">
                        <span className="text-stone-400 font-medium">Rejected Date:</span>
                        <span className="font-bold text-red-400 font-mono">{shp.rejectedDate}</span>
                      </div>
                    )}

                    {shp.status === 'IN_TRANSIT' && (
                      <div className="flex items-center justify-between text-xs border-t border-stone-800/60 pt-2">
                        <span className="text-stone-400 font-medium">Estimated Arrival:</span>
                        <span className="font-bold text-white font-mono">{shp.estimatedDelivery}</span>
                      </div>
                    )}
                  </div>

                </div>

                {/* 3-STEP TIMELINE ROUTE TRACKER MATCHING IMAGE 1 & IMAGE 2 EXACTLY */}
                <div className="space-y-3 pt-2 bg-stone-950/40 p-4 sm:p-5 rounded-2xl border border-stone-800/60">
                  <span className="text-[10px] font-bold text-stone-500 uppercase tracking-wider block">
                    LIVE LOGISTICS ROUTE TRACKING
                  </span>

                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 sm:gap-0 relative">
                    
                    {/* Step 1: Origin Hub */}
                    <div className="flex items-center gap-3 relative z-10">
                      <div className="w-9 h-9 rounded-xl flex items-center justify-center border bg-stone-900 border-stone-700 text-stone-200 shadow-sm">
                        <Package className="w-4 h-4" />
                      </div>
                      <div>
                        <p className="text-xs font-bold text-white">
                          {activeSignal === "INCOMING" ? "Farmer Hub" : "Processor Hub"}
                        </p>
                        <p className="text-[10px] text-stone-400 font-medium">Dispatched</p>
                      </div>
                    </div>

                    {/* Step 1 to 2 Connector Line */}
                    <div className="flex-1 h-[2px] mx-4 hidden sm:block bg-emerald-500/60" />

                    {/* Step 2: Transit Status */}
                    <div className="flex items-center gap-3 relative z-10">
                      <div className={`w-9 h-9 rounded-xl flex items-center justify-center border ${
                        shp.status === 'REJECTED'
                          ? 'bg-amber-950/40 border-amber-800/60 text-amber-400'
                          : 'bg-emerald-950/40 border-emerald-800/60 text-emerald-400'
                      }`}>
                        {shp.status === 'REJECTED' ? <RotateCcw className="w-4 h-4" /> : <Truck className="w-4 h-4" />}
                      </div>
                      <div>
                        <p className="text-xs font-bold text-white">
                          {shp.status === 'REJECTED' ? "Return Transit" : "In Transit"}
                        </p>
                        <p className="text-[10px] text-stone-400 font-medium">
                          {shp.status === 'REJECTED' ? "En-route to Seller" : "GPS En-route"}
                        </p>
                      </div>
                    </div>

                    {/* Step 2 to 3 Connector Line */}
                    <div className={`flex-1 h-[2px] mx-4 hidden sm:block ${
                      shp.status === 'REJECTED'
                        ? 'bg-red-500/60'
                        : shp.status === 'DELIVERED'
                        ? 'bg-emerald-500/60'
                        : 'bg-stone-800'
                    }`} />

                    {/* Step 3: Final Delivery Decision Node */}
                    <div className="flex items-center gap-3 relative z-10">
                      <div className={`w-9 h-9 rounded-xl flex items-center justify-center border ${
                        shp.status === 'DELIVERED'
                          ? 'bg-emerald-950 border-emerald-500 text-emerald-400'
                          : shp.status === 'REJECTED'
                          ? 'bg-red-950 border-red-500 text-red-400'
                          : 'bg-stone-900 border-stone-800 text-stone-500'
                      }`}>
                        {shp.status === 'DELIVERED' ? (
                          <CheckCircle2 className="w-4 h-4" />
                        ) : shp.status === 'REJECTED' ? (
                          <XCircle className="w-4 h-4" />
                        ) : (
                          <ShieldCheck className="w-4 h-4" />
                        )}
                      </div>
                      <div>
                        <p className={`text-xs font-extrabold ${
                          shp.status === 'DELIVERED'
                            ? 'text-emerald-400'
                            : shp.status === 'REJECTED'
                            ? 'text-red-400'
                            : 'text-stone-300'
                        }`}>
                          {shp.status === 'DELIVERED'
                            ? "Delivery Accepted"
                            : shp.status === 'REJECTED'
                            ? "Delivery Rejected"
                            : "Awaiting Inspection"}
                        </p>
                        <p className="text-[10px] text-stone-400 font-medium">
                          {shp.status === 'DELIVERED'
                            ? "Verified & Accepted"
                            : shp.status === 'REJECTED'
                            ? "Inspection Failed"
                            : "Inspection Pending"}
                        </p>
                      </div>
                    </div>

                  </div>
                </div>

                {/* REJECTION REASON DISPLAY BOX MATCHING IMAGE 3 EXACTLY */}
                {shp.status === 'REJECTED' && shp.rejectionReason && (
                  <div className="p-4 bg-red-950/20 border border-red-900/40 rounded-2xl space-y-3">
                    <div className="flex items-center gap-2 text-xs font-black text-red-400">
                      <AlertTriangle className="w-4 h-4 shrink-0" />
                      <span>{activeSignal === 'INCOMING' ? 'Processor Rejection Details & Reason' : 'Distributor Rejection Details & Reason'}</span>
                    </div>

                    <div className="p-3.5 bg-stone-950/80 rounded-xl border border-stone-800/80 text-xs text-stone-300 leading-relaxed font-medium">
                      {shp.rejectionReason}
                    </div>

                    <div className="flex items-center justify-between text-[11px] text-stone-400 pt-1">
                      <span className="flex items-center gap-1 font-bold text-red-400">
                        <RotateCcw className="w-3.5 h-3.5" /> Status: Cargo Returned to Seller
                      </span>
                      {shp.rejectedDate && (
                        <span>Rejected on: {shp.rejectedDate}</span>
                      )}
                    </div>
                  </div>
                )}

                {/* BOTTOM FOOTER WITH ESCROW STATUS & ACTIONS */}
                <div className="pt-2 border-t border-stone-800/80 flex flex-wrap items-center justify-between gap-3">
                  <div className="flex items-center gap-2 text-xs text-stone-400 font-bold">
                    <ShieldCheck className="w-4 h-4 text-emerald-400" />
                    <span>Protected by Smart Contract Escrow System</span>
                  </div>

                  {activeSignal === 'INCOMING' && shp.status === 'IN_TRANSIT' && (
                    <div className="flex items-center gap-3">
                      <button
                        onClick={() => handleAcceptDelivery(shp.id)}
                        className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs transition shadow-md cursor-pointer flex items-center justify-center"
                      >
                        <span>Accept Delivery</span>
                      </button>

                      <button
                        onClick={() => setRejectModalItem(shp)}
                        className="px-4 py-2 rounded-xl bg-red-500/10 hover:bg-red-500/20 border border-red-500/30 text-red-400 font-bold text-xs transition cursor-pointer flex items-center justify-center"
                      >
                        <span>Reject Delivery</span>
                      </button>
                    </div>
                  )}
                </div>

              </div>
            ))
          )}
        </div>

      </div>

      {/* REJECTION REASON MODAL WITH PROFESSIONAL UI & WRITTEN SECTION FOR OTHER */}
      {rejectModalItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-950/85 backdrop-blur-md">
          <div className="bg-stone-900 border border-stone-800 rounded-3xl p-6 sm:p-8 max-w-xl w-full space-y-6 shadow-2xl animate-in zoom-in-95 duration-200">
            
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-stone-800 pb-4">
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-red-500/10 border border-red-500/20 rounded-2xl text-red-400 shrink-0">
                  <AlertTriangle className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg font-extrabold text-white tracking-tight">Reject Delivery & Return Cargo</h3>
                  <p className="text-[11px] text-stone-400 font-medium">Select or specify the official inspection failure reason</p>
                </div>
              </div>
              <button
                onClick={() => setRejectModalItem(null)}
                className="p-2 rounded-xl text-stone-400 hover:text-white bg-stone-950 border border-stone-800 transition cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Shipment Summary Info Callout */}
            <div className="bg-stone-950/90 border border-stone-800 rounded-2xl p-4 flex flex-wrap items-center justify-between gap-3 text-xs">
              <div>
                <span className="text-[10px] font-bold text-stone-500 uppercase tracking-wider block">Target Cargo</span>
                <span className="font-extrabold text-white text-sm">{rejectModalItem.productName}</span>
                <span className="text-stone-400 block font-mono text-[11px]">ID: {rejectModalItem.id} | Batch: {rejectModalItem.batchId}</span>
              </div>
              <div className="text-right">
                <span className="text-[10px] font-bold text-stone-500 uppercase tracking-wider block">Cargo Value</span>
                <span className="font-extrabold text-emerald-400 text-sm">{rejectModalItem.value}</span>
              </div>
            </div>

            {/* Radio Options List */}
            <div className="space-y-3">
              <span className="text-xs font-extrabold text-stone-300 uppercase tracking-wider block">
                Select Rejection Reason Category:
              </span>

              <div className="space-y-2.5">
                {[
                  "Quality Inspection Failed",
                  "Cargo Damaged in Transit",
                  "Grade Mismatch",
                  "Other"
                ].map((reasonOption) => {
                  const isSelected = rejectCategory === reasonOption;
                  return (
                    <label
                      key={reasonOption}
                      className={`flex items-start gap-3 p-3.5 rounded-2xl border text-xs font-bold transition cursor-pointer ${
                        isSelected
                          ? "bg-red-950/20 border-red-500/40 text-white shadow-sm"
                          : "bg-stone-950/70 border-stone-800 text-stone-300 hover:border-stone-700 hover:bg-stone-950"
                      }`}
                    >
                      <input
                        type="radio"
                        name="rejectionReason"
                        checked={isSelected}
                        onChange={() => setRejectCategory(reasonOption)}
                        className="mt-0.5 accent-red-500 shrink-0"
                      />
                      <span className="leading-snug">{reasonOption}</span>
                    </label>
                  );
                })}
              </div>

              {/* DETAILED WRITTEN REJECTION TEXTAREA - AVAILABLE FOR ALL OPTIONS */}
              <div className="space-y-2 pt-2 animate-in fade-in duration-200">
                <label className="text-xs font-extrabold text-red-400 block">
                  Detailed Written Explanation of Rejection Problem:
                </label>
                <textarea
                  rows={4}
                  required
                  placeholder="Provide a detailed written explanation of the rejection problem (e.g. Moisture level exceeded 18%, produce damaged during transport, or quality grade mismatch)..."
                  value={customReason}
                  onChange={(e) => setCustomReason(e.target.value)}
                  className="w-full bg-stone-950 border border-stone-800 focus:border-red-500/80 rounded-2xl p-4 text-xs text-white placeholder-stone-500 focus:outline-none transition font-medium min-h-[100px] leading-relaxed shadow-inner"
                />
              </div>
            </div>

            {/* Modal Actions */}
            <div className="pt-4 border-t border-stone-800 flex items-center justify-end gap-3">
              <button
                onClick={() => setRejectModalItem(null)}
                className="px-5 py-2.5 rounded-xl bg-stone-950 hover:bg-stone-800 text-stone-300 font-bold text-xs border border-stone-800 transition cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmReject}
                className="px-6 py-2.5 rounded-xl bg-red-600 hover:bg-red-500 text-white font-black text-xs transition shadow-lg shadow-red-950/40 cursor-pointer"
              >
                Confirm Rejection & Return Cargo
              </button>
            </div>

          </div>
        </div>
      )}
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
