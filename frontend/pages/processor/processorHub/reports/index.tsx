import { useState } from "react";
import { useSession } from "next-auth/react";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/pages/api/auth/[...nextauth]";
import { GetServerSideProps } from "next";
import Head from "next/head";
import { 
  BarChart3, 
  TrendingUp, 
  IndianRupee,
  Package,
  Lock,
  AlertTriangle,
  Calendar,
  Download,
  CheckCircle2,
  PieChart,
  ArrowUpRight,
  Activity,
  FileSpreadsheet
} from "lucide-react";

type Timeframe = "WEEKLY" | "MONTHLY" | "YEARLY";

interface ProductMetric {
  name: string;
  quantity: string;
  revenue: string;
  percentage: number;
}

interface TrendPoint {
  period: string;
  revenue: number;
  volume: number;
}

interface AnalyticsData {
  produceTransformed: string;
  totalRevenue: string;
  escrowLocked: string;
  disputeRate: string;
  successfulShipments: number;
  totalOrders: number;
  productBreakdown: ProductMetric[];
  trendData: TrendPoint[];
}

const analyticsByTimeframe: Record<Timeframe, AnalyticsData> = {
  WEEKLY: {
    produceTransformed: "0 kg",
    totalRevenue: "₹ 0",
    escrowLocked: "₹ 0",
    disputeRate: "0.0%",
    successfulShipments: 0,
    totalOrders: 0,
    productBreakdown: [],
    trendData: []
  },
  MONTHLY: {
    produceTransformed: "0 kg",
    totalRevenue: "₹ 0",
    escrowLocked: "₹ 0",
    disputeRate: "0.0%",
    successfulShipments: 0,
    totalOrders: 0,
    productBreakdown: [],
    trendData: []
  },
  YEARLY: {
    produceTransformed: "0 kg",
    totalRevenue: "₹ 0",
    escrowLocked: "₹ 0",
    disputeRate: "0.0%",
    successfulShipments: 0,
    totalOrders: 0,
    productBreakdown: [],
    trendData: []
  }
};
function generatePdfBlob(title: string, timeframe: string, stats: any): Blob {
  const dateStr = new Date().toLocaleString("en-IN");
  const produceVal = stats.produceSold || stats.produceTransformed || "0 kg";
  const revenueVal = stats.totalRevenue || "₹ 0";
  const escrowVal = stats.escrowLocked || "₹ 0";
  const disputeVal = stats.disputeRate || "0.0%";
  const shipVal = String(stats.successfulShipments || 0);
  const orderVal = String(stats.totalOrders || 0);

  const items = stats.cropBreakdown || stats.productBreakdown || [];

  const textLines = [
    `${title.toUpperCase()} (${timeframe})`,
    `Generated: ${dateStr}`,
    "----------------------------------------------------------------------",
    `Produce Sold / Transformed : ${produceVal}`,
    `Total Revenue              : ${revenueVal}`,
    `Escrow Locked              : ${escrowVal}`,
    `Dispute Rate               : ${disputeVal}`,
    `Successful Shipments       : ${shipVal}`,
    `Total Orders               : ${orderVal}`,
    "----------------------------------------------------------------------",
    "ITEMIZED BREAKDOWN:",
    ...(items.length > 0 
      ? items.map((it: any) => `* ${it.name}: ${it.quantity} | ${it.revenue} (${it.percentage}%)`)
      : ["* No recorded transactions for this timeframe."]),
    "----------------------------------------------------------------------",
    "Verified & Secured by Seed2Shelf Platform Blockchain"
  ];

  const pdfStreamText = textLines.map(line => {
    const escaped = line.replace(/\\/g, "\\\\").replace(/\(/g, "\\(").replace(/\)/g, "\\)");
    return `(${escaped}) '`;
  }).join("\n");

  const pdfContent = `BT
/F1 11 Tf
14 TL
40 780 Td
${pdfStreamText}
ET`;

  const streamLength = pdfContent.length;

  const obj1 = `1 0 obj\n<< /Type /Catalog /Pages 2 0 R >>\nendobj\n`;
  const obj2 = `2 0 obj\n<< /Type /Pages /Kids [3 0 R] /Count 1 >>\nendobj\n`;
  const obj3 = `3 0 obj\n<< /Type /Page /Parent 2 0 R /MediaBox [0 0 595 842] /Contents 4 0 R /Resources << /Font << /F1 5 0 R >> >> >>\nendobj\n`;
  const obj4 = `4 0 obj\n<< /Length ${streamLength} >>\nstream\n${pdfContent}\nendstream\nendobj\n`;
  const obj5 = `5 0 obj\n<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>\nendobj\n`;

  const header = `%PDF-1.4\n`;
  
  const o1Pos = header.length;
  const o2Pos = o1Pos + obj1.length;
  const o3Pos = o2Pos + obj2.length;
  const o4Pos = o3Pos + obj3.length;
  const o5Pos = o4Pos + obj4.length;
  const xrefPos = o5Pos + obj5.length;

  const xref = `xref\n0 6\n0000000000 65535 f \n${String(o1Pos).padStart(10, '0')} 00000 n \n${String(o2Pos).padStart(10, '0')} 00000 n \n${String(o3Pos).padStart(10, '0')} 00000 n \n${String(o4Pos).padStart(10, '0')} 00000 n \n${String(o5Pos).padStart(10, '0')} 00000 n \n`;

  const trailer = `trailer\n<< /Size 6 /Root 1 0 R >>\nstartxref\n${xrefPos}\n%%EOF`;

  const fullPdf = header + obj1 + obj2 + obj3 + obj4 + obj5 + xref + trailer;

  return new Blob([fullPdf], { type: "application/pdf" });
}

