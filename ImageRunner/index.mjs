/*
 * This function is not intended to be invoked directly. Instead it will be
 * triggered by an orchestrator function.
 * 
 * Before running this sample, please:
 * - create a Durable orchestration function
 * - create a Durable HTTP starter function
 * - run 'npm install durable-functions' from the wwwroot folder of your
 *   function app in Kudu
 */

import runJob from "../esmBot/utils/image-runner.js";
import fetch from "node-fetch";

export default async function(context) {
  const object = context.bindings.job;
  // If the image has a path, it must also have a type
  if (object.path && !object.params.type) {
    throw new TypeError("Unknown image type");
  }

  const timeout = setTimeout(() => {
    throw new Error("Job timed out");
  }, 900000);
  context.log(`Starting job ${context.executionContext.invocationId}: ${object}`);
  try {
    const result = await runJob(object);
    context.log(`Finished job ${context.executionContext.invocationId}`);
    clearTimeout(timeout);
    let contentType;
    switch (result.fileExtension) {
      case "gif":
        contentType = "image/gif";
        break;
      case "png":
        contentType = "image/png";
        break;
      case "jpeg":
      case "jpg":
        contentType = "image/jpeg";
        break;
      case "webp":
        contentType = "image/webp";
        break;
    }
    try {
      await fetch(context.bindings.job.callback, { method: "POST", body: result.buffer, headers: { Authorization: process.env.WEBHOOK_AUTH, "Content-Type": contentType ?? result.fileExtension, "X-Azure-ID": object.instanceId } });
    } catch (e) {
      context.log.error(`Failed to send webhook request: ${e}`);
    }
    return result;
  } catch (e) {
    clearTimeout(timeout);
    context.log.error(`Failed running job ${context.executionContext.invocationId}: ${e}`);
    try {
      await fetch(context.bindings.job.callback, { method: "POST", body: JSON.stringify({ error: true, message: e.toString() }), headers: { Authorization: process.env.WEBHOOK_AUTH, "X-Azure-ID": object.instanceId } });
    } catch (e) {
      context.log.error(`Failed to send webhook request: ${e}`);
    }
    throw e;
  }
}