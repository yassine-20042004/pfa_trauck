CREATE TABLE IF NOT EXISTS "__EFMigrationsHistory" (
    "MigrationId" character varying(150) NOT NULL,
    "ProductVersion" character varying(32) NOT NULL,
    CONSTRAINT "PK___EFMigrationsHistory" PRIMARY KEY ("MigrationId")
);

START TRANSACTION;

CREATE TABLE "CargoItems" (
    "Id" uuid NOT NULL,
    CONSTRAINT "PK_CargoItems" PRIMARY KEY ("Id")
);

CREATE TABLE "DeliveryStops" (
    "Id" uuid NOT NULL,
    CONSTRAINT "PK_DeliveryStops" PRIMARY KEY ("Id")
);

CREATE TABLE "Drivers" (
    "Id" uuid NOT NULL,
    CONSTRAINT "PK_Drivers" PRIMARY KEY ("Id")
);

CREATE TABLE "LoadPlans" (
    "Id" uuid NOT NULL,
    CONSTRAINT "PK_LoadPlans" PRIMARY KEY ("Id")
);

CREATE TABLE "Trips" (
    "Id" uuid NOT NULL,
    CONSTRAINT "PK_Trips" PRIMARY KEY ("Id")
);

CREATE TABLE "Vehicles" (
    "Id" uuid NOT NULL,
    CONSTRAINT "PK_Vehicles" PRIMARY KEY ("Id")
);

INSERT INTO "__EFMigrationsHistory" ("MigrationId", "ProductVersion")
VALUES ('20260517193539_InitialCreate', '8.0.4');

COMMIT;

