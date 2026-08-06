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

export default function RetailerDashboard({ user }: { user: any }) {
  const [myInventory, setMyInventory] = useState<Crop[]>([]);
  const [requests, setRequests] = useState<Request[]>([]);

  const [orders, setOrders] = useState<any[]>([]);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const ownerId = user.retailerId || user.id;

      // 1. Fetch Retailer Inventory from MongoDB
      const cropsRes = await fetch("http://localhost:5000/api/products");
      if (cropsRes.ok) {
        const allCrops = await cropsRes.json();
        const filteredCrops = allCrops.filter((p: any) => p.currentOwnerId === ownerId);
        setMyInventory(filteredCrops.map((p: any) => ({
          id: p._id,
          batchId: p.batchId,
          name: p.cropName,
          quantity: p.quantity,
          isListed: p.status === "AVAILABLE"
        })));
      }

      // 2. Fetch Orders for Escrow/Shipment Tracking
      const ordersRes = await fetch("http://localhost:5000/api/orders");
      const usersRes = await fetch("http://localhost:5000/api/users");
      const productsRes = await fetch("http://localhost:5000/api/products");

      if (ordersRes.ok && usersRes.ok && productsRes.ok) {
        const ordersData = await ordersRes.json();
        const usersData = await usersRes.json();
        const productsData = await productsRes.json();

        const mapped = ordersData.map((o: any) => {
          const buyer = usersData.find((u: any) => u.farmerId === o.buyerId || u.processorId === o.buyerId || u.id === o.buyerId);
          const seller = usersData.find((u: any) => u.farmerId === o.sellerId || u.processorId === o.sellerId || u.id === o.sellerId);
          const prod = productsData.find((p: any) => p._id === o.productId || p.batchId === o.batchId);
          return {
            id: o._id,
            orderId: o.orderId,
            buyerId: o.buyerId,
            buyerName: buyer ? buyer.name : "Buyer",
            sellerId: o.sellerId,
            sellerName: seller ? seller.name : "Seller",
            cropName: prod ? prod.cropName : "Crop Batch",
            batchId: o.batchId,
            quantity: o.quantityPurchased,
            amount: o.amount,
            orderStatus: o.orderStatus,
            paymentStatus: o.paymentStatus,
            deliveryStatus: o.deliveryStatus
          };
        });
        setOrders(mapped);
      }
    } catch (err) {
      console.error("Error fetching retailer data:", err);
    }
  };

  const handleConfirmDelivery = async (orderId: string) => {
    try {
      await fetch(`http://localhost:5000/api/orders/${orderId}/confirm-delivery`, {
        method: "PUT"
      });
      fetchData();
    } catch (err) {
      console.error("Error confirming delivery:", err);
    }
  };

  const handleAcceptOrder = async (orderId: string) => {
    try {
      await fetch(`http://localhost:5000/api/orders/${orderId}/accept`, {
        method: "PUT"
      });
      fetchData();
    } catch (err) {
      console.error("Error accepting order:", err);
    }
  };

  const toggleListing = async (cropId: string, currentStatus: boolean) => {
    try {
      await fetch(`http://localhost:5000/api/products/${cropId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isListed: !currentStatus })
      });
      fetchData();
    } catch (err) {
      console.error("Error toggling product listing:", err);
    }
  };

  return (
    <div className="min-h-screen relative text-white">
      <Head>
        <title>Retailer Dashboard | Seed2Shelf</title>
      </Head>


      <div className="relative z-10 max-w-7xl mx-auto px-6 py-12">
        {/* Removed boxes and writings as requested */}
      </div>
    </div>
  );
}

export const getServerSideProps: GetServerSideProps = async (context) => {
  const session = await getServerSession(context.req, context.res, authOptions);
  if (!session || session.user?.role !== "RETAILER") {
    return { redirect: { destination: "/", permanent: false } };
  }
  return { props: { user: JSON.parse(JSON.stringify(session.user)) } };
};
