
// This is a simple in-memory store for groups.  It is not intended for production use.
// It is only used to demonstrate the capabilities of the service.
// DEMONSTRATION ONLY.  NOT FOR PRODUCTION USE.

import Repository from "./repository.js";

class GroupRepository extends Repository {
    constructor() {
        super();
        this.groups = new Map();
    }

    createGroup(group) {
        if (!group.id) {
            throw new Error('Group ID is required');
        }
        if (this.groups.has(group.id)) {
            throw new Error('Group already exists');
        }
        this.groups.set(group.id, group);
        return group;
    }

    getGroup(id) {
        return this.groups.get(id) || null;
    }

    getGroups() {
        return this.groups.values();
    }

    getGroupByName(name) {
        return _.find(this.groups.values(), (group) => {
            return group.name == name;
        });
    }

    updateGroup(id, updatedGroup) {
        if (!this.groups.has(id)) {
            throw new Error('Group not found');
        }

        updatedGroup.id = id;
        this.groups.set(id, updatedGroup);
        return updatedGroup;
    }

    deleteGroup(id) {
        if (!this.groups.has(id)) {
            throw new Error('Group not found');
        }
        this.groups.delete(id);
    }

    // Filter groups by field and value. Filter can be an array of filter criteria.
    // Example: [{userName: ['eq', 'bjensen']}, {active: ['eq', true]}].
    // Please refer to https://datatracker.ietf.org/doc/html/rfc7644#section-3.4.2.2 for more details.

    // Note: This is a simple implementation.  It does not support complex filters.
    filterGroups(filter) {
        const field = Object.getOwnPropertyNames(filter[0])[0]
        const value = filter[0][field][1]
        var mapValues = [...this.groups.values()];
        let found = mapValues.filter(function (item) {
            return item[field] == value;
        });
        return found;
    }
}

export default GroupRepository;