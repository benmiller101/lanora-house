import { db } from "./server/db";
import { users } from "./shared/schema";

async function createTestUser() {
  try {
    console.log("Creating test user...");
    
    const testUser = {
      id: "test_user_001",
      email: "test@example.com",
      username: "testuser",
      firstName: "Test",
      lastName: "User",
      profileImageUrl: null,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    await db.insert(users).values(testUser).onConflictDoNothing();
    
    console.log("✅ Test user created successfully!");
    console.log("📧 Email: test@example.com");
    console.log("👤 Name: Test User");
    console.log("🔑 Use guest login with this email to access the account");
    
  } catch (error) {
    console.error("❌ Error creating test user:", error);
  }
}

createTestUser();