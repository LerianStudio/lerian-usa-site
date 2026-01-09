ALTER TABLE `blogPosts` ADD `views` int DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE `blogPosts` ADD `averageRating` decimal(3,2) DEFAULT '0.00';