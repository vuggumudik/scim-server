import { v4 as uuidv4 } from 'uuid';

// Generate id for new user or group
function generateUUID() {
    return uuidv4();
}

// Convert undefined value to empty string or default value
function undefinedToEmptyStr(value, defaultValue) {
    return value === undefined ? defaultValue : value;
}

// Extract the tenant from an array of parameters
function extractTenant(params) {
    let tenant = '';
    params.forEach(element => {
        if (element.tenant !== undefined) {
            tenant = element.tenant;
        }
    });
    return tenant;
}

// Extract the operation from an array of parameters
function extractOperation(params) {
    let operation = '';
    params.forEach(element => {
        if (element.operation !== undefined) {
            operation = element.operation;
        }
    });
    return operation;
}

// Replace colons with dots in the path of the message
function replaceColonWithDot(message) {
    if (message.Operations !== undefined) {
        message.Operations.forEach(element => {
            if (element.path !== undefined) {
                if (element.path.startsWith('urn:ietf:params:scim:schemas:extension')) {
                    // only replace the last colon
                    // const lastColon = element.path.lastIndexOf(':');
                    // element.path = element.path.substring(0, lastColon) + '.' + element.path.substring(lastColon + 1);
                }else 
                    element.path = element.path.replace(/:/g, '.');
            }
        });
    }
    return message;
}

function breakMultiplePatchOperations(message) {
    const newMessage = { Operations: [] };

    if (message.Operations) {
        message.Operations.forEach(element => {
            if (element.path === undefined && element.value !== undefined) {
                Object.entries(element.value).forEach(([key, value]) => {
                    newMessage.Operations.push({ op: element.op, path: key, value });
                });
            } else {
                newMessage.Operations.push(element);
            }
        });

        message.Operations = newMessage.Operations;
    }

    return message;
}


// // Break multiple patch operations into separate patch operations
// function breakMultiplePatchOperations(message) {
//   const newMessage = { Operations: [] };
//   if (message.Operations !== undefined) {
//     message.Operations.forEach(element => {
//       if (element.path === undefined && element.value !== undefined) {
//         const keys = Object.keys(element.value);
//         keys.forEach(key => {
//           const newElement = { op: element.op };
//           newElement.path = key;
//           newElement.value = element.value[key];
//           newMessage.Operations.push(newElement);
//         });
//       } else {
//         newMessage.Operations.push(element);
//       }
//     });
//   }
//   message.Operations = newMessage.Operations;
//   return message;
// }

// Normalize the patch operation by replacing colons and breaking multiple operations
function normalizePatchOp(message) {
    const x = breakMultiplePatchOperations(message);
    return replaceColonWithDot(x);
}

function getEgressLogString(resource) {
    const { id, filter, constraints } = resource;
    const logMessage = [];

    if (id) {
        logMessage.push(`ID: ${id}`);
    }

    if (filter) {
        logMessage.push(`Filter: ${JSON.stringify(filter)}`);
    }

    if (constraints) {
        logMessage.push(`Constraints: ${JSON.stringify(constraints)}`);
    }

    if (logMessage.length > 0) {
        // console.debug(`Read operation received with ${logMessage.join(' and ')}`);
        return `Read operation received with ${logMessage.join(' and ')}`;
    }
    return '';
}
// Export the functions for external use
export {
    generateUUID,
    undefinedToEmptyStr,
    extractTenant,
    extractOperation,
    normalizePatchOp,
    getEgressLogString
};