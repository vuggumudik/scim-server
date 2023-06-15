
import { v4 as uuidv4 } from 'uuid';

function generateUUID() {
    return uuidv4();
}

function generateFilterResponse(results) {
    return {
        "schemas":  [
            "urn:scim:schemas:core:1.0"
          ],
        "totalResults": results.length,
        "Resources": results
    }
}

export  {
    generateUUID,
    generateFilterResponse
}

