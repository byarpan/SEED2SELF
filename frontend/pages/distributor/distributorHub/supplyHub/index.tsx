// Force reload
import { useState, useRef, useEffect } from "react";
import { useSession } from "next-auth/react";
import Head from "next/head";
import {
  Boxes,
  Sprout,
  PlusCircle,
  QrCode as QrIcon,
  CheckCircle2,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Calendar as CalendarIcon,
  UploadCloud,
  X,
  Eye,
  Download,
  Copy,
  Check,
  Pencil,
  Trash2,
  Package,
  ArrowRight
} from "lucide-react";

export interface InventoryItem {
  id: string; // e.g. DIST-2026-001 or BATCH-2026-0079
  itemType: "DISTRIBUTED" | "RAW"; // Distributed Product vs Purchased Raw Crop
  productName: string;
  category: string;
  quantity: string;
  pricePerUnit: string;
  date: string;
  status: "In Stock" | "Listed" | "Processing" | "Dispatched" | "Archived";
  parentRawBatchId?: string;
  supplierFarmer?: string;
  productImage?: string;
  qrCodeUrl: string;
  processingStatus?: "Available for Distribution" | "Sent for Distribution" | "Fully Distributed";
  sentForProcessingDate?: string;
  remainingStock?: string;
  processingQuantity?: string;
}

