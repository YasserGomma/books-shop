ALTER TABLE "categories" ADD COLUMN "name_translations" json;--> statement-breakpoint
ALTER TABLE "categories" ADD COLUMN "description_translations" json;--> statement-breakpoint
ALTER TABLE "books" ADD COLUMN "title_translations" json;--> statement-breakpoint
ALTER TABLE "books" ADD COLUMN "description_translations" json;--> statement-breakpoint
ALTER TABLE "tags" ADD COLUMN "name_translations" json;