export default function ProcessorReportsPage() {
  const { data: session } = useSession();
  const [timeframe, setTimeframe] = useState<Timeframe>("MONTHLY");
  const [downloadSuccess, setDownloadSuccess] = useState<string | null>(null);

  const currentStats = analyticsByTimeframe[timeframe];

  const handleExportReport = (type: string) => {
    try {
      if (type === "CSV") {
        const rows = [
          ["Seed2Shelf Processing & Inventory Analytics Report"],
          ["Timeframe", timeframe],
          ["Date Generated", new Date().toLocaleString("en-IN")],
          [""],
          ["Summary Metric", "Value"],
          ["Produce Transformed", currentStats.produceTransformed || "0 kg"],
          ["Total Revenue", currentStats.totalRevenue || "₹ 0"],
          ["Escrow Locked", currentStats.escrowLocked || "₹ 0"],
          ["Dispute Rate", currentStats.disputeRate || "0.0%"],
          ["Successful Shipments", currentStats.successfulShipments || 0],
          ["Total Orders", currentStats.totalOrders || 0],
          [""],
          ["Product Breakdown"],
          ["Product Name", "Quantity", "Revenue", "Share %"],
          ...(currentStats.productBreakdown || []).map(p => [p.name, p.quantity, p.revenue, `${p.percentage}%`])
        ];

        const csvString = rows.map(r => r.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(",")).join("\n");
        const blob = new Blob([csvString], { type: "text/csv;charset=utf-8;" });
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.download = `Processor_Report_${timeframe}_${new Date().toISOString().slice(0, 10)}.csv`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
      } else {
        const blob = generatePdfBlob("Seed2Shelf Processor Analytics Report", timeframe, currentStats);
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.download = `Processor_Report_${timeframe}_${new Date().toISOString().slice(0, 10)}.pdf`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
      }
      setDownloadSuccess(`${type} file downloaded to your device!`);
    } catch (err) {
      console.error("Export error:", err);
    }
    setTimeout(() => setDownloadSuccess(null), 3500);
  };

  const maxRevenue = Math.max(...currentStats.trendData.map(d => d.revenue), 1);

  return (
    <div className="min-h-screen bg-stone-950 text-stone-100 font-sans pb-24 pt-6 px-4 sm:px-6 lg:px-8 relative z-20">
      <Head>
        <title>Processing Analytics & Reports | Seed2Shelf Processor</title>
        <meta name="description" content="View processed goods analytics, transformation volume, and revenue summaries." />
      </Head>

      {/* Solid Dark Background Overlay matching Wallet theme */}
      <div className="fixed inset-0 bg-stone-950 z-[-1] pointer-events-none"></div>

      <div className="max-w-6xl mx-auto space-y-7">
        
        {/* HEADER WITH TIMEFRAME SELECTOR ON RIGHT */}
        <div className="flex flex-wrap items-center justify-between gap-4 border-y border-stone-800/80 py-3.5">
          <div className="flex items-center gap-3.5">
            <div className="p-2.5 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl text-emerald-400 shrink-0">
              <BarChart3 className="h-7 w-7" />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
                Reports & Yield Analytics
              </h1>
            </div>
          </div>

          {/* TIMEFRAME SWITCHING OPTIONS */}
          <div className="flex items-center bg-stone-950 p-1.5 rounded-2xl border border-stone-800 text-xs font-extrabold">
            <button
              onClick={() => setTimeframe("WEEKLY")}
              className={`px-4 py-2 rounded-xl transition cursor-pointer flex items-center gap-1.5 ${
                timeframe === "WEEKLY"
                  ? "bg-emerald-600 text-white shadow-md font-black"
                  : "text-stone-400 hover:text-stone-200"
              }`}
            >
              <span>Weekly</span>
            </button>

            <div className="w-[1px] h-4 bg-stone-800 mx-1 shrink-0"></div>

            <button
              onClick={() => setTimeframe("MONTHLY")}
              className={`px-4 py-2 rounded-xl transition cursor-pointer flex items-center gap-1.5 ${
                timeframe === "MONTHLY"
                  ? "bg-emerald-600 text-white shadow-md font-black"
                  : "text-stone-400 hover:text-stone-200"
              }`}
            >
              <span>Monthly</span>
            </button>

            <div className="w-[1px] h-4 bg-stone-800 mx-1 shrink-0"></div>

            <button
              onClick={() => setTimeframe("YEARLY")}
              className={`px-4 py-2 rounded-xl transition cursor-pointer flex items-center gap-1.5 ${
                timeframe === "YEARLY"
                  ? "bg-emerald-600 text-white shadow-md font-black"
                  : "text-stone-400 hover:text-stone-200"
              }`}
            >
              <span>Yearly</span>
            </button>
          </div>
        </div>

        {downloadSuccess && (
          <div className="p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl text-xs text-emerald-400 font-bold flex items-center gap-2 animate-in fade-in duration-300">
            <CheckCircle2 className="w-5 h-5 shrink-0" />
            <span>{downloadSuccess}</span>
          </div>
        )}

        {/* TIMEFRAME SUB-HEADER BANNER */}
        <div className="flex flex-wrap items-center justify-between bg-stone-900/90 border border-stone-800/90 rounded-2xl p-4 sm:p-5 gap-3 shadow-sm">
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-emerald-400" />
            <span className="text-sm font-bold text-stone-200">
              {timeframe === "WEEKLY" ? "Current Week Processing Report (Jul 20 - Jul 26, 2026)" : timeframe === "MONTHLY" ? "Monthly Processing Summary (July 2026)" : "Annual Yield & Transformation Summary (Year 2026)"}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => handleExportReport("CSV")}
              className="px-3.5 py-1.5 bg-stone-950 hover:bg-stone-800 border border-stone-800 rounded-xl text-xs font-bold text-stone-300 transition flex items-center gap-1.5 cursor-pointer"
            >
              <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-400" />
              <span>Export CSV</span>
            </button>
            <button
              onClick={() => handleExportReport("PDF")}
              className="px-3.5 py-1.5 bg-emerald-600/20 hover:bg-emerald-600/30 border border-emerald-500/30 rounded-xl text-xs font-bold text-emerald-400 transition flex items-center gap-1.5 cursor-pointer"
            >
              <Download className="w-3.5 h-3.5 text-emerald-400" />
              <span>Download PDF</span>
            </button>
          </div>
        </div>

        {/* UNIFIED 4-METRIC SQUARE CONTAINER (MATCHING FARMER REPORTS EXACTLY) */}
        <div className="bg-stone-900/90 border border-stone-800/90 rounded-3xl p-3.5 sm:p-5 shadow-sm">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 sm:gap-4">
            
            {/* Cell 1: Produce Transformed */}
            <div className="p-6 bg-stone-950/80 border border-stone-800/70 rounded-2xl space-y-4 flex flex-col justify-between hover:border-emerald-500/30 transition duration-300">
              <div className="flex items-center justify-between">
                <span className="text-xs font-black text-stone-400 uppercase tracking-wider block">
                  PRODUCED SOLD
                </span>
                <div className="p-2.5 bg-stone-900 border border-stone-800 rounded-xl text-stone-300">
                  <Package className="w-4 h-4" />
                </div>
              </div>
              
              <div className="space-y-1">
                <p className="text-3xl font-extrabold text-white tracking-tight">{currentStats.produceTransformed}</p>
                <div className="text-[11px] text-stone-400 flex items-center gap-1.5 font-medium">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                  <span>{currentStats.successfulShipments} Processed Batches</span>
                </div>
              </div>
            </div>

            {/* Cell 2: Total Revenue */}
            <div className="p-6 bg-stone-950/80 border border-emerald-900/30 rounded-2xl space-y-4 flex flex-col justify-between hover:border-emerald-500/40 transition duration-300">
              <div className="flex items-center justify-between">
                <span className="text-xs font-black text-emerald-400 uppercase tracking-wider block">
                  TOTAL REVENUE
                </span>
                <div className="p-2.5 bg-emerald-500/10 border border-emerald-500/20 rounded-xl text-emerald-400">
                  <IndianRupee className="w-4 h-4" />
                </div>
              </div>
              
              <div className="space-y-1">
                <p className="text-3xl font-extrabold text-emerald-400 tracking-tight">{currentStats.totalRevenue}</p>
                <div className="text-[11px] text-emerald-400/90 flex items-center gap-1.5 font-medium">
                  <ArrowUpRight className="w-3.5 h-3.5 shrink-0" />
                  <span>Settled Escrow Earnings from Distributors</span>
                </div>
              </div>
            </div>

            {/* Cell 3: Escrow Locked */}
            <div className="p-6 bg-stone-950/80 border border-amber-900/30 rounded-2xl space-y-4 flex flex-col justify-between hover:border-amber-500/40 transition duration-300">
              <div className="flex items-center justify-between">
                <span className="text-xs font-black text-amber-400 uppercase tracking-wider block">
                  ESCROW LOCKED
                </span>
                <div className="p-2.5 bg-amber-500/10 border border-amber-500/20 rounded-xl text-amber-400">
                  <Lock className="w-4 h-4" />
                </div>
              </div>
              
              <div className="space-y-1">
                <p className="text-3xl font-extrabold text-amber-400 tracking-tight">{currentStats.escrowLocked}</p>
                <div className="text-[11px] text-stone-400 flex items-center gap-1.5 font-medium">
                  <Activity className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                  <span>In-Transit Protection</span>
                </div>
              </div>
            </div>

            {/* Cell 4: Dispute Rate */}
            <div className="p-6 bg-stone-950/80 border border-rose-900/30 rounded-2xl space-y-4 flex flex-col justify-between hover:border-rose-500/40 transition duration-300">
              <div className="flex items-center justify-between">
                <span className="text-xs font-black text-stone-400 uppercase tracking-wider block">
                  DISPUTE RATE
                </span>
                <div className="p-2.5 bg-rose-500/10 border border-rose-500/20 rounded-xl text-rose-400">
                  <AlertTriangle className="w-4 h-4" />
                </div>
              </div>
              
              <div className="space-y-1">
                <p className="text-3xl font-extrabold text-rose-400 tracking-tight">{currentStats.disputeRate}</p>
                <div className="text-[11px] text-stone-400 flex items-center gap-1.5 font-medium">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                  <span>Quality Assurance Approved</span>
                </div>
              </div>
            </div>

          </div>
        </div>

        {/* ANALYTICS CHARTS & BREAKDOWN SECTION */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Revenue & Volume Trend Chart */}
          <div className="lg:col-span-2 bg-stone-900/90 border border-stone-800/90 rounded-3xl p-6 space-y-5 shadow-sm">
            <div className="flex items-center justify-between border-b border-stone-800 pb-4">
              <div className="flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-emerald-400" />
                <h3 className="text-base font-extrabold text-white">Revenue & Volume Trend</h3>
              </div>
              <span className="text-xs text-stone-400 font-medium">
                {timeframe} Performance
              </span>
            </div>

            {/* Custom Bar Visualization */}
            <div className="space-y-4 pt-2">
              <div className="h-44 flex items-end justify-between gap-3 sm:gap-6 pt-6 px-2">
                {currentStats.trendData.map((data, idx) => {
                  const heightPercent = maxRevenue > 0 ? (data.revenue / maxRevenue) * 100 : 0;
                  return (
                    <div key={idx} className="flex-1 flex flex-col items-center gap-2 h-full justify-end group">
                      <span className="text-[10px] text-emerald-400 font-mono opacity-0 group-hover:opacity-100 transition">
                        ₹{data.revenue}
                      </span>
                      <div className="w-full bg-stone-950 rounded-t-xl h-full flex items-end overflow-hidden border border-stone-800">
                        <div 
                          className="w-full bg-gradient-to-t from-emerald-600 to-emerald-400 rounded-t-xl transition-all duration-500"
                          style={{ height: `${Math.max(heightPercent, 8)}%` }}
                        />
                      </div>
                      <span className="text-[11px] font-bold text-stone-400">{data.period}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Processed Product Revenue Breakdown */}
          <div className="bg-stone-900/90 border border-stone-800/90 rounded-3xl p-6 space-y-5 shadow-sm">
            <div className="flex items-center justify-between border-b border-stone-800 pb-4">
              <div className="flex items-center gap-2">
                <PieChart className="w-5 h-5 text-emerald-400" />
                <h3 className="text-base font-extrabold text-white">Product Share</h3>
              </div>
              <span className="text-xs text-stone-400 font-medium">Output Share %</span>
            </div>

            <div className="space-y-4 pt-1">
              {currentStats.productBreakdown.map((product, idx) => (
                <div key={idx} className="space-y-1.5 p-3.5 bg-stone-950 rounded-2xl border border-stone-800">
                  <div className="flex items-center justify-between text-xs font-bold">
                    <span className="text-white">{product.name}</span>
                    <span className="text-emerald-400 font-mono">{product.revenue}</span>
                  </div>
                  
                  {/* Progress bar */}
                  <div className="w-full h-2 bg-stone-900 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-emerald-500 rounded-full"
                      style={{ width: `${product.percentage}%` }}
                    />
                  </div>

                  <div className="flex items-center justify-between text-[10px] text-stone-400 pt-0.5">
                    <span>Volume: {product.quantity}</span>
                    <span>{product.percentage}% of total</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

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
