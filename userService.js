// This is a simple in-memory store for users.  It is not intended for production use.
// It is only used to demonstrate the capabilities of the service.
// DEMONSTRATION ONLY.  NOT FOR PRODUCTION USE.

import UserRepository from './userRepository.js';
import _ from 'underscore';
import { generateUUID, undefinedToEmptyStr } from './utils.js';
import logger from './logger.js';


class UserService {

    constructor() {
        this.userRepository = new UserRepository();
    }

    egressHandler(resource, data) {
        try {
            logger.info(`Read operation received with id ${resource.id} and filter ${resource.filter} and constraints ${resource.constraints}`)
            const filter = resource.filter
            if (resource.id != undefined) {
                let user = this.userRepository.getUser(resource.id);
                if (user == undefined)
                    throw new Error("User not found")
                else {
                    return [user]
                }
            } else if (filter != undefined && filter.length > 0) {
                let users = this.userRepository.filterUsers(filter);
                return users
            } else {
                return [...this.userRepository.getUsers()];
            }
        } catch (err) {
            logger.error(err);
            throw err;
        }
        return undefined;
    }

    ingressHandler(resource, data) {
        try {
            logger.info(`${data.op} operation from tenant ${data.tenant}`)
            if (data.op == "CREATE") {
                logger.info(`Create operation received from tenant ${data.tenant}`);
                let user = this.convertToUserObject(data);
                user.id = generateUUID();
                delete user.op;
                this.userRepository.createUser(user)
                return user;
            } else if (data.op == "UPDATE") {
                logger.info(`Update operation received from tenant ${data.tenant}`);
                let user = this.userRepository.getUser(resource.id);
                if (user) {
                    let cUser = this.convertToUserObject(data);
                    cUser.id = resource.id
                    delete user.op;
                    this.userRepository.updateUser(resource.id, cUser);
                    return cUser;
                } else {
                    throw new Error("User not found");
                }
            } else if (data.op == "PATCH" || data.op == undefined) {
                logger.info(`Patch operation received from tenant ${data.tenant}`);
                let cUser = this.convertToUserObject(data);
                cUser.id = resource.id
                this.userRepository.updateUser(resource.id, cUser);
                return cUser;
            } else {
                logger.warn(`Unknown operation received from tenant ${data.tenant}`);
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
            let user = this.userRepository.getUser(resource.id)
            if (user == undefined)
                throw new Error("User not found")
            else {
                this.deleteUser(resource.id);
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