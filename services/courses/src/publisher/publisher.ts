import {
  EventBridgeClient,
  PutEventsCommand,
} from '@aws-sdk/client-eventbridge';
import { Course } from '@prisma/client';

const client = new EventBridgeClient({ 
        region: process.env.AWS_REGION ?? "ap-southeast-1"
    });

type CourseServiceEvent = 
        'course.created' 
    |   'course.updated' 
    |   'course.activated' 
    |   'course.archived'
    ;
export const publishSchoolYearEvent = async (
  eventType: CourseServiceEvent,
  snapshot: Partial<Course>
): Promise<void> => {
  const response = await client.send(
    new PutEventsCommand({
      Entries: [
        {
          EventBusName: process.env.EVENT_BUS_NAME,
          Source: 'aide.courses',
          DetailType: eventType,
          Detail: JSON.stringify({
            eventVersion: '1.0',
            id: snapshot.id,
            name: snapshot.courseName,
            description: snapshot.description,
            status: snapshot.status,
            snapshot,
          }),
        },
      ],
    })
  );

  console.log('EVENTBRIDGE RESPONSE', response);
};