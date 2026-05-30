import type { Prisma } from "@prisma/client";
import { prisma } from "./prisma.js";
import { NotFoundError } from "../errors/notFoundError.js";

export class VenueRepository {
    async addRoom(input: Prisma.RoomCreateInput){
        await prisma.room.create({
            data: input
        });
    }

    async addSchedule(roomId: string, teacherId: string, sectionId: string, scheduleName: string, startDate: Date, endDate: Date){
        return prisma.$transaction(async (tx) => {
            const room = await tx.room.findFirst({ where: { id: roomId }});
            if(!room) throw new NotFoundError(`Room with id: ${roomId}`);

            const teacher = await tx.room.findFirst({ where: { id: teacherId }});
            if(teacher) throw new NotFoundError(`Teacher with id: ${teacherId} not found`);

            const section = await tx.section.findFirst({ where: { id: sectionId }});
            if(!section) throw new NotFoundError(`Section with id: ${sectionId} not found`);

            const sched = await tx.schedule.create({
                data: {
                    roomId,
                    teacherId,
                    sectionId,
                    name: scheduleName,
                    start: startDate,
                    end: endDate
                }
            })

            return sched;
        })
    }
}