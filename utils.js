import { v4 as uuidv4 } from 'uuid';

// Generate id for new user or group
function generateUUID() {
    return uuidv4();
}

export  {
    generateUUID
}

