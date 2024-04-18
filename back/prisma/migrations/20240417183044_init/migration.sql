-- CreateTable
CREATE TABLE "Users" (
    "id" SERIAL NOT NULL,
    "email" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "name" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Notes" (
    "id" SERIAL NOT NULL,
    "title" TEXT NOT NULL,
    "data" TEXT,
    "published" BOOLEAN NOT NULL DEFAULT false,
    "user_id" INTEGER NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Notes_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Users_email_key" ON "Users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Users_phone_key" ON "Users"("phone");

-- CreateIndex
CREATE INDEX "idx_notes" ON "Notes"("user_id", "id", "title", "published");

-- AddForeignKey
ALTER TABLE "Notes" ADD CONSTRAINT "Notes_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "Users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
