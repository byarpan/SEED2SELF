import { useState } from "react";
import { useSession } from "next-auth/react";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/pages/api/auth/[...nextauth]";
import { GetServerSideProps } from "next";
import Head from "next/head";
import Link from "next/link";
import {
  Wallet as WalletIcon,
  Building2,
  Lock,
  ChevronDown,
  ChevronUp,
  CheckCircle2,
  PlusCircle,
  Info,
  TrendingUp,
  TrendingDown,
  Coins,
  X,
  ArrowRight
} from "lucide-react";

export default function ProcessorWalletPage() {
  const { data: session } = useSession();

  // Bank Connection State
  const [isBankConnected, setIsBankConnected] = useState<boolean>(false);

  // Time Filter State for Wallet Financial Summary
  const [timeFilter, setTimeFilter] = useState<"LIFETIME" | "YEARLY" | "MONTHLY" | "WEEKLY">("LIFETIME");

  // Escrow Details Modal Popup State
  const [isEscrowModalOpen, setIsEscrowModalOpen] = useState<boolean>(false);

  // Product Revenue Expand State
  const [expandedProduct, setExpandedProduct] = useState<string | null>(null);

  // Bank Manage Modal State
  const [isBankManageModalOpen, setIsBankManageModalOpen] = useState<boolean>(false);
  const [bankName, setBankName] = useState<string>("");
  const [accountHolder, setAccountHolder] = useState<string>(session?.user?.name || "");
  const [accountNumber, setAccountNumber] = useState<string>("");
  const [ifscCode, setIfscCode] = useState<string>("");
  const [branchName, setBranchName] = useState<string>("");
  const [saveSuccessMsg, setSaveSuccessMsg] = useState<string>("");

  const handleSaveBankDetails = (e: React.FormEvent) => {
    e.preventDefault();
    setIsBankConnected(true);
    setSaveSuccessMsg("Corporate bank account details saved & verified!");
    setTimeout(() => {
      setSaveSuccessMsg("");
      setIsBankManageModalOpen(false);
    }, 1200);
  };

  const maskedAccNo = accountNumber.length >= 4 ? `•••• •••• ${accountNumber.slice(-4)}` : accountNumber;

  // Processor Escrow Data
  const sampleProcessorEscrows: any[] = [];

  // Financial Metrics by Filter Timeframe
  const summaryMetrics = {
    LIFETIME: {
      revenue: "₹ 0",
      investment: "₹ 0",
      escrow: "₹ 0",
      activeEscrows: 0
    },
    YEARLY: {
      revenue: "₹ 0",
      investment: "₹ 0",
      escrow: "₹ 0",
      activeEscrows: 0
    },
    MONTHLY: {
      revenue: "₹ 0",
      investment: "₹ 0",
      escrow: "₹ 0",
      activeEscrows: 0
    },
    WEEKLY: {
      revenue: "₹ 0",
      investment: "₹ 0",
      escrow: "₹ 0",
      activeEscrows: 0
    }
  };

  // Revenue by Processed Product Data
  const sampleProcessedProducts: any[] = [];

  const currentMetrics = summaryMetrics[timeFilter];

  return (
    <div className="min-h-screen bg-stone-950 text-stone-100 font-sans pb-24 pt-6 px-4 sm:px-6 lg:px-8 relative z-20">
      <Head>
        <title>Processor Wallet | Seed2Shelf</title>
        <meta name="description" content="Processor corporate wallet, investment summary, and processed product revenue analytics" />
      </Head>

      {/* Solid Dark Background Overlay to cover background video */}
      <div className="fixed inset-0 bg-stone-950 z-[-1] pointer-events-none"></div>

      <div className="max-w-5xl mx-auto space-y-7">

        {/* =========================================================================
            PAGE HEADER
           ========================================================================= */}
        <div className="flex items-center gap-3.5 border-y border-stone-800/80 py-3.5">
          <div className="p-2.5 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl text-emerald-400 shrink-0">
            <WalletIcon className="h-7 w-7" />
          </div>
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              Processor Wallet
            </h1>
          </div>
        </div>

        {/* =========================================================================
            1. CONNECTED CORPORATE BANK ACCOUNT
           ========================================================================= */}
        <div className="space-y-2.5">
          <div className="flex items-center justify-between px-1 h-6">
            <h2 className="text-xs font-bold text-stone-400 uppercase tracking-wider">
              Bank Account
            </h2>
          </div>

          {isBankConnected ? (
            /* STATE A: BANK CONNECTED */
            <div className="bg-stone-900/90 border border-stone-800 rounded-3xl p-6 sm:p-7 shadow-sm">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-5">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl text-emerald-400 shrink-0">
                    <Building2 className="h-6 w-6" />
                  </div>

                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <h3 className="text-base font-extrabold text-white">
                        {bankName}
                      </h3>
                      <span className="text-xs font-bold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-0.5 rounded-full inline-flex items-center gap-1">
                        <CheckCircle2 className="h-3 w-3" /> Verified Corporate Bank
                      </span>
                    </div>

                    <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-stone-400 font-mono">
                      <span>Holder: <strong className="text-stone-200 font-sans">{accountHolder}</strong></span>
                      <span>Account: <strong className="text-emerald-400">{maskedAccNo}</strong></span>
                    </div>
                  </div>
                </div>

                <button
                  onClick={() => setIsBankManageModalOpen(true)}
                  className="w-full sm:w-auto inline-flex items-center justify-center bg-stone-800 hover:bg-stone-700 text-white font-semibold text-xs px-5 py-3 rounded-2xl border border-stone-700 transition cursor-pointer shrink-0"
                >
                  Manage Account
                </button>
              </div>
            </div>
          ) : (
            /* STATE B: BANK NOT CONNECTED */
            <div className="bg-stone-900/90 border border-stone-800 rounded-3xl p-6 sm:p-7 shadow-sm">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-stone-800 border border-stone-700/60 rounded-2xl text-stone-400 shrink-0">
                    <Building2 className="h-6 w-6" />
                  </div>

                  <div>
                    <h3 className="text-sm sm:text-base font-bold text-white">
                      Connect Corporate Bank Account
                    </h3>
                    <p className="text-xs text-stone-400 mt-0.5 max-w-md">
                      Connect your corporate bank account for B2B settlements and escrow payments.
                    </p>
                  </div>
                </div>

                <button
                  onClick={() => setIsBankManageModalOpen(true)}
                  className="inline-flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs px-5 py-3.5 rounded-2xl transition cursor-pointer shrink-0"
                >
                  <PlusCircle className="h-4 w-4" />
                  Add Corporate Bank
                </button>
              </div>
            </div>
          )}
        </div>


        {/* =========================================================================
            2. FINANCIAL SUMMARY CARDS
           ========================================================================= */}
        <div className="space-y-2.5">
          <div className="flex items-center justify-between px-1 h-6">
            <h2 className="text-xs font-bold text-stone-400 uppercase tracking-wider">
              Financial Summary
            </h2>

            <div className="flex items-center gap-1 bg-stone-900 p-1 rounded-xl border border-stone-800">
              {(["LIFETIME", "YEARLY", "MONTHLY", "WEEKLY"] as const).map((filter) => (
                <button
                  key={filter}
                  onClick={() => setTimeFilter(filter)}
                  className={`text-[10px] font-bold px-3 py-1 rounded-lg transition ${
                    timeFilter === filter
                      ? "bg-emerald-600 text-white"
                      : "text-stone-400 hover:text-stone-200"
                  }`}
                >
                  {filter.charAt(0) + filter.slice(1).toLowerCase()}
                </button>
              ))}
            </div>
          </div>

          <div className="bg-stone-900/90 border border-stone-800 rounded-3xl p-6 sm:p-7 shadow-sm">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              
              {/* CARD 1: Total Revenue */}
              <div className="space-y-2 p-5 bg-stone-950/60 border border-stone-800/80 rounded-2xl flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-stone-400 font-medium">
                      Total Revenue ({timeFilter.toLowerCase()})
                    </span>
                    <TrendingUp className="h-4 w-4 text-emerald-400" />
                  </div>
                  <div className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight mt-2">
                    {currentMetrics.revenue}
                  </div>
                </div>
                <span className="text-[11px] text-stone-400 font-medium pt-2 border-t border-stone-800/60 mt-3 block">
                  Net proceeds from B2B distributor sales
                </span>
              </div>

              {/* CARD 2: Total Investment */}
              <div className="space-y-2 p-5 bg-stone-950/60 border border-stone-800/80 rounded-2xl flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-stone-400 font-medium">
                      Total Investment
                    </span>
                    <Coins className="h-4 w-4 text-emerald-400" />
                  </div>
                  <div className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight mt-2">
                    {currentMetrics.investment}
                  </div>
                </div>
                <span className="text-[11px] text-stone-400 font-medium pt-2 border-t border-stone-800/60 mt-3 block">
                  Capital allocated to raw material procurement
                </span>
              </div>

              {/* CARD 3: Money Locked in Escrow */}
              <div className="space-y-2 p-5 bg-stone-950/60 border border-stone-800/80 rounded-2xl flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-stone-400 font-medium">
                      Money Locked in Escrow
                    </span>
                    <Lock className="h-4 w-4 text-amber-400" />
                  </div>
                  <div className="text-2xl sm:text-3xl font-extrabold text-amber-300 tracking-tight mt-2">
                    {currentMetrics.escrow}
                  </div>
                </div>

                <div className="flex items-center justify-between pt-2">
                  <span className="text-[11px] text-amber-400/90 font-medium">
                    {currentMetrics.activeEscrows} Active Escrows
                  </span>

                  <button
                    onClick={() => setIsEscrowModalOpen(true)}
                    className="inline-flex items-center gap-1 bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 font-bold text-xs px-3.5 py-1.5 rounded-xl border border-amber-500/30 transition cursor-pointer"
                  >
                    View Details <ArrowRight className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>

            </div>
          </div>
        </div>


        {/* =========================================================================
            3. REVENUE BY PROCESSED PRODUCT
           ========================================================================= */}
        <div className="space-y-2.5">
          <div className="flex items-center px-1 h-6">
            <h2 className="text-xs font-bold text-stone-400 uppercase tracking-wider">
              Revenue by Processed Product
            </h2>
          </div>

          <div className="bg-stone-900/90 border border-stone-800 rounded-3xl p-6 sm:p-7 space-y-3 shadow-sm">
            {sampleProcessedProducts.map((prod, idx) => {
              const isProductExpanded = expandedProduct === prod.name;
              return (
                <div key={idx} className="bg-stone-950/60 border border-stone-800 rounded-2xl overflow-hidden">
                  <div
                    onClick={() => setExpandedProduct(isProductExpanded ? null : prod.name)}
                    className="p-4 flex items-center justify-between cursor-pointer hover:bg-stone-900/40 transition"
                  >
                    <div className="flex items-center gap-3.5">
                      <div className="w-12 h-12 rounded-xl bg-stone-800 overflow-hidden shrink-0 border border-stone-700/50">
                        <img src={prod.image} alt={prod.name} className="w-full h-full object-cover" />
                      </div>
                      <div>
                        <h4 className="font-bold text-white text-sm">{prod.name}</h4>
                        <span className="text-xs text-stone-400">Total Batches Sold: {prod.totalBatches}</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <span className="font-extrabold text-emerald-400 text-sm sm:text-base block">{prod.totalRevenue}</span>
                        <button className="text-[11px] text-stone-400 hover:text-white flex items-center gap-1 ml-auto">
                          {isProductExpanded ? "Hide Details" : "View Details"}
                        </button>
                      </div>
                      {isProductExpanded ? (
                        <ChevronUp className="h-4 w-4 text-stone-400" />
                      ) : (
                        <ChevronDown className="h-4 w-4 text-stone-400" />
                      )}
                    </div>
                  </div>

                  {/* Expanded Product Variants Breakdown */}
                  {isProductExpanded && (
                    <div className="p-4 bg-stone-900/80 border-t border-stone-800 space-y-2 text-xs">
                      <p className="font-bold text-stone-300 text-[11px] uppercase tracking-wider">
                        Product Variants Sales Breakdown
                      </p>
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                        {prod.variants.map((v: any, vIdx: number) => (
                          <div key={vIdx} className="p-3 bg-stone-950 rounded-xl border border-stone-800 flex flex-col justify-between">
                            <span className="text-stone-300 font-semibold">{v.variantName}</span>
                            <div className="mt-2 flex items-center justify-between">
                              <span className="text-stone-400 text-[11px]">{v.qty}</span>
                              <span className="text-emerald-400 font-bold">{v.earnings}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

      </div>


      {/* =========================================================================
          ESCROW DETAILS MODAL DIALOG (POPUP)
         ========================================================================= */}
      {isEscrowModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="bg-stone-900 border border-stone-800 w-full max-w-2xl rounded-3xl p-6 sm:p-8 space-y-6 max-h-[90vh] overflow-y-auto shadow-2xl relative">
            
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-stone-800 pb-4">
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-amber-500/10 border border-amber-500/20 rounded-2xl text-amber-400">
                  <Lock className="h-6 w-6" />
                </div>
                <h3 className="text-lg font-extrabold text-white">Escrow Payment Details</h3>
              </div>

              <button
                onClick={() => setIsEscrowModalOpen(false)}
                className="p-2 text-stone-400 hover:text-white rounded-xl bg-stone-800 hover:bg-stone-700 transition cursor-pointer"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Escrow Explanation Banner */}
            <div className="p-4 bg-amber-500/10 border border-amber-500/20 rounded-2xl text-xs text-stone-300 space-y-1">
              <p className="font-bold text-amber-300 flex items-center gap-1.5">
                <Info className="h-4 w-4" /> How Escrow Protection Works for Processors
              </p>
              <p className="text-stone-300 leading-relaxed text-[11px]">
                When you purchase produce or cargo through distributors, funds are securely locked in escrow. Money is released to the distributor only after cargo delivery and quality inspection.
              </p>
            </div>

            {/* Escrow Summary Badges */}
            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 bg-stone-950 rounded-2xl border border-stone-800">
                <span className="text-[11px] text-stone-400 font-medium block">Total Locked Amount</span>
                <span className="text-xl font-extrabold text-amber-300 mt-1 block">{currentMetrics.escrow}</span>
              </div>

              <div className="p-4 bg-stone-950 rounded-2xl border border-stone-800">
                <span className="text-[11px] text-stone-400 font-medium block">Active Escrows</span>
                <span className="text-xl font-extrabold text-white mt-1 block">{currentMetrics.activeEscrows} Orders</span>
              </div>
            </div>

            {/* Escrow Items List */}
            <div className="space-y-3">
              <span className="text-xs font-bold text-stone-400 uppercase tracking-wider">
                Active Raw Material Escrow Items
              </span>

              {sampleProcessorEscrows.map((item) => (
                <div key={item.id} className="p-4 bg-stone-950 rounded-2xl border border-stone-800 space-y-3">
                  <div className="flex items-center gap-3">
                    <img src={item.cropImage} alt={item.cropName} className="w-10 h-10 rounded-xl object-cover border border-stone-800" />
                    <div className="flex-1 min-w-0">
                      <h4 className="font-bold text-white text-sm truncate">{item.cropName}</h4>
                      <p className="text-xs text-stone-400">Batch: <span className="font-mono text-stone-200">{item.batchNumber}</span> • Qty: {item.quantity}</p>
                    </div>
                    <div className="text-right">
                      <span className="text-sm font-extrabold text-amber-300 block">{item.escrowAmount}</span>
                    </div>
                  </div>

                  <div className="pt-2 border-t border-stone-800/80 flex items-center justify-between text-[11px] text-stone-400">
                    <div>Supplier: <span className="text-stone-200 font-semibold">{item.supplier}</span></div>
                    <div>Status: <span className="text-amber-400 font-semibold">{item.orderStatus}</span></div>
                    <div>Order ID: <span className="font-mono text-stone-300">{item.orderId}</span></div>
                  </div>
                </div>
              ))}
            </div>

            {/* Modal Footer */}
            <div className="pt-2 flex justify-end">
              <button
                onClick={() => setIsEscrowModalOpen(false)}
                className="bg-stone-800 hover:bg-stone-700 text-white font-bold text-xs px-6 py-3 rounded-xl transition cursor-pointer"
              >
                Close Details
              </button>
            </div>

          </div>
        </div>
      )}

      {/* =========================================================================
          MANAGE CORPORATE BANK ACCOUNT MODAL DIALOG (POPUP)
         ========================================================================= */}
      {isBankManageModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="bg-stone-900 border border-stone-800 w-full max-w-lg rounded-3xl p-6 sm:p-8 space-y-6 max-h-[90vh] overflow-y-auto shadow-2xl relative">
            
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-stone-800 pb-4">
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl text-emerald-400">
                  <Building2 className="h-6 w-6" />
                </div>
                <div>
                  <h3 className="text-lg font-extrabold text-white">Bank Account Details</h3>
                  <span className="text-xs text-stone-400">Primary account for trade settlements and payouts</span>
                </div>
              </div>

              <button
                onClick={() => setIsBankManageModalOpen(false)}
                className="p-2 text-stone-400 hover:text-white rounded-xl bg-stone-800 hover:bg-stone-700 transition cursor-pointer"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Success Message Banner */}
            {saveSuccessMsg && (
              <div className="p-3.5 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl text-emerald-400 text-xs font-bold flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4" /> {saveSuccessMsg}
              </div>
            )}

            {/* Form */}
            <form onSubmit={handleSaveBankDetails} className="space-y-4 text-xs">
              <div className="space-y-1.5">
                <label className="text-stone-300 font-bold block">Bank Name</label>
                <input
                  type="text"
                  required
                  value={bankName}
                  onChange={(e) => setBankName(e.target.value)}
                  placeholder="e.g. HDFC Bank Ltd"
                  className="w-full bg-stone-950 border border-stone-800 rounded-xl px-4 py-2.5 text-white placeholder-stone-600 focus:outline-none focus:border-emerald-500/50 transition"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-stone-300 font-bold block">Account Holder Name</label>
                <input
                  type="text"
                  required
                  value={accountHolder}
                  onChange={(e) => setAccountHolder(e.target.value)}
                  placeholder="e.g. Arpan Ghosh"
                  className="w-full bg-stone-950 border border-stone-800 rounded-xl px-4 py-2.5 text-white placeholder-stone-600 focus:outline-none focus:border-emerald-500/50 transition"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-stone-300 font-bold block">Account Number</label>
                  <input
                    type="text"
                    required
                    value={accountNumber}
                    onChange={(e) => setAccountNumber(e.target.value)}
                    placeholder="e.g. 98765432109012"
                    className="w-full bg-stone-950 border border-stone-800 rounded-xl px-4 py-2.5 text-white font-mono placeholder-stone-600 focus:outline-none focus:border-emerald-500/50 transition"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-stone-300 font-bold block">IFSC Code</label>
                  <input
                    type="text"
                    required
                    value={ifscCode}
                    onChange={(e) => setIfscCode(e.target.value)}
                    placeholder="e.g. HDFC0001824"
                    className="w-full bg-stone-950 border border-stone-800 rounded-xl px-4 py-2.5 text-white font-mono uppercase placeholder-stone-600 focus:outline-none focus:border-emerald-500/50 transition"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-stone-300 font-bold block">Branch Location</label>
                <input
                  type="text"
                  value={branchName}
                  onChange={(e) => setBranchName(e.target.value)}
                  placeholder="e.g. Karnal Main Branch, Haryana"
                  className="w-full bg-stone-950 border border-stone-800 rounded-xl px-4 py-2.5 text-white placeholder-stone-600 focus:outline-none focus:border-emerald-500/50 transition"
                />
              </div>

              <div className="p-3.5 bg-stone-950 rounded-xl border border-stone-800/80 text-xs text-stone-400 space-y-1">
                <span className="font-semibold text-emerald-400 flex items-center gap-1.5">
                  <CheckCircle2 className="h-4 w-4" /> Bank Account Settlement Policy
                </span>
                <p className="text-stone-400 leading-normal text-[11px]">
                  All escrow releases and trade settlements are automatically remitted to this account via direct bank transfer.
                </p>
              </div>

              {/* Modal Buttons */}
              <div className="pt-2 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsBankManageModalOpen(false)}
                  className="px-5 py-2.5 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-300 font-semibold transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold transition shadow-md cursor-pointer"
                >
                  Save Bank Details
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
