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
        element.path = element.path.replace(/:/g, '.');
      }
    });
  }
  return message;
}

// Break multiple patch operations into separate patch operations
function breakMultiplePatchOperations(message) {
  const newMessage = { Operations: [] };
  if (message.Operations !== undefined) {
    message.Operations.forEach(element => {
      if (element.path === undefined && element.value !== undefined) {
        const keys = Object.keys(element.value);
        keys.forEach(key => {
          const newElement = { op: element.op };
          newElement.path = key;
          newElement.value = element.value[key];
          newMessage.Operations.push(newElement);
        });
      } else {
        newMessage.Operations.push(element);
      }
    });
  }
  message.Operations = newMessage.Operations;
  return message;
}

// Normalize the patch operation by replacing colons and breaking multiple operations
function normalizePatchOp(message) {
  const normalizedMessage = replaceColonWithDot(message);
  return breakMultiplePatchOperations(normalizedMessage);
}

// Export the functions for external use
export {
  generateUUID,
  undefinedToEmptyStr,
  extractTenant,
  extractOperation,
  normalizePatchOp
};