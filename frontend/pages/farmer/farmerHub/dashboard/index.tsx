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
  Pencil,
  X,
  LocateFixed,
  ExternalLink,
  GitBranch,
  Loader2
} from "lucide-react";

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:5000";

export default function FarmerDashboard() {
  const { data: session } = useSession();
  const farmerId = (session?.user as any)?.id || (session?.user as any)?.farmerId || (session?.user as any)?.customId || "";
  const [displayFarmerId, setDisplayFarmerId] = useState<string>(
    (session?.user as any)?.farmerId || (session?.user as any)?.customId || ""
  );

  const getFormattedFarmerId = () => {
    const fId = (session?.user as any)?.farmerId || displayFarmerId;
    if (fId && fId.startsWith("S2S-FRM-")) return fId;
    if (fId && !fId.includes("-") && fId.length <= 15) return `S2S-FRM-${fId}`;
    return "S2S-FRM-000001";
  };

  const [farmInfo, setFarmInfo] = useState<{
    farmName: string;
    farmLocation: string;
    coordinates: string;
    latitude?: number;
    longitude?: number;
    googleMapsUrl?: string;
    landArea: string;
    mainCrops: string;
    farmingType: string;
    isRegistered: boolean;
  }>({
    farmName: "Not Registered Yet",
    farmLocation: "--",
    coordinates: "--",
    latitude: undefined,
    longitude: undefined,
    googleMapsUrl: undefined,
    landArea: "--",
    mainCrops: "--",
    farmingType: "--",
    isRegistered: false
  });

  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editForm, setEditForm] = useState({ ...farmInfo });
  const [isLocating, setIsLocating] = useState(false);

  useEffect(() => {
    if ((session?.user as any)?.farmerId) {
      setDisplayFarmerId((session?.user as any).farmerId);
    }
  }, [session]);

  useEffect(() => {
    if (!farmerId) return;
    const fetchDashboard = async () => {
      try {
        setIsLoading(true);
        const res = await fetch(`${BACKEND_URL}/api/v1/farmer/dashboard?userId=${farmerId}`);
        if (res.ok) {
          const json = await res.json();
          if (json.success && json.data) {
            if (json.data.farmerId) {
              setDisplayFarmerId(json.data.farmerId);
            }
            const { farm } = json.data;
            if (farm && farm.farmName) {
              const lat = farm.latitude;
              const lng = farm.longitude;
              const mapsUrl = farm.googleMapsUrl || (lat && lng ? `https://www.google.com/maps?q=${lat},${lng}` : `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(farm.farmLocation || "")}`);
              
              setFarmInfo({
                farmName: farm.farmName,
                farmLocation: farm.farmLocation || "--",
                coordinates: lat && lng ? `${lat}° N, ${lng}° E` : "--",
                latitude: lat,
                longitude: lng,
                googleMapsUrl: mapsUrl,
                landArea: farm.totalLandArea ? `${farm.totalLandArea} ${farm.landAreaUnit || 'Acres'}` : "--",
                mainCrops: Array.isArray(farm.mainCultivatedCrops) && farm.mainCultivatedCrops.length > 0
                  ? farm.mainCultivatedCrops.join(", ")
                  : "--",
                farmingType: farm.farmingPractice || "--",
                isRegistered: true
              });
            }
          }
        }
      } catch (err) {
        console.warn("Backend API offline or unreachable, utilizing default dashboard state", err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchDashboard();
  }, [farmerId]);

  const handleDetectGPSLocation = () => {
    if (!navigator.geolocation) {
      alert("Geolocation is not supported by your browser.");
      return;
    }
    setIsLocating(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const lat = parseFloat(position.coords.latitude.toFixed(4));
        const lng = parseFloat(position.coords.longitude.toFixed(4));
        const coordsStr = `${lat}° N, ${lng}° E`;
        setEditForm(prev => ({
          ...prev,
          coordinates: coordsStr,
          latitude: lat,
          longitude: lng,
          farmLocation: prev.farmLocation.includes("GPS:") 
            ? prev.farmLocation 
            : `${prev.farmLocation} (GPS: ${lat}, ${lng})`
        }));
        setIsLocating(false);
      },
      () => {
        setIsLocating(false);
        setEditForm(prev => ({
          ...prev,
          coordinates: "16.9902° N, 73.3120° E",
          latitude: 16.9902,
          longitude: 73.3120,
          farmLocation: "Ratnagiri, Maharashtra, India (GPS: 16.9902, 73.3120)"
        }));
      }
    );
  };

  const handleSaveFarmDetails = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      const landAreaNum = parseFloat(editForm.landArea) || 12.5;
      const cropsArray = editForm.mainCrops.split(",").map(c => c.trim()).filter(Boolean);

      const payload = {
        userId: farmerId,
        farmName: editForm.farmName,
        farmLocation: editForm.farmLocation,
        latitude: editForm.latitude,
        longitude: editForm.longitude,
        totalLandArea: landAreaNum,
        farmingPractice: editForm.farmingType,
        mainCultivatedCrops: cropsArray,
      };

      const res = await fetch(`${BACKEND_URL}/api/v1/farmer/dashboard`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        const json = await res.json();
        if (json.data) {
          const farm = json.data;
          const lat = farm.latitude;
          const lng = farm.longitude;
          const mapsUrl = lat && lng ? `https://www.google.com/maps?q=${lat},${lng}` : `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(farm.farmLocation || "")}`;
          
          setFarmInfo({
            ...editForm,
            googleMapsUrl: mapsUrl,
          });
        } else {
          setFarmInfo({ ...editForm });
        }
      } else {
        setFarmInfo({ ...editForm });
      }
    } catch (err) {
      console.warn("Backend update error, saving locally", err);
      setFarmInfo({ ...editForm });
    } finally {
      setIsSaving(false);
      setIsEditModalOpen(false);
    }
  };

  return (
    <div className="min-h-screen bg-stone-950 text-stone-100 font-sans pb-24 pt-6 px-4 sm:px-6 lg:px-8 relative z-20">
      <Head>
        <title>Farmer Dashboard | Seed2Shelf</title>
        <meta name="description" content="Manage farm produce logistics, inventory escrow, and blockchain batch lineage." />
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
                Farmer Dashboard
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

        {/* FARM INFORMATION SECTION */}
        <div className="space-y-3">
          
          <div className="flex items-center justify-between px-1 h-6">
            <h2 className="text-xs font-bold text-stone-400 uppercase tracking-wider">
              Farm Information & Details
            </h2>

            <button
              onClick={() => {
                setEditForm({ ...farmInfo });
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
                Registered Farm Record
              </span>
              <span className="text-xs font-mono font-bold text-stone-400 bg-stone-950 border border-stone-800 px-3 py-1 rounded-xl">
                ID: {getFormattedFarmerId()}
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-5 text-sm">
              <div className="p-4 bg-stone-950/60 rounded-2xl border border-stone-800/80 space-y-1">
                <span className="text-xs text-stone-400 font-bold uppercase block">Farm Name</span>
                <p className="font-bold text-white text-base">{farmInfo.farmName}</p>
              </div>

              <div className="p-4 bg-stone-950/60 rounded-2xl border border-stone-800/80 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-stone-400 font-bold uppercase flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5 text-emerald-400" /> Farm Location
                  </span>
                  {farmInfo.googleMapsUrl && (
                    <a
                      href={farmInfo.googleMapsUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[11px] font-bold text-emerald-400 hover:text-emerald-300 flex items-center gap-1 bg-emerald-500/10 hover:bg-emerald-500/20 px-2.5 py-1 rounded-lg border border-emerald-500/20 transition cursor-pointer"
                      title="Open exact location in Google Maps"
                    >
                      <ExternalLink className="w-3 h-3" /> View on Google Maps
                    </a>
                  )}
                </div>
                <p className="font-bold text-white text-base">{farmInfo.farmLocation}</p>
              </div>

              <div className="p-4 bg-stone-950/60 rounded-2xl border border-stone-800/80 space-y-1">
                <span className="text-xs text-stone-400 font-bold uppercase block flex items-center gap-1">
                  <Layers className="w-3.5 h-3.5 text-emerald-400" /> Total Land Area
                </span>
                <p className="font-bold text-white text-base">{farmInfo.landArea}</p>
              </div>

              <div className="p-4 bg-stone-950/60 rounded-2xl border border-stone-800/80 space-y-1 md:col-span-2">
                <span className="text-xs text-stone-400 font-bold uppercase block">Main Cultivated Crops</span>
                <p className="font-bold text-emerald-400 text-base">{farmInfo.mainCrops}</p>
              </div>

              <div className="p-4 bg-stone-950/60 rounded-2xl border border-stone-800/80 space-y-1">
                <span className="text-xs text-stone-400 font-bold uppercase block">Farming Practice</span>
                <p className="font-bold text-white text-base">{farmInfo.farmingType}</p>
              </div>
            </div>
          </div>

        </div>

        {/* FEATURE MODULES GRID */}
        <div className="space-y-3">
          <div className="flex items-center px-1 h-6">
            <h2 className="text-xs font-bold text-stone-400 uppercase tracking-wider">
              Farmer Modules
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">

            {/* Harvest Hub */}
            <Link
              href="/farmer/farmerHub/harvestHub"
              className="bg-stone-900/90 border border-stone-800 hover:border-emerald-500/40 rounded-3xl p-6 shadow-sm transition group flex flex-col justify-between h-44 cursor-pointer"
            >
              <div className="flex justify-between items-start">
                <div className="p-3 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
                  <Sprout className="w-6 h-6" />
                </div>
                <ArrowRight className="w-4 h-4 text-stone-500 group-hover:text-emerald-400 group-hover:translate-x-1 transition" />
              </div>
              <div>
                <h3 className="font-bold text-white text-base">Harvest Hub</h3>
                <p className="text-xs text-stone-400 mt-1">Log fresh harvest batches to escrow</p>
              </div>
            </Link>

            {/* Orders */}
            <Link
              href="/farmer/farmerHub/orders"
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
                <p className="text-xs text-stone-400 mt-1">Review processor buying requests</p>
              </div>
            </Link>

            {/* Shipments */}
            <Link
              href="/farmer/farmerHub/shipments"
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
                <p className="text-xs text-stone-400 mt-1">Track dispatch and transit handoffs</p>
              </div>
            </Link>

            {/* Reports */}
            <Link
              href="/farmer/farmerHub/reports"
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
                <p className="text-xs text-stone-400 mt-1">Review yield and escrow summaries</p>
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

      {/* EDIT FARM DETAILS MODAL POPUP */}
      {isEditModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="bg-stone-900 border border-stone-800 w-full max-w-lg rounded-3xl p-6 sm:p-7 space-y-6 shadow-2xl relative animate-in fade-in zoom-in-95 duration-200">
            
            <div className="flex items-center justify-between border-b border-stone-800 pb-4">
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl text-emerald-400">
                  <Pencil className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-lg font-extrabold text-white">Edit Farm Details</h3>
                  <p className="text-xs text-stone-400">Update your farm information records</p>
                </div>
              </div>

              <button
                onClick={() => setIsEditModalOpen(false)}
                className="p-2 text-stone-400 hover:text-white rounded-xl bg-stone-800 hover:bg-stone-700 transition cursor-pointer"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleSaveFarmDetails} className="space-y-4 text-xs">
              <div>
                <label className="text-stone-400 font-bold block mb-1">Farm Name</label>
                <input
                  type="text"
                  value={editForm.farmName}
                  onChange={(e) => setEditForm({ ...editForm, farmName: e.target.value })}
                  className="w-full bg-stone-950 border border-stone-800 rounded-xl px-3.5 py-2.5 text-white focus:outline-none focus:border-emerald-500/50 transition"
                  required
                />
              </div>

              <div>
                <label className="text-stone-400 font-bold block mb-1">Farm Location (Google Maps)</label>
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <input
                      type="text"
                      value={editForm.farmLocation}
                      onChange={(e) => setEditForm({ ...editForm, farmLocation: e.target.value })}
                      placeholder="e.g. Ratnagiri, Maharashtra, India"
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
                  <label className="text-stone-400 font-bold block mb-1">Total Land Area</label>
                  <input
                    type="text"
                    value={editForm.landArea}
                    onChange={(e) => setEditForm({ ...editForm, landArea: e.target.value })}
                    className="w-full bg-stone-950 border border-stone-800 rounded-xl px-3.5 py-2.5 text-white focus:outline-none focus:border-emerald-500/50 transition"
                    required
                  />
                </div>

                <div>
                  <label className="text-stone-400 font-bold block mb-1">Farming Practice</label>
                  <input
                    type="text"
                    value={editForm.farmingType}
                    onChange={(e) => setEditForm({ ...editForm, farmingType: e.target.value })}
                    className="w-full bg-stone-950 border border-stone-800 rounded-xl px-3.5 py-2.5 text-white focus:outline-none focus:border-emerald-500/50 transition"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="text-stone-400 font-bold block mb-1">Main Cultivated Crops</label>
                <input
                  type="text"
                  value={editForm.mainCrops}
                  onChange={(e) => setEditForm({ ...editForm, mainCrops: e.target.value })}
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
                  disabled={isSaving}
                  className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition cursor-pointer flex items-center gap-2"
                >
                  {isSaving && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                  <span>{isSaving ? "Saving..." : "Save Changes"}</span>
                </button>
              </div>
            </form>

          </div>
        </div>
      )}

    </div>
  );
}
