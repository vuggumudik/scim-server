
import _ from 'underscore';
import { generateUUID, undefinedToEmptyStr } from './utils.js';
import logger from './logger.js';

class UserService {

    constructor(repository) {
        this.repository = repository;
    }

    async egressHandler(resource, data) {
        try {
            logger.info(`Read operation received with id ${resource.id} and filter ${resource.filter} and constraints ${resource.constraints}`)
            const filter = resource.filter
            if (resource.id != undefined) {
                let user = await this.repository.getUser(resource.id, resource.tenant);
                if (user == undefined) {
                    logger.error(`User not found with id ${resource.id}`)
                    throw new Error("User not found")
                } else {
                    return [user]
                }
            } else if (filter != undefined && filter.length > 0) {
                let users = await this.repository.filterUsers(filter, resource.tenant);
                return users
            } else {
                let users = await this.repository.getUsers(resource.tenant);
                if (users == undefined) {
                    logger.error(`Users not found`)
                    throw new Error("Users not found")
                } else {
                    return users;
                }
            }
        } catch (err) {
            logger.error(err);
            throw err;
        }
        return undefined;
    }

    async ingressHandler(resource, data) {
        try {
            logger.info(`${resource.operation} operation from tenant ${resource.tenant}`)
            if (resource.operation == "CREATE") {
                logger.info(`Create operation received from tenant ${resource.tenant}`);
                let user = this.convertToUserObject(data);
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
        return undefined;
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

    // Test this functionality more.  It is not working as expected.
    convertToUserObject(data) {
        return _.assign({}, data);
    }

}

export default UserService;