import { useState } from "react";
import { useSession } from "next-auth/react";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/pages/api/auth/[...nextauth]";
import { GetServerSideProps } from "next";
import Head from "next/head";
import Link from "next/link";
import { 
  BarChart3, 
  Factory, 
  Boxes, 
  ClipboardList, 
  Truck, 
  MapPin, 
  Layers, 
  ArrowRight,
  Pencil,
  X,
  Check,
  LocateFixed,
  ExternalLink,
  Store,
  GitBranch,
  ShieldCheck
} from "lucide-react";

export default function ProcessorDashboard() {
  const { data: session } = useSession();
  const processorId = (session?.user as any)?.processorId || (session?.user as any)?.customId || (session?.user as any)?.id || "";
  
  const getFormattedProcessorId = () => {
    const pId = (session?.user as any)?.processorId || processorId;
    if (pId && pId.startsWith("S2S-PRC-")) return pId;
    if (pId && !pId.includes("-") && pId.length <= 15) return `S2S-PRC-${pId}`;
    return "S2S-PRC-000001";
  };

  const [facilityInfo, setFacilityInfo] = useState({
    facilityName: "Not Registered Yet",
    facilityLocation: "--",
    coordinates: "--",
    processingCapacity: "--",
    mainProducts: "--",
    processingPractice: "--",
    isRegistered: false
  });

  // Edit Facility Details Modal State
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editForm, setEditForm] = useState({ ...facilityInfo });
  const [isLocating, setIsLocating] = useState(false);

  const handleDetectGPSLocation = () => {
    if (!navigator.geolocation) {
      alert("Geolocation is not supported by your browser.");
      return;
    }
    setIsLocating(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const lat = position.coords.latitude.toFixed(4);
        const lng = position.coords.longitude.toFixed(4);
        const coordsStr = `${lat}° N, ${lng}° E`;
        setEditForm(prev => ({
          ...prev,
          coordinates: coordsStr,
          facilityLocation: prev.facilityLocation.includes("GPS:") 
            ? prev.facilityLocation 
            : `${prev.facilityLocation} (GPS: ${lat}, ${lng})`
        }));
        setIsLocating(false);
      },
      () => {
        setIsLocating(false);
        setEditForm(prev => ({
          ...prev,
          coordinates: "29.6857° N, 76.9905° E",
          facilityLocation: "Karnal Industrial Zone, Haryana, India (GPS: 29.6857, 76.9905)"
        }));
      }
    );
  };

  const handleSaveFacilityDetails = (e: React.FormEvent) => {
    e.preventDefault();
    setFacilityInfo({ ...editForm });
    setIsEditModalOpen(false);
  };

  return (
    <div className="min-h-screen bg-stone-950 text-stone-100 font-sans pb-24 pt-6 px-4 sm:px-6 lg:px-8 relative z-20">
      <Head>
        <title>Processor Dashboard | Seed2Shelf</title>
        <meta name="description" content="Manage processing facility operations, raw material marketplace, and processed goods inventory." />
      </Head>

      {/* Solid Dark Background Overlay to match Wallet & Farmer Dashboard theme */}
      <div className="fixed inset-0 bg-stone-950 z-[-1] pointer-events-none"></div>

      <div className="max-w-6xl mx-auto space-y-7">
        
        {/* =========================================================================
            HEADER (CLEAN TITLE & SUBTITLE - MATCHING FARMER DASHBOARD 1-TO-1)
           ========================================================================= */}
        <div className="flex items-center gap-3.5 border-y border-stone-800/80 py-3.5">
          <div className="p-2.5 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl text-emerald-400 shrink-0">
            <BarChart3 className="h-7 w-7" />
          </div>
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              Processor Dashboard
            </h1>
          </div>
        </div>


        {/* =========================================================================
            PROCESSING FACILITY INFORMATION SECTION (MATCHING FARMER DASHBOARD)
           ========================================================================= */}
        <div className="space-y-3">
          
          {/* HEADING OUTSIDE THE BOX WITH EDIT BUTTON */}
          <div className="flex items-center justify-between px-1 h-6">
            <h2 className="text-xs font-bold text-stone-400 uppercase tracking-wider">
              Processing Facility Information & Details
            </h2>

            <button
              onClick={() => {
                setEditForm({ ...facilityInfo });
                setIsEditModalOpen(true);
              }}
              className="inline-flex items-center gap-1.5 bg-stone-900 hover:bg-stone-800 text-stone-300 hover:text-white font-bold text-xs px-3.5 py-1.5 rounded-xl border border-stone-800 transition cursor-pointer"
            >
              <Pencil className="w-3.5 h-3.5 text-emerald-400" />
              Edit Details
            </button>
          </div>

          {/* DETAILS PORTION INSIDE THE BOX */}
          <div className="bg-stone-900/90 border border-stone-800 rounded-3xl p-6 sm:p-7 shadow-sm space-y-5">
            <div className="flex justify-between items-center pb-3 border-b border-stone-800">
              <span className="text-xs font-semibold text-stone-400">
                Registered Facility Record
              </span>
              <span className="text-xs font-mono font-bold text-stone-400 bg-stone-950 border border-stone-800 px-3 py-1 rounded-xl">
                ID: {getFormattedProcessorId()}
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-5 text-sm">
              
              {/* Facility Name */}
              <div className="p-4 bg-stone-950/60 rounded-2xl border border-stone-800/80 space-y-1">
                <span className="text-xs text-stone-400 font-bold uppercase block flex items-center gap-1">
                  <Factory className="w-3.5 h-3.5 text-emerald-400" /> Facility Name
                </span>
                <p className="font-bold text-white text-base">{facilityInfo.facilityName}</p>
              </div>

              {/* Facility Location */}
              <div className="p-4 bg-stone-950/60 rounded-2xl border border-stone-800/80 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-stone-400 font-bold uppercase flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5 text-emerald-400" /> Facility Location
                  </span>
                  <a
                    href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(facilityInfo.facilityLocation)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[11px] font-bold text-emerald-400 hover:text-emerald-300 flex items-center gap-1 bg-emerald-500/10 hover:bg-emerald-500/20 px-2.5 py-1 rounded-lg border border-emerald-500/20 transition cursor-pointer"
                    title="Open exact location in Google Maps"
                  >
                    <ExternalLink className="w-3 h-3" /> View on Google Maps
                  </a>
                </div>
                <p className="font-bold text-white text-base">{facilityInfo.facilityLocation}</p>
              </div>

              {/* Processing Capacity */}
              <div className="p-4 bg-stone-950/60 rounded-2xl border border-stone-800/80 space-y-1">
                <span className="text-xs text-stone-400 font-bold uppercase block flex items-center gap-1">
                  <Layers className="w-3.5 h-3.5 text-emerald-400" /> Processing Capacity
                </span>
                <p className="font-bold text-white text-base">{facilityInfo.processingCapacity}</p>
              </div>

              {/* Main Processed Products */}
              <div className="p-4 bg-stone-950/60 rounded-2xl border border-stone-800/80 space-y-1 md:col-span-2">
                <span className="text-xs text-stone-400 font-bold uppercase block">Main Processed Products</span>
                <p className="font-bold text-emerald-400 text-base">{facilityInfo.mainProducts}</p>
              </div>

              {/* Processing Practice */}
              <div className="p-4 bg-stone-950/60 rounded-2xl border border-stone-800/80 space-y-1">
                <span className="text-xs text-stone-400 font-bold uppercase block flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" /> Compliance & Standards
                </span>
                <p className="font-bold text-white text-base">{facilityInfo.processingPractice}</p>
              </div>

            </div>
          </div>

        </div>


        {/* =========================================================================
            PROCESSOR FEATURE MODULES GRID (MATCHING FARMER MODULES GRID)
           ========================================================================= */}
        <div className="space-y-3">
          <div className="flex items-center px-1 h-6">
            <h2 className="text-xs font-bold text-stone-400 uppercase tracking-wider">
              Processor Modules
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">

            {/* Marketplace */}
            <Link
              href="/processor/processorHub/marketplace"
              className="bg-stone-900/90 border border-stone-800 hover:border-emerald-500/40 rounded-3xl p-6 shadow-sm transition group flex flex-col justify-between h-44 cursor-pointer"
            >
              <div className="flex justify-between items-start">
                <div className="p-3 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
                  <Store className="w-6 h-6" />
                </div>
                <ArrowRight className="w-4 h-4 text-stone-500 group-hover:text-emerald-400 group-hover:translate-x-1 transition" />
              </div>
              <div>
                <h3 className="font-bold text-white text-base">Marketplace</h3>
                <p className="text-xs text-stone-400 mt-1">Procure fresh raw crops directly from farmers</p>
              </div>
            </Link>

            {/* Processed Inventory */}
            <Link
              href="/processor/processorHub/processedInventory"
              className="bg-stone-900/90 border border-stone-800 hover:border-emerald-500/40 rounded-3xl p-6 shadow-sm transition group flex flex-col justify-between h-44 cursor-pointer"
            >
              <div className="flex justify-between items-start">
                <div className="p-3 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
                  <Boxes className="w-6 h-6" />
                </div>
                <ArrowRight className="w-4 h-4 text-stone-500 group-hover:text-emerald-400 group-hover:translate-x-1 transition" />
              </div>
              <div>
                <h3 className="font-bold text-white text-base">Processed Inventory</h3>
                <p className="text-xs text-stone-400 mt-1">Manage packaged goods, stock & batch codes</p>
              </div>
            </Link>

            {/* Incoming Orders */}
            <Link
              href="/processor/processorHub/orders"
              className="bg-stone-900/90 border border-stone-800 hover:border-emerald-500/40 rounded-3xl p-6 shadow-sm transition group flex flex-col justify-between h-44 cursor-pointer"
            >
              <div className="flex justify-between items-start">
                <div className="p-3 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
                  <ClipboardList className="w-6 h-6" />
                </div>
                <ArrowRight className="w-4 h-4 text-stone-500 group-hover:text-emerald-400 group-hover:translate-x-1 transition" />
              </div>
              <div>
                <h3 className="font-bold text-white text-base">Incoming Orders</h3>
                <p className="text-xs text-stone-400 mt-1">Review distributor orders & payment escrows</p>
              </div>
            </Link>

            {/* Shipments */}
            <Link
              href="/processor/processorHub/shipments"
              className="bg-stone-900/90 border border-stone-800 hover:border-emerald-500/40 rounded-3xl p-6 shadow-sm transition group flex flex-col justify-between h-44 cursor-pointer"
            >
              <div className="flex justify-between items-start">
                <div className="p-3 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
                  <Truck className="w-6 h-6" />
                </div>
                <ArrowRight className="w-4 h-4 text-stone-500 group-hover:text-emerald-400 group-hover:translate-x-1 transition" />
              </div>
              <div>
                <h3 className="font-bold text-white text-base">Shipments</h3>
                <p className="text-xs text-stone-400 mt-1">Track outgoing cargo dispatches & delivery</p>
              </div>
            </Link>

            {/* Reports */}
            <Link
              href="/processor/processorHub/reports"
              className="bg-stone-900/90 border border-stone-800 hover:border-emerald-500/40 rounded-3xl p-6 shadow-sm transition group flex flex-col justify-between h-44 cursor-pointer"
            >
              <div className="flex justify-between items-start">
                <div className="p-3 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
                  <BarChart3 className="w-6 h-6" />
                </div>
                <ArrowRight className="w-4 h-4 text-stone-500 group-hover:text-emerald-400 group-hover:translate-x-1 transition" />
              </div>
              <div>
                <h3 className="font-bold text-white text-base">Reports & Analytics</h3>
                <p className="text-xs text-stone-400 mt-1">Review processing yield & revenue summaries</p>
              </div>
            </Link>

            {/* Trace Produce */}
            <Link
              href="/home/trace-product"
              className="bg-stone-900/90 border border-stone-800 hover:border-emerald-500/40 rounded-3xl p-6 shadow-sm transition group flex flex-col justify-between h-44 cursor-pointer"
            >
              <div className="flex justify-between items-start">
                <div className="p-3 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
                  <GitBranch className="w-6 h-6" />
                </div>
                <ArrowRight className="w-4 h-4 text-stone-500 group-hover:text-emerald-400 group-hover:translate-x-1 transition" />
              </div>
              <div>
                <h3 className="font-bold text-white text-base">Trace Produce</h3>
                <p className="text-xs text-stone-400 mt-1">Scan QR codes & track farm-to-shelf lineage</p>
              </div>
            </Link>

          </div>
        </div>

      </div>


      {/* =========================================================================
          EDIT FACILITY DETAILS MODAL POPUP
         ========================================================================= */}
      {isEditModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="bg-stone-900 border border-stone-800 w-full max-w-lg rounded-3xl p-6 sm:p-7 space-y-6 shadow-2xl relative animate-in fade-in zoom-in-95 duration-200">
            
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-stone-800 pb-4">
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl text-emerald-400">
                  <Pencil className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-lg font-extrabold text-white">Edit Facility Details</h3>
                  <p className="text-xs text-stone-400">Update processing plant information records</p>
                </div>
              </div>

              <button
                onClick={() => setIsEditModalOpen(false)}
                className="p-2 text-stone-400 hover:text-white rounded-xl bg-stone-800 hover:bg-stone-700 transition cursor-pointer"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Edit Form */}
            <form onSubmit={handleSaveFacilityDetails} className="space-y-4 text-xs">
              <div>
                <label className="text-stone-400 font-bold block mb-1">Facility Name</label>
                <input
                  type="text"
                  value={editForm.facilityName}
                  onChange={(e) => setEditForm({ ...editForm, facilityName: e.target.value })}
                  className="w-full bg-stone-950 border border-stone-800 rounded-xl px-3.5 py-2.5 text-white focus:outline-none focus:border-emerald-500/50 transition"
                  required
                />
              </div>

              <div>
                <label className="text-stone-400 font-bold block mb-1">Facility Location (Google Maps)</label>
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <input
                      type="text"
                      value={editForm.facilityLocation}
                      onChange={(e) => setEditForm({ ...editForm, facilityLocation: e.target.value })}
                      placeholder="e.g. Karnal Industrial Zone, Haryana, India"
                      className="w-full bg-stone-950 border border-stone-800 rounded-xl pl-9 pr-3.5 py-2.5 text-white focus:outline-none focus:border-emerald-500/50 transition"
                      required
                    />
                    <MapPin className="w-4 h-4 text-emerald-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  </div>

                  <button
                    type="button"
                    onClick={handleDetectGPSLocation}
                    disabled={isLocating}
                    className="px-3.5 py-2.5 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 rounded-xl font-bold text-xs flex items-center gap-1.5 transition cursor-pointer shrink-0"
                    title="Auto-detect current location via GPS / Google Maps API"
                  >
                    <LocateFixed className={`w-4 h-4 ${isLocating ? 'animate-spin' : ''}`} />
                    <span>{isLocating ? "Locating..." : "Auto-Pin GPS"}</span>
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-stone-400 font-bold block mb-1">Processing Capacity</label>
                  <input
                    type="text"
                    value={editForm.processingCapacity}
                    onChange={(e) => setEditForm({ ...editForm, processingCapacity: e.target.value })}
                    className="w-full bg-stone-950 border border-stone-800 rounded-xl px-3.5 py-2.5 text-white focus:outline-none focus:border-emerald-500/50 transition"
                    required
                  />
                </div>

                <div>
                  <label className="text-stone-400 font-bold block mb-1">Compliance & Practice</label>
                  <input
                    type="text"
                    value={editForm.processingPractice}
                    onChange={(e) => setEditForm({ ...editForm, processingPractice: e.target.value })}
                    className="w-full bg-stone-950 border border-stone-800 rounded-xl px-3.5 py-2.5 text-white focus:outline-none focus:border-emerald-500/50 transition"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="text-stone-400 font-bold block mb-1">Main Processed Products</label>
                <input
                  type="text"
                  value={editForm.mainProducts}
                  onChange={(e) => setEditForm({ ...editForm, mainProducts: e.target.value })}
                  className="w-full bg-stone-950 border border-stone-800 rounded-xl px-3.5 py-2.5 text-white focus:outline-none focus:border-emerald-500/50 transition"
                  required
                />
              </div>

              <div className="pt-3 flex items-center justify-end gap-3 border-t border-stone-800">
                <button
                  type="button"
                  onClick={() => setIsEditModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-300 text-xs font-bold transition cursor-pointer"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition cursor-pointer"
                >
                  Save Changes
                </button>
              </div>
            </form>

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
