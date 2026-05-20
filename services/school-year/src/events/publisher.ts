import {
  EventBridgeClient,
  PutEventsCommand,
} from '@aws-sdk/client-eventbridge';
// import { SchoolYearInstance } from '../models/schoolYearInstance';
import { SchoolYearInstance } from '@prisma/client';

const client = new EventBridgeClient({ 
        region: process.env.AWS_REGION ?? "ap-southeast-1"
    });

type IdentityEventType =
  | 'schoolYearInstance.created'
  | 'schoolYearInstance.updated'
  | 'schoolYearInstance.deleted'
  | 'schoolYearInstance.deactivated'
  ;

export const publishSchoolYearEvent = async (
  eventType: IdentityEventType,
  snapshot: Partial<SchoolYearInstance>
): Promise<void> => {
  const response = await client.send(
    new PutEventsCommand({
      Entries: [
        {
          EventBusName: process.env.EVENT_BUS_NAME,
          Source: 'school.year',
          DetailType: eventType,
          Detail: JSON.stringify({
            eventVersion: '1.0',
            id: snapshot.id,
            name: snapshot.name,
            snapshot,
          }),
        },
      ],
    })
  );

  console.log('EVENTBRIDGE RESPONSE', response);
};