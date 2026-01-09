import { relations } from "drizzle-orm";
import {
  users,
  events,
  blogCategories,
  academyCategories,
  blogPosts,
  academyVideos,
  blogPostCategories,
  blogPostRatings,
  blogPostComments,
  videoRatings,
  videoComments,
} from "./schema";

// ✅ CRITICAL-3 FIX: Users Relations
export const usersRelations = relations(users, ({ many }) => ({
  events: many(events),
  blogPosts: many(blogPosts),
  academyVideos: many(academyVideos),
  blogPostRatings: many(blogPostRatings),
  blogPostComments: many(blogPostComments),
  videoRatings: many(videoRatings),
  videoComments: many(videoComments),
}));

// ✅ CRITICAL-3 FIX: Events Relations
export const eventsRelations = relations(events, ({ one }) => ({
  createdBy: one(users, {
    fields: [events.createdBy],
    references: [users.id],
  }),
}));

// ✅ CRITICAL-3 FIX: Blog Categories Relations
export const blogCategoriesRelations = relations(blogCategories, ({ many }) => ({
  posts: many(blogPosts),
  postCategories: many(blogPostCategories),
}));

// ✅ CRITICAL-3 FIX: Academy Categories Relations
export const academyCategoriesRelations = relations(academyCategories, ({ many }) => ({
  videos: many(academyVideos),
}));

// ✅ CRITICAL-3 FIX: Blog Posts Relations
export const blogPostsRelations = relations(blogPosts, ({ one, many }) => ({
  author: one(users, {
    fields: [blogPosts.createdBy],
    references: [users.id],
  }),
  category: one(blogCategories, {
    fields: [blogPosts.categoryId],
    references: [blogCategories.id],
  }),
  categories: many(blogPostCategories),
  ratings: many(blogPostRatings),
  comments: many(blogPostComments),
}));

// ✅ CRITICAL-3 FIX: Academy Videos Relations
export const academyVideosRelations = relations(academyVideos, ({ one, many }) => ({
  author: one(users, {
    fields: [academyVideos.createdBy],
    references: [users.id],
  }),
  category: one(academyCategories, {
    fields: [academyVideos.categoryId],
    references: [academyCategories.id],
  }),
  ratings: many(videoRatings),
  comments: many(videoComments),
}));

// ✅ CRITICAL-3 FIX: Blog Post Categories Relations
export const blogPostCategoriesRelations = relations(blogPostCategories, ({ one }) => ({
  post: one(blogPosts, {
    fields: [blogPostCategories.postId],
    references: [blogPosts.id],
  }),
  category: one(blogCategories, {
    fields: [blogPostCategories.categoryId],
    references: [blogCategories.id],
  }),
}));

// ✅ CRITICAL-3 FIX: Blog Post Ratings Relations
export const blogPostRatingsRelations = relations(blogPostRatings, ({ one }) => ({
  post: one(blogPosts, {
    fields: [blogPostRatings.postId],
    references: [blogPosts.id],
  }),
  user: one(users, {
    fields: [blogPostRatings.userId],
    references: [users.id],
  }),
}));

// ✅ CRITICAL-3 FIX: Blog Post Comments Relations
export const blogPostCommentsRelations = relations(blogPostComments, ({ one }) => ({
  post: one(blogPosts, {
    fields: [blogPostComments.postId],
    references: [blogPosts.id],
  }),
  user: one(users, {
    fields: [blogPostComments.userId],
    references: [users.id],
  }),
}));

// ✅ CRITICAL-3 FIX: Video Ratings Relations
export const videoRatingsRelations = relations(videoRatings, ({ one }) => ({
  video: one(academyVideos, {
    fields: [videoRatings.videoId],
    references: [academyVideos.id],
  }),
  user: one(users, {
    fields: [videoRatings.userId],
    references: [users.id],
  }),
}));

// ✅ CRITICAL-3 FIX: Video Comments Relations
export const videoCommentsRelations = relations(videoComments, ({ one }) => ({
  video: one(academyVideos, {
    fields: [videoComments.videoId],
    references: [academyVideos.id],
  }),
  user: one(users, {
    fields: [videoComments.userId],
    references: [users.id],
  }),
}));
