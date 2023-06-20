import { SCIMMY } from "scimmy-routers";
import { extractTenant, extractOperation } from "./utils.js";

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
        return super.read()
    }


    async write(instance) {
        return super.write(instance);
    }

    async patch(message) {
        return super.patch(message);
    }

    async dispose() {
        return super.dispose();
    }
}

export default SCIMUser;