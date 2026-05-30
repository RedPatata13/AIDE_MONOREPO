import type { Prisma } from "@prisma/client";
import { prisma } from "./prisma.js";

export class IdentityRepository {
  async createAdmin(
    idInput: Prisma.IdentityCreateInput,
    input: {
      firstName: string;
      middleName?: string;
      lastName: string;
    }
  ) {
    return prisma.$transaction(async (tx) => {
      const identity = await tx.identity.create({
        data: idInput,
      });

      const admin = await tx.admin.create({
        data: {
          id: identity.id,
          ...input,
        },
      });

      return { admin, identity };
    });
  }

  async createTeacher(
    idInput: Prisma.IdentityCreateInput,
    input: {
      firstName: string;
      middleName?: string;
      lastName: string;
      contactNo?: string;
    }
  ) {
    return prisma.$transaction(async (tx) => {
      const identity = await tx.identity.create({
        data: idInput,
      });

      const teacher = await tx.teacher.create({
        data: {
          id: identity.id,
          ...input,
        },
      });

      return { teacher, identity };
    });
  }

  async createStudent(
    idInput: Prisma.IdentityCreateInput,
    input: {
      firstName: string;
      middleName?: string;
      lastName: string;
      contactNo?: string;
      guardianName?: string;
      guardianContactNo?: string;
    }
  ) {
    return prisma.$transaction(async (tx) => {
      const identity = await tx.identity.create({
        data: idInput,
      });

      const student = await tx.student.create({
        data: {
          id: identity.id,
          ...input,
        },
      });

      return { student, identity };
    });
  }
}