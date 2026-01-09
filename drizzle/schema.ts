import { int, mysqlEnum, mysqlTable, text, timestamp, varchar, boolean, decimal, index } from "drizzle-orm/mysql-core";

/**
 * Core user table backing auth flow.
 * Extended with professional information for Academy registration.
 */
export const users = mysqlTable("users", {
  id: int("id").autoincrement().primaryKey(),
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: mysqlEnum("role", ["user", "admin"]).default("user").notNull(),
  // Professional information fields
  jobTitle: varchar("jobTitle", { length: 255 }),
  company: varchar("company", { length: 255 }),
  linkedin: varchar("linkedin", { length: 500 }),
  profileCompleted: boolean("profileCompleted").default(false).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
  deletedAt: timestamp("deletedAt"), // Soft delete timestamp
}, (table) => ({
  // Índices para otimizar queries
  roleIdx: index("idx_users_role").on(table.role),
}));

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

/**
 * Events table for calendar display
 */
// Event types enum
export const eventTypeEnum = mysqlEnum("eventType", ["webinar", "workshop", "conference", "networking", "other"]);

export const events = mysqlTable("events", {
  id: int("id").autoincrement().primaryKey(),
  titlePt: varchar("titlePt", { length: 255 }).notNull(),
  titleEn: varchar("titleEn", { length: 255 }).notNull(),
  descriptionPt: text("descriptionPt"),
  descriptionEn: text("descriptionEn"),
  eventType: mysqlEnum("eventType", ["webinar", "workshop", "conference", "networking", "other"]).default("other").notNull(),
  location: varchar("location", { length: 500 }),
  imageUrl: varchar("imageUrl", { length: 1000 }),
  eventUrl: varchar("eventUrl", { length: 1000 }),
  eventDate: timestamp("eventDate").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  createdBy: int("createdBy")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }), // ✅ CRITICAL-2 FIX
}, (table) => ({
  // Índices para otimizar queries
  eventDateIdx: index("idx_events_eventDate").on(table.eventDate),
}));

export type Event = typeof events.$inferSelect;
export type InsertEvent = typeof events.$inferInsert;

/**
 * Blog categories for filtering
 */
