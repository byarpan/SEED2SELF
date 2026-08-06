import type { NextApiRequest, NextApiResponse } from "next";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../auth/[...nextauth]";
import { prisma } from "@/lib/prisma";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const session = await getServerSession(req, res, authOptions);
  if (!session || session.user.role !== "DISTRIBUTOR") {
    return res.status(401).json({ error: "Unauthorized" });
  }

  const { newBatchId, parentIds, newSellingPrice, newBatchName } = req.body;

  if (!newBatchId || !parentIds || parentIds.length === 0) {
    return res.status(400).json({ error: "Missing required fields" });
  }

  try {
    // 1. Fetch parent crops to verify ownership and calculate quantity
    const parentCrops = await prisma.crop.findMany({
      where: {
        id: { in: parentIds },
        currentOwnerId: session.user.id
      }
    });

    if (parentCrops.length !== parentIds.length) {
      return res.status(400).json({ error: "Some batches not found or not owned by you" });
    }

    let totalQuantity = 0;
    for (const crop of parentCrops) {
      const q = crop.quantity;
      if (!isNaN(q)) {
        totalQuantity += q;
      }
    }

    // 2. Create the new combined batch (Crop)
    const newCrop = await prisma.crop.create({
      data: {
        id: newBatchId,
        farmerId: parentCrops[0].farmerId,
        currentOwnerId: session.user.id,
        name: newBatchName || "Combined Batch",
        quantity: totalQuantity,
        harvestDate: new Date(),
        isListed: true
      }
    });

    // 3. Record lineage
    const lineageRecords = parentIds.map((parentId: string) => ({
      parentCropId: parentId,
      childCropId: newBatchId
    }));

    await prisma.batchCombination.createMany({
      data: lineageRecords
    });

    // 4. Mark parents as consumed (unlisted)
    await prisma.crop.updateMany({
      where: { id: { in: parentIds } },
      data: { isListed: false }
    });

    return res.status(200).json({ success: true, newCrop });

  } catch (error) {
    console.error("Combine batch error:", error);
    return res.status(500).json({ error: "Failed to combine batches" });
  }
}
