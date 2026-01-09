import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, protectedProcedure, adminProcedure, router } from "./_core/trpc";
import { z } from "zod";
import { TRPCError } from "@trpc/server";
import * as db from "./db";
import { getPublishedBlogPostsOptimized, getPublishedAcademyVideosOptimized } from "./db.optimized";
import { storagePut } from "./storage";
import { notifyOwner } from "./_core/notification";

export const appRouter = router({
  system: systemRouter,
  
  auth: router({
    me: publicProcedure.query(opts => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return { success: true } as const;
    }),
    updateProfile: protectedProcedure
      .input(z.object({
        jobTitle: z.string().min(1, "Cargo é obrigatório"),
        company: z.string().optional(),
        linkedin: z.string().optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        const isFirstTime = !ctx.user.profileCompleted;
        
        await db.upsertUser({
          openId: ctx.user.openId,
          jobTitle: input.jobTitle,
          company: input.company,
          linkedin: input.linkedin,
          profileCompleted: true,
        });
        
        // Notify owner about new user registration if this is first time setting profile
        if (isFirstTime) {
          await notifyOwner({
            title: "Novo usuário cadastrado na Academy",
            content: `${ctx.user.name} (${ctx.user.email}) acabou de completar o cadastro.\nCargo: ${input.jobTitle}\nEmpresa: ${input.company || "Não informada"}\nLinkedIn: ${input.linkedin || "Não informado"}`,
          });
        }
        
        return { success: true };
      }),

  }),

  users: router({
    getAll: adminProcedure.query(async () => {
      return await db.getAllUsers();
    }),
    update: adminProcedure
      .input(z.object({
        id: z.number(),
        name: z.string().optional(),
        email: z.string().email().optional(),
        jobTitle: z.string().optional(),
        company: z.string().optional(),
        linkedin: z.string().optional(),
        role: z.enum(["user", "admin"]).optional(),
      }))
      .mutation(async ({ input }) => {
        const { id, ...data } = input;
        await db.updateUserById(id, data);
        return { success: true };
      }),
    delete: adminProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ input }) => {
        await db.deleteUserById(input.id);
        return { success: true };
      }),
    getAnalytics: adminProcedure.query(async () => {
      return await db.getUserAnalytics();
    }),
  }),

  events: router({
    getUpcoming: publicProcedure.query(async () => {
      return await db.getUpcomingEvents();
    }),
    getAll: adminProcedure.query(async () => {
      return await db.getAllEvents();
    }),
    create: adminProcedure
      .input(z.object({
        titlePt: z.string(),
        titleEn: z.string(),
        descriptionPt: z.string().optional(),
        descriptionEn: z.string().optional(),
        eventType: z.enum(["webinar", "workshop", "conference", "networking", "other"]).default("other"),
        location: z.string().optional(),
        eventDate: z.date(),
        eventUrl: z.string().optional(),
        imageUrl: z.string().optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        return await db.createEvent({
          ...input,
          createdBy: ctx.user.id,
        });
      }),
    update: adminProcedure
      .input(z.object({
        id: z.number(),
        titlePt: z.string().optional(),
        titleEn: z.string().optional(),
        descriptionPt: z.string().optional(),
        descriptionEn: z.string().optional(),
        eventType: z.enum(["webinar", "workshop", "conference", "networking", "other"]).optional(),
        location: z.string().optional(),
        eventDate: z.date().optional(),
        eventUrl: z.string().optional(),
        imageUrl: z.string().optional(),
      }))
      .mutation(async ({ input }) => {
        const { id, ...data } = input;
        await db.updateEvent(id, data);
        return { success: true };
      }),
    delete: adminProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ input }) => {
        await db.deleteEvent(input.id);
        return { success: true };
      }),
  }),

  blog: router({
    getCategories: publicProcedure.query(async () => {
      return await db.getAllBlogCategories();
    }),
    getPosts: publicProcedure
      .input(z.object({
        categoryId: z.number().optional(),
        page: z.number().min(1).optional().default(1),
        limit: z.number().min(1).max(50).optional().default(10),
      }))
      .query(async ({ input }) => {
        return await getPublishedBlogPostsOptimized(input.categoryId, input.page, input.limit);
      }),
    getPostBySlug: publicProcedure
      .input(z.object({ slug: z.string() }))
      .query(async ({ input }) => {
        return await db.getBlogPostBySlug(input.slug);
      }),
    getAllPosts: adminProcedure.query(async () => {
      return await db.getAllBlogPosts();
    }),
    createPost: adminProcedure
      .input(z.object({
        titlePt: z.string(),
        titleEn: z.string(),
        contentPt: z.string(),
        contentEn: z.string(),
        excerptPt: z.string().optional(),
        excerptEn: z.string().optional(),
        slug: z.string(),
        categoryId: z.number(),
        coverImageUrl: z.string().optional(),
        authorName: z.string().optional(),
        authorLinkedIn: z.string().optional(),
        published: z.boolean(),
        publishedAt: z.date().optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        return await db.createBlogPost({
          ...input,
          createdBy: ctx.user.id,
        });
      }),
    updatePost: adminProcedure
      .input(z.object({
        id: z.number(),
        titlePt: z.string().optional(),
        titleEn: z.string().optional(),
        contentPt: z.string().optional(),
        contentEn: z.string().optional(),
        excerptPt: z.string().optional(),
        excerptEn: z.string().optional(),
        slug: z.string().optional(),
        categoryId: z.number().optional(),
        coverImageUrl: z.string().optional(),
        authorName: z.string().optional(),
        authorLinkedIn: z.string().optional(),
        published: z.boolean().optional(),
        publishedAt: z.date().optional(),
      }))
      .mutation(async ({ input }) => {
        const { id, ...data } = input;
        await db.updateBlogPost(id, data);
        return { success: true };
      }),
    deletePost: adminProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ input }) => {
        await db.deleteBlogPost(input.id);
        return { success: true };
      }),
    createCategory: adminProcedure
      .input(z.object({
        namePt: z.string(),
        nameEn: z.string(),
        slug: z.string().min(1).regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Slug deve conter apenas letras, números e hífens"),
      }))
      .mutation(async ({ input }) => {
        // Check if slug already exists
        const existing = await db.getBlogCategoryBySlug(input.slug);
        if (existing) {
          throw new TRPCError({
            code: "CONFLICT",
            message: "Slug já existe. Por favor, use um slug diferente.",
          });
        }
        return await db.createBlogCategory(input);
      }),
    updateCategory: adminProcedure
      .input(z.object({
        id: z.number(),
        namePt: z.string().optional(),
        nameEn: z.string().optional(),
        slug: z.string().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Slug deve conter apenas letras, números e hífens").optional(),
      }))
      .mutation(async ({ input }) => {
        const { id, ...data } = input;
        // If slug is being updated, check if new slug already exists
        if (data.slug) {
          const existing = await db.getBlogCategoryBySlug(data.slug);
          if (existing && existing.id !== id) {
            throw new TRPCError({
              code: "CONFLICT",
              message: "Slug já existe. Por favor, use um slug diferente.",
            });
          }
        }
        await db.updateBlogCategory(id, data);
        return { success: true };
      }),
    deleteCategory: adminProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ input }) => {
        await db.deleteBlogCategory(input.id);
        return { success: true };
      }),
    // Rating procedures
    ratePost: protectedProcedure
      .input(z.object({
        postId: z.number(),
        rating: z.number().min(1).max(5),
      }))
      .mutation(async ({ ctx, input }) => {
        await db.rateBlogPost(
          input.postId,
          ctx.user.id,
          input.rating
        );
        return { success: true };
      }),
    getPostRating: publicProcedure
      .input(z.object({ postId: z.number() }))
      .query(async ({ input }) => {
        return await db.getBlogPostRating(input.postId);
      }),
    getUserPostRating: protectedProcedure
      .input(z.object({ postId: z.number() }))
      .query(async ({ ctx, input }) => {
        return await db.getUserBlogPostRating(input.postId, ctx.user.id);
      }),
    // Comment procedures
    addPostComment: protectedProcedure
      .input(z.object({
        postId: z.number(),
        comment: z.string().min(1).max(500),
      }))
      .mutation(async ({ ctx, input }) => {
        await db.addBlogPostComment(
          input.postId,
          ctx.user.id,
          input.comment
        );
        return { success: true };
      }),
    getPostComments: publicProcedure
      .input(z.object({ 
        postId: z.number(),
        orderBy: z.enum(['desc', 'asc']).optional().default('desc'),
      }))
      .query(async ({ input }) => {
        return await db.getBlogPostComments(input.postId, input.orderBy);
      }),
    deletePostComment: adminProcedure
      .input(z.object({ commentId: z.number() }))
      .mutation(async ({ input }) => {
        await db.deleteBlogPostComment(input.commentId);
        return { success: true };
      }),
    getBlogPostsByCategory: publicProcedure
      .input(z.object({ categoryId: z.number() }))
      .query(async ({ input }) => {
        return await db.getBlogPostsByCategory(input.categoryId);
      }),
    addBlogPostCategories: adminProcedure
      .input(z.object({
        postId: z.number(),
        categoryIds: z.array(z.number()),
      }))
      .mutation(async ({ input }) => {
        await db.addBlogPostCategories(input.postId, input.categoryIds);
        return { success: true };
      }),
  }),

  academy: router({
    getVideos: protectedProcedure
      .input(z.object({
        categoryId: z.number().optional(),
        page: z.number().min(1).optional().default(1),
        limit: z.number().min(1).max(50).optional().default(10),
      }))
      .query(async ({ input }) => {
        return await getPublishedAcademyVideosOptimized(input.categoryId, input.page, input.limit);
      }),
    getVideoById: protectedProcedure
      .input(z.object({ id: z.number() }))
      .query(async ({ input }) => {
        return await db.getAcademyVideoById(input.id);
      }),
    getAllVideos: adminProcedure.query(async () => {
      return await db.getAllAcademyVideos();
    }),
    createVideo: adminProcedure
      .input(z.object({
        titlePt: z.string(),
        titleEn: z.string(),
        descriptionPt: z.string().optional(),
        descriptionEn: z.string().optional(),
        videoUrl: z.string(),
        thumbnailUrl: z.string().optional(),
        duration: z.number().optional(),
        categoryId: z.number().optional(),
        published: z.boolean(),
      }))
      .mutation(async ({ ctx, input }) => {
        return await db.createAcademyVideo({
          ...input,
          createdBy: ctx.user.id,
        });
      }),
    updateVideo: adminProcedure
      .input(z.object({
        id: z.number(),
        titlePt: z.string().optional(),
        titleEn: z.string().optional(),
        descriptionPt: z.string().optional(),
        descriptionEn: z.string().optional(),
        videoUrl: z.string().optional(),
        thumbnailUrl: z.string().optional(),
        duration: z.number().optional(),
        categoryId: z.number().optional(),
        published: z.boolean().optional(),
      }))
      .mutation(async ({ input }) => {
        const { id, ...data } = input;
        await db.updateAcademyVideo(id, data);
        return { success: true };
      }),
    deleteVideo: adminProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ input }) => {
        await db.deleteAcademyVideo(input.id);
        return { success: true };
      }),
    uploadVideo: adminProcedure
      .input(z.object({
        fileName: z.string(),
        fileData: z.string(), // base64
        contentType: z.string(),
      }))
      .mutation(async ({ ctx, input }) => {
        const buffer = Buffer.from(input.fileData, 'base64');
        const timestamp = Date.now();
        const fileKey = `academy-videos/${ctx.user.id}/${timestamp}-${input.fileName}`;
        
        const { url } = await storagePut(fileKey, buffer, input.contentType);
        
        return { url, key: fileKey };
      }),
    // Rating procedures
    rateVideo: protectedProcedure
      .input(z.object({
        videoId: z.number(),
        rating: z.number().min(1).max(5),
      }))
      .mutation(async ({ ctx, input }) => {
        await db.upsertVideoRating({
          videoId: input.videoId,
          userId: ctx.user.id,
          rating: input.rating,
        });
        return { success: true };
      }),
    getVideoRating: publicProcedure
      .input(z.object({ videoId: z.number() }))
      .query(async ({ input }) => {
        return await db.getVideoRating(input.videoId);
      }),
    getUserVideoRating: protectedProcedure
      .input(z.object({ videoId: z.number() }))
      .query(async ({ ctx, input }) => {
        return await db.getUserVideoRating(input.videoId, ctx.user.id);
      }),
    // Comment procedures
    addComment: protectedProcedure
      .input(z.object({
        videoId: z.number(),
        comment: z.string().min(1).max(500),
      }))
      .mutation(async ({ ctx, input }) => {
        await db.addVideoComment({
          videoId: input.videoId,
          userId: ctx.user.id,
          comment: input.comment,
        });
        return { success: true };
      }),
    getComments: publicProcedure
      .input(z.object({ 
        videoId: z.number(),
        orderBy: z.enum(['desc', 'asc']).optional().default('desc'),
      }))
      .query(async ({ input }) => {
        return await db.getVideoComments(input.videoId, input.orderBy);
      }),
    deleteComment: adminProcedure
      .input(z.object({ commentId: z.number() }))
      .mutation(async ({ input }) => {
        await db.deleteVideoComment(input.commentId);
        return { success: true };
      }),
    getCategories: publicProcedure.query(async () => {
      return await db.getAcademyCategories();
    }),
    createCategory: adminProcedure
      .input(z.object({
        namePt: z.string(),
        nameEn: z.string(),
        slug: z.string().min(1).regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Slug deve conter apenas letras, números e hífens"),
      }))
      .mutation(async ({ input }) => {
        // Check if slug already exists
        const existing = await db.getAcademyCategoryBySlug(input.slug);
        if (existing) {
          throw new TRPCError({
            code: "CONFLICT",
            message: "Slug já existe. Por favor, use um slug diferente.",
          });
        }
        return await db.createAcademyCategory(input);
      }),
    updateCategory: adminProcedure
      .input(z.object({
        id: z.number(),
        namePt: z.string().optional(),
        nameEn: z.string().optional(),
        slug: z.string().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Slug deve conter apenas letras, números e hífens").optional(),
      }))
      .mutation(async ({ input }) => {
        const { id, ...data } = input;
        // If slug is being updated, check if new slug already exists
        if (data.slug) {
          const existing = await db.getAcademyCategoryBySlug(data.slug);
          if (existing && existing.id !== id) {
            throw new TRPCError({
              code: "CONFLICT",
              message: "Slug já existe. Por favor, use um slug diferente.",
            });
          }
        }
        await db.updateAcademyCategory(id, data);
        return { success: true };
      }),
    deleteCategory: adminProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ input }) => {
        await db.deleteAcademyCategory(input.id);
        return { success: true };
      }),
    getVideosByCategory: publicProcedure
      .input(z.object({ categoryId: z.number() }))
      .query(async ({ input }) => {
        return await db.getVideosByCategory(input.categoryId);
      }),

  }),

  search: router({
    global: publicProcedure
      .input(z.object({
        query: z.string().min(1),
        language: z.enum(["pt", "en"]),
      }))
      .query(async ({ input }) => {
        return await db.globalSearch(input.query, input.language);
      }),
  }),

  analytics: router({
    getBlogMetrics: adminProcedure
      .query(async () => {
        return await db.getBlogAnalytics();
      }),
    getAcademyMetrics: adminProcedure
      .query(async () => {
        return await db.getAcademyAnalytics();
      }),
  }),
});

export type AppRouter = typeof appRouter;
