CREATE TABLE `academyVideos` (
	`id` int AUTO_INCREMENT NOT NULL,
	`titlePt` varchar(500) NOT NULL,
	`titleEn` varchar(500) NOT NULL,
	`descriptionPt` text,
	`descriptionEn` text,
	`videoUrl` varchar(1000) NOT NULL,
	`thumbnailUrl` varchar(1000),
	`duration` int,
	`published` boolean NOT NULL DEFAULT false,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	`createdBy` int NOT NULL,
	CONSTRAINT `academyVideos_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `blogCategories` (
	`id` int AUTO_INCREMENT NOT NULL,
	`namePt` varchar(100) NOT NULL,
	`nameEn` varchar(100) NOT NULL,
	`slug` varchar(100) NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `blogCategories_id` PRIMARY KEY(`id`),
	CONSTRAINT `blogCategories_slug_unique` UNIQUE(`slug`)
);
--> statement-breakpoint
CREATE TABLE `blogPosts` (
	`id` int AUTO_INCREMENT NOT NULL,
	`titlePt` varchar(500) NOT NULL,
	`titleEn` varchar(500) NOT NULL,
	`contentPt` text NOT NULL,
	`contentEn` text NOT NULL,
	`excerptPt` text,
	`excerptEn` text,
	`slug` varchar(500) NOT NULL,
	`categoryId` int NOT NULL,
	`coverImageUrl` varchar(1000),
	`published` boolean NOT NULL DEFAULT false,
	`publishedAt` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	`createdBy` int NOT NULL,
	CONSTRAINT `blogPosts_id` PRIMARY KEY(`id`),
	CONSTRAINT `blogPosts_slug_unique` UNIQUE(`slug`)
);
--> statement-breakpoint
CREATE TABLE `events` (
	`id` int AUTO_INCREMENT NOT NULL,
	`titlePt` varchar(255) NOT NULL,
	`titleEn` varchar(255) NOT NULL,
	`descriptionPt` text,
	`descriptionEn` text,
	`location` varchar(500),
	`eventDate` timestamp NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	`createdBy` int NOT NULL,
	CONSTRAINT `events_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
ALTER TABLE `users` ADD `jobTitle` varchar(255);--> statement-breakpoint
ALTER TABLE `users` ADD `company` varchar(255);--> statement-breakpoint
ALTER TABLE `users` ADD `linkedin` varchar(500);