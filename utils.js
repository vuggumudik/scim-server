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

export {
    generateUUID,
    undefinedToEmptyStr
}