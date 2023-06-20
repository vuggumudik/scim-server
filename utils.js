import { v4 as uuidv4 } from 'uuid';

// Generate id for new user or group
function generateUUID() {
    return uuidv4();
}

function undefinedToEmptyStr(value, defaultValue) {
    if (value == undefined)
        return defaultValue;
    else
        return value;
}

function extractTenant(params) {
    let jsonStr = '';
    if (params.length > 1) {
        jsonStr = params[1];
    } else {
        jsonStr = params[0];
    }
    return jsonStr.tenant;
}

export {
    generateUUID,
    undefinedToEmptyStr,
    extractTenant
}