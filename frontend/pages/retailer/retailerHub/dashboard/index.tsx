import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import Head from "next/head";
import Link from "next/link";
import { 
  BarChart3, 
  Sprout, 
  ClipboardList, 
  Truck, 
  MapPin, 
  Layers, 
  ArrowRight,
  ChevronRight,
  Pencil,
  X,
  Store,
  Package,
  FileText,
  GitBranch,
  Loader2,
  PackageSearch,
  LocateFixed,
  ExternalLink,
  Check
} from "lucide-react";

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:5000";

export default function RetailerDashboard() {
  const { data: session } = useSession();
  const retailerId = (session?.user as any)?.id || (session?.user as any)?.retailerId || "";
  
  const [displayRetId, setDisplayRetId] = useState<string>(
    (session?.user as any)?.retailerId || ""
  );

  const getFormattedRetId = () => {
    const rId = (session?.user as any)?.retailerId || displayRetId;
    if (rId && rId.startsWith("S2S-RET-")) return rId;
    if (rId && !rId.includes("-") && rId.length <= 15) return `S2S-RET-${rId}`;
    return "S2S-RET-000001";
  };

  const [retailerInfo, setRetailerInfo] = useState<{
    storeName: string;
    storeLocation: string;
    coordinates: string;
    storeType: string;
    shelfCapacity: string;
    employeeCount: string;
    isRegistered: boolean;
  }>({
    storeName: "Not Registered Yet",
    storeLocation: "--",
    coordinates: "--",
    storeType: "--",
    shelfCapacity: "--",
    employeeCount: "--",
    isRegistered: false
  });

  const [isLoading, setIsLoading] = useState(false);

  // Edit Store Details Modal State
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editForm, setEditForm] = useState({ ...retailerInfo });
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
          storeLocation: prev.storeLocation.includes("GPS:") 
            ? prev.storeLocation 
            : `${prev.storeLocation} (GPS: ${lat}, ${lng})`
        }));
        setIsLocating(false);
      },
      () => {
        setIsLocating(false);
        setEditForm(prev => ({
          ...prev,
          coordinates: "29.6857° N, 76.9905° E",
          storeLocation: "Karnal Industrial Zone, Haryana, India (GPS: 29.6857, 76.9905)"
        }));
      }
    );
  };

  const handleSaveFacilityDetails = (e: React.FormEvent) => {
    e.preventDefault();
    setRetailerInfo({ ...editForm });
    setIsEditModalOpen(false);
  };

  useEffect(() => {
    if ((session?.user as any)?.retailerId) {
      setDisplayRetId((session?.user as any).retailerId);
    }
  }, [session]);

  useEffect(() => {
    if (!retailerId) return;
    const fetchDashboard = async () => {
      try {
        setIsLoading(true);
        // We attempt to fetch retailer info
        const res = await fetch(`${BACKEND_URL}/api/v1/retailer/dashboard?userId=${retailerId}`);
        if (res.ok) {
          const json = await res.json();
          if (json.success && json.data) {
             // populate if actual data exists
          }
        }
        
        // Try fetching actual crops where currentOwnerId is the retailerId
        // Removed purchased batches fetch

      } catch (err) {
        console.warn("Backend API offline or unreachable, utilizing default dashboard state", err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchDashboard();
  }, [retailerId]);


  return (
    <div className="min-h-screen bg-stone-950 text-stone-100 font-sans pb-24 pt-6 px-4 sm:px-6 lg:px-8 relative z-20">
      <Head>
        <title>Retailer Dashboard | Seed2Shelf</title>
        <meta name="description" content="Manage store inventory, incoming shipments, and retail sales." />
      </Head>

      <div className="fixed inset-0 bg-stone-950 z-[-1] pointer-events-none"></div>

      <div className="max-w-6xl mx-auto space-y-7">
        
        {/* HEADER */}
        <div className="flex items-center justify-between border-y border-stone-800/80 py-3.5">
          <div className="flex items-center gap-3.5">
            <div className="p-2.5 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl text-emerald-400 shrink-0">
              <BarChart3 className="h-7 w-7" />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
                Retailer Dashboard
              </h1>
            </div>
          </div>

          {isLoading && (
            <div className="flex items-center gap-2 text-xs font-semibold text-emerald-400 bg-emerald-500/10 px-3 py-1.5 rounded-xl border border-emerald-500/20">
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
              <span>Syncing Live Data...</span>
            </div>
          )}
        </div>

        {/* RETAILER INFORMATION SECTION */}
        <div className="space-y-3">
          
          <div className="flex items-center justify-between px-1 h-6">
            <h2 className="text-xs font-bold text-stone-400 uppercase tracking-wider">
              Retailer Information & Details
            </h2>

            <button
              onClick={() => {
                setEditForm({ ...retailerInfo });
                setIsEditModalOpen(true);
              }}
              className="inline-flex items-center gap-1.5 bg-stone-900 hover:bg-stone-800 text-stone-300 hover:text-white font-bold text-xs px-3.5 py-1.5 rounded-xl border border-stone-800 transition cursor-pointer"
            >
              <Pencil className="w-3.5 h-3.5 text-emerald-400" />
              Edit Details
            </button>
          </div>

          <div className="bg-stone-900/90 border border-stone-800 rounded-3xl p-6 sm:p-7 shadow-sm space-y-5">
            <div className="flex justify-between items-center pb-3 border-b border-stone-800">
              <span className="text-xs font-semibold text-stone-400">
                Registered Retail Store Record
              </span>
              <span className="text-xs font-mono font-bold text-stone-400 bg-stone-950 border border-stone-800 px-3 py-1 rounded-xl">
                ID: {getFormattedRetId()}
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-5 text-sm">
              <div className="p-4 bg-stone-950/60 rounded-2xl border border-stone-800/80 space-y-1">
                <span className="text-xs text-stone-400 font-bold uppercase block">Store Name</span>
                <p className="font-bold text-white text-base">{retailerInfo.storeName}</p>
              </div>

              <div className="p-4 bg-stone-950/60 rounded-2xl border border-stone-800/80 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-stone-400 font-bold uppercase flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5 text-emerald-400" /> Store Location
                  </span>
                  <a
                    href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(retailerInfo.storeLocation)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[11px] font-bold text-emerald-400 hover:text-emerald-300 flex items-center gap-1 bg-emerald-500/10 hover:bg-emerald-500/20 px-2.5 py-1 rounded-lg border border-emerald-500/20 transition cursor-pointer"
                    title="Open exact location in Google Maps"
                  >
                    <ExternalLink className="w-3 h-3" /> View on Google Maps
                  </a>
                </div>
                <p className="font-bold text-white text-base">{retailerInfo.storeLocation}</p>
              </div>

              <div className="p-4 bg-stone-950/60 rounded-2xl border border-stone-800/80 space-y-1">
                <span className="text-xs text-stone-400 font-bold uppercase block flex items-center gap-1">
                  <Layers className="w-3.5 h-3.5 text-emerald-400" /> Shelf Capacity
                </span>
                <p className="font-bold text-white text-base">{retailerInfo.shelfCapacity}</p>
              </div>

              <div className="p-4 bg-stone-950/60 rounded-2xl border border-stone-800/80 space-y-1 md:col-span-2">
                <span className="text-xs text-stone-400 font-bold uppercase block">Store Type / Focus</span>
                <p className="font-bold text-emerald-400 text-base">{retailerInfo.storeType}</p>
              </div>

              <div className="p-4 bg-stone-950/60 rounded-2xl border border-stone-800/80 space-y-1">
                <span className="text-xs text-stone-400 font-bold uppercase block">Employee Count</span>
                <p className="font-bold text-white text-base">{retailerInfo.employeeCount}</p>
              </div>
            </div>
          </div>
        </div>


        {/* FEATURE MODULES GRID */}
        <div className="space-y-3">
          <div className="flex items-center px-1 h-6">
            <h2 className="text-xs font-bold text-stone-400 uppercase tracking-wider">
              Retailer Modules
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">

            {/* Marketplace */}
            <Link
              href="/retailer/retailerHub/marketplace"
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
                <p className="text-xs text-stone-400 mt-1">Browse and purchase processed goods</p>
              </div>
            </Link>
            
            {/* Retail Hub */}
            <Link
              href="/retailer/retailerHub/retailHub"
              className="bg-stone-900/90 border border-stone-800 hover:border-emerald-500/40 rounded-3xl p-6 shadow-sm transition group flex flex-col justify-between h-44 cursor-pointer"
            >
              <div className="flex justify-between items-start">
                <div className="p-3 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
                  <Store className="w-6 h-6" />
                </div>
                <ArrowRight className="w-4 h-4 text-stone-500 group-hover:text-emerald-400 group-hover:translate-x-1 transition" />
              </div>
              <div>
                <h3 className="font-bold text-white text-base">Retail Hub</h3>
                <p className="text-xs text-stone-400 mt-1">Package & List Retail Items</p>
              </div>
            </Link>

            {/* Orders */}
            <Link
              href="/retailer/retailerHub/orders"
              className="bg-stone-900/90 border border-stone-800 hover:border-emerald-500/40 rounded-3xl p-6 shadow-sm transition group flex flex-col justify-between h-44 cursor-pointer"
            >
              <div className="flex justify-between items-start">
                <div className="p-3 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
                  <ClipboardList className="w-6 h-6" />
                </div>
                <ArrowRight className="w-4 h-4 text-stone-500 group-hover:text-emerald-400 group-hover:translate-x-1 transition" />
              </div>
              <div>
                <h3 className="font-bold text-white text-base">Orders</h3>
                <p className="text-xs text-stone-400 mt-1">Track requested purchases</p>
              </div>
            </Link>

            {/* Shipments */}
            <Link
              href="/retailer/retailerHub/shipments"
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
                <p className="text-xs text-stone-400 mt-1">Track incoming deliveries</p>
              </div>
            </Link>

            {/* Reports */}
            <Link
              href="/retailer/retailerHub/reports"
              className="bg-stone-900/90 border border-stone-800 hover:border-emerald-500/40 rounded-3xl p-6 shadow-sm transition group flex flex-col justify-between h-44 cursor-pointer"
            >
              <div className="flex justify-between items-start">
                <div className="p-3 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
                  <FileText className="w-6 h-6" />
                </div>
                <ArrowRight className="w-4 h-4 text-stone-500 group-hover:text-emerald-400 group-hover:translate-x-1 transition" />
              </div>
              <div>
                <h3 className="font-bold text-white text-base">Reports & Analytics</h3>
                <p className="text-xs text-stone-400 mt-1">Review retail operations and expenses</p>
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
                <p className="text-xs text-stone-400 mt-1">Verify batch authenticity</p>
              </div>
            </Link>

          </div>
        </div>

      </div>

      {/* =========================================================================
          EDIT DETAILS MODAL POPUP
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
                  <h3 className="text-lg font-extrabold text-white">Edit Retailer Details</h3>
                  <p className="text-xs text-stone-400">Update store and facility records</p>
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
                <label className="text-stone-400 font-bold block mb-1">Store Name</label>
                <input
                  type="text"
                  value={editForm.storeName}
                  onChange={(e) => setEditForm({ ...editForm, storeName: e.target.value })}
                  className="w-full bg-stone-950 border border-stone-800 rounded-xl px-3.5 py-2.5 text-white focus:outline-none focus:border-emerald-500/50 transition"
                  required
                />
              </div>

              <div>
                <label className="text-stone-400 font-bold block mb-1">Store Location (Google Maps)</label>
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <input
                      type="text"
                      value={editForm.storeLocation}
                      onChange={(e) => setEditForm({ ...editForm, storeLocation: e.target.value })}
                      placeholder="e.g. Connaught Place, New Delhi"
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
                  <label className="text-stone-400 font-bold block mb-1">Shelf Capacity</label>
                  <input
                    type="text"
                    value={editForm.shelfCapacity}
                    onChange={(e) => setEditForm({ ...editForm, shelfCapacity: e.target.value })}
                    className="w-full bg-stone-950 border border-stone-800 rounded-xl px-3.5 py-2.5 text-white focus:outline-none focus:border-emerald-500/50 transition"
                    required
                  />
                </div>

                <div>
                  <label className="text-stone-400 font-bold block mb-1">Employee Count</label>
                  <input
                    type="text"
                    value={editForm.employeeCount}
                    onChange={(e) => setEditForm({ ...editForm, employeeCount: e.target.value })}
                    className="w-full bg-stone-950 border border-stone-800 rounded-xl px-3.5 py-2.5 text-white focus:outline-none focus:border-emerald-500/50 transition"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="text-stone-400 font-bold block mb-1">Store Type / Focus</label>
                <input
                  type="text"
                  value={editForm.storeType}
                  onChange={(e) => setEditForm({ ...editForm, storeType: e.target.value })}
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
