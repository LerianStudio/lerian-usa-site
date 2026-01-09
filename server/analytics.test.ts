import { describe, it, expect, beforeAll } from "vitest";
import { getDb, getUserAnalytics } from "./db";
import { users, videoComments, blogPostComments } from "../drizzle/schema";
import { like } from "drizzle-orm";

describe("User Analytics", () => {
  beforeAll(async () => {
    const db = await getDb();
    if (!db) throw new Error("Database not available");

    // Clean up test data
    await db.delete(videoComments);
    await db.delete(blogPostComments);
    await db.delete(users).where(like(users.email, "%test-analytics%"));
  });

  it("should return analytics with zero users", async () => {
    const analytics = await getUserAnalytics();
    expect(analytics).toBeDefined();
    expect(analytics?.totalUsers).toBeGreaterThanOrEqual(0);
    expect(analytics?.profileCompletionRate).toBeGreaterThanOrEqual(0);
    expect(analytics?.profileCompletionRate).toBeLessThanOrEqual(100);
  });

  it("should calculate profile completion rate correctly", async () => {
    const db = await getDb();
    if (!db) throw new Error("Database not available");

    // Create test users
    await db.insert(users).values([
      {
        openId: "test-analytics-1",
        name: "Test User 1",
        email: "test-analytics-1@example.com",
        jobTitle: "Developer",
        profileCompleted: true,
      },
      {
        openId: "test-analytics-2",
        name: "Test User 2",
        email: "test-analytics-2@example.com",
        jobTitle: null,
        profileCompleted: false,
      },
    ]);

    const analytics = await getUserAnalytics();
    expect(analytics).toBeDefined();
    
    // Should have at least our 2 test users
    expect(analytics?.totalUsers).toBeGreaterThanOrEqual(2);
    
    // Profile completion rate should be between 0 and 100
    expect(analytics?.profileCompletionRate).toBeGreaterThanOrEqual(0);
    expect(analytics?.profileCompletionRate).toBeLessThanOrEqual(100);

    // Clean up
    await db.delete(users).where(like(users.email, "%test-analytics%"));
  });

  it("should return top job titles", async () => {
    const db = await getDb();
    if (!db) throw new Error("Database not available");

    // Create test users with job titles
    await db.insert(users).values([
      {
        openId: "test-analytics-job-1",
        name: "Developer 1",
        email: "test-analytics-job-1@example.com",
        jobTitle: "Software Engineer",
        profileCompleted: true,
      },
      {
        openId: "test-analytics-job-2",
        name: "Developer 2",
        email: "test-analytics-job-2@example.com",
        jobTitle: "Software Engineer",
        profileCompleted: true,
      },
      {
        openId: "test-analytics-job-3",
        name: "Product Manager",
        email: "test-analytics-job-3@example.com",
        jobTitle: "Product Manager",
        profileCompleted: true,
      },
    ]);

    const analytics = await getUserAnalytics();
    expect(analytics).toBeDefined();
    expect(analytics?.topJobTitles).toBeDefined();
    expect(Array.isArray(analytics?.topJobTitles)).toBe(true);
    
    // Should have at most 5 job titles
    expect(analytics?.topJobTitles.length).toBeLessThanOrEqual(5);

    // Clean up
    await db.delete(users).where(like(users.email, "%test-analytics-job%"));
  });

  it("should return top companies", async () => {
    const db = await getDb();
    if (!db) throw new Error("Database not available");

    // Create test users with companies
    await db.insert(users).values([
      {
        openId: "test-analytics-company-1",
        name: "Employee 1",
        email: "test-analytics-company-1@example.com",
        company: "Tech Corp",
        profileCompleted: true,
      },
      {
        openId: "test-analytics-company-2",
        name: "Employee 2",
        email: "test-analytics-company-2@example.com",
        company: "Tech Corp",
        profileCompleted: true,
      },
    ]);

    const analytics = await getUserAnalytics();
    expect(analytics).toBeDefined();
    expect(analytics?.topCompanies).toBeDefined();
    expect(Array.isArray(analytics?.topCompanies)).toBe(true);
    
    // Should have at most 10 companies
    expect(analytics?.topCompanies.length).toBeLessThanOrEqual(10);

    // Clean up
    await db.delete(users).where(like(users.email, "%test-analytics-company%"));
  });

  it("should return registrations by month", async () => {
    const analytics = await getUserAnalytics();
    expect(analytics).toBeDefined();
    expect(analytics?.registrationsByMonth).toBeDefined();
    expect(typeof analytics?.registrationsByMonth).toBe("object");
  });

  it("should return most active users", async () => {
    const analytics = await getUserAnalytics();
    expect(analytics).toBeDefined();
    expect(analytics?.mostActiveUsers).toBeDefined();
    expect(Array.isArray(analytics?.mostActiveUsers)).toBe(true);
    
    // Should have at most 10 active users
    expect(analytics?.mostActiveUsers.length).toBeLessThanOrEqual(10);
  });
});
