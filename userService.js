
import _ from 'underscore';
import { generateUUID } from './utils.js';
import logger from './logger.js';

/**
 * User service class that handles all the user related operations such as read, update, delete etc.
 */
class UserService {

    constructor(repository) {
        this.repository = repository;
    }

    async egressHandler(resource, data) {
        try {
            logger.info(`{resource.tenant} : Read operation received with id ${resource.id} and filter 
            ${resource.filter} and constraints ${resource.constraints}`)
            const filter = resource.filter
            if (resource.id) {
                let user = await this.repository.getUser(resource.id, resource.tenant);
                if (user) {
                    if (resource.operation == "PATCH") {
                        user = this.addMissingComplexTypes(user);
                    }
                    log.debug(`{resource.tenant} : User found with id ${resource.id}`)
                    return [user]
                } else {
                    logger.error(`{resource.tenant} : User not found with id ${resource.id}`)
                    throw new Error("User not found")
                }
            } else if (filter && filter.length > 0) {
                log.debug(`{resource.tenant} : Filter is ${filter}`)
                let users = await this.repository.filterUsers(filter, resource.tenant);
                if (users == undefined) 
                    logger.error(`{resource.tenant} : Users not found with filter ${filter}`)
                else 
                    log.debug(`{resource.tenant} : Number of users found is ${users.length}`)
                return users
            } else {
                // Return all users. Pagination is not implemented.
                let users = await this.repository.getUsers(resource.tenant);
                if (users) return users;
                else {
                    logger.error(`{resource.tenant} : Users not found`);
                    throw new Error("Users not found")
                } 
            }
        } catch (err) {
            logger.error(err);
            throw err;
        }
    }

    async ingressHandler(resource, data) {
        try {
            logger.info(`${resource.operation} operation from tenant ${resource.tenant}`)
            logger.debug(`Data: ${JSON.stringify(data)}`)
            if (resource.operation == "CREATE") {
                logger.info(`Create operation received from tenant ${resource.tenant}`);
                let user = this.convertToUserObject(data, resource.operation);
                user.id = generateUUID();
                await this.repository.createUser(user, resource.tenant)
                return user;
            } else if (resource.operation == "UPDATE") {
                logger.info(`Update operation received from tenant ${resource.tenant}`);
                let user = this.repository.getUser(resource.id, resource.tenant);
                if (user) {
                    let cUser = this.convertToUserObject(data);
                    cUser.id = resource.id
                    await this.repository.updateUser(resource.id, cUser, resource.tenant);
                    return cUser;
                } else {
                    throw new Error("User not found");
                }
            } else if (resource.operation == "PATCH" || resource.operation == undefined) {
                logger.info(`Patch operation received from tenant ${resource.tenant}`);
                // Patch operations are failing with out this fix. Changing the opensource library is complicated matter.
                // So implementing this workaround for now.
                let cUser = this.convertToUserObject(data);
                cUser.id = resource.id
                this.repository.updateUser(resource.id, cUser, resource.tenant);
                return cUser;
            } else {
                logger.warn(`Unknown operation received from tenant ${resource.tenant}`);
            }
        } catch (err) {
            logger.error(err);
            throw err;
        }
    }

    degressHandler(resource) {
        try {
            logger.info(`Delete operation received data with id ${resource.id}`)
            let user = this.repository.getUser(resource.id)
            if (user == undefined) {
                logger.error(`User not found with id ${resource.id}`)
                throw new Error("User not found")
            } else {
                this.repository.deleteUser(resource.id);
            }
        } catch (err) {
            logger.error(err);
            throw err;
        }
    }

    // This is a workaround and need to be fixed in the future. Also, there is probably no need to support all types of
    // phones, emails and addresses. We can just support one of each type.
    convertToUserObject(data, operation = "READ") {

        if (operation == "PATCH") {
            if (data.emails == undefined) {
                data.emails = [{ "value": "", "primary": true, "type": "work" },
                { "primary": false, "type": "home" },
                { "primary": false, "type": "other" }];
            }
            if (data.phoneNumbers == undefined) {
                data.phoneNumbers = [{ "type": "work", "primary": true },
                { "type": "home", "primary": false },
                { "type": "mobile", "primary": false }];
            }
            if (data.addresses == undefined) {
                data.addresses = [{ "type": "work" }, { "type": "home" }, { "type": "other" }];
            }
        }
        return _.assign({}, data);
    }

    addMissingComplexTypes(data) {
        if (data.emails == undefined) {
            data.emails = [{ "value": "", "primary": true, "type": "work" },
            { "primary": false, "type": "home" },
            { "primary": false, "type": "other" }];
        }
        if (data.phoneNumbers == undefined) {
            data.phoneNumbers = [{ "type": "work", "primary": true },
            { "type": "home", "primary": false },
            { "type": "mobile", "primary": false }];
        }
        if (data.addresses == undefined) {
            data.addresses = [{ "type": "work" }, { "type": "home" }, { "type": "other" }];
        }
        return data;
    }
}

export default UserService;