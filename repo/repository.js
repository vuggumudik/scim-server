import PGDBOperations from "./postgresRepo.js";
import { User, Group, UserGroup } from './models.js';

// All the async functions should be implemented in any replacement implementation.
class Repository {
    constructor() {
        this.dbOps = new PGDBOperations();
    }

    // ------------------- Begin Resource Service Interface -------------------
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
        await this.dbOps.updateUser(id, u, tenant);
        return updatedUser;
    }

    // Delete a user by ID
    async deleteUser(id, tenant) {
        await this.dbOps.deleteUser(id, tenant);
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

    // ----------- Group Operations -------------
    async createGroup(group, tenant) {
        const foundGroup = await this.dbOps.getGroupByName(group.name, tenant);
        if (foundGroup != undefined) {
            // thow error with user id already exists
            throw new Error(`Group with {group.id} already exists`);
        }
        await this.dbOps.createGroup(group, tenant);
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

    async updateGroup(id, updatedGroup, tenant) {
        const group = await this.dbOps.getGroupById(id, tenant);
        if (group == undefined) {
            throw new Error('Group not found');
        }

        updatedGroup.id = id;
        await this.dbOps.updateGroup(id, updatedGroup, tenant);
        return updatedGroup;
    }

    async deleteGroup(id, tenant) {
        await this.dbOps.deleteGroup(id, tenant);
    }

    // Filter groups by field and value. Filter can be an array of filter criteria.
    // Example: [{userName: ['eq', 'bjensen']}, {active: ['eq', true]}].
    // Please refer to https://datatracker.ietf.org/doc/html/rfc7644#section-3.4.2.2 for more details.

    // Note: This is a simple implementation.  It does not support complex filters.
    async filterGroups(filter, tenant) {
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
        await this.dbOps.addGroupMember(groupId, memberId, tenant);
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
        await this.dbOps.removeGroupMember(groupId, memberId);
    }

    async deleteAllUserGroupAssociation(groupId, tenant) {
        await this.dbOps.deleteAllUserGroupAssociation(groupId, tenant);
    }

    // ----------- End Repository Implementation -------------

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
}

export default Repository;
