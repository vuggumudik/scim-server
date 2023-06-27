import logger from "./logger.js";

const tenantMapping = {'azure-ad': 'azure-ad-tenant', 'okta': 'okta-tenant', 'test-tenant': 'test-tenant'};

function authHandler(req) {
  // // Skip authentication for the UI
  // if (req.path.startsWith("/ui")) {
  //   logger.debug("Skipping authentication for UI");
  //   return;
  // }
  
  if (!authenticate(req)) {
    logger.info("Authentication failed");
    throw new Error("Authentication failed");
  }
  logger.debug("Authentication success");
}

function authenticate(key) {
  return !!key;
}

// Assumption is, buy the time this is called, authentication is already done.
function getTenant(key) {
    let token = "test-tenant";
    // Just for testing purposes..
    if (!key) {
        return token;
    }
    const tokens = key.split(" ");
    if (tokens.length > 1) {
        token = tokens[1];
    }
    // check if key is present in the mapping
    return tenantMapping[token] = tenantMapping[token] || token;
}

export { authHandler, authenticate, getTenant };
