import express from "express";
import SCIMMYRouters, { SCIMMY } from "scimmy-routers";
import _ from 'underscore';
import { authenticate, getTenant } from "./authService.js";
import UserService from "./userService.js";
import GroupService from "./groupService.js";
import { generateUUID } from "./utils.js";
import { scimConfig } from "./config.js";
import logger from "./logger.js"; // Import the logger
import morgan from "morgan"; // Import morgan for logging

// Map of valid scimType codes for each HTTP status code (where applicable)
const httpVerbToSCIMOP = { 'GET': 'READ', "POST": "CREATE", "PUT": "UPDATE", "PATCH": "PATCH", "DELETE": "DELETE" };

const app = express();

app.use(morgan("combined", { stream: { write: message => logger.http(message.trim()) } }));
logger.info("Starting SCIMMY server...");

SCIMMY.Config.set(scimConfig);
SCIMMY.Schemas.User.definition.extend([new SCIMMY.Types.Attribute("string", "op", { required: false })]);
SCIMMY.Schemas.User.definition.extend([new SCIMMY.Types.Attribute("string", "tenant", { required: false })]);
SCIMMY.Schemas.User.definition.extend(SCIMMY.Schemas.EnterpriseUser.definition);
SCIMMY.Schemas.Group.definition.extend([new SCIMMY.Types.Attribute("string", "op", { required: false })]);
SCIMMY.Schemas.Group.definition.extend([new SCIMMY.Types.Attribute("string", "tenant", { required: false })]);

SCIMMY.Resources.declare(SCIMMY.Resources.User)
    .ingress((resource, data) => {
        logger.info(`${data.op} operation from tenant ${data.tenant}}`)
        if (data.op == "CREATE") {
            logger.info(`Create operation received from tenant ${data.tenant}`);
            let user = UserService.convertToUserObject(data);
            user.id = generateUUID();
            delete user.op;
            UserService.createUser(user)
            console.log(user);
            return user;
        } else if (data.op == "UPDATE") {
            logger.info(`Update operation received from tenant ${data.tenant}`);
            let user = UserService.getUser(resource.id);
            if (user) {
                let cUser = UserService.convertToUserObject(data);
                cUser.id = resource.id
                delete user.op;
                UserService.updateUser(resource.id, cUser);
                return cUser;
            } else {
                throw new Error("User not found");
            }
        } else if (data.op == "PATCH" || data.op == undefined) {
            logger.info(`Patch operation recenved from tenant ${data.tenant}`);
            let cUser = UserService.convertToUserObject(data);
            cUser.id = resource.id
            UserService.updateUser(resource.id, cUser);
            return cUser;
        } else {
            logger.warn(`Unknown operation received from tenant ${data.tenant}`);
        }
    })
    .egress((resource) => {
        logger.info(`Read operation received with id ${resource.id} and filter ${resource.filter} and constraints ${resource.constraints}`)

        // Implement logic that looks 
        const filter = resource.filter

        if (resource.id != undefined) {
            let user = UserService.getUser(resource.id);
            if (user == undefined)
                throw new Error("User not found")
            else {
                return [user]
            }
        } else if (filter != undefined && filter.length > 0) {
            let users = UserService.filterUsers(filter);
            return users
        } else {
            return [...UserService.getUsers()]
        }
    })
    .degress((resource) => {
        logger.info(`Delete operation received data with id ${resource.id}`)
        let user = getUser(resource.id)
        if (user == undefined)
            throw new Error("User not found")
        else {
            UserService.deleteUser(resource.id);
        }
    });

SCIMMY.Resources.declare(SCIMMY.Resources.Group)
    .ingress((resource, data) => {
        logger.info(`${data.op} operation from tenant ${data.tenant}}`)
        if (data.op == "CREATE") {
            logger.info(`Create operation received from tenant ${data.tenant}`);
            let group = GroupService.convertToGroupObject(data);
            group.id = generateUUID();
            delete group.op;
            GroupService.createGroup(group)
            console.log(group);
            return group;
        } else if (data.op == "UPDATE") {
            logger.info(`Update operation received from tenant ${data.tenant}`);
            let group = GroupService.getGroup(resource.id);
            if (group) {
                let cGroup = GroupService.convertToGroupObject(data);
                cGroup.id = resource.id
                delete group.op;
                GroupService.updateGroup(resource.id, cGroup);
                return cGroup;
            } else {
                throw new Error("Group not found");
            }
        } else if (data.op == "PATCH" || data.op == undefined) {
            logger.info(`Patch operation recenved from tenant ${data.tenant}`);
            let cGroup = GroupService.convertToGroupObject(data);
            cGroup.id = resource.id
            GroupService.updateGroup(resource.id, cGroup);
            return cGroup;
        } else {
            logger.warn(`Unknown operation received from tenant ${data.tenant}`);
        }
    })
    .egress((resource) => {
        logger.info(`Read operation received with id ${resource.id} and filter ${resource.filter} and constraints ${resource.constraints}`)
        if (resource.id != undefined) {
            let group = GroupService.getGroup(resource.id);
            if (group == undefined)
                throw new Error("Group not found")
            else {
                return [group]
            }
        } else if (resource.filter != undefined && resource.filter.length > 0) {
            let groups = GroupService.filterGroups(resource.filter);
            return groups
        } else {
            return [...GroupService.getGroups()]
        }
    })
    .degress((resource) => {
        logger.info(`Delete operation received data with id ${resource.id}`)
        let group = GroupService.getGroup(resource.id)
        if (group == undefined)
            throw new Error("Group not found")
        else {
            GroupService.deleteGroup(resource.id);
        }
    });

// Log all requests using logger
app.use((req, res, next) => {
    logger.info({
        method: req.method,
        url: req.url,
        statusCode: res.statusCode
    });
    next();
});

// Instantiate SCIMMYRouters as new middleware for express
app.use("/scim/v2", new SCIMMYRouters({
    type: "bearer",
    docUri: "http://example.com/help/oauth.html",

    handler: (request) => {
        logger.debug("In handler function");
        if (!authenticate(request)) {
            logger.info("Authentication failed");
            throw new Error("Authentication failed");
        } else {
            logger.debug("Authentication success");
            request.body['tenant'] = getTenant(request);
            request.body['op'] = httpVerbToSCIMOP[request.method];
            console.log(request.method + ' : ' + httpVerbToSCIMOP[request.method]);
        }
    }
}));

// Start the server
const port = process.env.PORT || 3000;
app.listen(port, () => {
    logger.info(`Server started on port ${port}`);
});
