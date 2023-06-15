
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