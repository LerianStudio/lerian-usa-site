import { eq, desc, and, gte, lte, like, or, asc, isNull } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import { sql } from "drizzle-orm";
import { 
  InsertUser, 
  users, 
  events, 
  InsertEvent,
  blogCategories,
  InsertBlogCategory,
  blogPosts,
  InsertBlogPost,
  academyVideos,
  InsertAcademyVideo,
  academyCategories,
  InsertAcademyCategory,
  videoRatings,
  InsertVideoRating,
  videoComments,
  InsertVideoComment,
  blogPostRatings,
  InsertBlogPostRating,
  blogPostComments,
  InsertBlogPostComment,
  blogPostCategories
} from "../drizzle/schema";
import { ENV } from './_core/env';
import { format } from 'date-fns';
import { dbLogger } from './_core/logger';

let _db: ReturnType<typeof drizzle> | null = null;

export async function getDb() {
  if (!_db && process.env.DATABASE_URL) {
    try {
      _db = drizzle(process.env.DATABASE_URL);
    } catch (error) {
      dbLogger.warn({ err: error }, "Failed to connect to database");
      _db = null;
    }
  }
  return _db;
}

// ===== USER HELPERS =====

export async function upsertUser(user: InsertUser): Promise<void> {
  if (!user.openId) {
    throw new Error("User openId is required for upsert");
  }

  const db = await getDb();
  if (!db) {
    dbLogger.warn("Cannot upsert user: database not available");
    return;
  }

  try {
    const values: InsertUser = {
      openId: user.openId,
    };
    const updateSet: Record<string, unknown> = {};

    const textFields = ["name", "email", "loginMethod", "jobTitle", "company", "linkedin"] as const;
    type TextField = (typeof textFields)[number];

    const assignNullable = (field: TextField) => {
      const value = user[field];
      if (value === undefined) return;
      const normalized = value ?? null;
      values[field] = normalized;
      updateSet[field] = normalized;
    };

    textFields.forEach(assignNullable);

    if (user.lastSignedIn !== undefined) {
      values.lastSignedIn = user.lastSignedIn;
      updateSet.lastSignedIn = user.lastSignedIn;
    }
    if (user.role !== undefined) {
      values.role = user.role;
      updateSet.role = user.role;
    } else if (user.openId === ENV.ownerOpenId) {
      values.role = 'admin';
      updateSet.role = 'admin';
    }
    if (user.profileCompleted !== undefined) {
      values.profileCompleted = user.profileCompleted;
      updateSet.profileCompleted = user.profileCompleted;
    }

    if (!values.lastSignedIn) {
      values.lastSignedIn = new Date();
    }

    if (Object.keys(updateSet).length === 0) {
      updateSet.lastSignedIn = new Date();
    }

    await db.insert(users).values(values).onDuplicateKeyUpdate({
      set: updateSet,
    });
  } catch (error) {
    dbLogger.error({ err: error }, "Failed to upsert user");
    throw error;
  }
}

