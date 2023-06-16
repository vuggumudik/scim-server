
import Repository from "./repository.js";

class UserRepository extends Repository {
  constructor() {
    super();
    this.users = new Map();
  }

  // Create a new user
  createUser(user) {
    if (!user.id) {
      throw new Error('User ID is required');
    }

    if (this.users.has(user.id)) {
      throw new Error('User already exists');
    }

    this.users.set(user.id, user);
    return user;
  }

  // Read a user by ID
  getUser(id) {
    return this.users.get(id) || null;
  }

  // Read all users. Pagenation is not implemented. 
  // scimConfig has the maxResults set to 200. 
  // Actual implementation should honor that number. 
  // This is a simple demo.
  getUsers() {
    const users = this.users.values();
    return users;
  }

  // Read a user by userName
  getUserByUserName(userName) {
    const user = _.find(this.users.values(), (user) => {
      return user.userName == userName;
    });
    return user;
  }

  // Update a user by ID
  updateUser(id, updatedUser) {
    if (!this.users.has(id)) {
      throw new Error('User not found');
    }

    updatedUser.id = id;
    this.users.set(id, updatedUser);
    return updatedUser;
  }

  // Delete a user by ID
  deleteUser(id) {
    if (!this.users.has(id)) {
      throw new Error('User not found');
    }

    this.users.delete(id);
  }

  // Filter users by field and value. Filter can be an array of filter criteria.
  // Example: [{userName: ['eq', 'bjensen']}, {active: ['eq', true]}].
  // Please refer to https://datatracker.ietf.org/doc/html/rfc7644#section-3.4.2.2 for more details.

  // Note: This is a simple implementation.  It does not support complex filters.
  filterUsers(filter) {
    const field = Object.getOwnPropertyNames(filter[0])[0]
    const value = filter[0][field][1]
    var mapValues = [...this.users.values()];
    let found = mapValues.filter(function (item) {
      return item[field] == value;
    });
    return found;
  }
}



export default UserRepository;
