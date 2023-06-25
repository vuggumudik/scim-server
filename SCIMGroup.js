import logger from "./logger.js";
import { SCIMMY } from "scimmy-routers";
import { extractTenant, extractOperation } from "./utils.js";

class SCIMGroup extends SCIMMY.Resources.Group {


    /** @implements {SCIMMY.Types.Resource.endpoint} */
    static get endpoint() {
        return "/Groups";
    }

    /** @private */
    static #basepath;
    /** @implements {SCIMMY.Types.Resource.basepath} */
    static basepath(path) {
        if (path === undefined) return SCIMGroup.#basepath;
        else if (SCIMGroup.#basepath === undefined)
            SCIMGroup.#basepath = (path.endsWith(SCIMGroup.endpoint) ? path : `${path}${SCIMGroup.endpoint}`);

        return SCIMGroup;
    }

    /** @implements {SCIMMY.Types.Resource.schema} */
    static get schema() {
        return SCIMMY.Schemas.Group;
    }

    /** @private */
    static #extensions = [];
    /** @implements {SCIMMY.Types.Resource.extensions} */
    static get extensions() {
        return SCIMGroup.#extensions;
    }

    /** @private */
    static #ingress = () => { };
    /** @implements {SCIMMY.Types.Resource.ingress} */
    static ingress(handler) {
        SCIMGroup.#ingress = handler;
        return SCIMGroup;
    }

    /** @private */
    static #patch = () => { };
    /** @implements {SCIMMY.Types.Resource.ingress} */
    static patch(handler) {
        SCIMGroup.#patch = handler;
        return SCIMGroup;
    }

    /** @private */
    static #egress = () => { };
    /** @implements {SCIMMY.Types.Resource.egress} */
    static egress(handler) {
        SCIMGroup.#egress = handler;
        return SCIMGroup;
    }

    /** @private */
    static #degress = () => { };
    /** @implements {SCIMMY.Types.Resource.degress} */
    static degress(handler) {
        SCIMGroup.#degress = handler;
        return SCIMGroup;
    }

    constructor(...params) {
        super(...params);
        this.operation = extractOperation(params);
        this.tenant = extractTenant(params);
    }

    // Copied from SCIMMY.Resources.Group
    async read() {
        if (!this.id) {
            return new SCIMMY.Messages.ListResponse((await SCIMGroup.#egress(this))
                .map(u => new SCIMMY.Schemas.Group(u, "out", SCIMGroup.basepath(), this.attributes)), this.constraints);
        } else {
            try {
                return new SCIMMY.Schemas.Group((await SCIMGroup.#egress(this)).shift(), "out", SCIMGroup.basepath(), this.attributes);
            } catch (ex) {
                if (ex instanceof SCIMMY.Types.Error) throw ex;
                else if (ex instanceof TypeError) throw new SCIMMY.Types.Error(400, "invalidValue", ex.message);
                else throw new SCIMMY.Types.Error(404, null, `Resource ${this.id} not found`);
            }
        }
        // return super.read();
    }

    // Copied from SCIMMY.Resources.Group
    async write(instance) {
        // return super.write(instance);
        if (instance === undefined)
            throw new SCIMMY.Types.Error(400, "invalidSyntax", `Missing request body payload for ${!!this.id ? "PUT" : "POST"} operation`);
        if (Object(instance) !== instance || Array.isArray(instance))
            throw new SCIMMY.Types.Error(400, "invalidSyntax", `Operation ${!!this.id ? "PUT" : "POST"} expected request body payload to be single complex value`);

        try {
            return new SCIMMY.Schemas.Group(
                await SCIMGroup.#ingress(this, new SCIMMY.Schemas.Group(instance, "in")),
                "out", SCIMGroup.basepath(), this.attributes
            );
        } catch (ex) {
            if (ex instanceof SCIMMY.Types.Error) throw ex;
            else if (ex instanceof TypeError) throw new SCIMMY.Types.Error(400, "invalidValue", ex.message);
            else throw new SCIMMY.Types.Error(404, null, `Resource ${this.id} not found`);
        }
    }

    // Copied from SCIMMY.Resources.Group
    async patch(message) {
        logger.info("Group: Patch message is : " + JSON.stringify(message));
        // super.patch(message);
        if (message === undefined)
            throw new SCIMMY.Types.Error(400, "invalidSyntax", "Missing message body from PatchOp request");
        if (Object(message) !== message || Array.isArray(message))
            throw new SCIMMY.Types.Error(400, "invalidSyntax", "PatchOp request expected message body to be single complex value");

        try {
            // Handle the membership changes differently.
            const membershipPatchOperations = this.getMembershipPatchOperations(message);
            const nonMembershipPatchOperations = this.getNonMembershipPatchOperations(message);
            if (membershipPatchOperations.length > 0) {
                // Handle the membership changes. This is hacky at this point. 
                // This is done here to avoid performance issues.
                SCIMGroup.#patch(this, message);
            }
            if (nonMembershipPatchOperations.length > 0) {
                message.Operations = nonMembershipPatchOperations;
                return await new SCIMMY.Messages.PatchOp(message)
                    .apply(new SCIMMY.Schemas.Group((await SCIMGroup.#egress(this)).shift(), "out"),
                        async (instance) => await SCIMGroup.#ingress(this, instance))
                    .then(instance => !instance ? undefined : new SCIMMY.Schemas.Group(instance, "out", SCIMGroup.basepath(), this.attributes));
            }
            return new SCIMMY.Schemas.Group((await SCIMGroup.#egress(this)).shift(), "out");
        } catch (ex) {
            if (ex instanceof Types.Error) throw ex;
            else if (ex instanceof TypeError) throw new SCIMMY.Types.Error(400, "invalidValue", ex.message);
            else throw new SCIMMY.Types.Error(404, null, `Resource ${this.id} not found`);
        }
    }

    async dispose() {
        if (!!this.id) await SCIMGroup.#degress(this);
        else throw new Types.Error(404, null, "DELETE operation must target a specific resource");
    }

    // check if the message array contains the path of member attribute
    getMembershipPatchOperations(message) {
        let patchInfo = []
        message.Operations.forEach(element => {
            if (element.path === "members") {
                patchInfo.push(element);
            }
        });
        return patchInfo;
    }

    getNonMembershipPatchOperations(message) {
        let patchInfo = []
        message.Operations.forEach(element => {
            if (element.path !== "members") {
                patchInfo.push(element);
            }
        });
        return patchInfo;
    }
}

export default SCIMGroup;
