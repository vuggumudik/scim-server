import _ from 'underscore';
import morgan from "morgan";
import express from "express";
import logger from "./logger.js";
import initSCIMMY from "./scimConfig.js";
import UserService from "./userService.js";
import GroupService from "./groupService.js";
import { authHandler } from "./authService.js";
import SCIMMYRouters, { SCIMMY } from "scimmy-routers";
// import InMemoryRepository from './repo/inMemoryRepo.js';
import Repository from './repo/sqliteRepo.js';
import SCIMGroup from './SCIMGroup.js';
import SCIMUser from './SCIMUser.js';



const app = express();

app.use(morgan("combined", { stream: { write: message => logger.http(message.trim()) } }));
logger.info("Starting SCIMMY server...");


initSCIMMY();

// const repository = new InMemoryRepository()
const repository = new Repository();
let groupService = new GroupService(repository);
let userService = new UserService(repository);

// SCIMMY.Resources.declare(SCIMMY.Resources.User)
//     .ingress((resource, data) => { return userService.ingressHandler(resource, data); })
//     .egress(resource => { return userService.egressHandler(resource); })
//     .degress(resource => { return userService.degressHandler(resource); });

// SCIMMY.Resources.declare(SCIMMY.Resources.Group)
//     .ingress((resource, data) => { return groupService.ingressHandler(resource, data); })
//     .egress(resource => { return groupService.egressHandler(resource); })
//     .degress(resource => { return groupService.degressHandler(resource); });


SCIMMY.Resources.declare(SCIMUser)
    .ingress((resource, data) => { return userService.ingressHandler(resource, data); })
    .egress(resource => { return userService.egressHandler(resource); })
    .degress(resource => { return userService.degressHandler(resource); });

SCIMMY.Resources.declare(SCIMGroup)
    .ingress((resource, data) => { return groupService.ingressHandler(resource, data); })
    .egress(resource => { return groupService.egressHandler(resource); })
    .degress(resource => { return groupService.degressHandler(resource); })
    .patch((resource, data) => { return groupService.patchHandler(resource, data); });

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
