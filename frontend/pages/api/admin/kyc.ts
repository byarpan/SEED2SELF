import { NextApiRequest, NextApiResponse } from "next";
import { prisma } from "../../../lib/prisma";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../auth/[...nextauth]";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const session = await getServerSession(req, res, authOptions);

  // Security check: Only ADMIN can access these endpoints
  if (!session || session.user.role !== "ADMIN") {
    return res.status(401).json({ message: "Unauthorized. Admin access required." });
  }

  // 1. GET Request - Fetch all farmers and processors for review
  if (req.method === "GET") {
    try {
      const farmers = await prisma.user.findMany({
        where: {
          role: { in: ["FARMER", "PROCESSOR"] },
          OR: [
            { NOT: { kycStatus: null } },
            { NOT: { aadhaarNumber: null } },
            { NOT: { aadhaarFront: null } }
          ]
        },
        orderBy: [
          // Order by Pending Verification first, then others
          { kycStatus: "asc" }, 
          { name: "asc" }
        ],
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
          farmerId: true,
          processorId: true,
          mobileNumber: true,
          dob: true,
          gender: true,
          permanentAddress: true,
          state: true,
          district: true,
          village: true,
          pinCode: true,
          farmName: true,
          farmLocation: true,
          landArea: true,
          mainCrops: true,
          farmingType: true,
          regDate: true,
          aadhaarNumber: true,
          aadhaarFront: true,
          aadhaarBack: true,
          kycStatus: true,
          verificationDate: true,
          rejectionReason: true,
          createdAt: true
        }
      });

      return res.status(200).json(farmers);
    } catch (error) {
      console.error("Fetch pending KYC error:", error);
      return res.status(500).json({ message: "Error fetching KYC submissions" });
    }
  }

  // 2. POST / PUT Request - Approve/Reject KYC
  if (req.method === "POST" || req.method === "PUT") {
    try {
      const { userId, action, reason } = req.body;

      if (!userId || !action) {
        return res.status(400).json({ message: "Missing userId or action parameter" });
      }

      if (!["APPROVE", "REJECT", "RE_UPLOAD"].includes(action)) {
        return res.status(400).json({ message: "Action must be APPROVE, REJECT, or RE_UPLOAD" });
      }

      const farmer = await prisma.user.findUnique({
        where: { id: userId }
      });

      if (!farmer) {
        return res.status(404).json({ message: "User profile not found" });
      }

      const updateData: any = {};

      if (action === "APPROVE") {
        updateData.kycStatus = "Verified";
        updateData.verificationDate = new Date();
        updateData.rejectionReason = null;
      } else if (action === "RE_UPLOAD") {
        updateData.kycStatus = "Re-Upload Requested";
        updateData.rejectionReason = reason || "Please re-upload clear Aadhaar documents.";
        updateData.verificationDate = null;
      } else {
        if (!reason || reason.trim() === "") {
          return res.status(400).json({ message: "Rejection reason is required" });
        }
        updateData.kycStatus = "Rejected";
        updateData.rejectionReason = reason;
        updateData.verificationDate = null;
      }

      const updatedUser = await prisma.user.update({
        where: { id: userId },
        data: updateData
      });

      try {
        const { syncUserToMongoDB } = await import("../../../lib/mongodbSync");
        await syncUserToMongoDB(updatedUser);
      } catch (syncError) {
        console.error("Failed to sync KYC decision to MongoDB Atlas:", syncError);
      }

      return res.status(200).json({
        message: `KYC successfully ${action === "APPROVE" ? "Approved" : "Rejected"}`,
        user: {
          id: updatedUser.id,
          name: updatedUser.name,
          kycStatus: updatedUser.kycStatus,
          verificationDate: updatedUser.verificationDate,
          rejectionReason: updatedUser.rejectionReason
        }
      });
    } catch (error) {
      console.error("KYC decision error:", error);
      return res.status(500).json({ message: "Error saving KYC decision" });
    }
  }

  return res.status(405).json({ message: "Method not allowed" });
}
