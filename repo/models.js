// User model
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
  
  // Group model
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
  
  // UserGroup model
  class UserGroup {
    constructor(userId, groupId) {
      this.userId = userId;
      this.groupId = groupId;
    }
  }
  
  export { User, Group, UserGroup };
  