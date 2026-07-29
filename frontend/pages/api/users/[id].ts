import { NextApiRequest, NextApiResponse } from "next";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../auth/[...nextauth]";

const EXPRESS_BACKEND_URL = process.env.EXPRESS_BACKEND_URL || "http://localhost:5000";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { id } = req.query;
  const userId = id as string;
  const session = await getServerSession(req, res, authOptions);

  // 1. GET Request: Proxy to Express Backend
  if (req.method === "GET") {
    try {
      const expressRes = await fetch(`${EXPRESS_BACKEND_URL}/api/v1/farmer/profile/${userId}`);
      if (expressRes.ok) {
        const expressData = await expressRes.json();
        const payload = expressData.data || expressData;
        const u = payload.user || payload;
        const a = payload.address || {};
        const k = payload.kyc || {};

        return res.status(200).json({
          id: u._id || userId,
          name: u.fullName || u.name || "",
          email: u.email || "",
          role: u.role || "FARMER",
          farmerId: u.farmerId || null,
          processorId: u.processorId || null,
          mobileNumber: u.phone || null,
          dob: u.dateOfBirth ? new Date(u.dateOfBirth).toISOString().split("T")[0] : null,
          gender: u.gender || null,
          permanentAddress: a.addressLine || null,
          village: a.village || null,
          district: a.district || null,
          state: a.state || null,
          pinCode: a.pinCode || null,
          profilePhoto: u.profilePhoto || null,
          aadhaarNumber: k.aadhaarNumber || null,
          aadhaarFront: k.frontDocument?.url || k.frontImage || null,
          aadhaarBack: k.backDocument?.url || k.backImage || null,
          kycStatus: k.verificationStatus || u.verificationStatus || "Pending Verification",
        });
      }

      return res.status(expressRes.status).json({ message: "User not found" });
    } catch (error) {
      console.error("GET Profile proxy error:", error);
      return res.status(500).json({ message: "Error fetching user profile from Express backend" });
    }
  }

  // 2. PUT Request: Proxy to Express Backend
  if (req.method === "PUT") {
    if (!session) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    try {
      const expressRes = await fetch(`${EXPRESS_BACKEND_URL}/api/v1/farmer/profile/${userId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(req.body)
      });

      if (expressRes.ok) {
        const expressData = await expressRes.json();
        const payload = expressData.data || expressData;
        const u = payload.user || payload;
        const a = payload.address || {};
        const k = payload.kyc || {};

        return res.status(200).json({
          id: u._id || userId,
          name: u.fullName || u.name || req.body.name,
          email: u.email || session.user.email,
          role: u.role || "FARMER",
          farmerId: u.farmerId || null,
          mobileNumber: u.phone || req.body.mobileNumber,
          dob: u.dateOfBirth ? new Date(u.dateOfBirth).toISOString().split("T")[0] : req.body.dob,
          gender: u.gender || req.body.gender,
          permanentAddress: a.addressLine || req.body.permanentAddress,
          village: a.village || req.body.village,
          district: a.district || req.body.district,
          state: a.state || req.body.state,
          pinCode: a.pinCode || req.body.pinCode,
          profilePhoto: u.profilePhoto || req.body.profilePhoto,
          aadhaarNumber: k.aadhaarNumber || req.body.aadhaarNumber,
          aadhaarFront: k.frontDocument?.url || req.body.aadhaarFront,
          aadhaarBack: k.backDocument?.url || req.body.aadhaarBack,
          kycStatus: k.verificationStatus || u.verificationStatus || "Pending Verification",
        });
      }

      const errData = await expressRes.json().catch(() => ({ message: "Failed to update profile" }));
      return res.status(expressRes.status).json(errData);
    } catch (error) {
      console.error("PUT Profile proxy error:", error);
      return res.status(500).json({ message: "Error updating profile via Express backend" });
    }
  }

  return res.status(405).json({ message: "Method not allowed" });
}
