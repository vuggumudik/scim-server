import { SCIMMY } from "scimmy-routers";

let scimConfig = {
    // "documentationUri": "/path/to/documentation.html",
    "patch": {
        "supported": false
    },
    "bulk": {
        "supported": false,
        "maxOperations": 1000,
        "maxPayloadSize": 1048576
    },
    "filter": {
        "supported": false,
        "maxResults": 200
    },
    "changePassword": {
        "supported": false
    },
    "sort": {
        "supported": false
    },
    "etag": {
        "supported": false
    },
    "authenticationSchemes": []
}

function initSCIMMY() {
    SCIMMY.Config.set(scimConfig);
    SCIMMY.Schemas.User.definition.truncate("externalId");
    SCIMMY.Schemas.Group.definition.truncate("externalId");
    SCIMMY.Schemas.User.definition.extend([new SCIMMY.Types.Attribute("string", "externalId", {shadow: true, caseExact: true, required: false }),]);
    SCIMMY.Schemas.Group.definition.extend([new SCIMMY.Types.Attribute("string", "externalId", {shadow: true, caseExact: true, required: false }),]);
    SCIMMY.Schemas.User.definition.extend(SCIMMY.Schemas.EnterpriseUser.definition);
    extendGroupMemberAttribute(SCIMMY.Schemas.Group.definition.attributes);
    extendAddressAttribute(SCIMMY.Schemas.User.definition.attributes);
}

function extendGroupMemberAttribute(attributes) {
    let members = attributes.find(attribute => attribute.name === 'members');
    let subAttributes = members.subAttributes;
    subAttributes.push(new SCIMMY.Types.Attribute("string", "display", { required: false }));
}

function extendAddressAttribute(attributes) {
    let address = attributes.find(attribute => attribute.name === 'addresses');
    let subAttributes = address.subAttributes;
    subAttributes.push(new SCIMMY.Types.Attribute("boolean", "primary", { required: false }));
}

export default initSCIMMY;
