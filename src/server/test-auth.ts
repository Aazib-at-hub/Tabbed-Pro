import { signJwt, verifyJwt } from "./auth-middleware.js";

console.log("🧪 Testing Cryptographic JWT Implementation...\n");

const testSecret = "test_super_secret_signing_key_32_bytes_min_1234";

// 1. Valid Token
const validToken = signJwt({ sub: "usr_alice", email: "alice@example.com", role: "admin" }, testSecret);
const verified = verifyJwt(validToken, testSecret);
if (verified?.id === "usr_alice" && verified?.email === "alice@example.com") {
  console.log("  ✅ PASS: Valid signed JWT verifies correctly");
} else {
  console.error("  ❌ FAIL: Valid JWT verification failed", verified);
  process.exit(1);
}

// 2. Tampered Payload (Attempting to impersonate bob)
const parts = validToken.split(".");
const tamperedPayload = Buffer.from(JSON.stringify({ sub: "usr_bob", email: "bob@example.com" })).toString("base64url");
const forgedToken = `${parts[0]}.${tamperedPayload}.${parts[2]}`;
const forgedVerified = verifyJwt(forgedToken, testSecret);
if (forgedVerified === null) {
  console.log("  ✅ PASS: Forged/tampered JWT is strictly rejected");
} else {
  console.error("  ❌ FAIL: Forged JWT was accepted!", forgedVerified);
  process.exit(1);
}

// 3. Invalid Signature Key
const wrongKeyVerified = verifyJwt(validToken, "wrong_secret_key_that_does_not_match_at_all");
if (wrongKeyVerified === null) {
  console.log("  ✅ PASS: Token with incorrect signing key is strictly rejected");
} else {
  console.error("  ❌ FAIL: Token verified with wrong key!", wrongKeyVerified);
  process.exit(1);
}

// 4. Expired Token
const expiredToken = signJwt({ sub: "usr_charlie", exp: Math.floor(Date.now() / 1000) - 60 }, testSecret);
const expiredVerified = verifyJwt(expiredToken, testSecret);
if (expiredVerified === null) {
  console.log("  ✅ PASS: Expired JWT is rejected");
} else {
  console.error("  ❌ FAIL: Expired JWT was accepted!", expiredVerified);
  process.exit(1);
}

console.log("\n🎉 All Cryptographic JWT Security Tests Passed!\n");
