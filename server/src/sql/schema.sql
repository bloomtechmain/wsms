-- Drop tables if they exist
DROP TABLE IF EXISTS "audit_logs" CASCADE;
DROP TABLE IF EXISTS "payments" CASCADE;
DROP TABLE IF EXISTS "bills" CASCADE;
DROP TABLE IF EXISTS "tariff_rates" CASCADE;
DROP TABLE IF EXISTS "meter_readings" CASCADE;
DROP TABLE IF EXISTS "customers" CASCADE;
DROP TABLE IF EXISTS "customer_groups" CASCADE;
DROP TABLE IF EXISTS "users" CASCADE;
DROP TABLE IF EXISTS "roles" CASCADE;

-- CreateTable
CREATE TABLE "roles" (
    "id" SERIAL NOT NULL,
    "name" VARCHAR(50) NOT NULL,

    CONSTRAINT "roles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "users" (
    "id" SERIAL NOT NULL,
    "full_name" VARCHAR(100),
    "email" VARCHAR(100) NOT NULL,
    "password_hash" TEXT NOT NULL,
    "role_id" INTEGER,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "customer_groups" (
    "id" SERIAL NOT NULL,
    "group_code" VARCHAR(20) NOT NULL,
    "group_name" VARCHAR(100) NOT NULL,
    "description" TEXT,
    "manager_id" INTEGER,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "customer_groups_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "customers" (
    "id" SERIAL NOT NULL,
    "customer_code" VARCHAR(20) NOT NULL,
    "account_number" VARCHAR(50),
    "full_name" VARCHAR(100) NOT NULL,
    "address" TEXT,
    "phone" VARCHAR(20),
    "meter_number" VARCHAR(50) NOT NULL,
    "group_id" INTEGER,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "customers_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "meter_readings" (
    "id" SERIAL NOT NULL,
    "customer_id" INTEGER,
    "reading_month" DATE NOT NULL,
    "previous_reading" DECIMAL(10,2) NOT NULL,
    "current_reading" DECIMAL(10,2) NOT NULL,
    "units_consumed" DECIMAL(10,2) GENERATED ALWAYS AS (current_reading - previous_reading) STORED,
    "created_by" INTEGER,
    "created_at" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "meter_readings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "tariff_rates" (
    "id" SERIAL NOT NULL,
    "min_units" INTEGER NOT NULL,
    "max_units" INTEGER,
    "rate_per_unit" DECIMAL(10,2) NOT NULL,
    "created_at" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "tariff_rates_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "bills" (
    "id" SERIAL NOT NULL,
    "customer_id" INTEGER,
    "reading_id" INTEGER,
    "bill_month" DATE NOT NULL,
    "units" DECIMAL(10,2),
    "total_amount" DECIMAL(12,2),
    "arrears" DECIMAL(12,2) DEFAULT 0,
    "status" VARCHAR(20) DEFAULT 'UNPAID',
    "generated_by" INTEGER,
    "generated_at" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "bills_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "payments" (
    "id" SERIAL NOT NULL,
    "bill_id" INTEGER,
    "amount" DECIMAL(12,2) NOT NULL,
    "payment_date" DATE NOT NULL,
    "payment_method" VARCHAR(50),
    "reference_no" VARCHAR(100),
    "created_at" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "payments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "audit_logs" (
    "id" SERIAL NOT NULL,
    "user_id" INTEGER,
    "action" VARCHAR(100),
    "description" TEXT,
    "created_at" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "audit_logs_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "roles_name_key" ON "roles"("name");

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "customer_groups_group_code_key" ON "customer_groups"("group_code");

-- CreateIndex
CREATE UNIQUE INDEX "customers_customer_code_key" ON "customers"("customer_code");

-- CreateIndex
CREATE UNIQUE INDEX "customers_account_number_key" ON "customers"("account_number");

-- CreateIndex
CREATE UNIQUE INDEX "customers_meter_number_key" ON "customers"("meter_number");

-- CreateIndex
CREATE UNIQUE INDEX "meter_readings_customer_id_reading_month_key" ON "meter_readings"("customer_id", "reading_month");

-- CreateIndex
CREATE UNIQUE INDEX "bills_customer_id_bill_month_key" ON "bills"("customer_id", "bill_month");

-- AddForeignKey
ALTER TABLE "users" ADD CONSTRAINT "users_role_id_fkey" FOREIGN KEY ("role_id") REFERENCES "roles"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "customer_groups" ADD CONSTRAINT "customer_groups_manager_id_fkey" FOREIGN KEY ("manager_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "customers" ADD CONSTRAINT "customers_group_id_fkey" FOREIGN KEY ("group_id") REFERENCES "customer_groups"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "meter_readings" ADD CONSTRAINT "meter_readings_customer_id_fkey" FOREIGN KEY ("customer_id") REFERENCES "customers"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "meter_readings" ADD CONSTRAINT "meter_readings_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "bills" ADD CONSTRAINT "bills_customer_id_fkey" FOREIGN KEY ("customer_id") REFERENCES "customers"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "bills" ADD CONSTRAINT "bills_reading_id_fkey" FOREIGN KEY ("reading_id") REFERENCES "meter_readings"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "bills" ADD CONSTRAINT "bills_generated_by_fkey" FOREIGN KEY ("generated_by") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "payments" ADD CONSTRAINT "payments_bill_id_fkey" FOREIGN KEY ("bill_id") REFERENCES "bills"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "audit_logs" ADD CONSTRAINT "audit_logs_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- Seed Tariff Rates
INSERT INTO "tariff_rates" ("min_units", "max_units", "rate_per_unit") VALUES
(0, 10, 5.00),
(11, 20, 8.00),
(21, NULL, 12.00);

