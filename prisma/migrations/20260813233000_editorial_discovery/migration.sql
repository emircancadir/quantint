-- AlterEnum
ALTER TYPE "PostStatus" ADD VALUE 'SCHEDULED';

-- AlterTable
ALTER TABLE "Post"
ADD COLUMN "referencesTr" TEXT NOT NULL DEFAULT '',
ADD COLUMN "referencesEn" TEXT NOT NULL DEFAULT '',
ADD COLUMN "seriesOrder" INTEGER,
ADD COLUMN "seriesId" TEXT;

-- CreateTable
CREATE TABLE "Tag" (
  "id" TEXT NOT NULL,
  "slug" TEXT NOT NULL,
  "nameTr" TEXT NOT NULL,
  "nameEn" TEXT NOT NULL,
  CONSTRAINT "Tag_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Series" (
  "id" TEXT NOT NULL,
  "slug" TEXT NOT NULL,
  "nameTr" TEXT NOT NULL,
  "nameEn" TEXT NOT NULL,
  "descriptionTr" TEXT NOT NULL DEFAULT '',
  "descriptionEn" TEXT NOT NULL DEFAULT '',
  CONSTRAINT "Series_pkey" PRIMARY KEY ("id")
);

-- CreateTable (implicit Prisma many-to-many relation)
CREATE TABLE "_PostToTag" (
  "A" TEXT NOT NULL,
  "B" TEXT NOT NULL,
  CONSTRAINT "_PostToTag_AB_pkey" PRIMARY KEY ("A", "B")
);

-- CreateIndex
CREATE UNIQUE INDEX "Tag_slug_key" ON "Tag"("slug");
CREATE INDEX "Tag_nameTr_idx" ON "Tag"("nameTr");
CREATE INDEX "Tag_nameEn_idx" ON "Tag"("nameEn");
CREATE UNIQUE INDEX "Series_slug_key" ON "Series"("slug");
CREATE INDEX "_PostToTag_B_index" ON "_PostToTag"("B");
CREATE INDEX "Post_seriesId_seriesOrder_idx" ON "Post"("seriesId", "seriesOrder");

-- AddForeignKey
ALTER TABLE "Post" ADD CONSTRAINT "Post_seriesId_fkey" FOREIGN KEY ("seriesId") REFERENCES "Series"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "_PostToTag" ADD CONSTRAINT "_PostToTag_A_fkey" FOREIGN KEY ("A") REFERENCES "Post"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "_PostToTag" ADD CONSTRAINT "_PostToTag_B_fkey" FOREIGN KEY ("B") REFERENCES "Tag"("id") ON DELETE CASCADE ON UPDATE CASCADE;
