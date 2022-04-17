import { getClient } from "durable-functions";

export default async function(context, req) {
  const client = getClient(context);
  const instanceId = await client.startNew(req.params.functionName, undefined, req.body);

  context.log(`Started orchestration with ID = '${instanceId}'.`);

  return {
    status: 200,
    body: {
      id: instanceId
    },
    contentType: "application/json"
  };
}