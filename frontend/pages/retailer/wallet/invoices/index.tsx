import { useState } from "react";
import { useSession } from "next-auth/react";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/pages/api/auth/[...nextauth]";
import { GetServerSideProps } from "next";
import Head from "next/head";
import Link from "next/link";
import {
  Receipt,
  Download,
  FileText,
  CheckCircle2,
  Search,
  ChevronDown,
  X,
  Printer,
  Building2,
  User,
  Calendar,
  Tag,
  HelpCircle,
  FileX
} from "lucide-react";

export default function WalletInvoices() {
  const { data: session } = useSession();
  const [categoryFilter, setCategoryFilter] = useState<"ALL" | "SALES" | "PURCHASE">("ALL");
  const [isCategoryOpen, setIsCategoryOpen] = useState(false);

  const invoiceCategoryOptions: { value: "ALL" | "SALES" | "PURCHASE"; label: string }[] = [
    { value: "ALL", label: "All Invoices" },
    { value: "SALES", label: "Sales Invoices" },
    { value: "PURCHASE", label: "Purchase Invoices" }
  ];
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedInvoice, setSelectedInvoice] = useState<any | null>(null);

  // Retailer Invoices
  const initialInvoices: any[] = [];

  const filteredInvoices = initialInvoices.filter((inv) => {
    const matchesCategory =
      categoryFilter === "ALL" ||
      (categoryFilter === "SALES" && inv.category === "SALES") ||
      (categoryFilter === "PURCHASE" && inv.category === "PURCHASE");

    const matchesSearch =
      inv.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      inv.orderId.toLowerCase().includes(searchQuery.toLowerCase()) ||
      inv.batch.toLowerCase().includes(searchQuery.toLowerCase()) ||
      inv.item.toLowerCase().includes(searchQuery.toLowerCase()) ||
      inv.buyer.toLowerCase().includes(searchQuery.toLowerCase()) ||
      inv.supplier.toLowerCase().includes(searchQuery.toLowerCase());

    return matchesCategory && matchesSearch;
  });

  const handleDownload = (invoiceId: string) => {
    alert(`Downloading Tax Invoice ${invoiceId}...`);
  };

  return (
    <div className="min-h-screen bg-stone-950 text-stone-100 font-sans pb-24 pt-6 px-4 sm:px-6 lg:px-8 relative z-20">
      <Head>
        <title>Wallet Invoices | Seed2Shelf</title>
        <meta name="description" content="Agricultural sales tax invoices and procurement accounting records" />
      </Head>

      {/* Solid Dark Background Overlay */}
      <div className="fixed inset-0 bg-stone-950 z-[-1] pointer-events-none"></div>

      <div className="max-w-5xl mx-auto space-y-7">

        {/* =========================================================================
            PAGE HEADER (MATCHING WALLET BALANCE & TRANSACTIONS HEADER LOGO STYLE)
           ========================================================================= */}
        <div className="flex items-center gap-3.5 border-y border-stone-800/80 py-3.5">
          <div className="p-2.5 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl text-emerald-400 shrink-0">
            <Receipt className="h-7 w-7" />
          </div>
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              Invoices & Receipts
            </h1>
          </div>
        </div>


        {/* =========================================================================
            SEARCH & CATEGORY FILTER CONTROLS
           ========================================================================= */}
        <div className="space-y-3">
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
            
            {/* Search Bar */}
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-stone-500" />
              <input
                type="text"
                placeholder="Search by Invoice #, Order #, Batch, or Buyer..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-stone-900 border border-stone-800 rounded-2xl pl-10 pr-4 py-2.5 text-xs text-white placeholder-stone-500 focus:outline-none focus:border-emerald-500/50 transition"
              />
            </div>

            {/* Category Dropdown Select */}
            <div className="flex items-center gap-2.5 shrink-0">
              <span className="text-xs font-bold text-stone-400 hidden sm:inline">Invoice Category:</span>
              <div className="relative w-full sm:w-auto">
                <button
                  type="button"
                  onClick={() => setIsCategoryOpen(!isCategoryOpen)}
                  className="w-full bg-stone-900 border border-stone-800 hover:border-stone-700 rounded-2xl px-4 py-2.5 text-xs text-white font-extrabold focus:outline-none transition cursor-pointer flex items-center justify-between gap-3 shadow-md"
                >
                  <span>{invoiceCategoryOptions.find(o => o.value === categoryFilter)?.label || "All Invoices"}</span>
                  <ChevronDown className={`h-4 w-4 text-emerald-400 transition-transform duration-200 ${isCategoryOpen ? "rotate-180" : ""}`} />
                </button>

                {isCategoryOpen && (
                  <>
                    <div 
                      className="fixed inset-0 z-40" 
                      onClick={() => setIsCategoryOpen(false)} 
                    />
                    <div className="absolute right-0 top-full mt-2 w-48 bg-stone-900/95 border border-stone-800 rounded-2xl p-1.5 shadow-2xl z-50 backdrop-blur-xl animate-in fade-in zoom-in-95 duration-150 space-y-1">
                      {invoiceCategoryOptions.map((opt) => {
                        const isSelected = categoryFilter === opt.value;
                        return (
                          <button
                            key={opt.value}
                            type="button"
                            onClick={() => {
                              setCategoryFilter(opt.value);
                              setIsCategoryOpen(false);
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
        </div>


        {/* =========================================================================
            INVOICES TABLE / EMPTY STATE CONTAINER
           ========================================================================= */}
        <div className="space-y-3">
          <div className="flex items-center justify-between px-1 h-6">
            <h2 className="text-xs font-bold text-stone-400 uppercase tracking-wider">
              {categoryFilter === "PURCHASE"
                ? "Purchase Invoices"
                : categoryFilter === "SALES"
                ? "Sales Invoices"
                : "Trade Invoices"}
            </h2>
            <span className="text-[11px] text-stone-500">
              {filteredInvoices.length} record{filteredInvoices.length === 1 ? "" : "s"} found
            </span>
          </div>

          {/* If Purchase Invoices selected */}
          {categoryFilter === "PURCHASE" && filteredInvoices.length === 0 ? (
            <div className="bg-stone-900/90 border border-stone-800 rounded-3xl p-10 sm:p-14 text-center space-y-3 shadow-sm">
              <div className="w-12 h-12 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-2xl flex items-center justify-center mx-auto">
                <Receipt className="h-6 w-6" />
              </div>
              <h3 className="text-base sm:text-lg font-extrabold text-white">
                No Purchase Invoices Available
              </h3>
            </div>
          ) : filteredInvoices.length === 0 ? (
            <div className="bg-stone-900/90 border border-stone-800 rounded-3xl p-10 text-center text-xs text-stone-400 space-y-2">
              <p className="font-bold text-stone-300">No invoices match your search query.</p>
              <p className="text-stone-500">Try searching with a different Invoice Number, Batch ID, or Buyer Name.</p>
            </div>
          ) : (
            <div className="bg-stone-900/90 border border-stone-800 rounded-3xl p-6 sm:p-7 shadow-sm">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs sm:text-sm">
                  <thead>
                    <tr className="border-b border-stone-800 text-stone-400 text-[11px] font-bold uppercase tracking-wider">
                      <th className="pb-3.5 pl-2 align-middle">Invoice ID</th>
                      <th className="pb-3.5 align-middle">Batch Reference</th>
                      <th className="pb-3.5 align-middle">Item Details</th>
                      <th className="pb-3.5 align-middle">Total Amount</th>
                      <th className="pb-3.5 align-middle">Payment Status</th>
                      <th className="pb-3.5 text-right pr-2 align-middle">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-stone-800/80">
                    {filteredInvoices.map((inv) => (
                      <tr
                        key={inv.id}
                        onClick={() => setSelectedInvoice(inv)}
                        className="hover:bg-stone-950/60 transition cursor-pointer"
                      >
                        <td className="py-4 pl-2 font-bold text-white align-middle">
                          <div className="flex items-center gap-2">
                            <FileText className="w-4 h-4 text-emerald-400 shrink-0" />
                            <span className="font-mono text-xs">{inv.id}</span>
                          </div>
                        </td>
                        <td className="py-4 text-stone-300 font-mono text-xs align-middle">
                          {inv.batch}
                        </td>
                        <td className="py-4 text-stone-200 font-medium align-middle">
                          <div>
                            <span className="font-bold text-white block">{inv.item}</span>
                            <span className="text-[11px] text-stone-400">
                              Buyer: <strong className="text-stone-300">{inv.buyer}</strong>
                            </span>
                          </div>
                        </td>
                        <td className="py-4 font-extrabold text-white text-base tracking-tight align-middle">
                          {inv.amount}
                        </td>
                        <td className="py-4 align-middle">
                          <span className="text-[10px] px-2.5 py-1 rounded-full font-bold border inline-flex items-center gap-1 bg-emerald-500/10 text-emerald-400 border-emerald-500/20">
                            <CheckCircle2 className="w-3 h-3" />
                            {inv.paymentStatus}
                          </span>
                        </td>
                        <td className="py-4 text-right pr-2 align-middle" onClick={(e) => e.stopPropagation()}>
                          <button
                            onClick={() => handleDownload(inv.id)}
                            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-stone-800 hover:bg-stone-700 border border-stone-700 text-xs font-semibold text-stone-200 hover:text-white transition cursor-pointer"
                          >
                            <Download className="w-3.5 h-3.5 text-emerald-400" /> Download
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>

      </div>


      {/* =========================================================================
          INVOICE DETAIL MODAL POPUP
         ========================================================================= */}
      {selectedInvoice && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="bg-stone-900 border border-stone-800 w-full max-w-md rounded-3xl overflow-hidden shadow-2xl relative animate-in fade-in zoom-in-95 duration-200">
            
            {/* Modal Header Bar */}
            <div className="p-4 sm:p-5 bg-emerald-700 text-white flex items-center justify-between">
              <div className="space-y-0.5">
                <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-200 block">
                  Seed2Shelf Official B2B Tax Invoice
                </span>
                <h3 className="text-base sm:text-lg font-extrabold flex items-center gap-2">
                  <FileText className="h-5 w-5 text-white" />
                  {selectedInvoice.id}
                </h3>
              </div>

              <button
                onClick={() => setSelectedInvoice(null)}
                className="p-1.5 text-white/80 hover:text-white rounded-xl bg-black/20 hover:bg-black/40 transition cursor-pointer"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-5 sm:p-6 space-y-5 text-xs">
              
              {/* Category & Status Banner */}
              <div className="flex items-center justify-between bg-stone-950 p-3 rounded-2xl border border-stone-800">
                <div>
                  <span className="text-[10px] text-stone-500 block uppercase font-bold">Category</span>
                  <span className="font-extrabold text-emerald-400">{selectedInvoice.categoryLabel}</span>
                </div>
                <div className="text-right">
                  <span className="text-[10px] text-stone-500 block uppercase font-bold">Payment Status</span>
                  <span className="font-extrabold text-emerald-400 flex items-center gap-1 justify-end">
                    <CheckCircle2 className="h-3.5 w-3.5" /> {selectedInvoice.paymentStatus}
                  </span>
                </div>
              </div>

              {/* Invoice Party Details */}
              <div className="bg-stone-950 rounded-2xl p-4 border border-stone-800 space-y-3">
                <div className="flex justify-between items-center border-b border-stone-800/80 pb-2.5">
                  <span className="text-stone-400">Supplier (Seller):</span>
                  <strong className="text-white font-bold">{selectedInvoice.supplier}</strong>
                </div>

                <div className="flex justify-between items-center border-b border-stone-800/80 pb-2.5">
                  <span className="text-stone-400">Buyer (Purchaser):</span>
                  <strong className="text-white font-bold">{selectedInvoice.buyer}</strong>
                </div>

                <div className="flex justify-between items-center border-b border-stone-800/80 pb-2.5">
                  <span className="text-stone-400">Order ID:</span>
                  <span className="font-mono text-stone-200 font-bold">{selectedInvoice.orderId}</span>
                </div>

                <div className="flex justify-between items-center">
                  <span className="text-stone-400">Batch Reference:</span>
                  <span className="font-mono text-stone-200 font-bold">{selectedInvoice.batch}</span>
                </div>
              </div>

              {/* Line Item Table */}
              <div className="bg-stone-950 rounded-2xl p-4 border border-stone-800 space-y-2.5">
                <span className="text-[10px] text-stone-500 uppercase font-bold tracking-wider block border-b border-stone-800/80 pb-2">
                  Line Item Breakdown
                </span>

                <div className="flex justify-between items-center text-sm font-extrabold text-white">
                  <span>{selectedInvoice.item}</span>
                  <span>{selectedInvoice.amount}</span>
                </div>

                <div className="flex justify-between items-center text-stone-400 text-[11px]">
                  <span>Quantity: {selectedInvoice.quantity}</span>
                  <span>Rate: {selectedInvoice.unitPrice}</span>
                </div>

                <div className="pt-2 border-t border-stone-800/80 flex justify-between items-center text-stone-400 text-[11px]">
                  <span>Invoice Date:</span>
                  <span className="text-stone-200">{selectedInvoice.date}</span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-1 flex items-center justify-between gap-3">
                <button
                  onClick={() => handleDownload(selectedInvoice.id)}
                  className="flex-1 inline-flex items-center justify-center gap-2 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl transition cursor-pointer shadow-md"
                >
                  <Download className="h-4 w-4" /> Download PDF Invoice
                </button>

                <button
                  onClick={() => setSelectedInvoice(null)}
                  className="px-5 py-2.5 bg-stone-800 hover:bg-stone-700 text-stone-300 font-bold rounded-xl transition cursor-pointer"
                >
                  Close
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