export async function getUserByOpenId(openId: string) {
  const db = await getDb();
  if (!db) {
    dbLogger.warn("Cannot get user: database not available");
    return undefined;
  }

  const result = await db.select().from(users).where(
    and(eq(users.openId, openId), isNull(users.deletedAt))
  ).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function getAllUsers() {
  const db = await getDb();
  if (!db) return [];
  return await db.select().from(users).where(isNull(users.deletedAt)).orderBy(desc(users.createdAt));
}

export async function updateUserById(id: number, data: Partial<InsertUser>) {
  const db = await getDb();
  if (!db) return;
  await db.update(users).set(data).where(eq(users.id, id));
}

export async function deleteUserById(id: number) {
  const db = await getDb();
  if (!db) return;
  
  // ✅ Soft delete: mark user as deleted instead of removing from database
  // This preserves data for audit trail and allows recovery if needed
  await db.update(users).set({ deletedAt: new Date() }).where(eq(users.id, id));
}

// ===== EVENT HELPERS =====

export async function getUpcomingEvents() {
  const db = await getDb();
  if (!db) return [];
  
  const now = new Date();
  const result = await db
    .select()
    .from(events)
    .where(gte(events.eventDate, now))
    .orderBy(events.eventDate)
    .limit(10);
  
  return result;
}

export async function getAllEvents() {
  const db = await getDb();
  if (!db) return [];
  
  const result = await db.select().from(events).orderBy(desc(events.eventDate));
  return result;
}

export async function getEventById(id: number) {
  const db = await getDb();
  if (!db) return undefined;
  
  const result = await db.select().from(events).where(eq(events.id, id)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function createEvent(event: InsertEvent) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const result = await db.insert(events).values(event);
  return result;
}

export async function updateEvent(id: number, event: Partial<InsertEvent>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  await db.update(events).set(event).where(eq(events.id, id));
}

export async function deleteEvent(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  await db.delete(events).where(eq(events.id, id));
}

// ===== BLOG CATEGORY HELPERS =====

export async function getAllBlogCategories() {
  const db = await getDb();
  if (!db) return [];
  
  // Buscar categorias com contagem de posts publicados
  const result = await db
    .select({
      id: blogCategories.id,
      namePt: blogCategories.namePt,
      nameEn: blogCategories.nameEn,
      slug: blogCategories.slug,
      postCount: sql<number>`(
        SELECT COUNT(*) FROM ${blogPosts} 
        WHERE ${blogPosts.categoryId} = ${blogCategories.id} 
        AND ${blogPosts.published} = true
      )`,
    })
    .from(blogCategories)
    .orderBy(blogCategories.namePt);
  return result;
}

export async function createBlogCategory(category: InsertBlogCategory) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const result = await db.insert(blogCategories).values(category);
  return result;
}

export async function updateBlogCategory(id: number, category: Partial<InsertBlogCategory>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  await db.update(blogCategories).set(category).where(eq(blogCategories.id, id));
}

// ✅ MEDIUM-3: Função auxiliar para contar posts por categoria
export async function getBlogPostCountByCategory(categoryId: number): Promise<number> {
  const db = await getDb();
  if (!db) return 0;

  const result = await db
    .select({ count: sql<number>`COUNT(*)` })
    .from(blogPosts)
    .where(eq(blogPosts.categoryId, categoryId));

  return result[0]?.count || 0;
}

export async function deleteBlogCategory(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  // ✅ MEDIUM-3: Verificar se categoria está em uso
  const postCount = await getBlogPostCountByCategory(id);
  if (postCount > 0) {
    throw new Error(`Não é possível deletar categoria com ${postCount} post(s) associado(s). Remova ou mova os posts primeiro.`);
  }
  
  await db.delete(blogCategories).where(eq(blogCategories.id, id));
}

export async function getBlogCategoryBySlug(slug: string) {
  const db = await getDb();
  if (!db) return null;
  
  const result = await db
    .select()
    .from(blogCategories)
    .where(eq(blogCategories.slug, slug))
    .limit(1);
  
  return result[0] || null;
}

// ===== BLOG POST HELPERS =====

// REMOVED: getPublishedBlogPosts - was N+1 query, use getPublishedBlogPostsOptimized instead

export async function getAllBlogPosts() {
  const db = await getDb();
  if (!db) return [];
  
  const result = await db.select().from(blogPosts).orderBy(desc(blogPosts.createdAt));
  return result;
}

export async function getBlogPostBySlug(slug: string) {
  const db = await getDb();
  if (!db) return undefined;
  
  const result = await db.select().from(blogPosts).where(eq(blogPosts.slug, slug)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function createBlogPost(post: InsertBlogPost) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const result = await db.insert(blogPosts).values(post);
  // Return the inserted post with ID
  const insertedId = (result as any).insertId;
  const insertedPost = await db.select().from(blogPosts).where(eq(blogPosts.id, Number(insertedId))).limit(1);
  return insertedPost[0];
}

export async function updateBlogPost(id: number, post: Partial<InsertBlogPost>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  await db.update(blogPosts).set(post).where(eq(blogPosts.id, id));
}

export async function deleteBlogPost(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  // ✅ Use transaction to delete post and related data atomically
  await db.transaction(async (tx) => {
    await tx.delete(blogPostRatings).where(eq(blogPostRatings.postId, id));
    await tx.delete(blogPostComments).where(eq(blogPostComments.postId, id));
    await tx.delete(blogPostCategories).where(eq(blogPostCategories.postId, id));
    await tx.delete(blogPosts).where(eq(blogPosts.id, id));
  });
}

// ===== ACADEMY VIDEO HELPERS =====

// REMOVED: getPublishedAcademyVideos - was N+1 query, use getPublishedAcademyVideosOptimized instead

export async function getAllAcademyVideos() {
  const db = await getDb();
  if (!db) return [];
  
  const result = await db.select().from(academyVideos).orderBy(desc(academyVideos.createdAt));
  return result;
}

export async function getAcademyVideoById(id: number) {
  const db = await getDb();
  if (!db) return undefined;
  
  const result = await db.select().from(academyVideos).where(eq(academyVideos.id, id)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function createAcademyVideo(video: InsertAcademyVideo) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const result = await db.insert(academyVideos).values(video);
  // Return the inserted video with ID
  const insertedId = (result as any).insertId;
  const insertedVideo = await db.select().from(academyVideos).where(eq(academyVideos.id, Number(insertedId))).limit(1);
  return insertedVideo[0];
}

export async function updateAcademyVideo(id: number, video: Partial<InsertAcademyVideo>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  await db.update(academyVideos).set(video).where(eq(academyVideos.id, id));
}

export async function deleteAcademyVideo(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  // ✅ Use transaction to delete video and related data atomically
  await db.transaction(async (tx) => {
    await tx.delete(videoRatings).where(eq(videoRatings.videoId, id));
    await tx.delete(videoComments).where(eq(videoComments.videoId, id));
    await tx.delete(academyVideos).where(eq(academyVideos.id, id));
  });
}


// ===== GLOBAL SEARCH HELPERS =====

export async function globalSearch(query: string, language: "pt" | "en") {
  const db = await getDb();
  if (!db) {
    return { events: [], blogPosts: [], videos: [] };
  }

  const searchTerm = `%${query}%`;

  // Search events
  const eventResults = await db
    .select()
    .from(events)
    .where(
      language === "pt"
        ? or(like(events.titlePt, searchTerm), like(events.descriptionPt, searchTerm))
        : or(like(events.titleEn, searchTerm), like(events.descriptionEn, searchTerm))
    )
    .limit(5);

  // Search blog posts (only published)
  const blogResults = await db
    .select()
    .from(blogPosts)
    .where(
      and(
        eq(blogPosts.published, true),
        language === "pt"
          ? or(like(blogPosts.titlePt, searchTerm), like(blogPosts.contentPt, searchTerm))
          : or(like(blogPosts.titleEn, searchTerm), like(blogPosts.contentEn, searchTerm))
      )
    )
    .limit(5);

  // Search academy videos (only published)
  const videoResults = await db
    .select()
    .from(academyVideos)
    .where(
      and(
        eq(academyVideos.published, true),
        language === "pt"
          ? or(like(academyVideos.titlePt, searchTerm), like(academyVideos.descriptionPt, searchTerm))
          : or(like(academyVideos.titleEn, searchTerm), like(academyVideos.descriptionEn, searchTerm))
      )
    )
    .limit(5);

  return {
    events: eventResults,
    blogPosts: blogResults,
    videos: videoResults,
  };
}

// ===== VIDEO RATING HELPERS =====

export async function upsertVideoRating(rating: InsertVideoRating): Promise<void> {
  const db = await getDb();
  if (!db) {
    dbLogger.warn(" Cannot upsert video rating: database not available");
    return;
  }

  // ✅ MEDIUM-10: Validar range de rating
  if (rating.rating < 1 || rating.rating > 5) {
    throw new Error("Rating must be between 1 and 5");
  }

  // ✅ MEDIUM-10: Verificar se vídeo existe e está publicado
  const [video] = await db
    .select({ id: academyVideos.id, published: academyVideos.published })
    .from(academyVideos)
    .where(eq(academyVideos.id, rating.videoId))
    .limit(1);

  if (!video) {
    throw new Error("Video not found");
  }

  if (!video.published) {
    throw new Error("Cannot rate unpublished video");
  }

  try {
    // Check if user already rated this video
    const existing = await db
      .select()
      .from(videoRatings)
      .where(and(eq(videoRatings.videoId, rating.videoId), eq(videoRatings.userId, rating.userId)))
      .limit(1);

    if (existing.length > 0) {
      // Update existing rating
      await db
        .update(videoRatings)
        .set({ rating: rating.rating, updatedAt: new Date() })
        .where(and(eq(videoRatings.videoId, rating.videoId), eq(videoRatings.userId, rating.userId)));
    } else {
      // Insert new rating
      await db.insert(videoRatings).values(rating);
    }
  } catch (error) {
    dbLogger.error({ err: error }, " Error upserting video rating:");
    throw error;
  }
}

export async function getVideoRating(videoId: number): Promise<{ average: number; count: number }> {
  const db = await getDb();
  if (!db) {
    return { average: 0, count: 0 };
  }

  try {
    const ratings = await db
      .select()
      .from(videoRatings)
      .where(eq(videoRatings.videoId, videoId));

    if (ratings.length === 0) {
      return { average: 0, count: 0 };
    }

    const sum = ratings.reduce((acc, r) => acc + r.rating, 0);
    const average = sum / ratings.length;

    return { average: Math.round(average * 10) / 10, count: ratings.length };
  } catch (error) {
    dbLogger.error({ err: error }, " Error getting video rating:");
    return { average: 0, count: 0 };
  }
}

export async function getUserVideoRating(videoId: number, userId: number): Promise<number | null> {
  const db = await getDb();
  if (!db) {
    return null;
  }

  try {
    const result = await db
      .select()
      .from(videoRatings)
      .where(and(eq(videoRatings.videoId, videoId), eq(videoRatings.userId, userId)))
      .limit(1);

    return result.length > 0 ? result[0].rating : null;
  } catch (error) {
    dbLogger.error({ err: error }, " Error getting user video rating:");
    return null;
  }
}

// ===== VIDEO COMMENT HELPERS =====

export async function addVideoComment(comment: InsertVideoComment): Promise<void> {
  const db = await getDb();
  if (!db) {
    throw new Error("Database not available");
  }

  // ✅ MEDIUM-10: Validar comentário não vazio
  if (!comment.comment.trim()) {
    throw new Error("Comment cannot be empty");
  }

  // ✅ MEDIUM-10: Verificar se vídeo existe e está publicado
  const [video] = await db
    .select({ id: academyVideos.id, published: academyVideos.published })
    .from(academyVideos)
    .where(eq(academyVideos.id, comment.videoId))
    .limit(1);

  if (!video) {
    throw new Error("Video not found");
  }

  if (!video.published) {
    throw new Error("Cannot comment on unpublished video");
  }

  try {
    await db.insert(videoComments).values({
      ...comment,
      comment: comment.comment.trim(),
    });
  } catch (error) {
    dbLogger.error({ err: error }, " Error adding video comment:");
    throw error;
  }
}

export async function getVideoComments(videoId: number, orderBy: 'desc' | 'asc' = 'desc') {
  const db = await getDb();
  if (!db) {
    return [];
  }

  try {
    const orderFn = orderBy === 'desc' ? desc : asc;
    
    const comments = await db
      .select({
        id: videoComments.id,
        comment: videoComments.comment,
        createdAt: videoComments.createdAt,
        userId: videoComments.userId,
        userName: users.name,
      })
      .from(videoComments)
      .leftJoin(users, and(eq(videoComments.userId, users.id), isNull(users.deletedAt)))
      .where(eq(videoComments.videoId, videoId))
      .orderBy(orderFn(videoComments.createdAt));

    return comments;
  } catch (error) {
    dbLogger.error({ err: error }, " Error getting video comments:");
    return [];
  }
}

export async function deleteVideoComment(commentId: number): Promise<void> {
  const db = await getDb();
  if (!db) {
    dbLogger.warn(" Cannot delete video comment: database not available");
    return;
  }

  try {
    await db.delete(videoComments).where(eq(videoComments.id, commentId));
  } catch (error) {
    dbLogger.error({ err: error }, " Error deleting video comment:");
    throw error;
  }
}

// ===== BLOG POST RATING HELPERS =====

export async function rateBlogPost(postId: number, userId: number, rating: number): Promise<void> {
  const db = await getDb();
  if (!db) {
    throw new Error("Database not available");
  }

  if (rating < 1 || rating > 5) {
    throw new Error("Rating must be between 1 and 5");
  }

  // ✅ MEDIUM-10: Verificar se post existe e está publicado
  const [post] = await db
    .select({ id: blogPosts.id, published: blogPosts.published })
    .from(blogPosts)
    .where(eq(blogPosts.id, postId))
    .limit(1);

  if (!post) {
    throw new Error("Blog post not found");
  }

  if (!post.published) {
    throw new Error("Cannot rate unpublished post");
  }

  try {
    // Check if user already rated this post
    const existing = await db
      .select()
      .from(blogPostRatings)
      .where(and(eq(blogPostRatings.postId, postId), eq(blogPostRatings.userId, userId)))
      .limit(1);

    if (existing.length > 0) {
      // Update existing rating
      await db
        .update(blogPostRatings)
        .set({ rating, updatedAt: new Date() })
        .where(and(eq(blogPostRatings.postId, postId), eq(blogPostRatings.userId, userId)));
    } else {
      // Insert new rating
      await db.insert(blogPostRatings).values({
        postId,
        userId,
        rating,
      });
    }
  } catch (error) {
    dbLogger.error({ err: error }, " Error rating blog post:");
    throw error;
  }
}

export async function getBlogPostRating(postId: number): Promise<{ average: number; count: number }> {
  const db = await getDb();
  if (!db) {
    return { average: 0, count: 0 };
  }

  try {
    const ratings = await db
      .select()
      .from(blogPostRatings)
      .where(eq(blogPostRatings.postId, postId));

    if (ratings.length === 0) {
      return { average: 0, count: 0 };
    }

    const sum = ratings.reduce((acc, r) => acc + r.rating, 0);
    const average = sum / ratings.length;

    return { average, count: ratings.length };
  } catch (error) {
    dbLogger.error({ err: error }, " Error getting blog post rating:");
    return { average: 0, count: 0 };
  }
}

export async function getUserBlogPostRating(postId: number, userId: number): Promise<number | null> {
  const db = await getDb();
  if (!db) {
    return null;
  }

  try {
    const result = await db
      .select()
      .from(blogPostRatings)
      .where(and(eq(blogPostRatings.postId, postId), eq(blogPostRatings.userId, userId)))
      .limit(1);

    return result.length > 0 ? result[0].rating : null;
  } catch (error) {
    dbLogger.error({ err: error }, " Error getting user blog post rating:");
    return null;
  }
}

// ===== BLOG POST COMMENT HELPERS =====

export async function addBlogPostComment(postId: number, userId: number, comment: string): Promise<number> {
  const db = await getDb();
  if (!db) {
    throw new Error("Database not available");
  }

  if (!comment.trim()) {
    throw new Error("Comment cannot be empty");
  }

  if (comment.length > 1000) {
    throw new Error("Comment cannot exceed 1000 characters");
  }

  // ✅ MEDIUM-10: Verificar se post existe e está publicado
  const [post] = await db
    .select({ id: blogPosts.id, published: blogPosts.published })
    .from(blogPosts)
    .where(eq(blogPosts.id, postId))
    .limit(1);

  if (!post) {
    throw new Error("Blog post not found");
  }

  if (!post.published) {
    throw new Error("Cannot comment on unpublished post");
  }

  try {
    const [result] = await db.insert(blogPostComments).values({
      postId,
      userId,
      comment: comment.trim(),
    }).$returningId();
    return result.id;
  } catch (error) {
    dbLogger.error({ err: error }, " Error adding blog post comment:");
    throw error;
  }
}

export async function getBlogPostComments(postId: number, orderBy: 'desc' | 'asc' = 'desc') {
  const db = await getDb();
  if (!db) {
    return [];
  }

  try {
    const orderFn = orderBy === 'desc' ? desc : asc;
    
    const comments = await db
      .select({
        id: blogPostComments.id,
        comment: blogPostComments.comment,
        createdAt: blogPostComments.createdAt,
        userId: blogPostComments.userId,
        userName: users.name,
      })
      .from(blogPostComments)
      .leftJoin(users, and(eq(blogPostComments.userId, users.id), isNull(users.deletedAt)))
      .where(eq(blogPostComments.postId, postId))
      .orderBy(orderFn(blogPostComments.createdAt));

    return comments;
  } catch (error) {
    dbLogger.error({ err: error }, " Error getting blog post comments:");
    return [];
  }
}

export async function deleteBlogPostComment(commentId: number): Promise<void> {
  const db = await getDb();
  if (!db) {
    dbLogger.warn(" Cannot delete blog post comment: database not available");
    return;
  }

  try {
    await db.delete(blogPostComments).where(eq(blogPostComments.id, commentId));
  } catch (error) {
    dbLogger.error({ err: error }, " Error deleting blog post comment:");
    throw error;
  }
}


export async function getUserAnalytics() {
  const db = await getDb();
  if (!db) return null;

  // ✅ 1. Basic counts using SQL aggregations
  // ✅ MEDIUM-11: Filtrar usuários deletados
  const counts = await db
    .select({
      totalUsers: sql<number>`COUNT(*)`,
      completedProfiles: sql<number>`SUM(CASE WHEN profileCompleted = true THEN 1 ELSE 0 END)`,
    })
    .from(users)
    .where(isNull(users.deletedAt));

  const totalUsers = counts[0].totalUsers;
  const completedProfiles = counts[0].completedProfiles || 0;
  const profileCompletionRate = totalUsers > 0 ? (completedProfiles / totalUsers) * 100 : 0;

  // ✅ 2. Registrations by month (last 6 months) using SQL GROUP BY
  // ✅ MEDIUM-11: Filtrar usuários deletados
  const registrationsByMonth = await db
    .select({
      month: sql<string>`ANY_VALUE(DATE_FORMAT(createdAt, '%Y-%m'))`,
      count: sql<number>`COUNT(*)`,
    })
    .from(users)
    .where(and(sql`createdAt >= DATE_SUB(NOW(), INTERVAL 6 MONTH)`, isNull(users.deletedAt)))
    .groupBy(sql`DATE_FORMAT(createdAt, '%Y-%m')`)
    .orderBy(sql`DATE_FORMAT(createdAt, '%Y-%m')`);

  const registrationsByMonthMap = Object.fromEntries(
    registrationsByMonth.map(r => [r.month, r.count])
  );

  // ✅ 3. Top job titles using SQL GROUP BY
  // ✅ MEDIUM-11: Filtrar usuários deletados
  const topJobTitles = await db
    .select({
      title: sql<string>`ANY_VALUE(jobTitle)`,
      count: sql<number>`COUNT(*)`,
    })
    .from(users)
    .where(and(sql`jobTitle IS NOT NULL AND jobTitle != ''`, isNull(users.deletedAt)))
    .groupBy(users.jobTitle)
    .orderBy(sql`COUNT(*) DESC`)
    .limit(5);

  // ✅ 4. Top companies using SQL GROUP BY
  // ✅ MEDIUM-11: Filtrar usuários deletados
  const topCompanies = await db
    .select({
      company: sql<string>`ANY_VALUE(company)`,
      count: sql<number>`COUNT(*)`,
    })
    .from(users)
    .where(and(sql`company IS NOT NULL AND company != ''`, isNull(users.deletedAt)))
    .groupBy(users.company)
    .orderBy(sql`COUNT(*) DESC`)
    .limit(10);

  // ✅ 5. Most active users using SQL subqueries
  // ✅ MEDIUM-11: Filtrar usuários deletados
  const mostActiveUsers = await db
    .select({
      id: users.id,
      name: users.name,
      email: users.email,
      activityCount: sql<number>`
        COALESCE((SELECT COUNT(*) FROM videoComments WHERE userId = users.id), 0) +
        COALESCE((SELECT COUNT(*) FROM blogPostComments WHERE userId = users.id), 0)
      `,
    })
    .from(users)
    .where(isNull(users.deletedAt))
    .orderBy(sql`(
      COALESCE((SELECT COUNT(*) FROM videoComments WHERE userId = users.id), 0) +
      COALESCE((SELECT COUNT(*) FROM blogPostComments WHERE userId = users.id), 0)
    ) DESC`)
    .limit(10);

  return {
    totalUsers,
    profileCompletionRate: Math.round(profileCompletionRate),
    registrationsByMonth: registrationsByMonthMap,
    topJobTitles: topJobTitles.map(t => ({
      title: t.title || 'Não especificado',
      count: t.count,
    })),
    topCompanies: topCompanies.map(c => ({
      company: c.company || 'Não especificado',
      count: c.count,
    })),
    mostActiveUsers: mostActiveUsers.map(u => ({
      id: u.id,
      name: u.name || 'Unknown',
      email: u.email || '',
      activityCount: u.activityCount || 0,
    })),
  };
}




// ===== ACADEMY CATEGORIES HELPERS =====

export async function getAcademyCategories() {
  const db = await getDb();
  if (!db) return [];

  try {
    // Get categories first
    const categoriesResult = await db.select().from(academyCategories);
    
    // Get video counts per category
    const videoCounts = await db
      .select({
        categoryId: academyVideos.categoryId,
        count: sql<number>`COUNT(*)`
      })
      .from(academyVideos)
      .where(eq(academyVideos.published, true))
      .groupBy(academyVideos.categoryId);
    
    // Create a map for quick lookup
    const countMap = new Map(videoCounts.map(vc => [vc.categoryId, vc.count]));
    
    // Combine categories with counts
    return categoriesResult.map(cat => ({
      ...cat,
      videoCount: countMap.get(cat.id) || 0
    }));
  } catch (error) {
    dbLogger.error({ err: error }, " Error getting academy categories:");
    return [];
  }
}

export async function getVideosByCategory(categoryId: number) {
  const db = await getDb();
  if (!db) return [];

  try {
    return await db
      .select()
      .from(academyVideos)
      .where(and(
        eq(academyVideos.published, true),
        eq(academyVideos.categoryId, categoryId)
      ));
  } catch (error) {
    dbLogger.error({ err: error }, " Error getting videos by category:");
    return [];
  }
}

// ===== BLOG CATEGORIES HELPERS =====

export async function getBlogPostsByCategory(categoryId: number) {
  const db = await getDb();
  if (!db) return [];

  try {
    const postIds = await db
      .select({ postId: blogPostCategories.postId })
      .from(blogPostCategories)
      .where(eq(blogPostCategories.categoryId, categoryId));

    if (postIds.length === 0) return [];

    return await db
      .select()
      .from(blogPosts)
      .where(and(
        eq(blogPosts.published, true),
        sql`${blogPosts.id} IN (${sql.join(postIds.map(p => p.postId))})`
      ));
  } catch (error) {
    dbLogger.error({ err: error }, " Error getting blog posts by category:");
    return [];
  }
}

export async function getBlogPostWithCategories(postId: number) {
  const db = await getDb();
  if (!db) return null;

  try {
    const post = await db
      .select()
      .from(blogPosts)
      .where(eq(blogPosts.id, postId))
      .limit(1);

    if (post.length === 0) return null;

    const categories = await db
      .select()
      .from(blogPostCategories)
      .innerJoin(blogCategories, eq(blogPostCategories.categoryId, blogCategories.id))
      .where(eq(blogPostCategories.postId, postId));

    return {
      ...post[0],
      categories: categories.map(c => c.blogCategories),
    };
  } catch (error) {
    dbLogger.error({ err: error }, " Error getting blog post with categories:");
    return null;
  }
}

export async function addBlogPostCategories(postId: number, categoryIds: number[]) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  try {
    // ✅ Use transaction to ensure atomicity
    await db.transaction(async (tx) => {
      // Remove existing categories
      await tx.delete(blogPostCategories).where(eq(blogPostCategories.postId, postId));

      // Add new categories
      if (categoryIds.length > 0) {
        await tx.insert(blogPostCategories).values(
          categoryIds.map(categoryId => ({
            postId,
            categoryId,
          }))
        );
      }
    });
  } catch (error) {
    dbLogger.error({ err: error }, " Error adding blog post categories:");
    throw error;
  }
}


// ===== ACADEMY CATEGORY HELPERS =====

export async function createAcademyCategory(category: InsertAcademyCategory) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const result = await db.insert(academyCategories).values(category);
  return result;
}

export async function updateAcademyCategory(id: number, category: Partial<InsertAcademyCategory>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  await db.update(academyCategories).set(category).where(eq(academyCategories.id, id));
}

// ✅ MEDIUM-3: Função auxiliar para contar vídeos por categoria
export async function getAcademyVideoCountByCategory(categoryId: number): Promise<number> {
  const db = await getDb();
  if (!db) return 0;

  const result = await db
    .select({ count: sql<number>`COUNT(*)` })
    .from(academyVideos)
    .where(eq(academyVideos.categoryId, categoryId));

  return result[0]?.count || 0;
}

export async function deleteAcademyCategory(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  // ✅ MEDIUM-3: Verificar se categoria está em uso
  const videoCount = await getAcademyVideoCountByCategory(id);
  if (videoCount > 0) {
    throw new Error(`Não é possível deletar categoria com ${videoCount} vídeo(s) associado(s). Remova ou mova os vídeos primeiro.`);
  }
  
  await db.delete(academyCategories).where(eq(academyCategories.id, id));
}

export async function getAcademyCategoryBySlug(slug: string) {
  const db = await getDb();
  if (!db) return null;
  
  const result = await db
    .select()
    .from(academyCategories)
    .where(eq(academyCategories.slug, slug))
    .limit(1);
  
  return result[0] || null;
}


// ===== ANALYTICS HELPERS =====

export async function getBlogAnalytics() {
  const db = await getDb();
  if (!db) return null;

  try {
    // Total posts
    const allPosts = await db.select().from(blogPosts);
    const totalPosts = allPosts.length;

    // Posts by category
    const postsByCategory = await db
      .select({ 
        categoryId: blogPostCategories.categoryId,
        categoryName: blogCategories.namePt,
        count: sql<number>`count(*)` 
      })
      .from(blogPostCategories)
      .innerJoin(blogCategories, eq(blogPostCategories.categoryId, blogCategories.id))
      .groupBy(blogPostCategories.categoryId, blogCategories.namePt);

    // Average rating
    const avgRating = await db
      .select({ avg: sql<number>`avg(${blogPostRatings.rating})` })
      .from(blogPostRatings);
    const averageRating = avgRating[0]?.avg || 0;

    // Most rated post
    const mostRatedPost = await db
      .select({
        id: blogPosts.id,
        title: blogPosts.titlePt,
        avgRating: sql<number>`avg(${blogPostRatings.rating})`
      })
      .from(blogPosts)
      .leftJoin(blogPostRatings, eq(blogPosts.id, blogPostRatings.postId))
      .groupBy(blogPosts.id, blogPosts.titlePt)
      .orderBy(desc(sql<number>`avg(${blogPostRatings.rating})`))  
      .limit(1);

    // Least rated post
    const leastRatedPost = await db
      .select({
        id: blogPosts.id,
        title: blogPosts.titlePt,
        avgRating: sql<number>`avg(${blogPostRatings.rating})`
      })
      .from(blogPosts)
      .leftJoin(blogPostRatings, eq(blogPosts.id, blogPostRatings.postId))
      .groupBy(blogPosts.id, blogPosts.titlePt)
      .orderBy(asc(sql<number>`avg(${blogPostRatings.rating})`))  
      .limit(1);

    // Total comments
    const totalComments = await db
      .select({ count: sql<number>`count(*)` })
      .from(blogPostComments);

    // Average comments per post
    const avgCommentsPerPost = totalPosts > 0 ? (Number(totalComments[0]?.count) || 0) / totalPosts : 0;

    // Most commented post
    const mostCommentedPost = await db
      .select({
        id: blogPosts.id,
        title: blogPosts.titlePt,
        commentCount: sql<number>`count(${blogPostComments.id})`
      })
      .from(blogPosts)
      .leftJoin(blogPostComments, eq(blogPosts.id, blogPostComments.postId))
      .groupBy(blogPosts.id, blogPosts.titlePt)
      .orderBy(desc(sql<number>`count(${blogPostComments.id})`))  
      .limit(1);

    // Engagement rate
    const totalRatings = await db
      .select({ count: sql<number>`count(*)` })
      .from(blogPostRatings);
    const engagementRate = totalPosts > 0 ? ((Number(totalComments[0]?.count) || 0) + (Number(totalRatings[0]?.count) || 0)) / totalPosts : 0;

    return {
      totalPosts,
      postsByCategory: postsByCategory.map(p => ({ 
        category: p.categoryName, 
        count: Number(p.count) 
      })),
      averageRating: Math.round(averageRating * 10) / 10,
      mostRatedPost: mostRatedPost[0] ? {
        title: mostRatedPost[0].title,
        rating: Math.round(mostRatedPost[0].avgRating * 10) / 10
      } : null,
      leastRatedPost: leastRatedPost[0] ? {
        title: leastRatedPost[0].title,
        rating: Math.round(leastRatedPost[0].avgRating * 10) / 10
      } : null,
      totalComments: Number(totalComments[0]?.count) || 0,
      averageCommentsPerPost: Math.round(avgCommentsPerPost * 10) / 10,
      mostCommentedPost: mostCommentedPost[0] ? {
        title: mostCommentedPost[0].title,
        commentCount: Number(mostCommentedPost[0].commentCount)
      } : null,
      engagementRate: Math.round(engagementRate * 10) / 10,
    };
  } catch (error) {
    dbLogger.error({ err: error }, " Error getting blog analytics:");
    return null;
  }
}

export async function getAcademyAnalytics() {
  const db = await getDb();
  if (!db) return null;

  try {
    // Total videos
    const allVideos = await db.select().from(academyVideos);
    const totalVideos = allVideos.length;

    // Videos by category
    const videosByCategory = await db
      .select({ 
        categoryId: academyVideos.categoryId,
        categoryName: academyCategories.namePt,
        count: sql<number>`count(*)` 
      })
      .from(academyVideos)
      .leftJoin(academyCategories, eq(academyVideos.categoryId, academyCategories.id))
      .groupBy(academyVideos.categoryId, academyCategories.namePt);

    // Average rating
    const avgRating = await db
      .select({ avg: sql<number>`avg(${videoRatings.rating})` })
      .from(videoRatings);
    const averageRating = avgRating[0]?.avg || 0;

    // Most rated video
    const mostRatedVideo = await db
      .select({
        id: academyVideos.id,
        title: academyVideos.titlePt,
        avgRating: sql<number>`avg(${videoRatings.rating})`
      })
      .from(academyVideos)
      .leftJoin(videoRatings, eq(academyVideos.id, videoRatings.videoId))
      .groupBy(academyVideos.id, academyVideos.titlePt)
      .orderBy(desc(sql<number>`avg(${videoRatings.rating})`))  
      .limit(1);

    // Least rated video
    const leastRatedVideo = await db
      .select({
        id: academyVideos.id,
        title: academyVideos.titlePt,
        avgRating: sql<number>`avg(${videoRatings.rating})`
      })
      .from(academyVideos)
      .leftJoin(videoRatings, eq(academyVideos.id, videoRatings.videoId))
      .groupBy(academyVideos.id, academyVideos.titlePt)
      .orderBy(asc(sql<number>`avg(${videoRatings.rating})`))  
      .limit(1);

    // Total comments
    const totalComments = await db
      .select({ count: sql<number>`count(*)` })
      .from(videoComments);

    // Average comments per video
    const avgCommentsPerVideo = totalVideos > 0 ? (Number(totalComments[0]?.count) || 0) / totalVideos : 0;

    // Most commented video
    const mostCommentedVideo = await db
      .select({
        id: academyVideos.id,
        title: academyVideos.titlePt,
        commentCount: sql<number>`count(${videoComments.id})`
      })
      .from(academyVideos)
      .leftJoin(videoComments, eq(academyVideos.id, videoComments.videoId))
      .groupBy(academyVideos.id, academyVideos.titlePt)
      .orderBy(desc(sql<number>`count(${videoComments.id})`))  
      .limit(1);

    // Engagement rate
    const totalRatings = await db
      .select({ count: sql<number>`count(*)` })
      .from(videoRatings);
    const engagementRate = totalVideos > 0 ? ((Number(totalComments[0]?.count) || 0) + (Number(totalRatings[0]?.count) || 0)) / totalVideos : 0;

    return {
      totalVideos,
      videosByCategory: videosByCategory.map(v => ({ 
        category: v.categoryName, 
        count: Number(v.count) 
      })),
      averageRating: Math.round(averageRating * 10) / 10,
      mostRatedVideo: mostRatedVideo[0] ? {
        title: mostRatedVideo[0].title,
        rating: Math.round(mostRatedVideo[0].avgRating * 10) / 10
      } : null,
      leastRatedVideo: leastRatedVideo[0] ? {
        title: leastRatedVideo[0].title,
        rating: Math.round(leastRatedVideo[0].avgRating * 10) / 10
      } : null,
      totalComments: Number(totalComments[0]?.count) || 0,
      averageCommentsPerVideo: Math.round(avgCommentsPerVideo * 10) / 10,
      mostCommentedVideo: mostCommentedVideo[0] ? {
        title: mostCommentedVideo[0].title,
        commentCount: Number(mostCommentedVideo[0].commentCount)
      } : null,
      engagementRate: Math.round(engagementRate * 10) / 10,
    };
  } catch (error) {
    dbLogger.error({ err: error }, " Error getting academy analytics:");
    return null;
  }
}
