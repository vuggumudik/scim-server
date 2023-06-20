
import _ from 'underscore';
import { generateUUID } from './utils.js';
import logger from './logger.js';

class GroupService {

    constructor(repository) {
        this.repository = repository;
    }

    async ingressHandler(resource, data) {
        try {
            logger.info(`${data.op} operation from tenant ${resource.tenant}}`)
            if (data.op == "CREATE") {
                logger.info(`Create operation received from tenant ${resource.tenant}`);
                let group = this.convertToGroupObject(data);
                group.id = generateUUID();
                delete group.op;
                await this.repository.createGroup(group, resource.tenant)
                return group;
            } else if (data.op == "UPDATE") {
                logger.info(`Update operation received from tenant ${data.tenant}`);
                let group = this.repository.getGroup(resource.id, resource.tenant);
                if (group) {
                    let cGroup = this.convertToGroupObject(data);
                    cGroup.id = resource.id
                    delete group.op;
                    await this.repository.updateGroup(resource.id, cGroup, resource.tenant);
                    return cGroup;
                } else {
                    throw new Error("Group not found");
                }
            } else if (data.op == "PATCH" || data.op == undefined) {
                logger.info(`Patch operation received from tenant ${data.tenant}`);
                let cGroup = this.convertToGroupObject(data);
                cGroup.id = resource.id
                await this.repository.updateGroup(resource.id, cGroup);
                return cGroup;
            } else {
                logger.warn(`Unknown operation received from tenant ${data.tenant}`);
            }
        } catch (err) {
            logger.error(`Error in ingressHandler ${err}`)
            throw err;
        }
        return undefined;
    }

    async egressHandler(resource) {
        try {
            logger.info(`Read operation received with id ${resource.id} and filter ${resource.filter} and constraints ${resource.constraints}`)
            if (resource.id != undefined) {
                let group = await this.repository.getGroup(resource.id, resource.tenant);
                if (group == undefined)
                    throw new Error("Group not found")
                else {
                    return [group]
                }
            } else if (resource.filter != undefined && resource.filter.length > 0) {
                let groups = this.repository.filterGroups(resource.filter, resource.tenant);
                return groups
            } else {
                let groups = await this.repository.getGroups(resource.tenant);
                if (groups == undefined) {
                    logger.error(`Groups not found`)
                    throw new Error("Groups not found")
                } else {
                    return groups;
                }
            }
        } catch (err) {
            logger.error(`Error in egressHandler ${err}`)
            throw err;
        }
    }

    degressHandler(resource) {
        try {
            logger.info(`Delete operation received data with id ${resource.id}`)
            let group = this.repository.getGroup(resource.id)
            if (group == undefined) 
                throw new Error("Group not found")
            else {
                this.repository.deleteAllUserGroupAssociation(resource.id, resource.tenant);
                this.repository.deleteGroup(resource.id, resource.tenant);
            }
        } catch (err) {
            logger.error(`Error in degressHandler ${err}`)
            throw err;
        }
    }

    async patchHandler(resource, data) {
        try {
            logger.info(`Patch operation received data with id ${resource.id}`)
            const membershipPatchOperations = this.getMembershipPatchOperations(data);
            const nonMembershipPatchOperations = this.getNonMembershipPatchOperations(data);

            if (membershipPatchOperations.length > 0) {
                membershipPatchOperations.forEach(element => {
                    if (element.op === "add") {
                        // add member
                        const values = element.value;
                        values.forEach(v => {
                            this.repository.addGroupMember(resource.id, v.value, resource.tenant);
                        });
                    } else if (element.op === "remove") {
                        // remove member
                        const values = element.value;
                        values.forEach(v => {
                            this.repository.removeGroupMember(resource.id, v.value, resource.tenant);
                        });
                    } else if (element.op === "replace") {
                        this.repository.deleteAllUserGroupAssociation(resource.id, resource.tenant);
                        const values = element.value;
                        values.forEach(v => {
                            this.repository.addGroupMember(resource.id, v.value, resource.tenant);
                        });
                    }
                });
            }
        } catch (err) {
            logger.error(`Error in patchHandler ${err}`)
            throw err;
        }
    }

    convertToGroupObject(data) {
        return _.assign({}, data);
    }

    getMembershipPatchOperations(message) {
        let patchInfo = []
        message.Operations.forEach(element => {
            if (element.path === "members") {
                patchInfo.push(element);
            }
        });
        return patchInfo;
    }

    getNonMembershipPatchOperations(message) {
        let patchInfo = []
        message.Operations.forEach(element => {
            if (element.path !== "members") {
                patchInfo.push(element);
            }
        });
        return patchInfo;
    }
}


export default GroupService;