export const blogCategories = mysqlTable("blogCategories", {
  id: int("id").autoincrement().primaryKey(),
  namePt: varchar("namePt", { length: 100 }).notNull(),
  nameEn: varchar("nameEn", { length: 100 }).notNull(),
  slug: varchar("slug", { length: 100 }).notNull().unique(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type BlogCategory = typeof blogCategories.$inferSelect;
export type InsertBlogCategory = typeof blogCategories.$inferInsert;

/**
 * Academy categories for filtering
 */
export const academyCategories = mysqlTable("academyCategories", {
  id: int("id").autoincrement().primaryKey(),
  namePt: varchar("namePt", { length: 100 }).notNull(),
  nameEn: varchar("nameEn", { length: 100 }).notNull(),
  slug: varchar("slug", { length: 100 }).notNull().unique(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type AcademyCategory = typeof academyCategories.$inferSelect;
export type InsertAcademyCategory = typeof academyCategories.$inferInsert;

/**
 * Blog post to categories relationship (many-to-many)
 */
export const blogPostCategories = mysqlTable("blogPostCategories", {
  id: int("id").autoincrement().primaryKey(),
  postId: int("postId")
    .notNull()
    .references(() => blogPosts.id, { onDelete: "cascade" }), // ✅ CRITICAL-2 FIX
  categoryId: int("categoryId")
    .notNull()
    .references(() => blogCategories.id, { onDelete: "cascade" }), // ✅ CRITICAL-2 FIX
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type BlogPostCategory = typeof blogPostCategories.$inferSelect;
export type InsertBlogPostCategory = typeof blogPostCategories.$inferInsert;



/**
 * Blog posts table
 */
export const blogPosts = mysqlTable("blogPosts", {
  id: int("id").autoincrement().primaryKey(),
  titlePt: varchar("titlePt", { length: 500 }).notNull(),
  titleEn: varchar("titleEn", { length: 500 }).notNull(),
  contentPt: text("contentPt").notNull(),
  contentEn: text("contentEn").notNull(),
  excerptPt: text("excerptPt"),
  excerptEn: text("excerptEn"),
  slug: varchar("slug", { length: 500 }).notNull().unique(),
  // ✅ MEDIUM-4: Removido .notNull() para permitir SET NULL quando categoria for deletada
  categoryId: int("categoryId")
    .references(() => blogCategories.id, { onDelete: "set null" }),
  coverImageUrl: varchar("coverImageUrl", { length: 1000 }),
  authorName: varchar("authorName", { length: 255 }),
  authorLinkedIn: varchar("authorLinkedIn", { length: 500 }),
  published: boolean("published").default(false).notNull(),
  publishedAt: timestamp("publishedAt"),
  views: int("views").default(0).notNull(),
  averageRating: decimal("averageRating", { precision: 3, scale: 2 }).default("0.00"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  createdBy: int("createdBy")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }), // ✅ CRITICAL-2 FIX
}, (table) => ({
  // Índices para otimizar queries frequentes
  publishedIdx: index("idx_blog_published").on(table.published),
  publishedAtIdx: index("idx_blog_publishedAt").on(table.publishedAt),
  categoryIdIdx: index("idx_blog_categoryId").on(table.categoryId),
  createdByIdx: index("idx_blog_createdBy").on(table.createdBy),
  publishedPublishedAtIdx: index("idx_blog_published_publishedAt").on(table.published, table.publishedAt),
}));

export type BlogPost = typeof blogPosts.$inferSelect;
export type InsertBlogPost = typeof blogPosts.$inferInsert;

/**
 * Academy videos table
 */
export const academyVideos = mysqlTable("academyVideos", {
  id: int("id").autoincrement().primaryKey(),
  titlePt: varchar("titlePt", { length: 500 }).notNull(),
  titleEn: varchar("titleEn", { length: 500 }).notNull(),
  descriptionPt: text("descriptionPt"),
  descriptionEn: text("descriptionEn"),
  videoUrl: varchar("videoUrl", { length: 1000 }).notNull(),
  thumbnailUrl: varchar("thumbnailUrl", { length: 1000 }),
  duration: int("duration"), // Duration in seconds
  // ✅ MEDIUM-4: categoryId já é nullable, consistente com SET NULL
  categoryId: int("categoryId")
    .references(() => academyCategories.id, { onDelete: "set null" }),
  published: boolean("published").default(false).notNull(),
  views: int("views").default(0).notNull(),
  averageRating: decimal("averageRating", { precision: 3, scale: 2 }).default("0.00"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  createdBy: int("createdBy")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }), // ✅ CRITICAL-2 FIX
}, (table) => ({
  // Índices para otimizar queries frequentes
  publishedIdx: index("idx_academy_published").on(table.published),
  categoryIdIdx: index("idx_academy_categoryId").on(table.categoryId),
  createdByIdx: index("idx_academy_createdBy").on(table.createdBy),
  publishedCategoryIdx: index("idx_academy_published_categoryId").on(table.published, table.categoryId),
}));

export type AcademyVideo = typeof academyVideos.$inferSelect;
export type InsertAcademyVideo = typeof academyVideos.$inferInsert;

/**
 * Video ratings table - stores user ratings (0-5 stars) for academy videos
 */
export const videoRatings = mysqlTable("videoRatings", {
  id: int("id").autoincrement().primaryKey(),
  videoId: int("videoId")
    .notNull()
    .references(() => academyVideos.id, { onDelete: "cascade" }), // ✅ CRITICAL-2 FIX
  userId: int("userId")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }), // ✅ CRITICAL-2 FIX
  rating: int("rating").notNull(), // 0-5 stars
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
}, (table) => ({
  // Índices para otimizar queries
  videoIdIdx: index("idx_videoRatings_videoId").on(table.videoId),
  userIdIdx: index("idx_videoRatings_userId").on(table.userId),
}));

export type VideoRating = typeof videoRatings.$inferSelect;
export type InsertVideoRating = typeof videoRatings.$inferInsert;

/**
 * Video comments table - stores user comments for academy videos
 */
export const videoComments = mysqlTable("videoComments", {
  id: int("id").autoincrement().primaryKey(),
  videoId: int("videoId")
    .notNull()
    .references(() => academyVideos.id, { onDelete: "cascade" }), // ✅ CRITICAL-2 FIX
  userId: int("userId")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }), // ✅ CRITICAL-2 FIX
  comment: text("comment").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
}, (table) => ({
  // Índices para otimizar queries
  videoIdIdx: index("idx_videoComments_videoId").on(table.videoId),
  userIdIdx: index("idx_videoComments_userId").on(table.userId),
}));

export type VideoComment = typeof videoComments.$inferSelect;
export type InsertVideoComment = typeof videoComments.$inferInsert;

/**
 * Blog post ratings table - stores user ratings (1-5 stars) for blog posts
 */
export const blogPostRatings = mysqlTable("blogPostRatings", {
  id: int("id").autoincrement().primaryKey(),
  postId: int("postId")
    .notNull()
    .references(() => blogPosts.id, { onDelete: "cascade" }), // ✅ CRITICAL-2 FIX
  userId: int("userId")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }), // ✅ CRITICAL-2 FIX
  rating: int("rating").notNull(), // 1-5 stars
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
}, (table) => ({
  // Índices para otimizar queries
  postIdIdx: index("idx_blogPostRatings_postId").on(table.postId),
  userIdIdx: index("idx_blogPostRatings_userId").on(table.userId),
}));

export type BlogPostRating = typeof blogPostRatings.$inferSelect;
export type InsertBlogPostRating = typeof blogPostRatings.$inferInsert;

/**
 * Blog post comments table - stores user comments for blog posts
 */
export const blogPostComments = mysqlTable("blogPostComments", {
  id: int("id").autoincrement().primaryKey(),
  postId: int("postId")
    .notNull()
    .references(() => blogPosts.id, { onDelete: "cascade" }), // ✅ CRITICAL-2 FIX
  userId: int("userId")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }), // ✅ CRITICAL-2 FIX
  comment: text("comment").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
}, (table) => ({
  // Índices para otimizar queries
  postIdIdx: index("idx_blogPostComments_postId").on(table.postId),
  userIdIdx: index("idx_blogPostComments_userId").on(table.userId),
}));

export type BlogPostComment = typeof blogPostComments.$inferSelect;
export type InsertBlogPostComment = typeof blogPostComments.$inferInsert;
