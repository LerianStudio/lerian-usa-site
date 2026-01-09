CREATE TABLE `blogPostComments` (
	`id` int AUTO_INCREMENT NOT NULL,
	`postId` int NOT NULL,
	`userId` int NOT NULL,
	`comment` text NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `blogPostComments_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `blogPostRatings` (
	`id` int AUTO_INCREMENT NOT NULL,
	`postId` int NOT NULL,
	`userId` int NOT NULL,
	`rating` int NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `blogPostRatings_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
ALTER TABLE `blogPosts` ADD `authorName` varchar(255);--> statement-breakpoint
ALTER TABLE `blogPosts` ADD `authorLinkedIn` varchar(500);