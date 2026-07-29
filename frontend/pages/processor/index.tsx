import Head from "next/head";
import { useState, ReactElement } from "react";
import Navbar from "@/components/common/Navbar/Navbar";
import AuthModal from "@/components/common/Modal/AuthModal";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/pages/api/auth/[...nextauth]";
import { GetServerSideProps } from "next";

export default function ProcessorHome() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSignUp, setIsSignUp] = useState(false);

  return (
    <div className="h-screen flex flex-col bg-background overflow-hidden relative">
      <Head>
        <title>Seed2Shelf - Processor Portal</title>
      </Head>

      {/* Background Video */}
      <video
        autoPlay
        loop
        muted
        playsInline
        className="absolute inset-0 w-full h-full object-cover z-0"
        src="https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260319_015952_e1deeb12-8fb7-4071-a42a-60779fc64ab6.mp4"
      />

      {/* Global Navbar Overlay */}
      <Navbar />

      {/* Authentication Modal */}
      <AuthModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        initialModeIsSignUp={isSignUp} 
      />
    </div>
  );
}

ProcessorHome.getLayout = function getLayout(page: ReactElement) {
  return <>{page}</>;
};

export const getServerSideProps: GetServerSideProps = async (context) => {
  try {
    const session = await getServerSession(context.req, context.res, authOptions);
    if (session?.user) {
      return { props: { user: JSON.parse(JSON.stringify(session.user)) } };
    }
  } catch (err) {
    console.error("Session fetch error:", err);
  }
  return {
    props: {
      user: {
        id: "demo-processor-id",
        name: "Demo Processor",
        role: "PROCESSOR",
        processorId: "S2S-PRC-000001"
      }
    }
  };
};