export default function SupplyHubPage() {
  const { data: session } = useSession();

  // Initial inventory initialized as empty array
  const [inventory, setInventory] = useState<InventoryItem[]>([]);

  // Form states for Log New Distributed Item
  const [category, setCategory] = useState("Processed Grains");
  const [customCategory, setCustomCategory] = useState("");
  const [productName, setProductName] = useState("");
  const [parentRawBatchIds, setParentRawBatchIds] = useState<string[]>([]);
  const [quantity, setQuantity] = useState("");
  const [price, setPrice] = useState("");
  const [productImage, setProductImage] = useState<string | null>(null);

  // Calendar Date Picker State (Default to 24/07/2026)
  const [selectedDay, setSelectedDay] = useState<number>(24);
  const [selectedMonth, setSelectedMonth] = useState<number>(6); // 0-indexed: 6 = July
  const [selectedYear, setSelectedYear] = useState<number>(2026);
  const [isCalendarOpen, setIsCalendarOpen] = useState<boolean>(false);

  const calendarRef = useRef<HTMLDivElement>(null);
  const imageInputRef = useRef<HTMLInputElement>(null);

  // Filter state for My Inventory (Primary Tabs: Distributed Products, Purchased Harvests, History)
  const [inventoryFilter, setInventoryFilter] = useState<"DISTRIBUTED" | "RAW" | "HISTORY">("DISTRIBUTED");

  // History Tab Category Filter (Distributed Products vs Purchased Harvests)
  const [historyCategoryFilter, setHistoryCategoryFilter] = useState<"DISTRIBUTED_DISPATCHED" | "RAW_COMPLETED">("DISTRIBUTED_DISPATCHED");

  // Submitted & Batch Info UI states
  const [submitted, setSubmitted] = useState<boolean>(false);
  const [newBatchInfo, setNewBatchInfo] = useState<{ id: string; qr: string; url: string } | null>(null);
  const [selectedQrModal, setSelectedQrModal] = useState<InventoryItem | null>(null);
  const [processingModalItem, setProcessingModalItem] = useState<InventoryItem | null>(null);
  const [sendAmount, setSendAmount] = useState<string>("");
  const [sendError, setSendError] = useState<string>("");
  const [copied, setCopied] = useState<boolean>(false);

  // Month Names Array
  const monthNames = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];

  // Calendar Date Calculations
  const daysInMonth = new Date(selectedYear, selectedMonth + 1, 0).getDate();
  const firstDayOfWeek = new Date(selectedYear, selectedMonth, 1).getDay();

  const formattedDateDisplay = `${String(selectedDay).padStart(2, '0')}/${String(selectedMonth + 1).padStart(2, '0')}/${selectedYear}`;

  const handlePrevMonth = () => {
    if (selectedMonth === 0) {
      setSelectedMonth(11);
      setSelectedYear(selectedYear - 1);
    } else {
      setSelectedMonth(selectedMonth - 1);
    }
  };

  const handleNextMonth = () => {
    if (selectedMonth === 11) {
      setSelectedMonth(0);
      setSelectedYear(selectedYear + 1);
    } else {
      setSelectedMonth(selectedMonth + 1);
    }
  };

  // Close calendar dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (calendarRef.current && !calendarRef.current.contains(event.target as Node)) {
        setIsCalendarOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Image Upload Handler
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setProductImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  // Default Image Fallbacks
  const getProductImage = (item: InventoryItem) => {
    if (item.productImage) return item.productImage;
    if (item.category.includes("Fruit")) {
      return "https://images.unsplash.com/photo-1553279768-865429fa0078?auto=format&fit=crop&w=600&q=80";
    }
    return "https://images.unsplash.com/photo-1586201375761-83865001e31c?auto=format&fit=crop&w=600&q=80";
  };

  // Register New Distributed Product
  const handleRegisterProduct = (e: React.FormEvent) => {
    e.preventDefault();
    if (!productName || !quantity || !price) return;

    const finalCategory = category === "Others" ? (customCategory.trim() || "Others") : category;
    const randomDigits = Math.floor(1000 + Math.random() * 9000);
    const newBatchId = `DIST-2026-${randomDigits}`;
    const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=${newBatchId}`;
    const traceUrl = `https://seed2shelf.app/trace/${newBatchId}`;

    const newItem: InventoryItem = {
      id: newBatchId,
      itemType: "DISTRIBUTED",
      productName,
      category: finalCategory,
      quantity: `${quantity} kg`,
      pricePerUnit: `₹${price}/kg`,
      date: formattedDateDisplay,
      status: "In Stock",
      parentRawBatchId: parentRawBatchIds.join(", "),
      productImage: productImage || getProductImage({ category: finalCategory } as any),
      qrCodeUrl: qrUrl
    };

    setInventory([newItem, ...inventory]);
    setNewBatchInfo({
      id: newBatchId,
      qr: qrUrl,
      url: traceUrl
    });

    setSubmitted(true);
    setTimeout(() => setSubmitted(false), 5000);

    // Reset Form
    setProductName("");
    setCustomCategory("");
    setQuantity("");
    setPrice("");
    setProductImage(null);
  };

  // Toggle List / Unlist Status
  const handleToggleListStatus = (id: string) => {
    setInventory(
      inventory.map((item) => {
        if (item.id === id) {
          const newStatus = item.status === "Listed" ? "In Stock" : "Listed";
          return { ...item, status: newStatus };
        }
        return item;
      })
    );
  };

  // Delete Item
  const handleDeleteItem = (id: string) => {
    if (confirm("Are you sure you want to remove this item from your inventory?")) {
      setInventory(inventory.filter((item) => item.id !== id));
    }
  };

  // Download QR Code
  const downloadQrCode = (qrUrl: string, batchId: string) => {
    const link = document.createElement("a");
    link.href = qrUrl;
    link.download = `QR-${batchId}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Copy Traceability URL
  const copyTraceUrl = (url: string) => {
    navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Helper to extract numeric quantity and unit string (e.g. "300 kg" -> { num: 300, unit: "kg" })
  const parseQuantityAndUnit = (str: string | undefined) => {
    if (!str) return { num: 0, unit: "kg" };
    const match = str.trim().match(/^([\d.]+)\s*(.*)$/);
    if (match) {
      return { num: parseFloat(match[1]) || 0, unit: match[2] || "kg" };
    }
    return { num: parseFloat(str) || 0, unit: "kg" };
  };

  // Open modal to set custom quantity/limit for processing
  const handleOpenProcessingModal = (item: InventoryItem) => {
    setProcessingModalItem(item);
    const { num: availNum } = parseQuantityAndUnit(item.remainingStock || item.quantity);
    setSendAmount(availNum > 0 ? String(availNum) : "");
    setSendError("");
  };

  // Confirm sending set quantity for processing
  const handleConfirmSendForProcessing = (e: React.FormEvent) => {
    e.preventDefault();
    if (!processingModalItem) return;

    const { num: availNum, unit } = parseQuantityAndUnit(
      processingModalItem.remainingStock || processingModalItem.quantity
    );
    const amountToSendNum = parseFloat(sendAmount);

    if (isNaN(amountToSendNum) || amountToSendNum <= 0) {
      setSendError("Please enter a valid quantity greater than 0.");
      return;
    }

    if (amountToSendNum > availNum) {
      setSendError(`Cannot send more than available stock (${availNum} ${unit}).`);
      return;
    }

    const itemId = processingModalItem.id;

    setInventory((prev) =>
      prev.map((item) => {
        if (item.id === itemId) {
          const { num: currentRemainingNum, unit: u } = parseQuantityAndUnit(item.remainingStock || item.quantity);
          const { num: currentProcNum } = parseQuantityAndUnit(item.processingQuantity);

          const newRemainingNum = Math.max(0, currentRemainingNum - amountToSendNum);
          const newProcNum = currentProcNum + amountToSendNum;

          const newStatus = newRemainingNum === 0 ? "Fully Distributed" : "Sent for Distribution";

          return {
            ...item,
            processingStatus: newStatus,
            sentForProcessingDate: formattedDateDisplay,
            remainingStock: `${newRemainingNum} ${u}`,
            processingQuantity: `${newProcNum} ${u}`
          };
        }
        return item;
      })
    );

    setProcessingModalItem(null);
    setSendAmount("");
    setSendError("");
  };

  // Revoke/Reset processing status back to available
  const handleRevokeProcessing = (id: string) => {
    if (confirm("Are you sure you want to reset processing status for this batch? All processing volume will be returned to available stock.")) {
      setInventory((prev) =>
        prev.map((item) => {
          if (item.id === id) {
            const { num: totalNum, unit } = parseQuantityAndUnit(item.quantity);
            return {
              ...item,
              processingStatus: "Available for Distribution",
              sentForProcessingDate: undefined,
              remainingStock: `${totalNum} ${unit}`,
              processingQuantity: `0 ${unit}`
            };
          }
          return item;
        })
      );
    }
  };

  // Filtered inventory list
  const filteredInventory = inventory.filter((item) => {
    if (inventoryFilter === "DISTRIBUTED") return item.itemType === "DISTRIBUTED";
    if (inventoryFilter === "RAW") return item.itemType === "RAW";
    return true;
  });

  return (
    <div className="min-h-screen bg-stone-950 text-stone-100 font-sans pb-24 pt-6 px-4 sm:px-6 lg:px-8 relative z-20">
      <Head>
        <title>Supply Hub | Seed2Shelf Distributor</title>
        <meta name="description" content="Transform raw farmer crops into processed goods with blockchain traceability." />
      </Head>

      {/* Solid Dark Background Overlay */}
      <div className="fixed inset-0 bg-stone-950 z-[-1] pointer-events-none"></div>

      <div className="max-w-6xl mx-auto space-y-7">
        
        {/* =========================================================================
            HEADER (BORDER TOP & BOTTOM - MATCHING PURCHASE ORDERS STYLE)
           ========================================================================= */}
        <div className="flex items-center gap-3.5 border-y border-stone-800/80 py-3.5">
          <div className="p-2.5 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl text-emerald-400 shrink-0">
            <Boxes className="h-7 w-7" />
          </div>
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              Supply Hub
            </h1>
          </div>
        </div>

        {submitted && (
          <div className="p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl text-xs text-emerald-400 font-bold flex items-center gap-2 animate-in fade-in duration-300 shadow-lg">
            <CheckCircle2 className="w-5 h-5 shrink-0" />
            <span>Processed product registered successfully! Transformed QR Code generated.</span>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-7">
          
          {/* =========================================================================
              LOG NEW DISTRIBUTED ITEM FORM (LEFT CARD - 6 COLS)
             ========================================================================= */}
          <div className="lg:col-span-6 bg-stone-900/90 border border-stone-800 rounded-3xl p-6 sm:p-7 shadow-xl space-y-5">
            <div className="pb-3 border-b border-stone-800">
              <h2 className="text-base font-extrabold text-emerald-400 flex items-center gap-2">
                <PlusCircle className="w-5 h-5" /> Log New Distributed Item
              </h2>
            </div>

            <form onSubmit={handleRegisterProduct} className="space-y-4 text-xs">
              
              {/* FIELD 1: Product Category Dropdown */}
              <div>
                <label className="text-stone-400 font-bold uppercase text-[10px] tracking-wider block mb-1.5">
                  Product Category *
                </label>
                <div className="relative">
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full bg-stone-950 border border-stone-800 rounded-2xl pl-4 pr-10 py-3 text-white focus:outline-none focus:border-emerald-500 transition cursor-pointer appearance-none text-xs font-semibold"
                  >
                    <option value="Processed Grains">Processed Grains</option>
                    <option value="Fruit Extracts">Fruit Extracts</option>
                    <option value="Flours & Starches">Flours & Starches</option>
                    <option value="Packaged Foods">Packaged Foods</option>
                    <option value="Organic Oils">Organic Oils</option>
                    <option value="Others">Others</option>
                  </select>
                  <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-stone-400">
                    <ChevronDown className="w-4 h-4 text-stone-400" />
                  </div>
                </div>

                {category === "Others" && (
                  <div className="mt-2.5">
                    <label className="text-stone-400 font-bold uppercase text-[10px] tracking-wider block mb-1.5">
                      Specify Custom Category *
                    </label>
                    <input
                      type="text"
                      value={customCategory}
                      onChange={(e) => setCustomCategory(e.target.value)}
                      placeholder="e.g. Spices & Seasonings"
                      className="w-full bg-stone-950 border border-stone-800 rounded-2xl px-4 py-3 text-white placeholder-stone-600 focus:outline-none focus:border-emerald-500 transition text-xs font-semibold"
                      required
                    />
                  </div>
                )}
              </div>

              {/* FIELD 2: Product Name */}
              <div>
                <label className="text-stone-400 font-bold uppercase text-[10px] tracking-wider block mb-1.5">
                  Product Name *
                </label>
                <input
                  type="text"
                  value={productName}
                  onChange={(e) => setProductName(e.target.value)}
                  placeholder="e.g. Refined Basmati Flour (5kg Bags)"
                  className="w-full bg-stone-950 border border-stone-800 rounded-2xl px-4 py-3 text-white placeholder-stone-600 focus:outline-none focus:border-emerald-500 transition text-xs font-semibold"
                  required
                />
              </div>

              {/* FIELD 3: Linked Parent Batches (Batch Combination) */}
              <div>
                <label className="text-stone-500 font-bold uppercase text-[10px] tracking-wider block mb-1.5">
                  Source Batches (Select multiple to combine) *
                </label>
                <div className="bg-stone-950 border border-stone-800 rounded-2xl p-4 space-y-2 max-h-40 overflow-y-auto custom-scrollbar">
                  {inventory.filter(i => i.itemType === "RAW").length === 0 ? (
                    <div className="text-stone-500 text-xs italic">No purchased batches available</div>
                  ) : (
                    inventory.filter(i => i.itemType === "RAW").map((raw) => (
                      <label key={raw.id} className="flex items-center gap-3 cursor-pointer group">
                        <input
                          type="checkbox"
                          value={raw.id}
                          checked={parentRawBatchIds.includes(raw.id)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setParentRawBatchIds([...parentRawBatchIds, raw.id]);
                            } else {
                              setParentRawBatchIds(parentRawBatchIds.filter(id => id !== raw.id));
                            }
                          }}
                          className="w-4 h-4 rounded border-stone-700 text-emerald-500 focus:ring-emerald-500/30 bg-stone-900 cursor-pointer"
                        />
                        <span className="text-white text-xs font-semibold group-hover:text-emerald-400 transition">
                          {raw.id} - {raw.productName} ({raw.quantity})
                        </span>
                      </label>
                    ))
                  )}
                </div>
              </div>

              {/* Quantity & Price */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-stone-400 font-bold uppercase text-[10px] tracking-wider block mb-1.5">
                    Distributed Volume (kg) *
                  </label>
                  <input
                    type="number"
                    value={quantity}
                    onChange={(e) => setQuantity(e.target.value)}
                    placeholder="e.g. 100"
                    className="w-full bg-stone-950 border border-stone-800 rounded-2xl px-4 py-3 text-white placeholder-stone-600 focus:outline-none focus:border-emerald-500 transition text-xs font-semibold [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                    required
                  />
                </div>

                <div>
                  <label className="text-stone-400 font-bold uppercase text-[10px] tracking-wider block mb-1.5">
                    Selling Price (₹/kg) *
                  </label>
                  <input
                    type="number"
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                    placeholder="e.g. 65"
                    className="w-full bg-stone-950 border border-stone-800 rounded-2xl px-4 py-3 text-white placeholder-stone-600 focus:outline-none focus:border-emerald-500 transition text-xs font-semibold [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                    required
                  />
                </div>
              </div>

              {/* CUSTOM DATE PICKER */}
              <div className="relative" ref={calendarRef}>
                <label className="text-stone-400 font-bold uppercase text-[10px] tracking-wider block mb-1.5">
                  Distribution Date *
                </label>
                
                <div
                  onClick={() => setIsCalendarOpen(!isCalendarOpen)}
                  className="w-full bg-stone-950 border border-stone-800 rounded-2xl px-4 py-3 text-white flex items-center justify-between cursor-pointer hover:border-emerald-500/50 transition text-xs"
                >
                  <span className="font-semibold text-stone-200">{formattedDateDisplay}</span>
                  <CalendarIcon className="w-4 h-4 text-emerald-400 shrink-0" />
                </div>

                {isCalendarOpen && (
                  <div className="absolute left-0 top-full mt-2 z-50 w-72 bg-stone-900 border border-stone-800 rounded-2xl p-4 shadow-2xl space-y-3 animate-in fade-in zoom-in-95 duration-150">
                    
                    <div className="flex items-center justify-between pb-2 border-b border-stone-800">
                      <span className="font-extrabold text-white text-xs sm:text-sm">
                        {monthNames[selectedMonth]}, {selectedYear}
                      </span>

                      <div className="flex items-center gap-1">
                        <button
                          type="button"
                          onClick={handlePrevMonth}
                          className="p-1 text-stone-400 hover:text-white rounded-lg hover:bg-stone-800 transition cursor-pointer"
                          title="Previous Month"
                        >
                          <ChevronLeft className="w-4 h-4" />
                        </button>

                        <button
                          type="button"
                          onClick={handleNextMonth}
                          className="p-1 text-stone-400 hover:text-white rounded-lg hover:bg-stone-800 transition cursor-pointer"
                          title="Next Month"
                        >
                          <ChevronRight className="w-4 h-4" />
                        </button>
                      </div>
                    </div>

                    <div className="grid grid-cols-7 gap-1 text-center font-bold text-[10px] text-stone-400">
                      <span>Su</span>
                      <span>Mo</span>
                      <span>Tu</span>
                      <span>We</span>
                      <span>Th</span>
                      <span>Fr</span>
                      <span>Sa</span>
                    </div>

                    <div className="grid grid-cols-7 gap-1 text-center text-xs">
                      {Array.from({ length: firstDayOfWeek }).map((_, i) => (
                        <div key={`blank-${i}`} />
                      ))}

                      {Array.from({ length: daysInMonth }).map((_, idx) => {
                        const dayNum = idx + 1;
                        const isSelected = dayNum === selectedDay;
                        const isToday = dayNum === 24 && selectedMonth === 6 && selectedYear === 2026;

                        return (
                          <button
                            key={dayNum}
                            type="button"
                            onClick={() => {
                              setSelectedDay(dayNum);
                              setIsCalendarOpen(false);
                            }}
                            className={`py-1.5 rounded-xl font-semibold transition cursor-pointer ${
                              isSelected
                                ? "bg-emerald-600 text-white font-extrabold shadow-sm"
                                : isToday
                                ? "border border-emerald-500/50 text-emerald-400"
                                : "text-stone-300 hover:bg-stone-800 hover:text-white"
                            }`}
                          >
                            {dayNum}
                          </button>
                        );
                      })}
                    </div>

                    <div className="pt-2 border-t border-stone-800 flex items-center justify-between text-[11px]">
                      <button
                        type="button"
                        onClick={() => {
                          setSelectedDay(24);
                          setSelectedMonth(6);
                          setSelectedYear(2026);
                          setIsCalendarOpen(false);
                        }}
                        className="text-emerald-400 hover:text-emerald-300 font-bold"
                      >
                        Today
                      </button>

                      <button
                        type="button"
                        onClick={() => setIsCalendarOpen(false)}
                        className="text-stone-400 hover:text-stone-200"
                      >
                        Close
                      </button>
                    </div>

                  </div>
                )}
              </div>

              {/* Distributed Product Photo Upload */}
              <div>
                <label className="text-stone-400 font-bold uppercase text-[10px] tracking-wider block mb-1.5">
                  Distributed Product Photo *
                </label>
                <input
                  type="file"
                  accept="image/*"
                  ref={imageInputRef}
                  onChange={handleImageUpload}
                  className="hidden"
                />

                {productImage ? (
                  <div className="relative rounded-2xl overflow-hidden border border-stone-800 bg-stone-950 p-2 group">
                    <img
                      src={productImage}
                      alt="Distributed Product Preview"
                      className="w-full h-36 object-cover rounded-xl"
                    />
                    <button
                      type="button"
                      onClick={() => setProductImage(null)}
                      className="absolute top-4 right-4 p-1.5 rounded-full bg-stone-950/80 text-stone-300 hover:text-white border border-stone-800 transition cursor-pointer"
                      title="Remove Image"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ) : (
                  <div
                    onClick={() => imageInputRef.current?.click()}
                    className="border-2 border-dashed border-stone-800 hover:border-emerald-500/50 bg-stone-950/80 rounded-2xl p-5 text-center cursor-pointer transition flex flex-col items-center justify-center gap-2 group"
                  >
                    <div className="p-3 bg-stone-900 rounded-xl text-stone-400 group-hover:text-emerald-400 group-hover:bg-emerald-500/10 transition">
                      <UploadCloud className="w-6 h-6" />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-white group-hover:text-emerald-400 transition">
                        Click to upload product image photo
                      </p>
                      <p className="text-[10px] text-stone-500 mt-0.5">
                        PNG, JPG or WEBP (Displays on product card)
                      </p>
                    </div>
                  </div>
                )}
              </div>

              {/* Submit Button */}
              <div className="pt-2">
                <button
                  type="submit"
                  className="w-full py-3.5 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-xs transition cursor-pointer shadow-lg shadow-emerald-600/20 flex items-center justify-center gap-2"
                >
                  <PlusCircle className="w-4.5 h-4.5" />
                  <span>
                    {parentRawBatchIds.length > 0
                      ? "Update the Batch(es)"
                      : "Save & Register Distributed Item"}
                  </span>
                </button>
              </div>

            </form>

            {/* BATCH INFORMATION SECTION */}
            {(() => {
              const selectedParentRaw = parentRawBatchIds.length > 0 ? inventory.find(i => i.id === parentRawBatchIds[0]) : null;
              const displayedQrUrl = newBatchInfo
                ? newBatchInfo.qr
                : selectedParentRaw
                ? (selectedParentRaw.qrCodeUrl || `https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=${selectedParentRaw.id}`)
                : null;
              const displayedBatchId = newBatchInfo
                ? newBatchInfo.id
                : selectedParentRaw
                ? (parentRawBatchIds.length > 1 ? `${parentRawBatchIds.length} Batches Combined` : selectedParentRaw.id)
                : "SELECT-SOURCE-BATCH";

              return (
                <div className="mt-6 p-5 bg-stone-950 border border-stone-800 rounded-2xl space-y-4 shadow-xl transition-all duration-300">
                  <div className="flex items-center justify-between border-b border-stone-800/80 pb-3">
                    <div className="flex items-center gap-2">
                      <QrIcon className={`w-5 h-5 ${displayedQrUrl ? "text-emerald-400" : "text-stone-600"}`} />
                      <h3 className="text-sm font-extrabold text-white">Batch Information</h3>
                    </div>
                    <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full border ${
                      newBatchInfo || selectedParentRaw
                        ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" 
                        : "bg-stone-900 text-stone-500 border-stone-800"
                    }`}>
                      {newBatchInfo ? "Generated & Live" : selectedParentRaw ? "Loaded Previous QR" : "Pending Selection"}
                    </span>
                  </div>

                  {/* DYNAMIC LINEAGE CALLOUT FOR PREVIOUS BATCH */}
                  {selectedParentRaw && (
                    <div className="p-3.5 bg-stone-900 border border-emerald-500/30 rounded-xl text-xs space-y-1.5 animate-in fade-in duration-150">
                      <div className="flex items-center justify-between text-emerald-400 font-bold">
                        <span>Source Batch Lineage: {parentRawBatchIds.join(", ")}</span>
                        <span className="text-[10px] text-stone-400">Previous Data Loaded</span>
                      </div>
                      <p className="text-stone-300 text-[11px] leading-relaxed">
                        Combining <strong className="text-white font-mono">{parentRawBatchIds.length}</strong> source batches. Clicking <strong className="text-emerald-400">Update the Batch(es)</strong> will save the new distributed run under a new combined batch ID.
                      </p>
                    </div>
                  )}

                  <div className="flex flex-col sm:flex-row items-center gap-5">
                    {displayedQrUrl ? (
                      <div className="p-2 bg-white rounded-2xl shadow-md shrink-0 border border-stone-700 animate-in zoom-in-95 duration-200">
                        <img src={displayedQrUrl} alt={`QR Code for ${displayedBatchId}`} className="w-28 h-28 object-contain" />
                      </div>
                    ) : (
                      <div className="w-28 h-28 border-2 border-dashed border-stone-800/80 bg-stone-950/80 rounded-2xl shrink-0 flex items-center justify-center">
                        <QrIcon className="w-10 h-10 text-stone-700/70" />
                      </div>
                    )}

                    <div className="space-y-2 flex-1 text-center sm:text-left">
                      <div>
                        <span className="text-[10px] font-bold uppercase text-stone-500 block">Batch ID</span>
                        <span className={`font-extrabold ${displayedQrUrl ? "text-base text-emerald-400" : "text-sm text-stone-600"}`}>
                          {displayedBatchId}
                        </span>
                      </div>

                      <div className="flex flex-wrap gap-2 pt-2 justify-center sm:justify-start">
                        {displayedQrUrl ? (
                          <>
                            <button
                              type="button"
                              onClick={() => setSelectedQrModal(inventory.find(i => i.id === displayedBatchId) || ({ id: displayedBatchId, qrCodeUrl: displayedQrUrl, productName, category: "Processed", quantity: `${quantity} kg`, pricePerUnit: `₹${price}/kg`, date: formattedDateDisplay, status: "In Stock" } as any))}
                              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-xs transition cursor-pointer"
                            >
                              <Eye className="w-3.5 h-3.5" />
                              <span>View QR</span>
                            </button>
                            <button
                              type="button"
                              onClick={() => downloadQrCode(displayedQrUrl, displayedBatchId)}
                              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-200 border border-stone-700 font-extrabold text-xs transition cursor-pointer"
                            >
                              <Download className="w-3.5 h-3.5" />
                              <span>Download QR</span>
                            </button>
                          </>
                        ) : (
                          <>
                            <button
                              type="button"
                              disabled
                              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-stone-900 text-stone-600 border border-stone-800 text-xs font-bold cursor-not-allowed opacity-70"
                            >
                              <Eye className="w-3.5 h-3.5" />
                              <span>View QR</span>
                            </button>
                            <button
                              type="button"
                              disabled
                              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-stone-900 text-stone-600 border border-stone-800 text-xs font-bold cursor-not-allowed opacity-70"
                            >
                              <Download className="w-3.5 h-3.5" />
                              <span>Download QR</span>
                            </button>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })()}
          </div>

          {/* =========================================================================
              MY INVENTORY SECTION (RIGHT CARD - 6 COLS)
             ========================================================================= */}
          <div className="lg:col-span-6 bg-stone-900/90 border border-stone-800 rounded-3xl p-6 sm:p-7 shadow-xl space-y-5">
            <div className="pb-3 border-b border-stone-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <h2 className="text-base font-extrabold text-[#00d26a] flex items-center gap-2">
                <Package className="w-5 h-5" /> My Inventory
              </h2>
              
              {/* PRIMARY FILTER TABS: Distributed Products vs Purchased Harvests vs History */}
              <div className="flex items-center bg-stone-950 p-1 rounded-2xl border border-stone-800 text-[10px] font-extrabold flex-wrap sm:flex-nowrap gap-1">
                <button
                  onClick={() => setInventoryFilter("DISTRIBUTED")}
                  className={`px-3 py-1.5 rounded-xl transition cursor-pointer flex items-center justify-center ${
                    inventoryFilter === "DISTRIBUTED"
                      ? "bg-emerald-600 text-white shadow-md font-black"
                      : "text-stone-400 hover:text-stone-200"
                  }`}
                >
                  <span>Distributed Products</span>
                </button>

                <div className="w-[1px] h-3.5 bg-stone-800 mx-0.5 shrink-0 hidden sm:block"></div>

                <button
                  onClick={() => setInventoryFilter("RAW")}
                  className={`px-3 py-1.5 rounded-xl transition cursor-pointer flex items-center justify-center ${
                    inventoryFilter === "RAW"
                      ? "bg-emerald-600 text-white shadow-md font-black"
                      : "text-stone-400 hover:text-stone-200"
                  }`}
                >
                  <span>Purchased Harvests</span>
                </button>

                <div className="w-[1px] h-3.5 bg-stone-800 mx-0.5 shrink-0 hidden sm:block"></div>

                <button
                  onClick={() => setInventoryFilter("HISTORY")}
                  className={`px-3 py-1.5 rounded-xl transition cursor-pointer flex items-center justify-center ${
                    inventoryFilter === "HISTORY"
                      ? "bg-emerald-600 text-white shadow-md font-black"
                      : "text-stone-400 hover:text-stone-200"
                  }`}
                >
                  <span>History</span>
                </button>
              </div>
            </div>

            {/* MAIN TAB CONTENT */}
            {inventoryFilter === "RAW" ? (
              /* =========================================================================
                 TAB 1: PURCHASED HARVESTS (ACTIVE RAW CROP STOCK)
                 ========================================================================= */
              <div className="space-y-3">
                {inventory.filter(i => i.itemType === "RAW" && i.processingStatus !== "Fully Distributed" && parseQuantityAndUnit(i.remainingStock || i.quantity).num > 0).length === 0 ? (
                  <div className="p-8 text-center text-stone-400 text-xs">
                    No active purchased farmer crop harvests available. Completed batches move to History.
                  </div>
                ) : (
                  inventory.filter(i => i.itemType === "RAW" && i.processingStatus !== "Fully Distributed" && parseQuantityAndUnit(i.remainingStock || i.quantity).num > 0).map((raw) => {
                    const imgUrl = getProductImage(raw);
                    const isSent = raw.processingStatus === "Sent for Distribution";
                    const isFullyProcessed = raw.processingStatus === "Fully Distributed";
                    const { num: remainingNum } = parseQuantityAndUnit(raw.remainingStock || raw.quantity);
                    const hasAvailableStock = remainingNum > 0;

                    return (
                      <div
                        key={raw.id}
                        className={`bg-stone-950/90 border rounded-2xl p-4 space-y-3 shadow-md transition-all duration-300 ${
                          isSent || isFullyProcessed
                            ? "border-amber-500/30 opacity-90 bg-stone-950/95"
                            : "border-stone-800 hover:border-emerald-500/40"
                        }`}
                      >
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-stone-800/80 pb-3">
                          <div className="flex items-center gap-3">
                            <img
                              src={imgUrl}
                              alt={raw.productName}
                              className="w-12 h-12 rounded-xl object-cover border border-stone-800 shrink-0"
                            />
                            <div>
                              <div className="flex items-center gap-2">
                                <span className="font-mono text-xs font-extrabold text-emerald-400">{raw.id}</span>
                                {isSent ? (
                                  <span className="text-[9px] font-bold px-2.5 py-0.5 rounded-full bg-amber-500/15 text-amber-400 border border-amber-500/30">
                                    Sent for Distribution
                                  </span>
                                ) : (
                                  <span className="text-[9px] font-bold px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                                    Available for Distribution
                                  </span>
                                )}
                              </div>
                              <h3 className="text-sm font-black text-white">{raw.productName}</h3>
                            </div>
                          </div>

                          <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap">
                            <button
                              type="button"
                              onClick={() => setSelectedQrModal(raw)}
                              className="px-3 py-1.5 rounded-xl bg-stone-900 hover:bg-stone-800 text-stone-200 hover:text-white border border-stone-800 text-xs font-bold transition cursor-pointer flex items-center gap-1.5 shadow-sm"
                            >
                              <QrIcon className="w-3.5 h-3.5 text-emerald-400" />
                              <span>View QR</span>
                            </button>

                            {hasAvailableStock && (
                              <button
                                type="button"
                                onClick={() => handleOpenProcessingModal(raw)}
                                className="px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-xs transition cursor-pointer flex items-center gap-1.5 shadow-md"
                              >
                                <Boxes className="w-3.5 h-3.5" />
                                <span>{isSent ? "Send More" : "Send for Processing"}</span>
                              </button>
                            )}

                            {(isSent || parseQuantityAndUnit(raw.processingQuantity).num > 0) && (
                              <button
                                type="button"
                                onClick={() => handleRevokeProcessing(raw.id)}
                                className="px-2.5 py-1.5 rounded-xl bg-stone-900 hover:bg-red-500/20 text-stone-400 hover:text-red-400 border border-stone-800 text-xs font-bold transition cursor-pointer flex items-center gap-1"
                                title="Reset processing status and return stock"
                              >
                                <span className="hidden sm:inline">Reset</span>
                              </button>
                            )}
                          </div>
                        </div>

                        {/* Specs Grid with Limit Tracking */}
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-[11px] pt-0.5">
                          <div className="p-2.5 bg-stone-900/60 rounded-xl border border-stone-800/60">
                            <span className="text-[10px] text-stone-500 font-bold uppercase block mb-0.5">Supplier Farmer</span>
                            <span className="text-stone-200 font-bold truncate block">{raw.supplierFarmer || "Local Farmer"}</span>
                          </div>

                          <div className="p-2.5 bg-stone-900/60 rounded-xl border border-stone-800/60">
                            <span className="text-[10px] text-stone-500 font-bold uppercase block mb-0.5">Total Purchased</span>
                            <strong className="text-white font-extrabold">{raw.quantity}</strong>
                          </div>

                          <div className="p-2.5 bg-stone-900/60 rounded-xl border border-stone-800/60">
                            <span className="text-[10px] text-stone-500 font-bold uppercase block mb-0.5">In Distribution</span>
                            <strong className="text-amber-400 font-extrabold">{raw.processingQuantity || "0 kg"}</strong>
                          </div>

                          <div className="p-2.5 bg-stone-900/60 rounded-xl border border-stone-800/60">
                            <span className="text-[10px] text-stone-500 font-bold uppercase block mb-0.5">Available Stock</span>
                            <strong className="text-emerald-400 font-extrabold">{raw.remainingStock || raw.quantity}</strong>
                          </div>
                        </div>

                        {/* Processing Information Row */}
                        <div className="grid grid-cols-3 gap-2 text-[11px] pt-1 border-t border-stone-800/60">
                          <div className="p-2 bg-stone-900/40 rounded-xl border border-stone-800/40">
                            <span className="text-[9px] text-stone-500 font-bold uppercase block">Distribution Status</span>
                            <span className={`font-bold text-[10px] ${isSent ? "text-amber-400" : "text-emerald-400"}`}>
                              {raw.processingStatus || "Available for Distribution"}
                            </span>
                          </div>

                          <div className="p-2 bg-stone-900/40 rounded-xl border border-stone-800/40">
                            <span className="text-[9px] text-stone-500 font-bold uppercase block">Last Distribution Date</span>
                            <span className="text-stone-300 font-mono text-[10px]">
                              {raw.sentForProcessingDate || "Not Started"}
                            </span>
                          </div>

                          <div className="p-2 bg-stone-900/40 rounded-xl border border-stone-800/40">
                            <span className="text-[9px] text-stone-500 font-bold uppercase block">Purchase Price</span>
                            <span className="text-stone-200 font-extrabold text-[10px]">
                              {raw.pricePerUnit}
                            </span>
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            ) : inventoryFilter === "DISTRIBUTED" ? (
              /* =========================================================================
                 TAB 2: DISTRIBUTED PRODUCTS (ACTIVE REGISTERED PRODUCTS)
                 ========================================================================= */
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {inventory.filter(i => i.itemType === "DISTRIBUTED" && i.status !== "Dispatched" && i.status !== "Archived").length === 0 ? (
                  <div className="col-span-full p-8 text-center text-stone-400 text-xs">
                    No active processed product items registered yet.
                  </div>
                ) : (
                  inventory.filter(i => i.itemType === "DISTRIBUTED" && i.status !== "Dispatched" && i.status !== "Archived").map((item) => {
                    const imgUrl = getProductImage(item);
                    return (
                      <div
                        key={item.id}
                        className="bg-stone-900/90 border border-stone-800 hover:border-emerald-500/40 rounded-3xl p-4 space-y-3.5 shadow-sm hover:shadow-xl hover:shadow-emerald-500/5 transition-all duration-300 flex flex-col justify-between"
                      >
                        <div className="relative rounded-2xl overflow-hidden h-44 w-full bg-stone-950 border border-stone-800/80 group">
                          <img
                            src={imgUrl}
                            alt={item.productName}
                            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                          />
                          <div className="absolute top-2.5 left-2.5 bg-stone-950/90 backdrop-blur-md text-emerald-400 font-mono text-[10px] font-extrabold px-2.5 py-1 rounded-full border border-emerald-500/30 shadow-md">
                            {item.id}
                          </div>
                          <div className={`absolute top-2.5 right-2.5 text-[9px] font-extrabold px-2.5 py-1 rounded-full border backdrop-blur-md shadow-md ${
                            item.status === 'Listed'
                              ? 'bg-emerald-500/90 text-black border-emerald-400 font-black'
                              : 'bg-stone-900/90 text-stone-300 border-stone-700'
                          }`}>
                            {item.status}
                          </div>
                        </div>

                        <div className="flex items-center justify-between gap-2 pt-0.5">
                          <div className="space-y-0.5 truncate">
                            <span className="text-[9px] font-extrabold uppercase tracking-widest text-stone-400 block">
                              {item.category}
                            </span>
                            <h3 className="text-sm font-black text-white leading-tight truncate">
                              {item.productName}
                            </h3>
                          </div>
                          <div className="flex items-center gap-1.5 shrink-0">
                            <button
                              onClick={() => alert(`Editing ${item.productName}`)}
                              className="p-1.5 rounded-xl bg-stone-950 hover:bg-stone-800 text-stone-400 hover:text-white border border-stone-800 transition cursor-pointer"
                              title="Edit Item"
                            >
                              <Pencil className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => handleDeleteItem(item.id)}
                              className="p-1.5 rounded-xl bg-stone-950 hover:bg-red-500/20 text-stone-400 hover:text-red-400 border border-stone-800 transition cursor-pointer"
                              title="Delete Item"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>

                        <div className="p-3.5 bg-stone-950/80 border border-stone-800/90 rounded-2xl space-y-2 text-[11px]">
                          <div className="flex justify-between items-center text-stone-300">
                            <span className="text-stone-400 font-medium">Batch Volume:</span>
                            <strong className="text-emerald-400 font-extrabold">{item.quantity}</strong>
                          </div>
                          <div className="flex justify-between items-center text-stone-300">
                            <span className="text-stone-400 font-medium">Price per Unit:</span>
                            <strong className="text-white font-bold">{item.pricePerUnit}</strong>
                          </div>
                          {item.parentRawBatchId && (
                            <div className="flex justify-between items-center text-stone-300">
                              <span className="text-stone-400 font-medium">Linked Raw Batch:</span>
                              <strong className="font-mono text-stone-200 text-[10px]">{item.parentRawBatchId}</strong>
                            </div>
                          )}
                          <div className="flex justify-between items-center text-stone-300">
                            <span className="text-stone-400 font-medium">Date:</span>
                            <span className="text-stone-300 font-mono text-[10px]">{item.date}</span>
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-2 pt-1">
                          <button
                            type="button"
                            onClick={() => setSelectedQrModal(item)}
                            className="py-2.5 px-3 rounded-xl bg-stone-950 hover:bg-stone-800 border border-stone-800 text-stone-200 hover:text-white font-extrabold text-[11px] transition cursor-pointer flex items-center justify-center gap-1.5 shadow-sm"
                          >
                            <QrIcon className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                            <span className="truncate">View QR</span>
                          </button>
                          <button
                            onClick={() => handleToggleListStatus(item.id)}
                            className={`py-2.5 px-3 rounded-xl text-[11px] font-extrabold transition cursor-pointer border flex items-center justify-center gap-1 truncate ${
                              item.status === 'Listed'
                                ? 'bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 border-amber-500/30'
                                : 'bg-emerald-500 hover:bg-emerald-400 text-black border-emerald-400 font-black shadow-md shadow-emerald-500/10'
                            }`}
                          >
                            <span>{item.status === 'Listed' ? 'Unlist' : 'List Product'}</span>
                          </button>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            ) : (
              /* =========================================================================
                 TAB 3: HISTORY (PROCESSOR PRODUCTION & PURCHASES HISTORY)
                 ========================================================================= */
              <div className="space-y-4">
                {/* SUB CATEGORY SELECTOR FOR HISTORY */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between bg-stone-950 p-2.5 rounded-2xl border border-stone-800 text-[11px] font-bold gap-2">
                  <span className="text-stone-400 text-xs font-bold pl-1">Distributor History Logs</span>
                  <div className="flex items-center gap-1 bg-stone-900 p-1 rounded-xl border border-stone-800/80 text-[10px]">
                    <button
                      onClick={() => setHistoryCategoryFilter("DISTRIBUTED_DISPATCHED")}
                      className={`px-3 py-1.5 rounded-lg transition cursor-pointer flex items-center gap-1 ${
                        historyCategoryFilter === "DISTRIBUTED_DISPATCHED"
                          ? "bg-emerald-600 text-white font-extrabold shadow-sm"
                          : "text-stone-400 hover:text-stone-200"
                      }`}
                    >
                      <span>Distributed Products</span>
                    </button>

                    <button
                      onClick={() => setHistoryCategoryFilter("RAW_COMPLETED")}
                      className={`px-3 py-1.5 rounded-lg transition cursor-pointer flex items-center gap-1 ${
                        historyCategoryFilter === "RAW_COMPLETED"
                          ? "bg-emerald-600 text-white font-extrabold shadow-sm"
                          : "text-stone-400 hover:text-stone-200"
                      }`}
                    >
                      <span>Purchased Harvests</span>
                    </button>
                  </div>
                </div>

                {/* HISTORY ITEMS LIST */}
                {inventory.filter(i => {
                  if (historyCategoryFilter === "RAW_COMPLETED") {
                    return i.itemType === "RAW" && (i.processingStatus === "Fully Distributed" || parseQuantityAndUnit(i.remainingStock).num === 0);
                  }
                  return i.itemType === "DISTRIBUTED" && (i.status === "Dispatched" || i.status === "Archived");
                }).length === 0 ? (
                  <div className="p-8 text-center text-stone-400 text-xs">
                    {historyCategoryFilter === "RAW_COMPLETED"
                      ? "No 100% fully processed raw crop harvest history yet."
                      : "No dispatched or archived processed product history yet."}
                  </div>
                ) : (
                  inventory
                    .filter(i => {
                      if (historyCategoryFilter === "RAW_COMPLETED") {
                        return i.itemType === "RAW" && (i.processingStatus === "Fully Distributed" || parseQuantityAndUnit(i.remainingStock).num === 0);
                      }
                      return i.itemType === "DISTRIBUTED" && (i.status === "Dispatched" || i.status === "Archived");
                    })
                    .map((item) => {
                      const imgUrl = getProductImage(item);
                      const isRaw = item.itemType === "RAW";

                      return (
                        <div
                          key={item.id}
                          className="bg-stone-950/90 border border-blue-500/30 rounded-2xl p-4 space-y-3 shadow-md"
                        >
                          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-stone-800/80 pb-3">
                            <div className="flex items-center gap-3">
                              <img
                                src={imgUrl}
                                alt={item.productName}
                                className="w-12 h-12 rounded-xl object-cover border border-stone-800 shrink-0"
                              />
                              <div>
                                <div className="flex items-center gap-2">
                                  <span className="font-mono text-xs font-extrabold text-emerald-400">{item.id}</span>
                                  <span className="text-[9px] font-bold px-2.5 py-0.5 rounded-full bg-blue-500/15 text-blue-400 border border-blue-500/30 flex items-center gap-1">
                                    <CheckCircle2 className="w-3 h-3" />
                                    <span>Completed</span>
                                  </span>
                                </div>
                                <h3 className="text-sm font-black text-white">{item.productName}</h3>
                              </div>
                            </div>

                            <button
                              type="button"
                              onClick={() => setSelectedQrModal(item)}
                              className="px-3.5 py-1.5 rounded-xl bg-stone-900 hover:bg-stone-800 text-stone-200 hover:text-white border border-stone-800 text-xs font-bold transition cursor-pointer flex items-center gap-1.5 shadow-sm"
                            >
                              <QrIcon className="w-3.5 h-3.5 text-emerald-400" />
                              <span>View QR</span>
                            </button>
                          </div>

                          {/* Details Grid */}
                          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-[11px] pt-0.5">
                            <div className="p-2.5 bg-stone-900/60 rounded-xl border border-stone-800/60">
                              <span className="text-[10px] text-stone-500 font-bold uppercase block mb-0.5">Category</span>
                              <span className="text-stone-200 font-bold truncate block">{item.category}</span>
                            </div>

                            <div className="p-2.5 bg-stone-900/60 rounded-xl border border-stone-800/60">
                              <span className="text-[10px] text-stone-500 font-bold uppercase block mb-0.5">Total Quantity</span>
                              <strong className="text-white font-extrabold">{item.quantity}</strong>
                            </div>

                            <div className="p-2.5 bg-stone-900/60 rounded-xl border border-stone-800/60">
                              <span className="text-[10px] text-stone-500 font-bold uppercase block mb-0.5">Completion Status</span>
                              <strong className="text-blue-400 font-extrabold">Completed</strong>
                            </div>

                            <div className="p-2.5 bg-stone-900/60 rounded-xl border border-stone-800/60">
                              <span className="text-[10px] text-stone-500 font-bold uppercase block mb-0.5">Date Completed</span>
                              <span className="text-stone-300 font-mono text-[10px]">{item.sentForProcessingDate || item.date}</span>
                            </div>
                          </div>
                        </div>
                      );
                    })
                )}
              </div>
            )}

          </div>

        </div>

      </div>

      {/* VIEW QR MODAL */}
      {selectedQrModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-stone-900 border border-stone-800 rounded-3xl p-6 sm:p-7 max-w-sm w-full text-center space-y-5 shadow-2xl relative">
            <button
              onClick={() => setSelectedQrModal(null)}
              className="absolute top-4 right-4 p-1.5 rounded-full bg-stone-800 text-stone-400 hover:text-white transition cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>

            <div>
              <div className="p-3 bg-emerald-500/10 rounded-full w-12 h-12 flex items-center justify-center mx-auto mb-2 text-emerald-400 border border-emerald-500/20">
                <QrIcon className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-black text-white">{selectedQrModal.productName}</h3>
              <p className="font-mono text-xs font-bold text-emerald-400 mt-1">{selectedQrModal.id}</p>
            </div>

            <div className="p-4 bg-white rounded-2xl mx-auto w-56 h-56 flex items-center justify-center shadow-inner">
              <img src={selectedQrModal.qrCodeUrl} alt={`QR Code ${selectedQrModal.id}`} className="w-full h-full object-contain" />
            </div>

            <div className="p-3 bg-stone-950 rounded-xl border border-stone-800 text-left space-y-1">
              <span className="text-[10px] font-bold text-stone-500 uppercase block">Traceability Link</span>
              <div className="flex items-center justify-between gap-2">
                <span className="font-mono text-[11px] text-stone-300 truncate">
                  https://seed2shelf.app/trace/{selectedQrModal.id}
                </span>
                <button
                  onClick={() => copyTraceUrl(`https://seed2shelf.app/trace/${selectedQrModal.id}`)}
                  className="p-1 text-stone-400 hover:text-emerald-400 transition shrink-0 cursor-pointer"
                  title="Copy URL"
                >
                  {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div className="flex gap-3 pt-1">
              <button
                onClick={() => downloadQrCode(selectedQrModal.qrCodeUrl, selectedQrModal.id)}
                className="flex-1 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl font-extrabold text-xs flex items-center justify-center gap-1.5 shadow-md transition cursor-pointer"
              >
                <Download className="w-4 h-4" /> Download QR
              </button>
              <button
                onClick={() => setSelectedQrModal(null)}
                className="px-4 py-2.5 bg-stone-800 hover:bg-stone-700 text-stone-300 rounded-xl font-bold text-xs transition cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* SET PROCESSING LIMIT MODAL */}
      {processingModalItem && (() => {
        const { num: availNum, unit } = parseQuantityAndUnit(
          processingModalItem.remainingStock || processingModalItem.quantity
        );
        const { num: currentProcNum } = parseQuantityAndUnit(processingModalItem.processingQuantity);
        const amountNum = parseFloat(sendAmount) || 0;
        const projectedRemaining = Math.max(0, availNum - amountNum);
        const projectedTotalProc = currentProcNum + amountNum;

        return (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-stone-900 border border-stone-800 rounded-3xl p-6 sm:p-7 max-w-lg w-full space-y-5 shadow-2xl relative">
              <button
                type="button"
                onClick={() => setProcessingModalItem(null)}
                className="absolute top-4 right-4 p-1.5 rounded-full bg-stone-800 text-stone-400 hover:text-white transition cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>

              {/* Header */}
              <div className="flex items-center gap-3 border-b border-stone-800 pb-4">
                <div className="p-3 bg-emerald-500/10 rounded-2xl text-emerald-400 border border-emerald-500/20">
                  <Boxes className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-lg font-black text-white">Set Processing Limit</h3>
                  <p className="text-xs text-stone-400">Specify how much crop to send to processing line</p>
                </div>
              </div>

              {/* Crop Batch Summary Card */}
              <div className="p-4 bg-stone-950 border border-stone-800 rounded-2xl space-y-2 text-xs">
                <div className="flex justify-between items-center">
                  <span className="text-stone-400 font-bold uppercase text-[10px]">Crop Batch ID:</span>
                  <span className="font-mono font-extrabold text-emerald-400">{processingModalItem.id}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-stone-400 font-bold uppercase text-[10px]">Product Crop Name:</span>
                  <span className="font-black text-white">{processingModalItem.productName}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-stone-400 font-bold uppercase text-[10px]">Supplier Farmer:</span>
                  <span className="font-semibold text-stone-300">{processingModalItem.supplierFarmer || "Local Farmer"}</span>
                </div>
                <div className="grid grid-cols-2 gap-2 pt-2 border-t border-stone-800/80 text-[11px]">
                  <div>
                    <span className="text-stone-500 text-[10px] block">Current Available Stock</span>
                    <strong className="text-emerald-400 text-sm font-black">{availNum} {unit}</strong>
                  </div>
                  <div>
                    <span className="text-stone-500 text-[10px] block">Currently In Distribution</span>
                    <strong className="text-amber-400 text-sm font-black">{currentProcNum} {unit}</strong>
                  </div>
                </div>
              </div>

              {/* Form Input */}
              <form onSubmit={handleConfirmSendForProcessing} className="space-y-4 text-xs">
                <div>
                  <label className="text-stone-300 font-bold block mb-1.5">
                    Quantity to Send for Processing ({unit}) *
                  </label>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        const current = parseFloat(sendAmount) || 0;
                        const next = Math.max(1, current - 1);
                        setSendAmount(String(next));
                        setSendError("");
                      }}
                      className="w-11 h-11 bg-stone-950 hover:bg-stone-800 border border-stone-800 hover:border-emerald-500/50 text-stone-300 hover:text-white rounded-2xl font-black text-lg flex items-center justify-center transition cursor-pointer shrink-0 shadow-sm"
                      title="Decrease quantity"
                    >
                      -
                    </button>

                    <input
                      type="number"
                      step="any"
                      min="1"
                      max={availNum}
                      value={sendAmount}
                      onChange={(e) => {
                        setSendAmount(e.target.value);
                        setSendError("");
                      }}
                      placeholder={`Max ${availNum}`}
                      className="w-full bg-stone-950 border border-stone-800 rounded-2xl px-4 py-3 text-white placeholder-stone-600 focus:outline-none focus:border-emerald-500 text-sm font-bold text-center [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none transition shadow-inner"
                      required
                    />

                    <button
                      type="button"
                      onClick={() => {
                        const current = parseFloat(sendAmount) || 0;
                        const next = Math.min(availNum, current + 1);
                        setSendAmount(String(next));
                        setSendError("");
                      }}
                      className="w-11 h-11 bg-stone-950 hover:bg-stone-800 border border-stone-800 hover:border-emerald-500/50 text-stone-300 hover:text-white rounded-2xl font-black text-lg flex items-center justify-center transition cursor-pointer shrink-0 shadow-sm"
                      title="Increase quantity"
                    >
                      +
                    </button>
                  </div>
                  {sendError && (
                    <p className="text-red-400 text-[11px] font-bold mt-1.5 text-center">{sendError}</p>
                  )}
                </div>

                {/* Preset Percentage Buttons */}
                <div>
                  <span className="text-stone-400 font-bold text-[10px] uppercase block mb-1.5">Quick Select Percentage</span>
                  <div className="grid grid-cols-4 gap-2">
                    {[
                      { label: "25", factor: 0.25 },
                      { label: "50", factor: 0.5 },
                      { label: "75", factor: 0.75 },
                      { label: "100", factor: 1 }
                    ].map((btn) => {
                      const calculatedVal = Math.round(availNum * btn.factor);
                      const isSelected = sendAmount === String(calculatedVal);
                      return (
                        <button
                          key={btn.label}
                          type="button"
                          onClick={() => {
                            setSendAmount(String(calculatedVal));
                            setSendError("");
                          }}
                          className={`py-2.5 rounded-xl text-xs font-extrabold transition cursor-pointer border flex items-center justify-center ${
                            isSelected
                              ? "bg-emerald-600 text-white border-emerald-500 shadow-md"
                              : "bg-stone-950 hover:bg-stone-800 border-stone-800 text-stone-300 hover:text-white"
                          }`}
                        >
                          {btn.label}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Calculation Summary Box */}
                <div className="p-3.5 bg-stone-950/80 rounded-2xl border border-stone-800 space-y-1.5 text-[11px]">
                  <div className="flex justify-between items-center text-stone-300">
                    <span>New Volume to Process:</span>
                    <strong className="text-amber-400 font-extrabold">+{amountNum} {unit}</strong>
                  </div>
                  <div className="flex justify-between items-center text-stone-300">
                    <span>Remaining Stock Available:</span>
                    <strong className="text-emerald-400 font-extrabold">{projectedRemaining} {unit}</strong>
                  </div>
                  <div className="flex justify-between items-center text-stone-300 pt-1 border-t border-stone-800/60">
                    <span>New Status:</span>
                    <span className={`font-extrabold text-[10px] px-2 py-0.5 rounded-full border ${
                      projectedRemaining === 0
                        ? "bg-blue-500/10 text-blue-400 border-blue-500/20"
                        : "bg-amber-500/10 text-amber-400 border-amber-500/20"
                    }`}>
                      {projectedRemaining === 0 ? "Fully Distributed" : "Sent for Distribution"}
                    </span>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setProcessingModalItem(null)}
                    className="flex-1 py-3 bg-stone-800 hover:bg-stone-700 text-stone-300 rounded-2xl font-bold text-xs transition cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 py-3 bg-emerald-600 hover:bg-emerald-500 text-white rounded-2xl font-extrabold text-xs shadow-lg transition cursor-pointer flex items-center justify-center gap-1.5"
                  >
                    <Boxes className="w-4 h-4" />
                    <span>Confirm & Send {amountNum > 0 ? `${amountNum} ${unit}` : ""}</span>
                  </button>
                </div>
              </form>
            </div>
          </div>
        );
      })()}

    </div>
  );
}
