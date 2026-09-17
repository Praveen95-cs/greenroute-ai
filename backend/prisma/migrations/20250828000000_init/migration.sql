-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "public";

-- CreateEnum
CREATE TYPE "Role" AS ENUM ('USER', 'ADMIN');

-- CreateEnum
CREATE TYPE "TripStatus" AS ENUM ('PLANNED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "CarpoolStatus" AS ENUM ('PENDING', 'MATCHED', 'ACCEPTED', 'REJECTED', 'CANCELLED', 'COMPLETED');

-- CreateTable
CREATE TABLE "users" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password_hash" TEXT NOT NULL,
    "first_name" TEXT NOT NULL,
    "last_name" TEXT NOT NULL,
    "role" "Role" NOT NULL DEFAULT 'USER',
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "user_preferences" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "preferred_transport" TEXT,
    "max_walking_distance_m" INTEGER,
    "max_budget" DOUBLE PRECISION,
    "sustainability_priority" INTEGER NOT NULL DEFAULT 50,
    "time_priority" INTEGER NOT NULL DEFAULT 50,
    "accessibility_needs" JSONB,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "user_preferences_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "transport_modes" (
    "id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "co2_grams_per_km" DOUBLE PRECISION NOT NULL,
    "avg_cost_per_km" DOUBLE PRECISION NOT NULL,
    "avg_speed_kmh" DOUBLE PRECISION NOT NULL,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "transport_modes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "trips" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "route_id" TEXT,
    "status" "TripStatus" NOT NULL DEFAULT 'PLANNED',
    "started_at" TIMESTAMP(3),
    "completed_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "trips_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "routes" (
    "id" TEXT NOT NULL,
    "source_lat" DOUBLE PRECISION NOT NULL,
    "source_lng" DOUBLE PRECISION NOT NULL,
    "source_label" TEXT NOT NULL,
    "dest_lat" DOUBLE PRECISION NOT NULL,
    "dest_lng" DOUBLE PRECISION NOT NULL,
    "dest_label" TEXT NOT NULL,
    "departure_time" TIMESTAMP(3) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "routes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "route_options" (
    "id" TEXT NOT NULL,
    "route_id" TEXT NOT NULL,
    "transport_mode_id" TEXT NOT NULL,
    "duration_minutes" INTEGER NOT NULL,
    "distance_km" DOUBLE PRECISION NOT NULL,
    "estimated_cost" DOUBLE PRECISION NOT NULL,
    "estimated_co2_grams" DOUBLE PRECISION NOT NULL,
    "walking_minutes" INTEGER NOT NULL DEFAULT 0,
    "reliability_score" DOUBLE PRECISION NOT NULL DEFAULT 0.8,
    "composite_score" DOUBLE PRECISION,
    "is_recommended" BOOLEAN NOT NULL DEFAULT false,
    "metadata" JSONB,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "route_options_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "carpool_requests" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "origin_lat" DOUBLE PRECISION NOT NULL,
    "origin_lng" DOUBLE PRECISION NOT NULL,
    "origin_label" TEXT NOT NULL,
    "dest_lat" DOUBLE PRECISION NOT NULL,
    "dest_lng" DOUBLE PRECISION NOT NULL,
    "dest_label" TEXT NOT NULL,
    "departure_time" TIMESTAMP(3) NOT NULL,
    "available_seats" INTEGER NOT NULL DEFAULT 1,
    "max_detour_km" DOUBLE PRECISION NOT NULL DEFAULT 2,
    "status" "CarpoolStatus" NOT NULL DEFAULT 'PENDING',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "carpool_requests_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "carpool_matches" (
    "id" TEXT NOT NULL,
    "request_id" TEXT NOT NULL,
    "matched_user_id" TEXT NOT NULL,
    "compatibility_score" DOUBLE PRECISION NOT NULL,
    "detour_km" DOUBLE PRECISION NOT NULL,
    "status" "CarpoolStatus" NOT NULL DEFAULT 'PENDING',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "carpool_matches_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "carbon_records" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "trip_id" TEXT,
    "co2_grams" DOUBLE PRECISION NOT NULL,
    "co2_saved_grams" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "recorded_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "carbon_records_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "simulations" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "parameters" JSONB NOT NULL,
    "results" JSONB NOT NULL,
    "created_by" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "simulations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ai_conversations" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "query" TEXT NOT NULL,
    "response" TEXT,
    "metadata" JSONB,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ai_conversations_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE INDEX "users_email_idx" ON "users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "user_preferences_user_id_key" ON "user_preferences"("user_id");

-- CreateIndex
CREATE UNIQUE INDEX "transport_modes_code_key" ON "transport_modes"("code");

-- CreateIndex
CREATE INDEX "trips_user_id_idx" ON "trips"("user_id");

-- CreateIndex
CREATE INDEX "trips_status_idx" ON "trips"("status");

-- CreateIndex
CREATE INDEX "routes_created_at_idx" ON "routes"("created_at");

-- CreateIndex
CREATE INDEX "route_options_route_id_idx" ON "route_options"("route_id");

-- CreateIndex
CREATE INDEX "carpool_requests_user_id_idx" ON "carpool_requests"("user_id");

-- CreateIndex
CREATE INDEX "carpool_requests_status_idx" ON "carpool_requests"("status");

-- CreateIndex
CREATE INDEX "carpool_matches_request_id_idx" ON "carpool_matches"("request_id");

-- CreateIndex
CREATE INDEX "carpool_matches_matched_user_id_idx" ON "carpool_matches"("matched_user_id");

-- CreateIndex
CREATE INDEX "carbon_records_user_id_idx" ON "carbon_records"("user_id");

-- CreateIndex
CREATE INDEX "carbon_records_recorded_at_idx" ON "carbon_records"("recorded_at");

-- CreateIndex
CREATE INDEX "simulations_created_at_idx" ON "simulations"("created_at");

-- CreateIndex
CREATE INDEX "ai_conversations_user_id_idx" ON "ai_conversations"("user_id");

-- CreateIndex
CREATE INDEX "ai_conversations_created_at_idx" ON "ai_conversations"("created_at");

-- AddForeignKey
ALTER TABLE "user_preferences" ADD CONSTRAINT "user_preferences_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "trips" ADD CONSTRAINT "trips_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "trips" ADD CONSTRAINT "trips_route_id_fkey" FOREIGN KEY ("route_id") REFERENCES "routes"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "route_options" ADD CONSTRAINT "route_options_route_id_fkey" FOREIGN KEY ("route_id") REFERENCES "routes"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "route_options" ADD CONSTRAINT "route_options_transport_mode_id_fkey" FOREIGN KEY ("transport_mode_id") REFERENCES "transport_modes"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "carpool_requests" ADD CONSTRAINT "carpool_requests_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "carpool_matches" ADD CONSTRAINT "carpool_matches_request_id_fkey" FOREIGN KEY ("request_id") REFERENCES "carpool_requests"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "carpool_matches" ADD CONSTRAINT "carpool_matches_matched_user_id_fkey" FOREIGN KEY ("matched_user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "carbon_records" ADD CONSTRAINT "carbon_records_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "carbon_records" ADD CONSTRAINT "carbon_records_trip_id_fkey" FOREIGN KEY ("trip_id") REFERENCES "trips"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ai_conversations" ADD CONSTRAINT "ai_conversations_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
