import { useState, useEffect } from "react";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/pages/api/auth/[...nextauth]";
import { GetServerSideProps } from "next";
import Head from "next/head";

interface Crop {
  id: string;
  name: string;
  quantity: number;
  farmerId: string;
  farmer: { name: string };
  currentOwnerId: string;
  currentOwner?: { role: string };
  isListed: boolean;
}

interface Request {
  id: string;
  crop: Crop;
  sender: { id: string; name: string; role: string };
  receiver: { id: string; name: string; role: string };
  status: string;
  quantity: number;
  deliveryDate: string;
  ratings?: any[];
}

export default function DistributorDashboard({ user }: { user: any }) {
  const [myInventory, setMyInventory] = useState<Crop[]>([]);
  const [requests, setRequests] = useState<Request[]>([]);

  const [orders, setOrders] = useState<any[]>([]);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const ownerId = user.distributorId || user.id;

      // 1. Fetch Distributor Inventory from MongoDB
      const cropsRes = await fetch("/api/crops");
      if (cropsRes.ok) {
        const allCrops = await cropsRes.json();
        const filteredCrops = allCrops.filter((p: any) => p.currentOwnerId === ownerId);
        setMyInventory(filteredCrops.map((p: any) => ({
          id: p.id,
          batchId: p.batchId,
          name: p.name,
          quantity: p.quantity,
          isListed: p.isListed
        })));
      }

      // 2. Fetch Orders for Escrow/Shipment Tracking
      const ordersRes = await fetch("/api/requests");
      const usersRes = await fetch("/api/users");

      if (ordersRes.ok && usersRes.ok) {
        const ordersData = await ordersRes.json();
        const usersData = await usersRes.json();

        const mapped = ordersData.map((o: any) => {
          const buyer = usersData.find((u: any) => u.farmerId === o.senderId || u.processorId === o.senderId || u.id === o.senderId);
          const seller = usersData.find((u: any) => u.farmerId === o.receiverId || u.processorId === o.receiverId || u.id === o.receiverId);
          const prod = o.crop;
          return {
            id: o.id,
            orderId: o.id,
            buyerId: o.senderId,
            buyerName: buyer ? buyer.name : "Buyer",
            sellerId: o.receiverId,
            sellerName: seller ? seller.name : "Seller",
            cropName: prod ? prod.name : "Crop Batch",
            batchId: prod ? prod.batchId : o.id,
            quantity: o.quantity,
            amount: o.quantity * 50,
            orderStatus: o.status,
            paymentStatus: o.status === "COMPLETED" ? "COMPLETED" : "PENDING",
            deliveryStatus: o.status === "DELIVERED" || o.status === "COMPLETED" ? "DELIVERED" : (o.status === "SHIPPED" ? "SHIPPED" : "PENDING")
          };
        });
        setOrders(mapped);
      }
    } catch (err) {
      console.error("Error fetching distributor data:", err);
    }
  };

  const handleConfirmDelivery = async (orderId: string) => {
    try {
      await fetch(`/api/requests`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ requestId: orderId, action: "confirm_delivery" })
      });
      fetchData();
    } catch (err) {
      console.error("Error confirming delivery:", err);
    }
  };

  const handleAcceptOrder = async (orderId: string) => {
    try {
      await fetch(`/api/requests`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ requestId: orderId, action: "accept" })
      });
      fetchData();
    } catch (err) {
      console.error("Error accepting order:", err);
    }
  };

  const toggleListing = async (cropId: string, currentStatus: boolean) => {
    try {
      await fetch(`/api/crops`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ cropId, isListed: !currentStatus })
      });
      fetchData();
    } catch (err) {
      console.error("Error toggling product listing:", err);
    }
  };

  return (
    <div className="min-h-screen relative text-white">
      <Head>
        <title>Distributor Dashboard | Seed2Shelf</title>
      </Head>


      <div className="relative z-10 max-w-7xl mx-auto px-6 py-12">
        {/* Removed boxes and writings as requested */}
      </div>
    </div>
  );
}

export const getServerSideProps: GetServerSideProps = async (context) => {
  const session = await getServerSession(context.req, context.res, authOptions);
  if (!session || session.user?.role !== "DISTRIBUTOR") {
    return { redirect: { destination: "/", permanent: false } };
  }
  return { props: { user: JSON.parse(JSON.stringify(session.user)) } };
};
