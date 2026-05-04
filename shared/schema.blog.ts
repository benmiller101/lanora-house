import { pgTable, text, timestamp, varchar, integer, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Blog Posts Table
export const blogPosts = pgTable("blog_posts", {
  id: varchar("id").primaryKey().notNull(),
  title: varchar("title").notNull(),
  slug: varchar("slug").unique().notNull(),
  excerpt: text("excerpt").notNull(),
  content: text("content").notNull(),
  coverImage: varchar("cover_image").notNull(),
  publishedAt: timestamp("published_at").defaultNow().notNull(),
  category: varchar("category").notNull(),
  tags: jsonb("tags").default([]).notNull(),
  authorId: varchar("author_id").notNull(), // References users table
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
  status: varchar("status").default("draft").notNull(), // draft, published, archived
  viewCount: integer("view_count").default(0).notNull(),
});

// Blog Post Comments Table
export const blogComments = pgTable("blog_comments", {
  id: varchar("id").primaryKey().notNull(),
  postId: varchar("post_id").notNull(), // References blog_posts table
  userId: varchar("user_id").notNull(), // References users table
  content: text("content").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
  status: varchar("status").default("published").notNull(), // published, hidden, spam
});

// Blog categories
export const BLOG_CATEGORIES = [
  "Lanora House Clearances",
  "Lanora House Antiques", 
  "Lanora House Selling Items",
  "Lanora House Saving Money",
  "Lanora House Raffle",
  "Lanora House Valuation"
] as const;

// Zod schemas
export const insertBlogPostSchema = createInsertSchema(blogPosts).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
  viewCount: true,
}).extend({
  category: z.enum(BLOG_CATEGORIES, {
    errorMap: () => ({ message: "Please select a valid blog category" })
  })
});

export const insertBlogCommentSchema = createInsertSchema(blogComments).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

// TypeScript types
export type InsertBlogPost = z.infer<typeof insertBlogPostSchema>;
export type BlogPost = typeof blogPosts.$inferSelect;

export type InsertBlogComment = z.infer<typeof insertBlogCommentSchema>;
export type BlogComment = typeof blogComments.$inferSelect;