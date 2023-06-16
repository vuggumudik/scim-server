import _ from 'underscore';
import morgan from "morgan";
import express from "express";
import logger from "./logger.js";
import initSCIMMY from "./scimConfig.js";
import UserService from "./userService.js";
import GroupService from "./groupService.js";
import { authHandler } from "./authService.js";
import SCIMMYRouters, { SCIMMY } from "scimmy-routers";

const app = express();

app.use(morgan("combined", { stream: { write: message => logger.http(message.trim()) } }));
logger.info("Starting SCIMMY server...");


initSCIMMY();

let groupService = new GroupService();
let userService = new UserService();

SCIMMY.Resources.declare(SCIMMY.Resources.User)
    .ingress((resource, data) => { return userService.ingressHandler(resource, data); })
    .egress(resource => { return userService.egressHandler(resource); })
    .degress(resource => { return userService.degressHandler(resource); });

SCIMMY.Resources.declare(SCIMMY.Resources.Group)
    .ingress((resource, data) => { return groupService.ingressHandler(resource, data); })
    .egress(resource => { return groupService.egressHandler(resource); })
    .degress(resource => { return groupService.degressHandler(resource); });

// Log all requests using logger
app.use((req, res, next) => {
    logger.info({
        method: req.method,
        url: req.url,
        statusCode: res.statusCode
    });
    next();
});

app.use("/scim/v2", new SCIMMYRouters({
    type: "bearer",
    docUri: "http://example.com/help/oauth.html",
    handler: authHandler
}));

const port = process.env.PORT || 3000;
app.listen(port, () => {
    logger.info(`Server started on port ${port}`);
});
