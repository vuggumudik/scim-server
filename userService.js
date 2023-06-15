
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

    static getUsers() {
        return users.values();
    }

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

    static convertToUserObject(data) {
        return _.assign({}, data);
    }


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