import { useState } from "react";
import { useSession } from "next-auth/react";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/pages/api/auth/[...nextauth]";
import { GetServerSideProps } from "next";
import Head from "next/head";
import { ShieldCheck, CheckCircle2 } from "lucide-react";

export default function AdminSettings() {
  const { data: session } = useSession();
  const [saved, setSaved] = useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  return (
    <div className="min-h-screen bg-stone-950 text-stone-100 font-sans pb-24 pt-6 px-4 sm:px-6 lg:px-8 relative z-20">
      <Head>
        <title>System Settings | Admin Engine | Seed2Shelf</title>
      </Head>

      <div className="max-w-4xl mx-auto space-y-7">
        
        {/* HEADER */}
        <div className="flex items-center gap-3.5 border-b border-stone-800/80 pb-4">
          <div className="p-3 bg-[#00d26a]/10 border border-[#00d26a]/20 rounded-2xl text-[#00d26a] shrink-0">
            <ShieldCheck className="h-7 w-7" />
          </div>
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              Admin Engine System Settings
            </h1>
            <p className="text-xs text-stone-400 font-medium">Configure system governance, automated audit logging, & platform security parameters</p>
          </div>
        </div>

        {saved && (
          <div className="p-4 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-bold rounded-2xl flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5" />
            <span>Admin Engine settings saved successfully!</span>
          </div>
        )}

        <form onSubmit={handleSave} className="bg-stone-900/90 border border-stone-800 rounded-3xl p-6 space-y-5 text-xs">
          
          <div className="space-y-1.5">
            <label className="text-stone-300 font-bold block uppercase tracking-wider text-[10px]">Platform Mode</label>
            <select className="w-full bg-stone-950 border border-stone-800 rounded-xl p-3 text-xs text-white focus:outline-none focus:border-[#00d26a]">
              <option value="PRODUCTION">Production Mode (Live Blockchain Ledger)</option>
              <option value="MAINTENANCE">Maintenance Mode</option>
            </select>
          </div>

          <div className="space-y-1.5">
            <label className="text-stone-300 font-bold block uppercase tracking-wider text-[10px]">Universal KYC Enforcement</label>
            <select className="w-full bg-stone-950 border border-stone-800 rounded-xl p-3 text-xs text-white focus:outline-none focus:border-[#00d26a]">
              <option value="STRICT">Strict (KYC approval required before order creation)</option>
              <option value="FLEXIBLE">Flexible (Allow preview during verification)</option>
            </select>
          </div>

          <div className="space-y-1.5">
            <label className="text-stone-300 font-bold block uppercase tracking-wider text-[10px]">Audit Log Retention</label>
            <input type="text" defaultValue="365 Days" className="w-full bg-stone-950 border border-stone-800 rounded-xl p-3 text-xs text-white" />
          </div>

          <button
            type="submit"
            className="px-6 py-3 bg-[#00d26a] hover:bg-emerald-500 text-stone-950 font-black text-xs uppercase tracking-wider rounded-xl transition cursor-pointer shadow-lg"
          >
            Save Admin Settings
          </button>
        </form>

      </div>
    </div>
  );
}

export const getServerSideProps: GetServerSideProps = async (context) => {
  const session = await getServerSession(context.req, context.res, authOptions);
  if (!session || session.user.role !== "ADMIN") {
    return { redirect: { destination: "/auth/admin-login", permanent: false } };
  }
  return { props: {} };
};
