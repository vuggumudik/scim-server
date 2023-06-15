
let scimConfig = {
    // "documentationUri": "/path/to/documentation.html",
    "patch": {
        "supported": true
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

export  {
    scimConfig
}
