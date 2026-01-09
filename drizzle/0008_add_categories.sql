CREATE TABLE `academyCategories` (
`id` int AUTO_INCREMENT NOT NULL,
`namePt` varchar(100) NOT NULL,
`nameEn` varchar(100) NOT NULL,
`slug` varchar(100) NOT NULL,
`createdAt` timestamp NOT NULL DEFAULT (now()),
CONSTRAINT `academyCategories_id` PRIMARY KEY(`id`),
CONSTRAINT `academyCategories_slug_unique` UNIQUE(`slug`)
);
--> statement-breakpoint
CREATE TABLE `blogPostCategories` (
`id` int AUTO_INCREMENT NOT NULL,
`postId` int NOT NULL,
`categoryId` int NOT NULL,
`createdAt` timestamp NOT NULL DEFAULT (now()),
CONSTRAINT `blogPostCategories_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `videoCategories` (
`id` int AUTO_INCREMENT NOT NULL,
`videoId` int NOT NULL,
`categoryId` int NOT NULL,
`createdAt` timestamp NOT NULL DEFAULT (now()),
CONSTRAINT `videoCategories_id` PRIMARY KEY(`id`)
);
