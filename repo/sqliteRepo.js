
// This is a simple in-memory store for users.  It is not intended for production use.
// It is only used to demonstrate the capabilities of the service.
// DEMONSTRATION ONLY.  NOT FOR PRODUCTION USE.

import sqlite3 from "sqlite3";
import { open } from "sqlite";

class Repository {
    constructor() {
        this.dbOps = new DBOperations();
    }

    // -----------
    // Create a new user
    async createUser(user, tenant) {
        const foundUser = await this.dbOps.getUsersByUserName(user.userName, tenant);
        if (foundUser != undefined) {
            throw new Error('User with the same userName already exists');
        }

        const convertedUser = this.convertUser(user);
        this.dbOps.createUser(convertedUser, tenant);
        return user;
    }

    // Read a user by ID
    async getUser(id, tenant) {

        const u = await this.dbOps.getUserById(id, tenant);
        if (u) {
            return this.convertUserToOutbound(u);
        }
        return null;
        // return this.users.get(id) || null;
    }

    // Read all users. Pagenation is not implemented. 
    // scimConfig has the maxResults set to 200. 
    // Actual implementation should honor that number. 
    // This is a simple demo.
    async getUsers(tenant) {
        const users = await this.dbOps.getUsers(tenant);
        // const users = this.users.values();
        let x = []
        users.forEach(u => x.push(this.convertUserToOutbound(u)));
        return x;
    }

    // Read a user by userName
    async getUsersByUserName(userName, tenant) {
        const user = await this.dbOps.getUsersByUserName(userName, tenant);
        return this.convertUserToOutbound(user);
        // return user;
    }

    // Update a user by ID
    async updateUser(id, updatedUser, tenant) {
        const user = await this.dbOps.getUserById(id, tenant);

        if (user == undefined) {
            throw new Error('User not found');
        }

        updatedUser.id = id;
        const u = this.convertUser(updatedUser);
        this.dbOps.updateUser(id, u, tenant);
        return updatedUser;
    }

    // Delete a user by ID
    deleteUser(id, tenant) {
        this.dbOps.deleteUser(id, tenant);
    }

    // Filter users by field and value. Filter can be an array of filter criteria.
    // Example: [{userName: ['eq', 'bjensen']}, {active: ['eq', true]}].
    // Please refer to https://datatracker.ietf.org/doc/html/rfc7644#section-3.4.2.2 for more details.

    // Note: This is a simple implementation.  It does not support complex filters.
    async filterUsers(filter, tenant) {
        const field = Object.getOwnPropertyNames(filter[0])[0]
        const value = filter[0][field][1]
        if (field == 'userName') {
            const user = await this.dbOps.getUsersByUserName(value, tenant);
            if (user) {
                return [this.convertUserToOutbound(user)];
            }
            return [];
        }
    }

    convertUser(user) {
        const { id, externalId, userName, active, tenant } = user;
        const json = JSON.stringify(user);
        const firstName = user.name.familyName;
        const lastName = user.name.givenName;

        return new User(id, externalId, userName, firstName, lastName, active, tenant, json);
    }

    convertUserToOutbound(user) {
        const json = user.json;
        const u = JSON.parse(json);
        return u
    }

    convertUsersToOutbound(users) {
        let convertedUsers = [];
        users.forEach(user => {
            convertedUsers.push(this.convertUserToOutbound(user));
        });
        // const json = JSON.stringify(user);
        return convertedUsers
    }

    // ----------- Group Operations -------------
    async createGroup(group, tenant) {
        const foundGroup = await this.dbOps.getGroupByName(group.name, tenant);
        if (foundGroup != undefined) {
            // thow error with user id already exists
            throw new Error(`Group with {group.id} already exists`);
        }
        this.dbOps.createGroup(group, tenant);
        return group;
    }
    async getGroup(id, tenant) {
        const group = await this.dbOps.getGroupById(id, tenant);
        return group;
    }

    async getGroups(tenant) {
        const groups = await this.dbOps.getGroups(tenant);
        return groups;
    }


    async getGroupByName(name, tenant) {
        const g = await this.dbOps.getGroupByName(name, tenant);
        return g;
    }

