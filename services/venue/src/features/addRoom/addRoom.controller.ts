import { VenueRepository } from "../../db/venueRepository.js";

export async function addRoomController(body: string){
    const room = JSON.parse(body);

    const repo = new VenueRepository();
    const result = await repo.addRoom(room);

    console.log(`Room added with id: ${result.id}`)
    return result;
}