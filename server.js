import express from "express";
import logger from "./logger.js";
import initSCIMMY from "./scimConfig.js";
import UserService from "./userService.js";
import GroupService from "./groupService.js";
import { authHandler, getTenant } from "./authService.js";
import SCIMMYRouters, { SCIMMY } from "scimmy-routers";
import Repository from './repo/repository.js';
import SCIMGroup from './SCIMGroup.js';
import SCIMUser from './SCIMUser.js';

// Map HTTP verbs to SCIM operations
const httpVerbToSCIMOP = {
  'GET': 'READ',
  'POST': 'CREATE',
  'PUT': 'UPDATE',
  'PATCH': 'PATCH',
  'DELETE': 'DELETE'
};

const app = express();

// Log a message indicating that the SCIMMY server is starting
logger.info("Starting SCIMMY server...");

// Initialize SCIMMY
initSCIMMY();

// Create a repository instance
const repository = new Repository();

// Create service instances for handling users and groups
const groupService = new GroupService(repository);
const userService = new UserService(repository);

// Declare SCIM resources and their corresponding handlers
SCIMMY.Resources.declare(SCIMUser)
  .ingress(userService.ingressHandler) // Handler for resource creation
  .egress(userService.egressHandler) // Handler for resource retrieval
  .degress(userService.degressHandler); // Handler for resource deletion

SCIMMY.Resources.declare(SCIMGroup)
  .ingress(groupService.ingressHandler)
  .egress(groupService.egressHandler)
  .degress(groupService.degressHandler)
  .patch(groupService.patchHandler); // Handler for resource patching

// Middleware to map HTTP verbs to SCIM operations
const httpVerbToSCIMOPMiddleware = (req, res, next) => {
  req.query.operation = httpVerbToSCIMOP[req.method];
  next();
};

// Middleware to attach the tenant to the logger's metadata or context
const loggerMiddleware = (req, res, next) => {
  const tenant = req.query.tenant;
  logger.defaultMeta = { tenant };
  console.log("tenant is: " + tenant);
  next();
};

// Middleware to extract the tenant from the request
const tenantMiddleware = (req, res, next) => {
  const tenant = getTenant(req);
  if (!tenant) {
    logger.error("No tenant found in request");
    res.status(400).send("No tenant found in request");
    return;
  }
  logger.defaultMeta = { tenant };
  req.query.tenant = tenant;
  next();
};

// Mount the middlewares
app.use(tenantMiddleware);
app.use(loggerMiddleware);
app.use(httpVerbToSCIMOPMiddleware);

// Log all requests using the logger
app.use((req, res, next) => {
  logger.info(`{method: ${req.method}, url: ${req.url}, statusCode: ${res.statusCode}`);
  next();
});

// Mount SCIMMY routers for handling SCIM endpoints
app.use("/scim/v2", new SCIMMYRouters({
  type: "bearer",
  docUri: "http://example.com/help/oauth.html",
  handler: authHandler
}));

const port = process.env.PORT || 3000;

// Start the server and listen on the specified port
app.listen(port, () => {
  logger.info(`Server started on port ${port}`);
});