    updateGroup(id, updatedGroup, tenant) {
        const group = this.dbOps.getGroupById(id, tenant);
        if (group == undefined) {
            throw new Error('Group not found');
        }

        updatedGroup.id = id;
        this.dbOps.updateGroup(id, updatedGroup, tenant);
        return updatedGroup;
    }

    deleteGroup(id, tenant) {
        this.dbOps.deleteGroup(id, tenant);
    }

    // Filter groups by field and value. Filter can be an array of filter criteria.
    // Example: [{userName: ['eq', 'bjensen']}, {active: ['eq', true]}].
    // Please refer to https://datatracker.ietf.org/doc/html/rfc7644#section-3.4.2.2 for more details.

    // Note: This is a simple implementation.  It does not support complex filters.
    filterGroups(filter, tenant) {
        const field = Object.getOwnPropertyNames(filter[0])[0]
        const value = filter[0][field][1]
        var mapValues = [...this.groups.values()];
        let found = mapValues.filter(function (item) {
            return item[field] == value;
        });
        return found;
    }

    // ----------- Group Member Operations -------------
    async addGroupMember(groupId, memberId, tenant) {
        const group = await this.dbOps.getGroupById(groupId, tenant);
        if (group == undefined) {
            throw new Error('Group not found');
        }
        const member = await this.dbOps.getUserById(memberId, tenant);
        if (member == undefined) {
            throw new Error('User not found');
        }
        this.dbOps.addGroupMember(groupId, memberId, tenant);
    }

    async removeGroupMember(groupId, memberId, tenant) {
        const group = await this.dbOps.getGroupById(groupId, tenant);
        if (group == undefined) {
            throw new Error('Group not found');
        }
        const member = await this.dbOps.getUserById(memberId, tenant);
        if (member == undefined) {
            throw new Error('User not found');
        }
        this.dbOps.removeGroupMember(groupId, memberId);
    }

    async deleteAllUserGroupAssociation(groupId, tenant) {
        this.dbOps.deleteAllUserGroupAssociation(groupId, tenant);
    }


}

/// -------------- Database operations ------------------
class DBOperations {
    constructor() {
        this.init();
    }

    async init() {
        this.db = await this.createDbConnection();
        await this.createTables();
    }
    createDbConnection() {
        return open({
            filename: './db/scim.db',
            driver: sqlite3.Database
        });
    }

    async createTables() {
        this.db.exec(`
            CREATE TABLE IF NOT EXISTS users (
            id TEXT PRIMARY KEY,
            externalId TEXT,
            userName TEXT,
            firstName TEXT,
            lastName TEXT,
            status TEXT,
            tenant TEXT,
            json TEXT,
            createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
            updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP
            )`);

        this.db.exec(`
            CREATE TABLE IF NOT EXISTS groups (
            id TEXT PRIMARY KEY,
            externalId TEXT,
            displayName TEXT,
            groupDescription TEXT,
            status TEXT,
            tenant TEXT,
            createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
            updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP
            )`);

        this.db.exec(`
            CREATE TABLE IF NOT EXISTS groupMembers (
            id TEXT PRIMARY KEY,
            groupId TEXT,
            userId TEXT,
            tenant TEXT,
            createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
            updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP
            )`);
    }

