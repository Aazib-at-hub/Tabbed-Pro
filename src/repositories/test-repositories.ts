/**
 * test-repositories.ts — Comprehensive Verification Suite for Repository Pattern
 *
 * Runs self-contained unit tests across all domain repositories without requiring an active server.
 * Run with: npx tsx src/repositories/test-repositories.ts
 */

import { createLocalRepositories, localStore } from "./local/index.js";
import { db } from "../lib/db.js";

async function runTests() {
  console.log("🧪 Starting Repository System Verification Suite...\n");
  let passed = 0;
  let failed = 0;

  function assert(condition: boolean, testName: string) {
    if (condition) {
      console.log(`  ✅ PASS: ${testName}`);
      passed++;
    } else {
      console.error(`  ❌ FAIL: ${testName}`);
      failed++;
    }
  }

  // Reset store to pristine state
  localStore.reset();
  const repos = createLocalRepositories();
  const testUserId = "usr_test_999";

  console.log("--- 1. Testing User Repository ---");
  const newUser = await repos.users.create({
    id: testUserId,
    email: "test.user@example.com",
    name: "Test User",
    emailVerified: true,
    isOnboarded: true,
    subscriptionTier: "free",
    subscriptionStatus: "active",
  });
  assert(newUser.id === testUserId, "User creation returns correct ID");

  const foundUser = await repos.users.findById(testUserId);
  assert(foundUser?.email === "test.user@example.com", "Find user by ID");

  const subStatus = await repos.users.getSubscriptionStatus(testUserId);
  assert(subStatus.tier === "free" && subStatus.maxPrompts === 10, "Free tier max prompts is 10");

  await repos.users.updateSubscription(testUserId, { subscriptionTier: "pro" });
  const proSubStatus = await repos.users.getSubscriptionStatus(testUserId);
  assert(
    proSubStatus.tier === "pro" && proSubStatus.maxPrompts === Infinity,
    "Upgraded to Pro tier with unlimited prompts",
  );

  console.log("\n--- 2. Testing AI Profile Repository ---");
  const profile = await repos.profiles.upsert(testUserId, {
    profession: "Senior AI Engineer",
    techStack: "PyTorch, TypeScript",
    responseStyle: "Precise & Direct",
  });
  assert(profile.profession === "Senior AI Engineer", "Profile upserted with profession");

  const retrievedProfile = await repos.profiles.findByUserId(testUserId);
  assert(retrievedProfile?.techStack === "PyTorch, TypeScript", "Find profile by user ID");

  console.log("\n--- 3. Testing Folder Repository ---");
  const folder = await repos.folders.create(testUserId, {
    name: "AI Agents",
    icon: "🤖",
    color: "#6366f1",
  });
  assert(folder.name === "AI Agents", "Folder created successfully");

  const foldersList = await repos.folders.listByUserId(testUserId);
  assert(
    foldersList.some((f) => f.id === folder.id),
    "Folder present in user folder list",
  );

  console.log("\n--- 4. Testing Prompt Repository ---");
  const prompt = await repos.prompts.create(testUserId, {
    title: "Autonomous Agent Architecture",
    rawContent: "design an autonomous multi-agent system with supervisor and worker nodes",
    category: "Coding",
    mode: "coding",
    tags: ["agents", "architecture"],
    folderId: folder.id,
  });
  assert(prompt.title === "Autonomous Agent Architecture", "Prompt created with correct title");
  assert((prompt.score?.overall ?? 0) > 0, "Prompt auto-scored by scoring engine");
  assert(
    Array.isArray(prompt.insights) && prompt.insights.length > 0,
    "Prompt insights auto-generated",
  );

  // Filter test
  const filtered = await repos.prompts.list(testUserId, { folderId: folder.id });
  assert(filtered.length === 1 && filtered[0].id === prompt.id, "Prompt filtered by folder ID");

  // Favorite toggle test
  const toggled = await repos.prompts.toggleFavorite(prompt.id);
  assert(toggled?.isFavorite === true, "Prompt favorite toggled to true");

  // Folder delete prompt unlinking test
  await repos.folders.delete(folder.id);
  const promptAfterFolderDelete = await repos.prompts.findById(prompt.id);
  assert(promptAfterFolderDelete?.folderId === undefined, "Folder deletion unlinks prompt cleanly");

  // Optimize test
  const optimized = await repos.prompts.optimize(prompt.id, "coding");
  assert(Boolean(optimized?.optimizedContent?.includes("ROLE")), "Prompt optimized successfully");

  console.log("\n--- 5. Testing Template Repository ---");
  const templates = await repos.templates.list();
  assert(templates.length > 0, "Built-in templates retrieved");

  const firstTpl = templates[0];
  const vaultPrompt = await repos.templates.saveToVault(testUserId, firstTpl.id);
  assert(
    vaultPrompt !== null && vaultPrompt.title === firstTpl.title,
    "Template saved to Prompt Vault",
  );

  console.log("\n--- 6. Testing Workspace Repository ---");
  const wsp = await repos.workspaces.create(testUserId, {
    name: "Enterprise Research Labs",
    plan: "teams",
  });
  assert(wsp.name === "Enterprise Research Labs", "Workspace created");

  const members = await repos.workspaces.getMembers(wsp.id);
  assert(members.length === 1 && members[0].role === "admin", "Creator is admin of workspace");

  const invite = await repos.workspaces.inviteMember(wsp.id, "researcher@example.com", "editor");
  assert(
    invite.email === "researcher@example.com" && invite.status === "pending",
    "Teammate invited",
  );

  const teamPrompt = await repos.workspaces.createPrompt(wsp.id, testUserId, {
    title: "Zero-Shot RAG Evaluation Protocol",
    rawContent: "Write an enterprise benchmark for comparing vector database precision and recall.",
    category: "Research",
  });
  assert(teamPrompt.workspaceId === wsp.id, "Team prompt created within workspace");

  const wspAnalytics = await repos.workspaces.getAnalytics(wsp.id);
  assert(wspAnalytics.totalPrompts >= 1, "Workspace analytics computes prompt counts");

  console.log("\n--- 7. Testing Analytics Repository ---");
  const userStats = await repos.analytics.getUserStats(testUserId);
  assert(userStats.totalPrompts >= 2, "User stats computes total prompts count");

  console.log("\n--- 8. Testing db.ts Facade Backward Compatibility ---");
  const legacyFolders = db.getFolders(testUserId);
  assert(Array.isArray(legacyFolders), "db.getFolders backward compatible");
  const legacyStats = db.getStats(testUserId);
  assert(typeof legacyStats.totalPrompts === "number", "db.getStats backward compatible");

  console.log(`\n========================================`);
  console.log(`Test Results: ${passed} Passed, ${failed} Failed`);
  console.log(`========================================\n`);

  if (failed > 0) {
    process.exit(1);
  }
}

runTests().catch((err) => {
  console.error("Test execution failed:", err);
  process.exit(1);
});
