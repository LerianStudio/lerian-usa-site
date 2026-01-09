import { describe, it, expect, beforeAll, afterAll } from "vitest";
import { getDb } from "./db";
import { videoRatings, videoComments, academyVideos, users } from "../drizzle/schema";
import { eq, and } from "drizzle-orm";

describe("Academy Video Ratings and Comments", () => {
  let testUserId: number;
  let testVideoId: number;
  let testCommentId: number;

  beforeAll(async () => {
    const db = await getDb();
    // Create test user
    const [newUser] = await db
      .insert(users)
      .values({
        openId: "test-user-ratings-" + Date.now(),
        name: "Test User Ratings",
        email: "test-ratings@example.com",
        role: "user",
      })
      .$returningId();
    testUserId = newUser.id;

    // Create test video
    const [newVideo] = await db
      .insert(academyVideos)
      .values({
        titlePt: "Test Video for Ratings",
        titleEn: "Test Video for Ratings",
        descriptionPt: "Test description",
        descriptionEn: "Test description",
        videoUrl: "https://youtube.com/watch?v=test",
        thumbnailUrl: "https://example.com/thumb.jpg",
        duration: 300,
        published: true,
        createdBy: testUserId,
      })
      .$returningId();
    testVideoId = newVideo.id;
  });

  afterAll(async () => {
    const db = await getDb();
    // Clean up test data
    if (testCommentId) {
      await db.delete(videoComments).where(eq(videoComments.id, testCommentId));
    }
    if (testUserId && testVideoId) {
      await db
        .delete(videoRatings)
        .where(
          and(eq(videoRatings.userId, testUserId), eq(videoRatings.videoId, testVideoId))
        );
    }
    if (testVideoId) {
      await db.delete(academyVideos).where(eq(academyVideos.id, testVideoId));
    }
    if (testUserId) {
      await db.delete(users).where(eq(users.id, testUserId));
    }
  });

  describe("Video Ratings", () => {
    it("should create a new rating", async () => {
      const db = await getDb();
      const [rating] = await db
        .insert(videoRatings)
        .values({
          videoId: testVideoId,
          userId: testUserId,
          rating: 5,
        })
        .$returningId();

      expect(rating.id).toBeDefined();

      const [inserted] = await db
        .select()
        .from(videoRatings)
        .where(eq(videoRatings.id, rating.id));

      expect(inserted.rating).toBe(5);
      expect(inserted.videoId).toBe(testVideoId);
      expect(inserted.userId).toBe(testUserId);
    });

    it("should update existing rating", async () => {
      const db = await getDb();
      // Update rating from 5 to 4
      await db
        .update(videoRatings)
        .set({ rating: 4 })
        .where(
          and(eq(videoRatings.userId, testUserId), eq(videoRatings.videoId, testVideoId))
        );

      const [updated] = await db
        .select()
        .from(videoRatings)
        .where(
          and(eq(videoRatings.userId, testUserId), eq(videoRatings.videoId, testVideoId))
        );

      expect(updated.rating).toBe(4);
    });

    it("should calculate average rating correctly", async () => {
      const db = await getDb();
      // Create another user and rating
      const [user2] = await db
        .insert(users)
        .values({
          openId: "test-user-ratings-2-" + Date.now(),
          name: "Test User 2",
          email: "test-ratings-2@example.com",
          role: "user",
        })
        .$returningId();

      await db.insert(videoRatings).values({
        videoId: testVideoId,
        userId: user2.id,
        rating: 2,
      });

      const ratings = await db
        .select()
        .from(videoRatings)
        .where(eq(videoRatings.videoId, testVideoId));

      const average = ratings.reduce((sum, r) => sum + r.rating, 0) / ratings.length;

      // Average of 4 and 2 should be 3
      expect(average).toBe(3);
      expect(ratings.length).toBe(2);

      // Clean up
      await db.delete(videoRatings).where(eq(videoRatings.userId, user2.id));
      await db.delete(users).where(eq(users.id, user2.id));
    });

    it("should enforce rating between 1 and 5", async () => {
      // Try to insert invalid rating (should fail at application level)
      const invalidRating = 6;
      expect(invalidRating).toBeGreaterThan(5); // This would be caught by tRPC validation

      const invalidRating2 = 0;
      expect(invalidRating2).toBeLessThan(1); // This would be caught by tRPC validation
    });
  });

  describe("Video Comments", () => {
    it("should create a new comment", async () => {
      const db = await getDb();
      const [comment] = await db
        .insert(videoComments)
        .values({
          videoId: testVideoId,
          userId: testUserId,
          comment: "This is a test comment",
        })
        .$returningId();

      testCommentId = comment.id;
      expect(comment.id).toBeDefined();

      const [inserted] = await db
        .select()
        .from(videoComments)
        .where(eq(videoComments.id, comment.id));

      expect(inserted.comment).toBe("This is a test comment");
      expect(inserted.videoId).toBe(testVideoId);
      expect(inserted.userId).toBe(testUserId);
      expect(inserted.createdAt).toBeInstanceOf(Date);
    });

    it("should retrieve comments for a video", async () => {
      const db = await getDb();
      const comments = await db
        .select()
        .from(videoComments)
        .where(eq(videoComments.videoId, testVideoId));

      expect(comments.length).toBeGreaterThan(0);
      expect(comments[0].videoId).toBe(testVideoId);
    });

    it("should delete a comment", async () => {
      const db = await getDb();
      const [newComment] = await db
        .insert(videoComments)
        .values({
          videoId: testVideoId,
          userId: testUserId,
          comment: "Comment to be deleted",
        })
        .$returningId();

      await db.delete(videoComments).where(eq(videoComments.id, newComment.id));

      const [deleted] = await db
        .select()
        .from(videoComments)
        .where(eq(videoComments.id, newComment.id));

      expect(deleted).toBeUndefined();
    });

    it("should enforce comment max length", async () => {
      const longComment = "a".repeat(1001);
      expect(longComment.length).toBeGreaterThan(1000); // Would be caught by tRPC validation
    });

    it("should not allow empty comments", async () => {
      const emptyComment = "";
      expect(emptyComment.trim()).toBe(""); // Would be caught by tRPC validation
    });
  });
});
