import {
  EventBridgeClient,
  PutEventsCommand,
} from '@aws-sdk/client-eventbridge';
import { Student } from '../models/student';

const client = new EventBridgeClient({ 
        region: process.env.AWS_REGION ?? "ap-southeast-1"
    });

type IdentityEventType =
  | 'student.created'
  | 'student.updated'
  | 'student.deleted';

export const publishIdentityEvent = async (
  eventType: IdentityEventType,
  snapshot: Student
): Promise<void> => {
  const response = await client.send(
    new PutEventsCommand({
      Entries: [
        {
          EventBusName: process.env.EVENT_BUS_NAME,
          Source: 'school.identity.student',
          DetailType: eventType,
          Detail: JSON.stringify({
            eventVersion: '1.0',
            studentId: snapshot.studentId,
            cognitoSub: snapshot.cognitoSub,
            snapshot,
          }),
        },
      ],
    })
  );

  console.log('EVENTBRIDGE RESPONSE', response);
};