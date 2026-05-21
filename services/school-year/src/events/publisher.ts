import {
  EventBridgeClient,
  PutEventsCommand,
} from '@aws-sdk/client-eventbridge';
// import { SchoolYearInstance } from '../models/schoolYearInstance';
import { SchoolYearInstance, SchoolYearTemplate, Term, TermTemplate } from '@prisma/client';

const client = new EventBridgeClient({ 
        region: process.env.AWS_REGION ?? "ap-southeast-1"
    });

type SchoolYearServiceEventType =
  | 'schoolYearInstance.created'
  | 'schoolYearInstance.updated'
  | 'schoolYearInstance.deleted'
  | 'schoolYearInstance.archived'
  | 'schoolYearInstance.deactivated'
  | 'schoolYearInstance.reactivated'
  | 'schoolYearInstance.ends'
  | 'schoolYearTemplate.updated'
  | 'termTemplate.updated'
  | 'term.ends'
  | 'term.starts'
  | 'term.created'
  | 'term.deactivated'
  | 'term.archived'
  | 'lastTerm.ends'
  ;
export const publishSchoolYearEvent = async (
  eventType: SchoolYearServiceEventType,
  snapshot: Partial<SchoolYearInstance>
): Promise<void> => {
  const response = await client.send(
    new PutEventsCommand({
      Entries: [
        {
          EventBusName: process.env.EVENT_BUS_NAME,
          Source: 'aide.school.year',
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

export const publishTermEvent = async (
  eventType: SchoolYearServiceEventType,
  snapshot: Partial<Term>
): Promise<void> => {
  const response = await client.send(
    new PutEventsCommand({
      Entries: [
        {
          EventBusName: process.env.EVENT_BUS_NAME,
          Source: 'aide.school.term',
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

export const publishTermTemplateEvent = async (
  eventType: SchoolYearServiceEventType,
  snapshot: Partial<TermTemplate>
): Promise<void> => {
  const response = await client.send(
    new PutEventsCommand({
      Entries: [
        {
          EventBusName: process.env.EVENT_BUS_NAME,
          Source: 'aide.term.template',
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

export const publishSchoolYearTemplateEvent = async (
  eventType: SchoolYearServiceEventType,
  snapshot: Partial<SchoolYearTemplate>
): Promise<void> => {
  const response = await client.send(
    new PutEventsCommand({
      Entries: [
        {
          EventBusName: process.env.EVENT_BUS_NAME,
          Source: 'aide.year.template',
          DetailType: eventType,
          Detail: JSON.stringify({
            eventVersion: '1.0',
            id: snapshot.templateId,
            name: snapshot.templateName,
            snapshot,
          }),
        },
      ],
    })
  );

  console.log('EVENTBRIDGE RESPONSE', response);
};