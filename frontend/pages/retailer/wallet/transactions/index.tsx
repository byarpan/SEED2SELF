import { useState } from "react";
import { useSession } from "next-auth/react";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/pages/api/auth/[...nextauth]";
import { GetServerSideProps } from "next";
import Head from "next/head";
import Link from "next/link";
import {
  ArrowLeftRight,
  ArrowDownLeft,
  Lock,
  Building2,
  CheckCircle2,
  Search,
  X,
  Share2,
  Copy,
  HelpCircle,
  ChevronDown
} from "lucide-react";

export default function WalletTransactions() {
  const { data: session } = useSession();
  const [filterType, setFilterType] = useState<"ALL" | "PAYOUTS" | "ESCROW" | "BANK_DEBITS">("ALL");
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  const retailerFilterOptions: { value: "ALL" | "PAYOUTS" | "ESCROW" | "BANK_DEBITS"; label: string }[] = [
    { value: "ALL", label: "All" },
    { value: "PAYOUTS", label: "Bank Credits" },
    { value: "BANK_DEBITS", label: "Bank Debits" },
    { value: "ESCROW", label: "Escrow Locks" }
  ];
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedTx, setSelectedTx] = useState<any | null>(null);
  const [copiedField, setCopiedField] = useState<string | null>(null);

  // Retailer payment transactions
  const transactions: any[] = [];

  const filteredTransactions = transactions.filter((tx) => {
    const matchesFilter =
      filterType === "ALL" ||
      (filterType === "PAYOUTS" && tx.type === "PAYOUT") ||
      (filterType === "BANK_DEBITS" && tx.type === "BANK_DEBIT") ||
      (filterType === "ESCROW" && tx.type === "ESCROW");

    const matchesSearch =
      tx.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      tx.buyer?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      tx.orderId?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      tx.shortId?.toLowerCase().includes(searchQuery.toLowerCase());

    return matchesFilter && matchesSearch;
  });

  const copyToClipboard = (text: string, fieldName: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(fieldName);
    setTimeout(() => setCopiedField(null), 2000);
  };

  return (
    <div className="min-h-screen bg-stone-950 text-stone-100 font-sans pb-24 pt-6 px-4 sm:px-6 lg:px-8 relative z-20">
      <Head>
        <title>Wallet Transactions | Seed2Shelf</title>
        <meta name="description" content="Payment history and escrow transaction logs for retailers" />
      </Head>

      {/* Solid Dark Background Overlay */}
      <div className="fixed inset-0 bg-stone-950 z-[-1] pointer-events-none"></div>

      <div className="max-w-5xl mx-auto space-y-7">

        {/* =========================================================================
            PAGE HEADER (MATCHING WALLET BALANCE HEADER LOGO STYLE)
           ========================================================================= */}
        <div className="flex items-center gap-3.5 border-y border-stone-800/80 py-3.5">
          <div className="p-2.5 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl text-emerald-400 shrink-0">
            <ArrowLeftRight className="h-7 w-7" />
          </div>
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              Wallet Transactions
            </h1>
          </div>
        </div>


        {/* =========================================================================
            SEARCH & FILTER CONTROLS
           ========================================================================= */}
        <div className="space-y-3">
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
            
            {/* Search Input */}
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-stone-500" />
              <input
                type="text"
                placeholder="Search product, buyer, or Order ID..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-stone-900 border border-stone-800 rounded-2xl pl-10 pr-4 py-2.5 text-xs text-white placeholder-stone-500 focus:outline-none focus:border-emerald-500/50 transition"
              />
            </div>

            {/* Sleek Custom Filter Dropdown */}
            <div className="relative shrink-0">
              <button
                type="button"
                onClick={() => setIsFilterOpen(!isFilterOpen)}
                className="bg-stone-900 border border-stone-800 hover:border-stone-700 rounded-2xl px-4 py-2.5 text-xs text-white font-extrabold focus:outline-none transition cursor-pointer flex items-center justify-between gap-3 shadow-md"
              >
                <span>{retailerFilterOptions.find(o => o.value === filterType)?.label || "All"}</span>
                <ChevronDown className={`h-4 w-4 text-emerald-400 transition-transform duration-200 ${isFilterOpen ? "rotate-180" : ""}`} />
              </button>

              {isFilterOpen && (
                <>
                  <div 
                    className="fixed inset-0 z-40" 
                    onClick={() => setIsFilterOpen(false)} 
                  />
                  <div className="absolute right-0 top-full mt-2 w-48 bg-stone-900/95 border border-stone-800 rounded-2xl p-1.5 shadow-2xl z-50 backdrop-blur-xl animate-in fade-in zoom-in-95 duration-150 space-y-1">
                    {retailerFilterOptions.map((opt) => {
                      const isSelected = filterType === opt.value;
                      return (
                        <button
                          key={opt.value}
                          type="button"
                          onClick={() => {
                            setFilterType(opt.value);
                            setIsFilterOpen(false);
                          }}
                          className={`w-full text-left px-3.5 py-2.5 rounded-xl text-xs font-bold transition flex items-center justify-between cursor-pointer ${
                            isSelected
                              ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                              : "text-stone-300 hover:text-white hover:bg-stone-800/80"
                          }`}
                        >
                          <span>{opt.label}</span>
                        </button>
                      );
                    })}
                  </div>
                </>
              )}
            </div>

          </div>
        </div>


        {/* =========================================================================
            TRANSACTIONS LIST CONTAINER (CLEAN & UNCLUTTERED)
           ========================================================================= */}
        <div className="space-y-3">
          <div className="flex items-center justify-between px-1 h-6">
            <h2 className="text-xs font-bold text-stone-400 uppercase tracking-wider">
              Transaction Records
            </h2>
            <span className="text-[11px] text-stone-500">
              Tap any row to view details
            </span>
          </div>

          <div className="bg-stone-900/90 border border-stone-800 rounded-3xl p-5 sm:p-6 space-y-2.5 shadow-sm">
            {filteredTransactions.length === 0 ? (
              <div className="p-8 text-center text-stone-400 text-xs">
                No transaction records found matching your query.
              </div>
            ) : (
              filteredTransactions.map((tx) => (
                <div
                  key={tx.id}
                  onClick={() => setSelectedTx(tx)}
                  className="bg-stone-950/60 border border-stone-800/80 hover:border-stone-700/80 rounded-2xl p-4 flex items-center justify-between gap-4 cursor-pointer hover:bg-stone-900/50 transition shadow-sm"
                >
                  {/* Left Side: Icon + Title & Buyer */}
                  <div className="flex items-center gap-3.5 min-w-0">
                    <div
                      className={`p-2.5 rounded-xl border shrink-0 ${
                        tx.type === "PAYOUT"
                          ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-400"
                          : "bg-amber-500/10 border-amber-500/20 text-amber-400"
                      }`}
                    >
                      {tx.type === "PAYOUT" ? (
                        <ArrowDownLeft className="h-5 w-5" />
                      ) : (
                        <Lock className="h-5 w-5" />
                      )}
                    </div>

                    <div className="min-w-0">
                      <h4 className="font-bold text-white text-sm tracking-tight truncate">
                        {tx.productName || tx.title}
                      </h4>
                      <p className="text-xs text-stone-400 truncate mt-0.5">
                        Received from: <strong className="text-stone-300 font-semibold">{tx.buyer}</strong>
                      </p>
                    </div>
                  </div>

                  {/* Right Side: Amount & Date */}
                  <div className="text-right shrink-0">
                    <span
                      className={`text-base font-extrabold block tracking-tight ${
                        tx.type === "PAYOUT" ? "text-emerald-400" : "text-amber-300"
                      }`}
                    >
                      {tx.type === "PAYOUT" ? `+ ${tx.amount}` : tx.amount}
                    </span>
                    <span className="text-xs text-stone-400 font-medium block mt-0.5">
                      {tx.date}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

      </div>


      {/* =========================================================================
          PHONEPE-INSPIRED TRANSACTION DETAILS MODAL DIALOG (POPUP)
         ========================================================================= */}
      {selectedTx && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="bg-stone-900 border border-stone-800 w-full max-w-md rounded-3xl overflow-hidden shadow-2xl relative animate-in fade-in zoom-in-95 duration-200">
            
            {/* PhonePe Green Status Top Header Bar */}
            <div className={`p-4 sm:p-5 text-white flex items-center justify-between ${
              selectedTx.type === 'PAYOUT' ? 'bg-emerald-700' : 'bg-amber-600'
            }`}>
              <div className="space-y-0.5">
                <h3 className="text-base sm:text-lg font-extrabold flex items-center gap-2">
                  <CheckCircle2 className="h-5 w-5 text-white" />
                  {selectedTx.status}
                </h3>
                <p className="text-xs text-emerald-100/90 font-medium pl-7">
                  {selectedTx.time} on {selectedTx.date}
                </p>
              </div>

              <button
                onClick={() => setSelectedTx(null)}
                className="p-1.5 text-white/80 hover:text-white rounded-xl bg-black/20 hover:bg-black/40 transition cursor-pointer"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Modal Main Content Container */}
            <div className="p-5 sm:p-6 space-y-5">
              
              {/* Paid By / Received From Card */}
              <div className="bg-stone-950 rounded-2xl p-4 border border-stone-800 space-y-3">
                <span className="text-[11px] text-stone-400 font-semibold block uppercase tracking-wider">
                  {selectedTx.type === "PAYOUT" ? "Received from" : "Escrow Payment from"}
                </span>

                <div className="flex items-center justify-between gap-3 pb-3 border-b border-stone-800/80">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 font-extrabold text-sm flex items-center justify-center shrink-0">
                      {selectedTx.buyer?.slice(0, 2).toUpperCase() || "??"}
                    </div>
                    <div>
                      <h4 className="font-extrabold text-white text-sm">{selectedTx.buyer}</h4>
                      <p className="text-xs text-stone-400 font-mono text-[11px]">{selectedTx.buyerUpi}</p>
                    </div>
                  </div>

                  <span className="text-lg font-black text-white tracking-tight shrink-0">
                    {selectedTx.amount}
                  </span>
                </div>

                <div className="text-xs text-stone-400 space-y-1 pt-1">
                  <div className="flex justify-between">
                    <span>Product Item:</span>
                    <strong className="text-stone-200">{selectedTx.productName || selectedTx.title}</strong>
                  </div>
                  <div className="flex justify-between">
                    <span>Order ID:</span>
                    <strong className="font-mono text-stone-300">{selectedTx.orderId}</strong>
                  </div>
                </div>
              </div>


              {/* Transfer Details Section */}
              <div className="bg-stone-950 rounded-2xl p-4 border border-stone-800 space-y-3">
                <div className="flex items-center justify-between text-xs font-bold text-white border-b border-stone-800/80 pb-2.5">
                  <span className="flex items-center gap-1.5">
                    <Building2 className="h-4 w-4 text-emerald-400" /> Transfer Details
                  </span>
                  <ChevronDown className="h-4 w-4 text-stone-500" />
                </div>

                <div className="space-y-3 text-xs">
                  
                  {/* Transaction ID */}
                  <div>
                    <span className="text-[11px] text-stone-400 block">Transaction ID</span>
                    <div className="flex items-center justify-between gap-2 mt-0.5">
                      <span className="font-mono text-stone-200 text-[11px] truncate">{selectedTx.id}</span>
                      <button
                        onClick={() => copyToClipboard(selectedTx.id, "id")}
                        className="text-stone-400 hover:text-emerald-400 p-1 transition cursor-pointer shrink-0"
                        title="Copy Transaction ID"
                      >
                        <Copy className="h-3.5 w-3.5" />
                      </button>
                    </div>
                    {copiedField === "id" && (
                      <span className="text-[10px] text-emerald-400 font-bold block mt-0.5">Copied!</span>
                    )}
                  </div>

                  {/* Account / Credited to */}
                  <div className="pt-2 border-t border-stone-800/60">
                    <span className="text-[11px] text-stone-400 block">
                      {selectedTx.type === "PAYOUT" ? "Credited to Bank Account" : "Destination Bank Account"}
                    </span>
                    <div className="flex items-center justify-between gap-2 mt-0.5">
                      <span className="font-semibold text-emerald-400 text-xs">{selectedTx.bankName}</span>
                      <span className="font-extrabold text-white text-xs">{selectedTx.amount}</span>
                    </div>
                    <div className="flex items-center justify-between gap-2 mt-1">
                      <span className="text-[11px] text-stone-400">UTR Reference:</span>
                      <div className="flex items-center gap-1.5">
                        <span className="font-mono text-stone-300 text-[11px]">{selectedTx.utr}</span>
                        <button
                          onClick={() => copyToClipboard(selectedTx.utr, "utr")}
                          className="text-stone-400 hover:text-emerald-400 p-0.5 transition cursor-pointer"
                          title="Copy UTR"
                        >
                          <Copy className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </div>
                    {copiedField === "utr" && (
                      <span className="text-[10px] text-emerald-400 font-bold block mt-0.5">Copied UTR!</span>
                    )}
                  </div>

                </div>
              </div>


              {/* PhonePe-Style Action Buttons: ONLY Share Receipt & Support */}
              <div className="grid grid-cols-2 gap-3 pt-1">
                <button
                  onClick={() => alert(`Share Receipt link copied for ${selectedTx.shortId}`)}
                  className="flex flex-col items-center justify-center p-3 bg-stone-950 hover:bg-stone-800 rounded-2xl border border-stone-800 transition cursor-pointer text-stone-200 hover:text-white"
                >
                  <Share2 className="h-5 w-5 text-emerald-400 mb-1" />
                  <span className="text-xs font-bold">Share Receipt</span>
                </button>

                <button
                  onClick={() => alert("Connecting to Support...")}
                  className="flex flex-col items-center justify-center p-3 bg-stone-950 hover:bg-stone-800 rounded-2xl border border-stone-800 transition cursor-pointer text-stone-200 hover:text-white"
                >
                  <HelpCircle className="h-5 w-5 text-emerald-400 mb-1" />
                  <span className="text-xs font-bold">Contact Support</span>
                </button>
              </div>

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
