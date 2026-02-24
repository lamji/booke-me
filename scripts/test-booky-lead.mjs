import fetch from "node-fetch";
import mongoose from "mongoose";
import * as dotenv from "dotenv";

dotenv.config({ path: ".env.local" });

const BASE_URL = "http://localhost:3000";
const SESSION_ID = `test_session_${Date.now()}`;
const history = [];

async function chat(userMessage) {
  history.push({ role: "user", content: userMessage });
  console.log(`\n👤 USER: ${userMessage}`);
  
  const payload = {
    sessionId: SESSION_ID,
    messages: history.map((m) => ({ role: m.role, content: m.content }))
  };

  const res = await fetch(`${BASE_URL}/api/chat`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  
  const data = await res.json();
  const reply = data.reply || data.error;
  history.push({ role: "assistant", content: reply });
  console.log(`🤖 BOOKY: ${reply}`);
}

async function runTest() {
  console.log("Starting Lead Capture Simulation...");
  
  await chat("Hi there!");
  await chat("Check availability");
  await chat("Jick Lampago");
  await chat("jick@yopmail.com");
  await chat("thanks that's all");

  console.log("\n--- Checking Database for Client ---");
  await mongoose.connect(process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/book-me");
  const Client = mongoose.connection.collection("clients");
  const found = await Client.findOne({ email: "jick@yopmail.com" });
  
  if (found) {
    console.log(`✅ Client accurately generated in DB: ${found.name} | ${found.email} | ${found.type}`);
  } else {
    console.log("❌ Client NOT found in DB. Generation failed.");
  }
  
  process.exit(0);
}

runTest().catch(err => {
  console.error(err);
  process.exit(1);
});
