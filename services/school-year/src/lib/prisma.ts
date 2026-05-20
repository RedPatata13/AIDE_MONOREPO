import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";
// import { Prisma, PrismaClient } from "@prisma/client/extension";
// import PrismaClient from "../../generated/prisma"
import { PrismaClient } from "@prisma/client";

const connectionString = `${process.env.DATABASE_URL}`;

const adapter = new PrismaPg({ connectionString });
const prisma = new PrismaClient({ adapter });

export { prisma }