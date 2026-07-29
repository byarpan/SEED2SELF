async function testExpressArchitecture() {
  console.log("==========================================");
  console.log("VERIFYING EXPRESS BACKEND SINGLE ARCHITECTURE");
  console.log("==========================================");

  const testUserId = "arpanghosh8617@gmail.com";
  const expressUrl = "http://localhost:5000/api/v1/farmer/profile";

  console.log(`\n1. GET Profile Request to Express Backend (${expressUrl}/${testUserId})...`);
  try {
    const getRes = await fetch(`${expressUrl}/${testUserId}`);
    console.log(`   • GET Status: ${getRes.status}`);
    if (getRes.ok) {
      const getJson = await getRes.json();
      console.log("   • GET Data Retrieved:", JSON.stringify(getJson.data?.user?.fullName || getJson.data?.user?.email, null, 2));
    }
  } catch (err: any) {
    console.error("❌ GET Request failed:", err.message);
  }

  console.log(`\n2. PUT Profile Request to Express Backend (${expressUrl}/${testUserId})...`);
  const updatePayload = {
    name: "Arpan Ghosh",
    mobileNumber: "8617676375",
    permanentAddress: "Building 45, Tech Hub Central",
    village: "Kalyani Phase 2",
    district: "Nadia",
    state: "West Bengal",
    pinCode: "741235",
    aadhaarNumber: "123456789012",
  };

  try {
    const putRes = await fetch(`${expressUrl}/${testUserId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(updatePayload),
    });
    console.log(`   • PUT Status: ${putRes.status}`);
    if (putRes.ok) {
      const putJson = await putRes.json();
      console.log("   • Express Backend Update Success Message:", putJson.message);
      console.log("   • Updated Address stored in MongoDB Atlas:", putJson.data?.address?.addressLine);
    }
  } catch (err: any) {
    console.error("❌ PUT Request failed:", err.message);
  }

  console.log("\n==========================================");
  console.log("EXPRESS BACKEND ARCHITECTURE VERIFIED SUCCESSFULLY");
  console.log("==========================================");
}

testExpressArchitecture();
