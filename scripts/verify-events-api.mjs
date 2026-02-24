import fetch from 'node-fetch';

async function verifyEvents() {
  console.log("🚀 Simulating User-Side API Call: GET http://localhost:3000/api/events");
  
  try {
    const response = await fetch('http://localhost:3000/api/events');
    const data = await response.json();
    
    console.log("\n📊 API RESPONSE STATUS:", response.status);
    console.log("📦 DATA RECEIVED:");
    console.log(JSON.stringify(data, null, 2));
    
    if (Array.isArray(data)) {
      console.log(`\n✅ SUCCESS: Found ${data.length} active events.`);
      data.forEach((event, i) => {
        console.log(`   ${i + 1}. [${event.isActive ? 'ONLINE' : 'OFFLINE'}] Name: ${event.name} | Price: ${event.basePrice}`);
      });
    } else {
      console.error("\n❌ ERROR: API did not return an array.");
    }
  } catch (error) {
    console.error("\n❌ CONNECTION ERROR: Ensure 'npm run dev' is running on port 3000.");
    console.error(error.message);
  }
}

verifyEvents();
