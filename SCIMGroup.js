import logger from "./logger.js";
import { SCIMMY } from "scimmy-routers";
import { extractTenant, extractOperation } from "./utils.js";

class SCIMGroup extends SCIMMY.Resources.Group {

    constructor(...params) {
        super(...params);
        this.operation = extractOperation(params);
        this.tenant = extractTenant(params);
    }

    // Copied from SCIMMY.Resources.Group
    async read() {
        return super.read();
    }

    // Copied from SCIMMY.Resources.Group
    async write(instance) {
        return super.write(instance);
    }

    // Copied from SCIMMY.Resources.Group
    async patch(message) {
        try {
        logger.info("Group: Patch message is : " + JSON.stringify(message));
        return super.patch(message);
        } catch (ex) {
            logger.error("Group: Patch message is : " + JSON.stringify(message));
            logger.error("Group: Patch error is : " + JSON.stringify(ex));
        }
    }

    async dispose() {
        super.dispose();
    }

   
}

export default SCIMGroup;
