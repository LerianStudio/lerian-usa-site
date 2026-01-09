import { describe, it, expect, beforeAll } from "vitest";
import { eq } from "drizzle-orm";
import { getDb } from "./db";
import { blogPosts, blogPostRatings, blogPostComments, users } from "../drizzle/schema";
import * as db from "./db";

describe("Blog Post Ratings", () => {
  let testPostId: number;
  let testUserId: number;

  beforeAll(async () => {
    const database = await getDb();
    if (!database) throw new Error("Database not available");

    // Create test user
    const [user] = await database
      .insert(users)
      .values({
        name: "Test User",
        email: `test-blog-${Date.now()}@example.com`,
        openId: `test-blog-openid-${Date.now()}`,
        role: "user",
      })
      .$returningId();
    testUserId = user.id;

    // Create test blog post
    const [post] = await database
      .insert(blogPosts)
      .values({
        titlePt: "Test Post",
        titleEn: "Test Post",
        contentPt: "Test content",
        contentEn: "Test content",
        excerptPt: "Test excerpt",
        excerptEn: "Test excerpt",
        slug: `test-post-${Date.now()}`,
        categoryId: 1,
        published: true,
        createdBy: testUserId,
      })
      .$returningId();
    testPostId = post.id;
  });

  it("should create a new rating", async () => {
    await db.rateBlogPost(testPostId, testUserId, 5);

    const database = await getDb();
    if (!database) throw new Error("Database not available");

    const ratings = await database
      .select()
      .from(blogPostRatings)
      .where(eq(blogPostRatings.postId, testPostId));

    expect(ratings.length).toBe(1);
    expect(ratings[0].rating).toBe(5);
  });

  it("should update existing rating", async () => {
    await db.rateBlogPost(testPostId, testUserId, 4);

    const database = await getDb();
    if (!database) throw new Error("Database not available");

    const ratings = await database
      .select()
      .from(blogPostRatings)
      .where(eq(blogPostRatings.postId, testPostId));

    expect(ratings.length).toBe(1);
    expect(ratings[0].rating).toBe(4);
  });

  it("should calculate average rating correctly", async () => {
    const ratingData = await db.getBlogPostRating(testPostId);

    expect(ratingData.count).toBe(1);
    expect(ratingData.average).toBe(4);
  });

  it("should validate rating is between 1 and 5", async () => {
    await expect(db.rateBlogPost(testPostId, testUserId, 6)).rejects.toThrow();
    await expect(db.rateBlogPost(testPostId, testUserId, 0)).rejects.toThrow();
  });
});

describe("Blog Post Comments", () => {
  let testPostId: number;
  let testUserId: number;
  let testCommentId: number;

  beforeAll(async () => {
    const database = await getDb();
    if (!database) throw new Error("Database not available");

    // Create test user
    const [user] = await database
      .insert(users)
      .values({
        name: "Test Commenter",
        email: `test-commenter-${Date.now()}@example.com`,
        openId: `test-commenter-openid-${Date.now()}`,
        role: "user",
      })
      .$returningId();
    testUserId = user.id;

    // Create test blog post
    const [post] = await database
      .insert(blogPosts)
      .values({
        titlePt: "Test Post for Comments",
        titleEn: "Test Post for Comments",
        contentPt: "Test content",
        contentEn: "Test content",
        excerptPt: "Test excerpt",
        excerptEn: "Test excerpt",
        slug: `test-post-comments-${Date.now()}`,
        categoryId: 1,
        published: true,
        createdBy: testUserId,
      })
      .$returningId();
    testPostId = post.id;
  });

  it("should create a new comment", async () => {
    const commentId = await db.addBlogPostComment(testPostId, testUserId, "Great post!");
    testCommentId = commentId;

    const database = await getDb();
    if (!database) throw new Error("Database not available");

    const comments = await database
      .select()
      .from(blogPostComments)
      .where(eq(blogPostComments.postId, testPostId));

    expect(comments.length).toBe(1);
    expect(comments[0].comment).toBe("Great post!");
  });

  it("should retrieve comments for a post", async () => {
    const comments = await db.getBlogPostComments(testPostId);

    expect(comments.length).toBe(1);
    expect(comments[0].comment).toBe("Great post!");
    expect(comments[0].userName).toBe("Test Commenter");
  });

  it("should delete a comment", async () => {
    await db.deleteBlogPostComment(testCommentId);

    const comments = await db.getBlogPostComments(testPostId);
    expect(comments.length).toBe(0);
  });

  it("should validate comment max length", async () => {
    const longComment = "a".repeat(1001);
    await expect(db.addBlogPostComment(testPostId, testUserId, longComment)).rejects.toThrow();
  });

  it("should not allow empty comments", async () => {
    await expect(db.addBlogPostComment(testPostId, testUserId, "")).rejects.toThrow();
    await expect(db.addBlogPostComment(testPostId, testUserId, "   ")).rejects.toThrow();
  });
});
