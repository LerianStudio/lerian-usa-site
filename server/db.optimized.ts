// ✅ HIGH-6 FIX: Optimized queries to avoid N+1 problem
// These functions replace the original getPublishedBlogPosts and getPublishedAcademyVideos
// ✅ MEDIUM-8: Added pagination support

import { getDb } from "./db";
import { eq, desc, and, inArray, sql } from "drizzle-orm";
import { blogPosts, blogPostRatings, academyVideos, videoRatings } from "../drizzle/schema";

/**
 * Get published blog posts with ratings - OPTIMIZED VERSION with PAGINATION
 * Avoids N+1 query by batch loading all ratings in a single query
 * @param categoryId - Optional category filter
 * @param page - Page number (1-indexed), defaults to 1
 * @param limit - Items per page, defaults to 10
 * @returns { posts: PostWithRating[], total: number }
 */
export async function getPublishedBlogPostsOptimized(
  categoryId?: number, 
  page: number = 1, 
  limit: number = 10
) {
  const db = await getDb();
  if (!db) return { posts: [], total: 0 };
  
  const offset = (page - 1) * limit;
  const conditions = categoryId 
    ? and(eq(blogPosts.published, true), eq(blogPosts.categoryId, categoryId))
    : eq(blogPosts.published, true);
  
  // Get total count first
  const countResult = await db
    .select({ count: sql<number>`count(*)` })
    .from(blogPosts)
    .where(conditions);
  const total = Number(countResult[0]?.count) || 0;
  
  // Query 1: Get paginated published posts
  const posts = await db
    .select()
    .from(blogPosts)
    .where(conditions)
    .orderBy(desc(blogPosts.publishedAt))
    .limit(limit)
    .offset(offset);
  
  if (posts.length === 0) return { posts: [], total };
  
  // Query 2: Batch load ALL ratings for these posts in a single query (not N queries!)
  const postIds = posts.map(p => p.id);
  const allRatings = await db
    .select()
    .from(blogPostRatings)
    .where(inArray(blogPostRatings.postId, postIds));
  
  // Create rating map for O(1) lookup
  const ratingMap = new Map<number, { average: number; count: number }>();
  postIds.forEach(id => {
    const ratings = allRatings.filter(r => r.postId === id);
    if (ratings.length === 0) {
      ratingMap.set(id, { average: 0, count: 0 });
    } else {
      const sum = ratings.reduce((acc, r) => acc + r.rating, 0);
      const average = sum / ratings.length;
      ratingMap.set(id, { average, count: ratings.length });
    }
  });
  
  // Combine posts with ratings
  const postsWithRatings = posts.map(post => ({
    ...post,
    averageRating: ratingMap.get(post.id)?.average || 0,
    ratingCount: ratingMap.get(post.id)?.count || 0,
  }));
  
  return { posts: postsWithRatings, total };
}

/**
 * Get published academy videos with ratings - OPTIMIZED VERSION with PAGINATION
 * Avoids N+1 query by batch loading all ratings in a single query
 * @param categoryId - Optional category filter
 * @param page - Page number (1-indexed), defaults to 1
 * @param limit - Items per page, defaults to 10
 * @returns { videos: VideoWithRating[], total: number }
 */
export async function getPublishedAcademyVideosOptimized(
  categoryId?: number,
  page: number = 1,
  limit: number = 10
) {
  const db = await getDb();
  if (!db) return { videos: [], total: 0 };
  
  const offset = (page - 1) * limit;
  const conditions = categoryId
    ? and(eq(academyVideos.published, true), eq(academyVideos.categoryId, categoryId))
    : eq(academyVideos.published, true);
  
  // Get total count first
  const countResult = await db
    .select({ count: sql<number>`count(*)` })
    .from(academyVideos)
    .where(conditions);
  const total = Number(countResult[0]?.count) || 0;
  
  // Query 1: Get paginated published videos
  const videos = await db
    .select()
    .from(academyVideos)
    .where(conditions)
    .orderBy(desc(academyVideos.createdAt))
    .limit(limit)
    .offset(offset);
  
  if (videos.length === 0) return { videos: [], total };
  
  // Query 2: Batch load ALL ratings for these videos in a single query (not N queries!)
  const videoIds = videos.map(v => v.id);
  const allRatings = await db
    .select()
    .from(videoRatings)
    .where(inArray(videoRatings.videoId, videoIds));
  
  // Create rating map for O(1) lookup
  const ratingMap = new Map<number, { average: number; count: number }>();
  videoIds.forEach(id => {
    const ratings = allRatings.filter(r => r.videoId === id);
    if (ratings.length === 0) {
      ratingMap.set(id, { average: 0, count: 0 });
    } else {
      const sum = ratings.reduce((acc, r) => acc + r.rating, 0);
      const average = sum / ratings.length;
      ratingMap.set(id, { average, count: ratings.length });
    }
  });
  
  // Combine videos with ratings
  const videosWithRatings = videos.map(video => ({
    ...video,
    averageRating: ratingMap.get(video.id)?.average || 0,
    ratingCount: ratingMap.get(video.id)?.count || 0,
  }));
  
  return { videos: videosWithRatings, total };
}
