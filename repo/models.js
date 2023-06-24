// Create a user model
class User {
    constructor(id, externalId, userName, firstName, lastName, status, tenant, json) {
        this.id = id;
        this.externalId = externalId;
        this.userName = userName;
        this.firstName = firstName;
        this.lastName = lastName;
        this.status = status;
        this.tenant = tenant;
        this.json = json;
    }
}

// Create a group model
class Group {
    constructor(id, externalId, displayName, groupDescription, status, tenant) {
        this.id = id;
        this.externalId = externalId;
        this.displayName = displayName;
        this.groupDescription = groupDescription;
        this.status = status;
        this.tenant = tenant;
    }
}

// Create a userGroup model
class UserGroup {
    constructor(userId, groupId) {
        this.userId = userId;
        this.groupId = groupId;
    }
}

export {
    User,
    Group,
    UserGroup
}