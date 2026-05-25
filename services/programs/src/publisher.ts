import { EventBridgeClient, PutEventsCommand } from "@aws-sdk/client-eventbridge";
import { Program } from "@prisma/client";

export type ProgramServiceType = 
        'program.created'
    |   'program.updated'
    |   'program.activated'
    |   'program.deactivated'
    ;
const client = new EventBridgeClient({
    region: process.env.AWS_REGION ?? 'ap-southeast-1'
});

export const publishProgramEvent = async (
    eventType: ProgramServiceType,
    snapshot: Partial<Program>
): Promise<void> => {
    const response = await client.send(
        new PutEventsCommand({
            Entries: [
                {
                    EventBusName: process.env.EVENT_BUS_NAME,
                    Source: 'aide.programs',
                    DetailType: eventType,
                    Detail: JSON.stringify({
                        eventVersion: '2.0',
                        id: snapshot.id,
                        name: snapshot.programName,
                        status: snapshot.status,
                        description: snapshot.description
                    })
                }
            ]
        })
    );

    console.log('EVENTBRIDGE RESPONSE: ', response);
}