import { VenueRepository } from "../../db/venueRepository.js";

export async function addScheduleController(body: string){
    const sched = JSON.parse(body);

    const repo = new VenueRepository();
    const result = await repo.addSchedule(sched.roomId, sched.teacherId, sched.sectionId, sched.name, new Date(sched.startDate), new Date(sched.endDate));

    console.log(`Room added with id: ${result.id}`)
    return result;
}