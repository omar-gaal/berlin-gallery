import { pgTable, uuid, varchar, text, timestamp, boolean, bigint, integer, primaryKey, index } from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm";

export const users = pgTable(
  "users",
  {
    id: uuid("id")
      .primaryKey()
      .default(sql`gen_random_uuid()`),
    email: varchar("email", { length: 255 }).notNull().unique(),
    name: varchar("name", { length: 255 }),
    passwordHash: text("password_hash").notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => ({
    emailIdx: index("users_email_idx").on(table.email),
  })
);

export const photos = pgTable(
  "photos",
  {
    id: uuid("id")
      .primaryKey()
      .default(sql`gen_random_uuid()`),
    uploadedBy: uuid("uploaded_by").references(() => users.id, { onDelete: "set null" }),
    originalFilename: varchar("original_filename", { length: 255 }).notNull(),
    storageKey: varchar("storage_key", { length: 512 }).notNull().unique(),
    mimeType: varchar("mime_type", { length: 255 }).notNull(),
    width: integer("width"),
    height: integer("height"),
    fileSize: bigint("file_size", { mode: "bigint" }).notNull(),
    favorite: boolean("favorite").notNull().default(false),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => ({
    uploadedByIdx: index("photos_uploaded_by_idx").on(table.uploadedBy),
    createdAtIdx: index("photos_created_at_idx").on(table.createdAt),
    favoriteIdx: index("photos_favorite_idx").on(table.favorite),
  })
);

export const tags = pgTable(
  "tags",
  {
    id: uuid("id")
      .primaryKey()
      .default(sql`gen_random_uuid()`),
    name: varchar("name", { length: 255 }).notNull().unique(),
  },
  (table) => ({
    nameIdx: index("tags_name_idx").on(table.name),
  })
);

export const photoTags = pgTable(
  "photo_tags",
  {
    photoId: uuid("photo_id")
      .notNull()
      .references(() => photos.id, { onDelete: "cascade" }),
    tagId: uuid("tag_id")
      .notNull()
      .references(() => tags.id, { onDelete: "cascade" }),
  },
  (table) => ({
    pk: primaryKey({ columns: [table.photoId, table.tagId] }),
    photoIdIdx: index("photo_tags_photo_id_idx").on(table.photoId),
    tagIdIdx: index("photo_tags_tag_id_idx").on(table.tagId),
  })
);