    async createUser(user, tenant) {
        const { id, userName, externalId, firstName, lastName, status, json } = user;

        try {
            const result = await this.db.run(`INSERT INTO users (id, externalId, userName, firstName, lastName, status, tenant, json)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
                [id, externalId, userName, firstName, lastName, status, tenant, json]
            );
        } catch (err) {
            throw new Error(err);
        }
    }

    async getUsers(tenant) {
        try {
            const rows = await this.db.all(`SELECT * FROM users where tenant = ?`, [tenant]);
            let users = [];
            rows.forEach(row => {
                const user = new User(row.id, row.externalId, row.userName, row.firstName, row.lastName, row.status, row.tenant, row.json);
                users.push(user);
            });
            return users;
        } catch (err) {
            throw new Error(err);
        }
    }

    // Read a user by ID
    async getUserById(userId, tenant) {
        let user;
        try {
            const row = await this.db.get(`SELECT * FROM users WHERE id = ? and tenant = ?`, [userId, tenant]);
            if (row) {
                user = new User(row.id, row.externalId, row.userName, row.firstName, row.lastName, row.status, row.tenant, row.json);
            }
        } catch (err) {
            throw new Error(err);
        }
        return user;
    }

    // Read a user by ID
    async getUsersByUserName(userName, tenant) {
        try {
            const row = await this.db.get(`SELECT * FROM users WHERE userName = ? and tenant = ?`, [userName, tenant]);
            if (row) {
                const user = new User(row.id, row.externalId, row.userName, row.firstName, row.lastName, row.status, row.tenant, row.json);
                return user;
            } else {
                return null
            }
        } catch (err) {
            throw new Error(err);
        }
    }

    // Update a user by ID
    async updateUser(userId, updatedUser, tenant) {
        const { userName, firstName, lastName, status, json } = updatedUser;

        await this.db.run(
            `UPDATE users SET userName = ?, firstName = ?, lastName = ?, status = ?, json = ?, updatedAt = CURRENT_TIMESTAMP WHERE id = ? AND tenant = ?`,
            [userName, firstName, lastName, status, json, userId, tenant]
        );
    }

    // Delete a user by ID
    async deleteUser(userId, tenant) {
        await this.db.run(`DELETE FROM users WHERE id = ? and tenant = ?`, [userId, tenant]);
    }

    // get groups
    async getGroups(tenant) {
        try {
            const rows = await this.db.all(`SELECT * FROM groups where tenant = ?`, [tenant]);
            let groups = [];
            rows.forEach(row => {
                const group = new Group(row.id, row.externalId, row.displayName, row.groupDescription, row.status, row.tenant);
                groups.push(group);
            });
            return groups;
        } catch (err) {
            throw new Error(err);
        }
    }

    // Read a group by ID
    async getGroupById(groupId, tenant) {
        try {
            const row = await this.db.get(`SELECT * FROM groups WHERE id = ? and tenant = ?`, [groupId, tenant]);
            if (row) {
                const group = new Group(row.id, row.externalId, row.displayName, row.groupDescription, row.status, row.tenant);
                return group;
            } else {
                return null
            }
        } catch (err) {
            throw new Error(err);
        }
    }

    // get group by name
    async getGroupByName(groupName, tenant) {
        try {
            const row = await this.db.get(`SELECT * FROM groups WHERE displayName = ? and tenant = ?`, [groupName, tenant]);
            if (row) {
                const group = new Group(row.id, row.externalId, row.displayName, row.groupDescription, row.status, row.tenant);
                return group;
            } else {
                return null
            }
        } catch (err) {
            throw new Error(err);
        }
    }

    // Create a new group
    async createGroup(group, tenant) {
        const { id, externalId, displayName, groupDescription, status } = group;

        await this.db.run(
            `INSERT INTO groups (id, externalId, displayName, groupDescription, status, tenant)
        VALUES (?, ?, ?, ?, ?, ?)`,
            [id, externalId, displayName, groupDescription, status, tenant]
        );
    }

    // Update a group by ID
    async updateGroup(groupId, updatedGroup, tenant) {
        const { displayName, groupDescription, status } = updatedGroup;

        await this.db.run(
            `UPDATE groups SET displayName = ?, groupDescription = ?, status = ?, updatedAt = CURRENT_TIMESTAMP
WHERE id = ? and tenant = ?`,
            [displayName, groupDescription, status, groupId, tenant]
        );
    }

    // Delete a group by ID
    async deleteGroup(groupId, tenant) {
        await this.db.run(`DELETE FROM groups WHERE id = ? and tenant = ?`, [groupId, tenant]);
    }

    async addGroupMember(groupId, userId, tenant) {
        await this.db.run(`INSERT INTO groupMembers (groupId, userId, tenant) VALUES (?, ?, ?)`, [groupId, userId, tenant]);
    }

    async removeGroupMember(groupId, userId) {
        await this.db.run(`DELETE FROM groupMembers WHERE groupId = ? AND userId = ?`, [groupId, userId]);
    }

    async deleteAllUserGroupAssociation(groupId, tenant) {
        await this.db.run(`DELETE FROM groupMembers WHERE groupId = ? AND tenant = ?`, [groupId, tenant]);
    }
}

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

export default Repository;