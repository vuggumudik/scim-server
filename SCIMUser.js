import { SCIMMY } from "scimmy-routers";
import logger from "./logger.js";
import { extractTenant, extractOperation, normalizePatchOp } from "./utils.js";
import { fixMissingCanonicalTypes } from "./userUtils.js";

/**
 * This class is an extension of the SCIMMY User resource. 
 * The main purpose of this class is:
 *  - to override the patch method so that some of the complex attributes can be patched properly.
 *  - to get a better handling on logging and error handling.
 * 
 */

class SCIMUser extends SCIMMY.Resources.User {

    /**
     * Instantiate a new SCIM User resource and parse any supplied parameters
     * @extends SCIMMY.Types.Resource
     */
    constructor(...params) {
        super(...params);
        this.operation = extractOperation(params);
        this.tenant = extractTenant(params);
    }

    async read() {
        try {
            return super.read()
        } catch (ex) {
            logger.error(ex);
            // Send a more generic error back as much as possible.
            if (ex instanceof Types.Error) throw ex;
            else if (ex instanceof TypeError) throw new Types.Error(400, "invalidValue", ex.message);
            else throw new Types.Error(404, null, `Resource ${this.id} not found`);
        }
    }


    async write(instance) {
        try {
            // Yet another fix for requests that are not coming with proper 
            // conanical values for the complex attributes such as emails, phone numbers and addresses.
            return super.write(fixMissingCanonicalTypes(instance));
        } catch (ex) {
            logger.error(ex);
            // Send a more generic error back as much as possible.
            if (ex instanceof Types.Error) throw ex;
            else if (ex instanceof TypeError) throw new Types.Error(400, "invalidValue", ex.message);
            else throw new Types.Error(404, null, `Resource ${this.id} not found`);
        }
    }

    async patch(message) {

        try {
            logger.info("Patch message is : " + JSON.stringify(message));
            message = normalizePatchOp(message);
            return super.patch(message);
        } catch (err) {
            console.log(err)
            logger.error(ex);
            // Send a more generic error back as much as possible.
            if (ex instanceof Types.Error) throw ex;
            else if (ex instanceof TypeError) throw new Types.Error(400, "invalidValue", ex.message);
            else throw new Types.Error(404, null, `Resource ${this.id} not found`);
        }
    }

    async dispose() {
        try {
            return super.dispose();
        } catch (ex) {
            logger.error(ex);
            // Send a more generic error back as much as possible.
            if (ex instanceof Types.Error) throw ex;
            else if (ex instanceof TypeError) throw new Types.Error(400, "invalidValue", ex.message);
            else throw new Types.Error(404, null, `Resource ${this.id} not found`);
        }
    }
}

export default SCIMUser;