CREATE TABLE `learning_progress` (
	`learner_id` text NOT NULL,
	`lesson_id` text NOT NULL,
	`completed` integer DEFAULT false NOT NULL,
	`best_quiz_score` integer DEFAULT 0 NOT NULL,
	`last_visited` integer DEFAULT false NOT NULL,
	`updated_at` integer NOT NULL,
	PRIMARY KEY(`learner_id`, `lesson_id`)
);
--> statement-breakpoint
CREATE INDEX `learning_progress_learner_updated_idx` ON `learning_progress` (`learner_id`,`updated_at`);--> statement-breakpoint
CREATE TABLE `quiz_attempts` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`learner_id` text NOT NULL,
	`lesson_id` text NOT NULL,
	`score` integer NOT NULL,
	`total_questions` integer NOT NULL,
	`attempted_at` integer NOT NULL
);
--> statement-breakpoint
CREATE INDEX `quiz_attempts_learner_lesson_idx` ON `quiz_attempts` (`learner_id`,`lesson_id`);