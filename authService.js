
import logger from "./logger.js";

// Map of valid scimType codes for each HTTP status code (where applicable)
const httpVerbToSCIMOP = { 'GET': 'READ', "POST": "CREATE", "PUT": "UPDATE", "PATCH": "PATCH", "DELETE": "DELETE" };

// TODO: Implement authentication and tenant resolution
function authHandler(req) {
    logger.info("Authenticating request from " + req.ip + " with key " + req.headers["x-api-key"] + " and tenant " + req.headers["x-tenant-id"]);
    logger.info("Request body: " + JSON.stringify(req.body));
    if (!authenticate(req)) {
        logger.info("Authentication failed");
        throw new Error("Authentication failed");
    } else {
        logger.debug("Authentication success");
        req.body['tenant'] = getTenant(req);
        req.body['op'] = httpVerbToSCIMOP[req.method];
        console.log(req.method + ' : ' + httpVerbToSCIMOP[req.method]);
    }
}

function authenticate(key) {
    if (key) {
        return true;
    } else {
        return false;
    }
}

function getTenant(key) {
    return "test-tenant"
}

export {
    authHandler,
    authenticate,
    getTenant,
    httpVerbToSCIMOP
}
