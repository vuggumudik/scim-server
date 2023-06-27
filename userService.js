import _ from 'underscore';
import { generateUUID, getEgressLogString } from './utils.js';
import logger from './logger.js';
import { addMissingComplexTypes, cleanUpData } from "./userUtils.js"

/**
 * User service class that handles all the user related operations such as read, update, delete, etc.
 */
class UserService {
    constructor(repository) {
        this.repo = repository;
        // const { getUser, filterUsers, getUsers, createUser, updateUser, deleteUser } = this.repository;
        // this.getUser = getUser;
        // this.filterUsers = filterUsers;
        // this.getUsers = getUsers;
        // this.createUser = createUser;
        // this.updateUser = updateUser;
        // this.deleteUser = deleteUser;
    }

    async egressHandler(resource, data) {
        try {
            logger.info(`User : ${getEgressLogString(resource)}`);

            const { id, filter, operation, tenant } = resource;

            if (id) {
                let user = await this.repo.getUser(id, tenant);
                if (user) {
                    if (operation === "PATCH") {
                        user = addMissingComplexTypes(user);
                    }
                    // Log the user found with id
                    logger.debug(`User found with id ${id}`);
                    return [user];
                } else {
                    // Log the user not found with id
                    logger.error(`User not found with id ${id}`);
                    throw new Error("User not found");
                }
            } else if (filter && filter.length > 0) {
                // Log the filter details
                logger.debug(`${tenant} : Filter is ${filter}`);

                const users = await this.repo.filterUsers(filter, tenant);

                if (!users) {
                    logger.error(`Users not found with filter ${filter}`);
                } else {
                    logger.debug(`Number of users found is ${users.length}`);
                }

                return users;
            } else {
                // Return all users. Pagination is not implemented.
                const users = await this.repo.getUsers(tenant);

                if (users) {
                    return users;
                } else {
                    // Log users not found
                    logger.error('Users not found');
                    throw new Error("Users not found");
                }
            }
        } catch (err) {
            // Log the error
            logger.error(err);
            throw err;
        }
    }

    async ingressHandler(resource, data) {
        try {
            // Log the operation and data details
            logger.info(`Received ${resource.operation} request for user with id ${resource.id}`);
            logger.info(`Data: ${JSON.stringify(data)}`);

            const { operation, id, tenant } = resource;

            if (operation === "CREATE") {
                // Log the create operation
                const user = _.assign({}, data);
                user.id = generateUUID();
                await this.repo.createUser(user, tenant);
                return user;
            } else if (operation === "UPDATE") {
                // Log the update operation
                let user = this.repo.getUser(id, tenant);
                if (user) {
                    const cUser = _.assign({}, data);
                    cUser.id = id;
                    await this.repo.updateUser(id, cUser, tenant);
                    return cUser;
                } else {
                    throw new Error("User not found");
                }
            } else if (operation === "PATCH" || operation === undefined) {
                // Log the patch operation
                const cUser = _.assign({}, data);
                cUser.id = id;
                let cleanedUpData = cleanUpData(cUser);
                await this.repo.updateUser(id, cleanedUpData, tenant);
                // Clean up the data before returning
                return cleanedUpData;
            } else {
                // Log unknown operation
                logger.warn(`Operation ${operation} is unknown`);
            }
        } catch (err) {
            // Log the error
            logger.error(err);
            throw err;
        }
    }

    async degressHandler(resource) {
        try {
            // Log the delete operation with id
            logger.info(`Delete operation received data with id ${resource.id}`);

            const { id } = resource;
            let user = await this.repo.getUser(id);
            if (!user) {
                // Log user not found with id
                logger.error(`User with ${id} not found`);
                throw new Error("User not found");
            } else {
                // Implementation of this delete user should take into account the cascading delete of the user (e.g. delete any group membership, etc.)
                await this.repo.deleteUser(id);
            }
        } catch (err) {
            // Log the error
            logger.error(err);
            throw err;
        }
    }

    // This is a workaround and needs to be fixed in the future. Also, there is probably no need to support all types of
    // phones, emails, and addresses. We can just support one of each type.
    addMissingComplexTypes(data) {
        const defaultEmails = [
            { "value": "", "primary": true, "type": "work" },
            { "primary": false, "type": "home" },
            { "primary": false, "type": "other" }
        ];
        const defaultPhoneNumbers = [
            { "type": "work", "primary": true },
            { "type": "home", "primary": false },
            { "type": "mobile", "primary": false }
        ];
        const defaultAddresses = [
            { "type": "work" },
            { "type": "home" },
            { "type": "other" }
        ];

        if (!data.emails) {
            data.emails = defaultEmails;
        } else {
            const missingEmailTypes = defaultEmails.filter(email => !data.emails.find(e => e.type === email.type));
            data.emails.push(...missingEmailTypes);
        }

        if (!data.phoneNumbers) {
            data.phoneNumbers = defaultPhoneNumbers;
        } else {
            const missingPhoneNumberTypes = defaultPhoneNumbers.filter(phone => !data.phoneNumbers.find(p => p.type === phone.type));
            data.phoneNumbers.push(...missingPhoneNumberTypes);
        }

        if (!data.addresses) {
            data.addresses = defaultAddresses;
        } else {
            const missingAddressTypes = defaultAddresses.filter(address => !data.addresses.find(a => a.type === address.type));
            data.addresses.push(...missingAddressTypes);
        }

        // If type is not present, set it to the one that is missing. 
        data.emails.forEach(email => {
            if (!email.type) email.type = "work";
        });
        data.phoneNumbers.forEach(phone => {
            if (!phone.type) phone.type = "work";
        });
        data.addresses.forEach(address => {
            if (!address.type) address.type = "work";
        });

        return data;
    }

    cleanUpData(data) {
        // Remove the phonenumbers, emails, and addresses if the value is not present
        if (data.phoneNumbers) {
            data.phoneNumbers = data.phoneNumbers.filter(phone => phone.value);
        };
        if (data.phoneNumbers && data.phoneNumbers.length === 0) delete data.phoneNumbers;
        if (data.emails) {
            data.emails = data.emails.filter(email => email.value);
        }
        if (data.emails && data.emails.length === 0) delete data.emails;
        if (data.addresses) {
            data.addresses = data.addresses.filter(address => address.streetAddress || address.locality || address.region || address.postalCode || address.country);
        }
        if (data.addresses && data.addresses.length === 0) delete data.addresses;
        return data;
    }


}

export default UserService;
