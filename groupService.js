

// This is a simple in-memory store for groups.  It is not intended for production use.
// It is only used to demonstrate the capabilities of the service.
// DEMONSTRATION ONLY.  NOT FOR PRODUCTION USE.

import _ from 'underscore';

const groups = new Map();

class GroupService {

    static createGroup(group) {
        if (!group.id) {
            throw new Error('Group ID is required');
        }

        if (groups.has(group.id)) {
            throw new Error('Group already exists');
        }

        groups.set(group.id, group);
        return group;
    }

    static getGroup(id) {
        return groups.get(id) || null;
    }

    static getGroups() {
        return groups.values();
    }

    static getGroupByName(name) {
        return _.find(groups.values(), (group) => {
            return group.name == name;
        });
    }

    static updateGroup(id, updatedGroup) {
        if (!groups.has(id)) {
            throw new Error('Group not found');
        }

        updatedGroup.id = id;
        groups.set(id, updatedGroup);
        return updatedGroup;
    }

    static deleteGroup(id) {
        if (!groups.has(id)) {
            throw new Error('Group not found');
        }

        groups.delete(id);
    }

    static convertToGroupObject(data) {
        return _.assign({}, data);
    }

    // Filter groups by field and value. Filter can be an array of filter criteria.
    // Example: [{userName: ['eq', 'bjensen']}, {active: ['eq', true]}].
    // Please refer to https://datatracker.ietf.org/doc/html/rfc7644#section-3.4.2.2 for more details.
    
    // Note: This is a simple implementation.  It does not support complex filters.
    static filterGroups(filter) {
        const field = Object.getOwnPropertyNames(filter[0])[0]
        const value = filter[0][field][1]
        var mapValues = [...groups.values()];
        let found = mapValues.filter(function (item) {
            return item[field] == value;
        });
        return found;
    }
}


export default GroupService;