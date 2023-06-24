
import logger from "./logger.js";


// TODO: Implement authentication and tenant resolution
function authHandler(req) {
    if (!authenticate(req)) {
        logger.info("Authentication failed");
        throw new Error("Authentication failed");
    }
    logger.debug("Authentication success");
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
    getTenant
}
