async function testSignup() {
  console.log("Testing Signup & MongoDB Atlas Realtime Sync...");

  const email = `farmer${Date.now()}@seed2shelf.com`;
  const res = await fetch("http://localhost:3000/api/auth/signup", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      name: "Ramesh Farmer",
      email,
      password: "Password@123",
      role: "FARMER"
    })
  });

  const json = await res.json();
  console.log("Signup Response:", json);
}

testSignup();
