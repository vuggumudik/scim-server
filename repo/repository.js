import PGDBOperations from "./postgresRepo.js";
import { User, Group, UserGroup } from './models.js';

class Repository {
    constructor() {
        this.dbOps = new PGDBOperations();
    }

    async createUser(user, tenant) {
        const foundUser = await this.dbOps.getUsersByUserName(user.userName, tenant);
        if (foundUser) {
            throw new Error('User with the same userName already exists');
        }

        const convertedUser = this.convertUser(user);
        await this.dbOps.createUser(convertedUser, tenant);
        return user;
    }

    async getUser(id, tenant) {
        const user = await this.dbOps.getUserById(id, tenant);
        return user ? this.convertUserToOutbound(user) : null;
    }

    async getUsers(tenant) {
        const users = await this.dbOps.getUsers(tenant);
        return users.map(user => this.convertUserToOutbound(user));
    }

    async getUsersByUserName(userName, tenant) {
        const user = await this.dbOps.getUsersByUserName(userName, tenant);
        return this.convertUserToOutbound(user);
    }

    async updateUser(id, updatedUser, tenant) {
        const user = await this.dbOps.getUserById(id, tenant);
        if (!user) {
            throw new Error('User not found');
        }

        updatedUser.id = id;
        const convertedUser = this.convertUser(updatedUser);
        await this.dbOps.updateUser(id, convertedUser, tenant);
        return updatedUser;
    }

    async deleteUser(id, tenant) {
        await this.dbOps.deleteUser(id, tenant);
    }

    // Filter users by field and value. Filter can be an array of filter criteria.
    // Example: [{userName: ['eq', 'bjensen']}, {active: ['eq', true]}].
    // Please refer to https://datatracker.ietf.org/doc/html/rfc7644#section-3.4.2.2 for more details.

    // Note: This is a simple implementation.  It does not support complex filters.
    async filterUsers(filter, tenant) {
        const field = Object.getOwnPropertyNames(filter[0])[0];
        const value = filter[0][field][1];

        if (field === 'userName') {
            const user = await this.dbOps.getUsersByUserName(value, tenant);
            return user ? [this.convertUserToOutbound(user)] : [];
        }

        return [];
    }

    async createGroup(group, tenant) {
        const foundGroup = await this.dbOps.getGroupByName(group.name, tenant);
        if (foundGroup) {
            throw new Error(`Group with ${group.id} already exists`);
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
        const group = await this.dbOps.getGroupByName(name, tenant);
        return group;
    }

    async updateGroup(id, updatedGroup, tenant) {
        const group = await this.dbOps.getGroupById(id, tenant);
        if (!group) {
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
        const field = Object.getOwnPropertyNames(filter[0])[0];
        const value = filter[0][field][1];
        const mapValues = await this.dbOps.getGroups(tenant);

        return mapValues.filter(item => item[field] == value);
    }

    async addGroupMember(groupId, memberId, tenant) {
        const group = await this.dbOps.getGroupById(groupId, tenant);
        if (!group) {
            throw new Error('Group not found');
        }

        const member = await this.dbOps.getUserById(memberId, tenant);
        if (!member) {
            throw new Error('User not found');
        }

        await this.dbOps.addGroupMember(groupId, memberId, tenant);
    }

    async removeGroupMember(groupId, memberId, tenant) {
        const group = await this.dbOps.getGroupById(groupId, tenant);
        if (!group) {
            throw new Error('Group not found');
        }

        const member = await this.dbOps.getUserById(memberId, tenant);
        if (!member) {
            throw new Error('User not found');
        }

        await this.dbOps.removeGroupMember(groupId, memberId);
    }

    async deleteAllUserGroupAssociation(groupId, tenant) {
        await this.dbOps.deleteAllUserGroupAssociation(groupId, tenant);
    }

    convertUser(user) {
        const { id, externalId, userName, active, tenant, name } = user;
        const json = JSON.stringify(user);
        const firstName = name.familyName;
        const lastName = name.givenName;

        return new User(id, externalId, userName, firstName, lastName, active, tenant, json);
    }

    convertUserToOutbound(user) {
        const { json, ...u } = user;
        return JSON.parse(json);
    }

    convertUsersToOutbound(users) {
        return users.map(user => this.convertUserToOutbound(user));
    }
}

export default Repository;
