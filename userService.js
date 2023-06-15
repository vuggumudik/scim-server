// This is a simple in-memory store for users.  It is not intended for production use.
// It is only used to demonstrate the capabilities of the service.
// DEMONSTRATION ONLY.  NOT FOR PRODUCTION USE.

import _ from 'underscore';

const users = new Map();

class UserService {

    // Create a new user
    static createUser(user) {
        if (!user.id) {
            throw new Error('User ID is required');
        }

        if (users.has(user.id)) {
            throw new Error('User already exists');
        }

        users.set(user.id, user);
        return user;
    }

    // Read a user by ID
    static getUser(id) {
        return users.get(id) || null;
    }

    // Read all users. Pagenation is not implemented. 
    // scimConfig has the maxResults set to 200. 
    // Actual implementation should honor that number. 
    // This is a simple demo.
    static getUsers() {
        return users.values();
    }

    // Read a user by userName
    static getUserByUserName(userName) {
        return _.find(users.values(), (user) => {
            return user.userName == userName;
        });
    }

    // Update a user by ID
    static updateUser(id, updatedUser) {
        if (!users.has(id)) {
            throw new Error('User not found');
        }

        updatedUser.id = id;
        users.set(id, updatedUser);
        return updatedUser;
    }


    // Delete a user by ID
    static deleteUser(id) {
        if (!users.has(id)) {
            throw new Error('User not found');
        }

        users.delete(id);
    }

    // Test this functionality more.  It is not working as expected.
    static convertToUserObject(data) {
        return _.assign({}, data);
    }

    // Filter users by field and value. Filter can be an array of filter criteria.
    // Example: [{userName: ['eq', 'bjensen']}, {active: ['eq', true]}].
    // Please refer to https://datatracker.ietf.org/doc/html/rfc7644#section-3.4.2.2 for more details.
    
    // Note: This is a simple implementation.  It does not support complex filters.
    static filterUsers(filter) {
        const field = Object.getOwnPropertyNames(filter[0])[0]
        const value = filter[0][field][1]
        var mapValues = [...users.values()];
        let found = mapValues.filter(function (item) {
            return item[field] == value;
        });
        return found;
    }

}


export default UserService;