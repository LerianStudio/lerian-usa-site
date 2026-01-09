import { describe, it, expect, beforeAll } from "vitest";
import { appRouter } from "./routers";
import { getDb } from "./db";
import { users } from "../drizzle/schema";
import { eq } from "drizzle-orm";

describe("Users Management", () => {
  let testUserId: number;
  const testOpenId = `test-user-${Date.now()}`;

  beforeAll(async () => {
    const db = await getDb();
    if (!db) throw new Error("Database not available");

    // Create a test user
    const result = await db.insert(users).values({
      openId: testOpenId,
      name: "Test User",
      email: "test@example.com",
      role: "user",
      jobTitle: "Developer",
      company: "Test Company",
      linkedin: "https://linkedin.com/in/test",
      profileCompleted: true,
    });

    testUserId = Number(result[0].insertId);
  });

  it("should get all users (admin only)", async () => {
    const caller = appRouter.createCaller({
      user: {
        id: 1,
        openId: "admin-openid",
        name: "Admin",
        email: "admin@test.com",
        role: "admin",
        profileCompleted: true,
        createdAt: new Date(),
        updatedAt: new Date(),
        lastSignedIn: new Date(),
      },
      req: {} as any,
      res: {} as any,
    });

    const result = await caller.users.getAll();
    expect(Array.isArray(result)).toBe(true);
    expect(result.length).toBeGreaterThan(0);
  });

  it("should update user information", async () => {
    const caller = appRouter.createCaller({
      user: {
        id: 1,
        openId: "admin-openid",
        name: "Admin",
        email: "admin@test.com",
        role: "admin",
        profileCompleted: true,
        createdAt: new Date(),
        updatedAt: new Date(),
        lastSignedIn: new Date(),
      },
      req: {} as any,
      res: {} as any,
    });

    const result = await caller.users.update({
      id: testUserId,
      jobTitle: "Senior Developer",
      company: "Updated Company",
    });

    expect(result.success).toBe(true);

    // Verify the update
    const db = await getDb();
    if (!db) throw new Error("Database not available");
    
    const updated = await db.select().from(users).where(eq(users.id, testUserId)).limit(1);
    expect(updated[0].jobTitle).toBe("Senior Developer");
    expect(updated[0].company).toBe("Updated Company");
  });

  it("should not allow non-admin to access user management", async () => {
    const caller = appRouter.createCaller({
      user: {
        id: 2,
        openId: "user-openid",
        name: "Regular User",
        email: "user@test.com",
        role: "user",
        profileCompleted: true,
        createdAt: new Date(),
        updatedAt: new Date(),
        lastSignedIn: new Date(),
      },
      req: {} as any,
      res: {} as any,
    });

    await expect(caller.users.getAll()).rejects.toThrow();
  });

  it("should delete user", async () => {
    const caller = appRouter.createCaller({
      user: {
        id: 1,
        openId: "admin-openid",
        name: "Admin",
        email: "admin@test.com",
        role: "admin",
        profileCompleted: true,
        createdAt: new Date(),
        updatedAt: new Date(),
        lastSignedIn: new Date(),
      },
      req: {} as any,
      res: {} as any,
    });

    const result = await caller.users.delete({ id: testUserId });
    expect(result.success).toBe(true);

    // Verify soft deletion: user still in DB but marked as deleted
    const db = await getDb();
    if (!db) throw new Error("Database not available");
    
    const deleted = await db.select().from(users).where(eq(users.id, testUserId)).limit(1);
    expect(deleted.length).toBe(1); // User still in DB
    expect(deleted[0].deletedAt).not.toBeNull(); // Marked as deleted
  });
});

describe("Profile Onboarding", () => {
  const testOpenId = `onboarding-test-${Date.now()}`;

  it("should update profile and mark as completed", async () => {
    const db = await getDb();
    if (!db) throw new Error("Database not available");

    // Create user without completed profile
    const result = await db.insert(users).values({
      openId: testOpenId,
      name: "New User",
      email: "newuser@example.com",
      role: "user",
      profileCompleted: false,
    });

    const userId = Number(result[0].insertId);

    const caller = appRouter.createCaller({
      user: {
        id: userId,
        openId: testOpenId,
        name: "New User",
        email: "newuser@example.com",
        role: "user",
        profileCompleted: false,
        createdAt: new Date(),
        updatedAt: new Date(),
        lastSignedIn: new Date(),
      },
      req: {} as any,
      res: {} as any,
    });

    const updateResult = await caller.auth.updateProfile({
      jobTitle: "Product Manager",
      company: "Startup Inc",
      linkedin: "https://linkedin.com/in/newuser",
    });

    expect(updateResult.success).toBe(true);

    // Verify profile is marked as completed
    const updated = await db.select().from(users).where(eq(users.id, userId)).limit(1);
    expect(updated[0].profileCompleted).toBe(true);
    expect(updated[0].jobTitle).toBe("Product Manager");

    // Cleanup
    await db.delete(users).where(eq(users.id, userId));
  });

  it("should require jobTitle for profile completion", async () => {
    const caller = appRouter.createCaller({
      user: {
        id: 1,
        openId: "test-openid",
        name: "Test User",
        email: "test@example.com",
        role: "user",
        profileCompleted: false,
        createdAt: new Date(),
        updatedAt: new Date(),
        lastSignedIn: new Date(),
      },
      req: {} as any,
      res: {} as any,
    });

    await expect(
      caller.auth.updateProfile({
        jobTitle: "", // Empty job title
        company: "Company",
      })
    ).rejects.toThrow();
  });
});
