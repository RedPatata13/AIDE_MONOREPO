import {
  EventBridgeClient,
  PutEventsCommand,
} from '@aws-sdk/client-eventbridge';
import { Course } from '../models/Program';

const client = new EventBridgeClient({ 
        region: process.env.AWS_REGION ?? "ap-southeast-1"
    });

type IdentityEventType =
  | 'course.created'
  | 'course.updated'
  | 'course.deleted'
  | 'course.deactivated'
  ;

export const publishIdentityEvent = async (
  eventType: IdentityEventType,
  snapshot: Partial<Course>
): Promise<void> => {
  const response = await client.send(
    new PutEventsCommand({
      Entries: [
        {
          EventBusName: process.env.EVENT_BUS_NAME,
          Source: 'school.identity.admin',
          DetailType: eventType,
          Detail: JSON.stringify({
            eventVersion: '1.0',
            courseId: snapshot.courseId,
            snapshot,
          }),
        },
      ],
    })
  );

  console.log('EVENTBRIDGE RESPONSE', response);
};