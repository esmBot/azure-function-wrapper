/*
 * This function is not intended to be invoked directly. Instead it will be
 * triggered by an HTTP starter function.
 * 
 * Before running this sample, please:
 * - create a Durable activity function (default name is "Hello")
 * - create a Durable HTTP starter function
 * - run 'npm install durable-functions' from the wwwroot folder of your 
 *    function app in Kudu
 */

import { orchestrator } from "durable-functions";

export default orchestrator(function* (context) {
  return yield context.df.callActivity("ImageRunner", Object.assign({ instanceId: context.bindingData.instanceId }, context.bindingData.input));
});