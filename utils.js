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

// function extractTenant(params) {
//     let jsonStr = '';
//     if (params.length > 1) {
//         jsonStr = params[1];
//     } else {
//         jsonStr = params[0];
//     }
//     return jsonStr.tenant;
// }

function extractTenant(params) {
    let tenant = '';
    params.forEach(element => {
        if (element.tenant != undefined)
            tenant = element.tenant;
    });
    return tenant;
}

function extractOperation(params) {
    let operation = '';
    params.forEach(element => {
        if (element.operation != undefined)
            operation = element.operation;
    });
    return operation;
}

export {
    generateUUID,
    undefinedToEmptyStr,
    extractTenant,
    extractOperation
}