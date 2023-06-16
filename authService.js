
import logger from "./logger.js";

// Map of valid scimType codes for each HTTP status code (where applicable)
const httpVerbToSCIMOP = { 'GET': 'READ', "POST": "CREATE", "PUT": "UPDATE", "PATCH": "PATCH", "DELETE": "DELETE" };

// TODO: Implement authentication and tenant resolution
function authHandler(req) {
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

// Need to implement this method
function authenticate(key) {
    if (key) {
        return true;
    } else {
        return false;
    }
}

// Need to implement this method properly.
function getTenant(key) {
    return "test-tenant"
}

export {
    authHandler,
    authenticate,
    getTenant,
    httpVerbToSCIMOP
}
