import { EventBridgeEvent, APIGatewayProxyResult } from "aws-lambda";

export const handler = async (event: EventBridgeEvent<string, any>): Promise<APIGatewayProxyResult> => {
    console.log(`EVENT RECEIVED`, JSON.stringify(event, null, 2));

    const student = event.detail;

    console.log(`New student created: `, student);

    return {
        statusCode: 200,
        body: JSON.stringify({ message: 'processed '})
    }
}