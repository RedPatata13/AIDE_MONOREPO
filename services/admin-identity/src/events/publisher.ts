import {
  EventBridgeClient,
  PutEventsCommand,
} from '@aws-sdk/client-eventbridge';
// import { Student } from '../models/admin';
import { Admin } from '../models/admin';

const client = new EventBridgeClient({ 
        region: process.env.AWS_REGION ?? "ap-southeast-1"
    });

type IdentityEventType =
  | 'admin.created'
  | 'admin.updated'
  | 'admin.deleted'
  | 'admin.deactivated'
  ;

export const publishIdentityEvent = async (
  eventType: IdentityEventType,
  snapshot: Partial<Admin>
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
            adminId: snapshot.adminId,
            cognitoSub: snapshot.cognitoSub,
            snapshot,
          }),
        },
      ],
    })
  );

  console.log('EVENTBRIDGE RESPONSE', response);
};