import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import Head from "next/head";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { 
  ShoppingCart, 
  Search, 
  Calendar, 
  X, 
  Plus, 
  Minus, 
  Trash2, 
  ChevronRight,
  Sprout,
  Package,
  ArrowRight,
  ShoppingBag,
  Info,
  CheckCircle2,
  MapPin,
  Edit,
  ArrowLeft
} from "lucide-react";

export default function BuyProducts() {
  const { data: session } = useSession();
  const [crops, setCrops] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  // Cart State
  const [cart, setCart] = useState<any[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [requestStatus, setRequestStatus] = useState("");

  // Checkout Multi-Step Modal State
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [checkoutStep, setCheckoutStep] = useState(1); // 1: Address, 2: Payment, 3: Confirm, 4: Success
  const [addresses, setAddresses] = useState<any[]>([]);
  const [selectedAddressId, setSelectedAddressId] = useState("");
  const [paymentMode, setPaymentMode] = useState("online"); // online

  // Address Dialog Form State
  const [showAddressForm, setShowAddressForm] = useState(false);
  const [editingAddressId, setEditingAddressId] = useState<string | null>(null);
  const [isSavingAddress, setIsSavingAddress] = useState(false);

  // Address fields
  const [addrWarehouseName, setAddrWarehouseName] = useState("");
  const [addrContactName, setAddrContactName] = useState("");
  const [addrMobileNumber, setAddrMobileNumber] = useState("");
  const [addrLine, setAddrLine] = useState("");
  const [addrState, setAddrState] = useState("");
  const [addrDistrict, setAddrDistrict] = useState("");
  const [addrCityVillage, setAddrCityVillage] = useState("");
  const [addrPinCode, setAddrPinCode] = useState("");
  const [addrLandmark, setAddrLandmark] = useState("");

  // Traceability Modal State
  const [historyBatchId, setHistoryBatchId] = useState<string | null>(null);
  const [batchHistoryData, setBatchHistoryData] = useState<any>(null);

  useEffect(() => {
    const saved = localStorage.getItem("seed2shelf_addresses");
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (parsed.length > 0) {
          // Normalize format
          const normalized = parsed.map((a: any) => ({
            id: a.id || `addr-${Math.random()}`,
            warehouseName: a.warehouseName || a.name || "Warehouse",
            contactName: a.contactName || "Contact Person",
            mobileNumber: a.mobileNumber || a.mobile || "",
            addressLine: a.addressLine || a.street || "",
            state: a.state || "",
            district: a.district || "",
            cityVillage: a.cityVillage || a.city || "",
            pinCode: a.pinCode || "",
            landmark: a.landmark || ""
          }));
          setAddresses(normalized);
          setSelectedAddressId(normalized[0].id);
        }
      } catch (e) {
        console.error(e);
      }
    }
  }, []);

  const handleSaveAddress = (e: React.FormEvent) => {
    e.preventDefault();
    if (!addrWarehouseName || !addrContactName || !addrMobileNumber || !addrLine || !addrState || !addrDistrict || !addrCityVillage || !addrPinCode) {
      alert("Please fill in all required fields.");
      return;
    }

    setIsSavingAddress(true);

    setTimeout(() => {
      const addressData = {
        id: editingAddressId || `addr-${Date.now()}`,
        warehouseName: addrWarehouseName,
        contactName: addrContactName,
        mobileNumber: addrMobileNumber,
        addressLine: addrLine,
        state: addrState,
        district: addrDistrict,
        cityVillage: addrCityVillage,
        pinCode: addrPinCode,
        landmark: addrLandmark
      };

      let updated;
      if (editingAddressId) {
        updated = addresses.map(a => a.id === editingAddressId ? addressData : a);
      } else {
        updated = [...addresses, addressData];
      }

      setAddresses(updated);
      localStorage.setItem("seed2shelf_addresses", JSON.stringify(updated));
      
      if (!editingAddressId) {
        setSelectedAddressId(addressData.id);
      }

      setShowAddressForm(false);
      setEditingAddressId(null);
      setIsSavingAddress(false);

      // Clear fields
      setAddrWarehouseName("");
      setAddrContactName("");
      setAddrMobileNumber("");
      setAddrLine("");
      setAddrState("");
      setAddrDistrict("");
      setAddrCityVillage("");
      setAddrPinCode("");
      setAddrLandmark("");
    }, 600);
  };

  const startEditAddress = (addr: any) => {
    setEditingAddressId(addr.id);
    setAddrWarehouseName(addr.warehouseName);
    setAddrContactName(addr.contactName);
    setAddrMobileNumber(addr.mobileNumber);
    setAddrLine(addr.addressLine);
    setAddrState(addr.state);
    setAddrDistrict(addr.district);
    setAddrCityVillage(addr.cityVillage);
    setAddrPinCode(addr.pinCode);
    setAddrLandmark(addr.landmark || "");
    setShowAddressForm(true);
  };

  const handleDeleteAddress = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const updated = addresses.filter(a => a.id !== id);
    setAddresses(updated);
    localStorage.setItem("seed2shelf_addresses", JSON.stringify(updated));
    if (selectedAddressId === id) {
      setSelectedAddressId(updated.length > 0 ? updated[0].id : "");
    }
  };

  const getSelectedAddressString = () => {
    const addr = addresses.find(a => a.id === selectedAddressId);
    if (!addr) return "";
    const landmarkStr = addr.landmark ? ` (Landmark: ${addr.landmark})` : "";
    return `${addr.warehouseName} (Contact: ${addr.contactName}) - ${addr.addressLine}, ${addr.cityVillage}, ${addr.district}, ${addr.state} - ${addr.pinCode}${landmarkStr} (Mobile: ${addr.mobileNumber})`;
  };

  const viewBatchHistory = async (batchId: string) => {
    if (!batchId) return;
    setHistoryBatchId(batchId);
    setBatchHistoryData(null);
    const res = await fetch(`/api/history/${batchId}`);
    if (res.ok) {
      setBatchHistoryData(await res.json());
    }
  };

  const userRole = session?.user?.role || "CUSTOMER";

  const getUpstreamRole = (role?: string) => {
    switch (role) {
      case "PROCESSOR": return "FARMER";
      case "DISTRIBUTOR": return "PROCESSOR";
      case "RETAILER": return "DISTRIBUTOR";
      case "CUSTOMER": return "RETAILER";
      default: return "RETAILER";
    }
  };

  const fetchCrops = async () => {
    const upstreamRole = getUpstreamRole(userRole);

    try {
      const res = await fetch(`/api/crops?isListed=true`);
      if (res.ok) {
        const result = await res.json();
        const items = result.data || result;
        
        const mapped = (Array.isArray(items) ? items : [])
          .filter((p: any) => p.quantity > 0)
          .map((p: any) => ({
            id: p.id,
            name: p.name || "Organic Harvest",
            quantity: p.quantity || 0,
            harvestDate: p.harvestDate ? new Date(p.harvestDate).toLocaleDateString() : "Recent",
            batchId: p.batchId,
            price: p.price || 100,
            image: p.image || "https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?auto=format&fit=crop&q=80&w=600",
            currentOwner: {
              id: p.currentOwner?.id || p.currentOwnerId || "Owner",
              name: p.currentOwner?.name || "Registered User",
              role: p.currentOwner?.role || "FARMER"
            }
          }));

        setCrops(mapped);
      }
    } catch (err) {
      console.error("Error loading marketplace crops:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCrops();
  }, [userRole]);

  // Cart Helper functions
  const addToCart = (crop: any) => {
    const existing = cart.find(item => item.crop.id === crop.id);
    const defaultQty = Math.min(10, crop.quantity);
    const defaultDate = new Date();
    defaultDate.setDate(defaultDate.getDate() + 7);
    const formattedDate = defaultDate.toISOString().split("T")[0];

    if (existing) {
      if (existing.requestedQuantity + 1 > crop.quantity) return;
      setCart(cart.map(item => 
        item.crop.id === crop.id 
          ? { ...item, requestedQuantity: item.requestedQuantity + 1 }
          : item
      ));
    } else {
      setCart([...cart, { 
        crop, 
        requestedQuantity: defaultQty, 
        requestedDeliveryDate: formattedDate 
      }]);
    }
    setIsCartOpen(true);
  };

  const updateCartQty = (cropId: string, val: number, maxQty: number) => {
    setCart(cart.map(item => {
      if (item.crop.id === cropId) {
        const newQty = Math.max(0.1, Math.min(maxQty, parseFloat((item.requestedQuantity + val).toFixed(1))));
        return { ...item, requestedQuantity: newQty };
      }
      return item;
    }));
  };

  const updateCartQtyInput = (cropId: string, value: string, maxQty: number) => {
    const parsed = parseFloat(value);
    if (isNaN(parsed) || parsed <= 0) return;
    setCart(cart.map(item => {
      if (item.crop.id === cropId) {
        const newQty = Math.min(maxQty, parsed);
        return { ...item, requestedQuantity: newQty };
      }
      return item;
    }));
  };

  const updateCartDate = (cropId: string, date: string) => {
    setCart(cart.map(item => 
      item.crop.id === cropId 
        ? { ...item, requestedDeliveryDate: date }
        : item
    ));
  };

  const removeFromCart = (cropId: string) => {
    setCart(cart.filter(item => item.crop.id !== cropId));
  };

  const loadRazorpayScript = () => {
    return new Promise((resolve) => {
      const script = document.createElement("script");
      script.src = "https://checkout.razorpay.com/v1/checkout.js";
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };

  const handleCheckout = async (e: React.FormEvent) => {
    e.preventDefault();
    if (cart.length === 0 || !session?.user?.id) return;

    try {
      const scriptLoaded = await loadRazorpayScript();
      if (!scriptLoaded) {
        alert("Failed to load Razorpay payment SDK. Check your internet connection.");
        return;
      }

      const grandTotal = cart.reduce((sum, item) => sum + item.requestedQuantity * (item.crop.price || 100), 0);
      setRequestStatus("Initiating secure Razorpay checkout order...");

      const orderRes = await fetch("http://localhost:5000/api/payments/create-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ amount: grandTotal })
      });

      if (!orderRes.ok) {
        throw new Error("Failed to initialize Razorpay checkout session.");
      }

      const orderData = await orderRes.json();
      const buyerId = (session.user as any).farmerId || (session.user as any).processorId || session.user.id;
      const buyerRole = session.user.role || "CUSTOMER";

      const options = {
        key: orderData.key,
        amount: orderData.amount,
        currency: orderData.currency,
        name: "Seed2Shelf Escrow Engine",
        description: "Agricultural Crop Secure Escrow Payout",
        order_id: orderData.id,
        handler: async function (response: any) {
          setRequestStatus("Verifying transaction on the backend...");

          try {
            const verifyRes = await fetch("http://localhost:5000/api/payments/verify", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
                buyerId,
                buyerRole,
                amount: grandTotal,
                items: cart.map(item => ({
                  productId: item.crop.id,
                  batchId: item.crop.batchId,
                  quantityPurchased: item.requestedQuantity,
                  amount: item.requestedQuantity * (item.crop.price || 100),
                  sellerId: item.crop.currentOwner.id,
                  sellerRole: item.crop.currentOwner.role
                }))
              })
            });

            if (verifyRes.ok) {
              setRequestStatus("");
              setCart([]);
              setCheckoutStep(4);
            } else {
              const errData = await verifyRes.json();
              alert(`Verification failed: ${errData.error || "Please retry."}`);
              setRequestStatus("Error: Verification failed.");
            }
          } catch (verifyErr: any) {
            console.error("Error verifying payment signature:", verifyErr);
            alert("Error connecting to verify endpoint.");
            setRequestStatus("Error: Verification connection failed.");
          }
        },
        prefill: {
          name: session.user.name || "Buyer Name",
          email: session.user.email || "buyer@seed2shelf.com",
        },
        theme: {
          color: "#10b981",
        },
      };

      const rzp = new (window as any).Razorpay(options);
      rzp.on("payment.failed", function (response: any) {
        alert(`Payment failed: ${response.error.description}`);
        setRequestStatus("");
      });
      
      rzp.open();
    } catch (err: any) {
      console.error("Razorpay initiation error:", err);
      alert(`Error starting checkout: ${err.message}`);
      setRequestStatus("Error starting checkout session.");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0c0c0d] flex flex-col items-center justify-center text-white">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#00d26a] mb-4"></div>
        <p className="text-stone-400 font-bold uppercase tracking-wider text-sm">Loading Marketplace Listings...</p>
      </div>
    );
  }

  const filteredCrops = crops.filter(crop => 
    crop.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    crop.currentOwner.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (crop.batchId && crop.batchId.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const marketplaceTitle = userRole === "DISTRIBUTOR" ? "Distributor Marketplace" : userRole === "RETAILER" ? "Retailer Marketplace" : "Customer Marketplace";

  return (
    <div 
      className="min-h-screen text-white pt-24 pb-20 relative bg-cover bg-center bg-fixed font-sans"
      style={{ backgroundImage: "url('/images/bg.png')" }}
    >
      <div className="absolute inset-0 bg-[#0c0c0d]/90 backdrop-blur-[4px]"></div>

      <Head>
        <title>{marketplaceTitle} | Seed2Shelf</title>
      </Head>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 relative z-10">
        
        {/* Header */}
        <div className="mb-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-6 border-b border-white/10 pb-8">
          <div>
            <p className="text-xs uppercase tracking-widest text-[#00d26a] font-black mb-1">On-Chain Trade Link</p>
            <h1 className="text-3xl font-black text-white flex items-center gap-3">
              <ShoppingBag className="h-8 w-8 text-[#00d26a]" />
              {marketplaceTitle}
            </h1>
            <p className="text-stone-400 text-sm mt-1 max-w-2xl">
              Browse verified agricultural produce, view blockchain traceability logs, and complete secure escrow purchases.
            </p>
          </div>

          <div className="flex items-center gap-4 w-full md:w-auto self-stretch md:self-auto">
            {/* Search Bar */}
            <div className="relative flex-grow md:w-64">
              <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                <Search className="h-4 w-4 text-stone-500" />
              </span>
              <input
                type="text"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder="Search produce, owners..."
                className="w-full bg-white/5 border border-white/10 rounded-2xl pl-10 pr-4 py-3 text-sm focus:outline-none focus:border-[#00d26a] transition-all text-white placeholder-stone-500"
              />
            </div>

            {/* Cart Button */}
            <button 
              onClick={() => setIsCartOpen(true)}
              className="relative bg-[#00d26a] hover:bg-[#00b25a] text-black px-5 py-3 rounded-2xl transition-all shadow-lg flex items-center gap-2.5 font-bold cursor-pointer hover:scale-[1.02] active:scale-[0.98] shrink-0"
            >
              <ShoppingCart className="h-5 w-5" />
              <span className="hidden sm:inline">My Cart</span>
              {cart.length > 0 && (
                <span className="absolute -top-1.5 -right-1.5 bg-red-600 text-white rounded-full text-[9px] w-5 h-5 flex items-center justify-center font-black border border-[#0c0c0d] animate-bounce">
                  {cart.length}
                </span>
              )}
            </button>
          </div>
        </div>

        {/* Listings Grid */}
        {filteredCrops.length === 0 ? (
          <div className="matte-glass p-12 rounded-3xl border border-white/10 text-center">
            <p className="text-stone-400 text-base font-semibold">
              {searchQuery ? "No listings matches your search terms." : "No products are currently listed for sale."}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredCrops.map(crop => {
              const isAlreadyInCart = cart.some(item => item.crop.id === crop.id);
              return (
                <div 
                  key={crop.id} 
                  className="matte-glass p-6 rounded-3xl border border-white/10 hover:border-[#00d26a]/30 transition-all duration-300 flex flex-col justify-between group shadow-xl"
                >
                  <div>
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h3 className="text-xl font-bold text-white group-hover:text-[#00d26a] transition-colors">{crop.name}</h3>
                        <button 
                          onClick={() => viewBatchHistory(crop.batchId)} 
                          className="text-[10px] bg-white/5 hover:bg-[#00d26a]/15 px-2.5 py-1 rounded-lg text-stone-300 hover:text-[#00d26a] transition font-mono border border-white/5 mt-2 flex items-center gap-1.5 cursor-pointer"
                        >
                          Trace Batch: {crop.batchId ? crop.batchId.substring(0, 12) : "N/A"}...
                        </button>
                      </div>
                      <span className="bg-[#00d26a]/10 border border-[#00d26a]/20 text-[#00d26a] px-3 py-1.5 rounded-full text-xs font-black">
                        {crop.quantity} kg
                      </span>
                    </div>

                    <div className="my-6 space-y-2.5 text-xs text-stone-400 bg-black/20 p-4 rounded-2xl border border-white/5">
                      <div className="flex justify-between">
                        <span className="font-bold text-stone-500">SELLER</span>
                        <Link href={`/farmer/profile`} className="text-[#00d26a] hover:underline font-extrabold">
                          {crop.currentOwner.name}
                        </Link>
                      </div>
                      <div className="flex justify-between">
                        <span className="font-bold text-stone-500">UNIT PRICE</span>
                        <span className="font-bold text-[#00d26a]">₹{crop.price || 100} / kg</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="font-bold text-stone-500">HARVEST DATE</span>
                        <span className="font-semibold text-stone-300">{new Date(crop.harvestDate).toLocaleDateString()}</span>
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={() => addToCart(crop)}
                    disabled={isAlreadyInCart}
                    className={`w-full font-bold py-3.5 rounded-2xl transition-all flex items-center justify-center gap-2 cursor-pointer shadow-md ${
                      isAlreadyInCart 
                        ? "bg-white/5 border border-white/10 text-stone-500 cursor-not-allowed" 
                        : "bg-white/10 hover:bg-[#00d26a] hover:text-black border border-white/10 hover:border-transparent text-white"
                    }`}
                  >
                    <ShoppingCart className="h-4 w-4" />
                    {isAlreadyInCart ? "Added to Cart" : "Add to Cart"}
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Shopping Cart Drawer */}
      <AnimatePresence>
        {isCartOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.6 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsCartOpen(false)}
              className="fixed inset-0 z-40 bg-black/80 backdrop-blur-sm"
            />

            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "tween", duration: 0.3, ease: "easeInOut" }}
              className="fixed top-0 right-0 h-full w-full sm:w-[450px] bg-[#141415] border-l border-white/10 z-50 p-6 flex flex-col text-white shadow-2xl"
            >
              <div className="flex justify-between items-center pb-4 border-b border-white/10 mb-6 shrink-0">
                <h2 className="text-xl font-bold flex items-center gap-2.5 text-green-300">
                  <ShoppingCart className="h-5 w-5 text-[#00d26a]" />
                  Checkout Cart ({cart.length})
                </h2>
                <button 
                  onClick={() => setIsCartOpen(false)}
                  className="text-stone-400 hover:text-white p-2 rounded-full hover:bg-white/5 transition cursor-pointer"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              {requestStatus && (
                <div className={`mb-4 p-4 rounded-2xl text-xs font-bold border shrink-0 ${
                  requestStatus.includes("Error") || requestStatus.includes("Failed") 
                    ? "bg-red-500/10 border-red-500/20 text-red-400" 
                    : "bg-[#00d26a]/10 border-[#00d26a]/20 text-[#00d26a]"
                }`}>
                  {requestStatus}
                </div>
              )}

              <div className="flex-grow overflow-y-auto custom-scrollbar space-y-4 pr-1">
                {cart.length === 0 ? (
                  <div className="text-center py-20 text-stone-500">
                    <ShoppingCart className="h-12 w-12 mx-auto mb-3 text-stone-600" />
                    <p className="text-sm font-bold uppercase tracking-wider">Your cart is empty</p>
                    <p className="text-xs text-stone-600 mt-1">Add items from listings to begin checkout.</p>
                  </div>
                ) : (
                  cart.map(item => (
                    <div key={item.crop.id} className="bg-white/5 border border-white/5 p-4 rounded-2xl space-y-3 shadow-md">
                      <div className="flex justify-between items-start">
                        <div>
                          <h4 className="font-bold text-white text-base">{item.crop.name}</h4>
                          <p className="text-xs text-stone-500 font-mono mt-0.5">Seller: {item.crop.currentOwner.name}</p>
                        </div>
                        <button 
                          onClick={() => removeFromCart(item.crop.id)}
                          className="text-stone-500 hover:text-red-400 p-1.5 rounded-lg hover:bg-white/5 transition cursor-pointer"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>

                      <div className="grid grid-cols-2 gap-4 pt-2 border-t border-white/5">
                        <div>
                          <label className="block text-[10px] font-bold text-stone-500 uppercase mb-1.5">Qty (max: {item.crop.quantity}kg)</label>
                          <div className="flex items-center gap-1">
                            <button
                              type="button"
                              onClick={() => updateCartQty(item.crop.id, -5, item.crop.quantity)}
                              className="bg-white/5 hover:bg-white/10 text-white rounded-lg p-2 transition cursor-pointer border border-white/5"
                              title="Decrease by 5"
                            >
                              <Minus className="h-3 w-3" />
                            </button>
                            <input
                              type="number"
                              min="1"
                              step="5"
                              max={item.crop.quantity}
                              value={item.requestedQuantity}
                              onChange={e => updateCartQtyInput(item.crop.id, e.target.value, item.crop.quantity)}
                              className="w-16 bg-black/40 border border-white/5 rounded-lg text-center py-1 text-sm font-bold text-white focus:outline-none focus:border-[#00d26a]"
                            />
                            <button
                              type="button"
                              onClick={() => updateCartQty(item.crop.id, 5, item.crop.quantity)}
                              className="bg-white/5 hover:bg-white/10 text-white rounded-lg p-2 transition cursor-pointer border border-white/5"
                              title="Increase by 5"
                            >
                              <Plus className="h-3 w-3" />
                            </button>
                          </div>
                        </div>

                        <div>
                          <label className="block text-[10px] font-bold text-stone-500 uppercase mb-1.5">Delivery Date</label>
                          <div className="relative">
                            <span className="absolute inset-y-0 left-0 pl-2.5 flex items-center pointer-events-none text-stone-500">
                              <Calendar className="h-3 w-3" />
                            </span>
                            <input
                              type="date"
                              value={item.requestedDeliveryDate}
                              onChange={e => updateCartDate(item.crop.id, e.target.value)}
                              className="w-full bg-black/40 border border-white/5 rounded-lg pl-8 pr-2 py-1 text-xs font-bold text-white focus:outline-none focus:border-[#00d26a]"
                              required
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>

              {cart.length > 0 && (
                <div className="border-t border-white/10 pt-4 mt-4 shrink-0 space-y-3">
                  <div className="flex justify-between text-sm font-semibold px-1">
                    <span className="text-stone-400">Total Items:</span>
                    <span>{cart.length} listings</span>
                  </div>
                  <button
                    onClick={() => {
                      setIsCartOpen(false);
                      setIsCheckoutOpen(true);
                      setCheckoutStep(1);
                    }}
                    className="w-full bg-[#00d26a] hover:bg-[#00b25a] text-black font-extrabold py-4 rounded-2xl transition shadow-lg text-sm flex items-center justify-center gap-2 cursor-pointer"
                  >
                    Confirm & Buy
                    <ArrowRight className="h-4 w-4" />
                  </button>
                </div>
              )}
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Step-by-Step Checkout Modal */}
      <AnimatePresence>
        {isCheckoutOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm overflow-y-auto">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-[#141415] border border-white/10 rounded-3xl w-full max-w-2xl shadow-2xl relative p-8 text-white max-h-[90vh] overflow-y-auto custom-scrollbar"
            >
              {checkoutStep < 4 && (
                <button 
                  onClick={() => setIsCheckoutOpen(false)}
                  className="absolute top-4 right-4 text-stone-400 hover:text-white p-2 rounded-full hover:bg-white/5 cursor-pointer"
                >
                  ✕
                </button>
              )}

              <div className="flex items-center justify-between mb-10 max-w-lg mx-auto bg-white/[0.02] border border-white/5 py-4 px-6 rounded-2xl">
                {[
                  { step: 1, label: "Delivery" },
                  { step: 2, label: "Payment" },
                  { step: 3, label: "Confirm" }
                ].map((item) => (
                  <div key={item.step} className="flex items-center flex-1 last:flex-initial">
                    <div className="flex items-center gap-2.5">
                      <div className={`w-7 h-7 rounded-full flex items-center justify-center font-extrabold text-xs transition-all duration-300 ${
                        checkoutStep === item.step
                          ? "bg-[#00d26a] text-black shadow-lg shadow-[#00d26a]/20 scale-110"
                          : checkoutStep > item.step
                          ? "bg-[#00d26a]/20 text-[#00d26a]"
                          : "bg-white/5 text-stone-500 border border-white/10"
                      }`}>
                        {checkoutStep > item.step ? "✓" : item.step}
                      </div>
                      <span className={`text-[11px] font-black uppercase tracking-wider hidden sm:inline ${
                        checkoutStep === item.step ? "text-[#00d26a]" : "text-stone-400"
                      }`}>{item.label}</span>
                    </div>
                    {item.step < 3 && (
                      <div className={`h-[1px] flex-grow mx-4 transition-all duration-500 ${
                        checkoutStep > item.step ? "bg-[#00d26a]" : "bg-white/10"
                      }`} />
                    )}
                  </div>
                ))}
              </div>

              {/* Step 1: Address */}
              {checkoutStep === 1 && (
                <div className="space-y-6">
                  {addresses.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-10 text-center space-y-4 bg-white/[0.02] border border-white/5 rounded-3xl p-8">
                      <div className="w-16 h-16 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-stone-400">
                        <MapPin className="h-8 w-8" />
                      </div>
                      <div className="space-y-1">
                        <h3 className="text-lg font-bold text-white">Delivery Address</h3>
                        <p className="text-sm text-stone-400">No delivery address has been added yet.</p>
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          setEditingAddressId(null);
                          setShowAddressForm(true);
                        }}
                        className="mt-2 bg-[#00d26a] hover:bg-[#00b25a] text-black font-extrabold px-6 py-3 rounded-xl text-xs transition-all shadow-lg flex items-center gap-2 cursor-pointer"
                      >
                        <Plus className="h-4 w-4" />
                        Add Delivery Address
                      </button>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <div className="flex justify-between items-center">
                        <div>
                          <h3 className="text-xl font-bold text-green-300 font-sans">Select Delivery Address</h3>
                        </div>
                        <button
                          onClick={() => {
                            setEditingAddressId(null);
                            setShowAddressForm(true);
                          }}
                          className="bg-white/5 hover:bg-white/10 border border-white/10 text-white font-extrabold px-4 py-2.5 rounded-xl text-xs transition cursor-pointer flex items-center gap-1.5"
                        >
                          <Plus className="h-3.5 w-3.5 text-[#00d26a]" />
                          Add Address
                        </button>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-h-[300px] overflow-y-auto pr-1 custom-scrollbar">
                        {addresses.map((addr) => {
                          const isSelected = addr.id === selectedAddressId;
                          return (
                            <div 
                              key={addr.id}
                              onClick={() => setSelectedAddressId(addr.id)}
                              className={`p-4 rounded-2xl border transition-all duration-300 cursor-pointer flex flex-col justify-between hover:scale-[1.01] ${
                                isSelected 
                                  ? "bg-[#00d26a]/10 border-[#00d26a] shadow-lg shadow-[#00d26a]/5" 
                                  : "bg-white/5 border-white/10 hover:border-white/20"
                              }`}
                            >
                              <div className="space-y-1.5 relative">
                                <h4 className="font-extrabold text-sm text-white pr-6 truncate">{addr.warehouseName}</h4>
                                <p className="text-xs text-stone-400 font-medium">Contact: {addr.contactName}</p>
                                <p className="text-xs text-stone-400 font-normal leading-relaxed">
                                  {addr.addressLine}, {addr.cityVillage}, {addr.district}, {addr.state} - {addr.pinCode}
                                </p>
                              </div>
                            </div>
                          );
                        })}
                      </div>

                      <div className="flex justify-between pt-6 border-t border-white/10 mt-6">
                        <button
                          onClick={() => setIsCheckoutOpen(false)}
                          className="bg-white/5 hover:bg-white/10 border border-white/10 text-stone-300 hover:text-white font-bold px-6 py-3 rounded-xl text-sm transition flex items-center gap-2 cursor-pointer"
                        >
                          <ArrowLeft className="h-4 w-4" />
                          Back
                        </button>
                        <button
                          onClick={() => setCheckoutStep(2)}
                          disabled={!selectedAddressId}
                          className="bg-[#00d26a] hover:bg-[#00b25a] disabled:opacity-50 text-black font-extrabold px-6 py-3 rounded-xl text-sm transition shadow-lg flex items-center gap-2 cursor-pointer"
                        >
                          Continue to Payment
                          <ChevronRight className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  )}

                  {showAddressForm && (
                    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/95 backdrop-blur-md">
                      <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="bg-[#18181b] border border-white/10 rounded-3xl p-6 w-full max-w-xl shadow-2xl relative text-white"
                      >
                        <h3 className="text-lg font-black text-green-300 mb-4 flex items-center gap-2">
                          <MapPin className="h-5 w-5" />
                          {editingAddressId ? "Edit Delivery Address" : "Add Delivery Address"}
                        </h3>

                        <form onSubmit={handleSaveAddress} className="space-y-4">
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div>
                              <label className="block text-[10px] text-stone-400 font-bold uppercase mb-1">Location Name *</label>
                              <input
                                type="text"
                                required
                                placeholder="e.g. Home"
                                value={addrWarehouseName}
                                onChange={e => setAddrWarehouseName(e.target.value)}
                                className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-2 text-xs text-white focus:outline-none focus:border-[#00d26a]"
                              />
                            </div>
                            <div>
                              <label className="block text-[10px] text-stone-400 font-bold uppercase mb-1">Contact Name *</label>
                              <input
                                type="text"
                                required
                                placeholder="e.g. Jane Doe"
                                value={addrContactName}
                                onChange={e => setAddrContactName(e.target.value)}
                                className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-2 text-xs text-white focus:outline-none focus:border-[#00d26a]"
                              />
                            </div>
                          </div>

                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div>
                              <label className="block text-[10px] text-stone-400 font-bold uppercase mb-1">Mobile Number *</label>
                              <input
                                type="text"
                                required
                                placeholder="e.g. 9876543210"
                                value={addrMobileNumber}
                                onChange={e => setAddrMobileNumber(e.target.value)}
                                className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-2 text-xs text-white focus:outline-none focus:border-[#00d26a]"
                              />
                            </div>
                            <div>
                              <label className="block text-[10px] text-stone-400 font-bold uppercase mb-1">Address Line *</label>
                              <input
                                type="text"
                                required
                                placeholder="e.g. Street 12"
                                value={addrLine}
                                onChange={e => setAddrLine(e.target.value)}
                                className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-2 text-xs text-white focus:outline-none focus:border-[#00d26a]"
                              />
                            </div>
                          </div>

                          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                            <div>
                              <label className="block text-[10px] text-stone-400 font-bold uppercase mb-1">City *</label>
                              <input
                                type="text"
                                required
                                value={addrCityVillage}
                                onChange={e => setAddrCityVillage(e.target.value)}
                                className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-2 text-xs text-white focus:outline-none focus:border-[#00d26a]"
                              />
                            </div>
                            <div>
                              <label className="block text-[10px] text-stone-400 font-bold uppercase mb-1">District *</label>
                              <input
                                type="text"
                                required
                                value={addrDistrict}
                                onChange={e => setAddrDistrict(e.target.value)}
                                className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-2 text-xs text-white focus:outline-none focus:border-[#00d26a]"
                              />
                            </div>
                            <div>
                              <label className="block text-[10px] text-stone-400 font-bold uppercase mb-1">State *</label>
                              <input
                                type="text"
                                required
                                value={addrState}
                                onChange={e => setAddrState(e.target.value)}
                                className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-2 text-xs text-white focus:outline-none focus:border-[#00d26a]"
                              />
                            </div>
                          </div>

                          <div>
                            <label className="block text-[10px] text-stone-400 font-bold uppercase mb-1">PIN Code *</label>
                            <input
                              type="text"
                              required
                              value={addrPinCode}
                              onChange={e => setAddrPinCode(e.target.value)}
                              className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-2 text-xs text-white focus:outline-none focus:border-[#00d26a]"
                            />
                          </div>

                          <div className="flex justify-end gap-3 pt-4 border-t border-white/5 font-sans">
                            <button
                              type="button"
                              onClick={() => {
                                setShowAddressForm(false);
                                setEditingAddressId(null);
                              }}
                              className="bg-white/5 hover:bg-white/10 text-stone-300 font-bold px-4 py-2 rounded-xl text-xs transition cursor-pointer"
                            >
                              Cancel
                            </button>
                            <button
                              type="submit"
                              disabled={isSavingAddress}
                              className="bg-[#00d26a] hover:bg-[#00b25a] disabled:opacity-50 text-black font-extrabold px-6 py-2 rounded-xl text-xs transition cursor-pointer"
                            >
                              Save Address
                            </button>
                          </div>
                        </form>
                      </motion.div>
                    </div>
                  )}
                </div>
              )}

              {/* Step 2: Payment */}
              {checkoutStep === 2 && (
                <div className="space-y-6">
                  <div>
                    <h3 className="text-xl font-bold text-green-300 font-sans">Choose Payment Method</h3>
                  </div>

                  <div className="space-y-4">
                    <div className="p-5 rounded-2xl border bg-[#00d26a]/10 border-[#00d26a] flex items-start gap-4">
                      <Package className="h-5 w-5 text-[#00d26a]" />
                      <div>
                        <h4 className="font-extrabold text-sm">Online Payment Mode (Razorpay)</h4>
                        <p className="text-xs text-stone-400 mt-1">Pay securely using UPI, cards, or NetBanking.</p>
                      </div>
                    </div>
                  </div>

                  <div className="flex justify-between pt-4 border-t border-white/10">
                    <button
                      onClick={() => setCheckoutStep(1)}
                      className="bg-white/5 hover:bg-white/10 border border-white/10 text-stone-300 hover:text-white font-bold px-6 py-3 rounded-xl text-sm transition cursor-pointer"
                    >
                      Back to Address
                    </button>
                    <button
                      onClick={() => setCheckoutStep(3)}
                      className="bg-[#00d26a] hover:bg-[#00b25a] text-black font-extrabold px-6 py-3 rounded-xl text-sm transition shadow-lg flex items-center gap-2 cursor-pointer"
                    >
                      Proceed to Confirmation
                      <ChevronRight className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              )}

              {/* Step 3: Confirm */}
              {checkoutStep === 3 && (
                <div className="space-y-6">
                  <div>
                    <h3 className="text-xl font-bold text-green-300 font-sans">Finalize Purchase Request</h3>
                  </div>

                  <div className="space-y-4">
                    <div className="bg-white/5 border border-white/5 p-5 rounded-2xl space-y-3">
                      <h4 className="text-xs text-stone-500 font-bold uppercase tracking-wider">Items in Order</h4>
                      <div className="space-y-2 max-h-[150px] overflow-y-auto custom-scrollbar pr-1">
                        {cart.map((item) => (
                          <div key={item.crop.id} className="flex justify-between text-sm">
                            <span className="font-bold text-stone-300">{item.crop.name}</span>
                            <span className="font-mono text-[#00d26a] font-extrabold">{item.requestedQuantity} kg (₹{item.requestedQuantity * (item.crop.price || 100)})</span>
                          </div>
                        ))}
                      </div>
                      <div className="flex justify-between text-sm font-bold border-t border-white/5 pt-2 mt-2">
                        <span className="text-stone-400">Grand Total Amount:</span>
                        <span className="text-[#00d26a] font-extrabold">
                          ₹{cart.reduce((sum, item) => sum + item.requestedQuantity * (item.crop.price || 100), 0)}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex justify-between pt-4 border-t border-white/10">
                    <button
                      onClick={() => setCheckoutStep(2)}
                      className="bg-white/5 hover:bg-white/10 border border-white/10 text-stone-300 hover:text-white font-bold px-6 py-3 rounded-xl text-sm transition cursor-pointer"
                    >
                      Back
                    </button>
                    <button
                      onClick={handleCheckout}
                      className="bg-[#00d26a] hover:bg-[#00b25a] text-black font-extrabold px-8 py-3 rounded-xl text-sm transition shadow-lg flex items-center gap-2 cursor-pointer"
                    >
                      Place Order & Pay
                      <ArrowRight className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              )}

              {/* Step 4: Success */}
              {checkoutStep === 4 && (
                <div className="text-center py-10 space-y-6">
                  <div className="w-16 h-16 rounded-full bg-[#00d26a]/10 border border-[#00d26a]/20 flex items-center justify-center mx-auto text-[#00d26a] shadow-lg">
                    <CheckCircle2 className="h-8 w-8" />
                  </div>
                  <div>
                    <h3 className="text-2xl font-black text-white">Purchase Orders Placed!</h3>
                    <p className="text-sm text-stone-400 max-w-md mx-auto mt-2">
                      Your payment has been successfully processed and locked in escrow.
                    </p>
                  </div>
                  <div className="pt-4">
                    <button
                      onClick={() => {
                        setIsCheckoutOpen(false);
                        setCheckoutStep(1);
                        fetchCrops();
                      }}
                      className="bg-[#00d26a] hover:bg-[#00b25a] text-black font-extrabold px-8 py-3 rounded-xl text-sm transition shadow-lg cursor-pointer"
                    >
                      Close and Refresh
                    </button>
                  </div>
                </div>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
