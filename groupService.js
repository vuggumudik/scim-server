
import _ from 'underscore';
import GroupRepository from './groupRepository.js';
import { generateUUID } from './utils.js';
import logger from './logger.js';

class GroupService {

    constructor() {
        this.groupRepository = new GroupRepository();
    }

    ingressHandler(resource, data) {
        try {
            logger.info(`${data.op} operation from tenant ${data.tenant}}`)
            if (data.op == "CREATE") {
                logger.info(`Create operation received from tenant ${data.tenant}`);
                let group = this.convertToGroupObject(data);
                group.id = generateUUID();
                delete group.op;
                this.groupRepository.createGroup(group)
                // console.log(group);
                return group;
            } else if (data.op == "UPDATE") {
                logger.info(`Update operation received from tenant ${data.tenant}`);
                let group = this.groupRepository.getGroup(resource.id);
                if (group) {
                    let cGroup = this.convertToGroupObject(data);
                    cGroup.id = resource.id
                    delete group.op;
                    this.groupRepository.updateGroup(resource.id, cGroup);
                    return cGroup;
                } else {
                    throw new Error("Group not found");
                }
            } else if (data.op == "PATCH" || data.op == undefined) {
                logger.info(`Patch operation received from tenant ${data.tenant}`);
                let cGroup = this.convertToGroupObject(data);
                cGroup.id = resource.id
                this.groupRepository.updateGroup(resource.id, cGroup);
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

    egressHandler(resource) {
        try {
            logger.info(`Read operation received with id ${resource.id} and filter ${resource.filter} and constraints ${resource.constraints}`)
            if (resource.id != undefined) {
                let group = this.groupRepository.getGroup(resource.id);
                if (group == undefined)
                    throw new Error("Group not found")
                else {
                    return [group]
                }
            } else if (resource.filter != undefined && resource.filter.length > 0) {
                let groups = this.groupRepository.filterGroups(resource.filter);
                return groups
            } else {
                return [...this.groupRepository.getGroups()]
            }
        } catch (err) {
            logger.error(`Error in egressHandler ${err}`)
            throw err;
        }
    }

    degressHandler(resource) {
        try {
            logger.info(`Delete operation received data with id ${resource.id}`)
            let group = this.groupRepository.getGroup(resource.id)
            if (group == undefined)
                throw new Error("Group not found")
            else {
                this.groupRepository.deleteGroup(resource.id);
            }
        } catch (err) {
            logger.error(`Error in degressHandler ${err}`)
            throw err;
        }
    }

    convertToGroupObject(data) {
        return _.assign({}, data);
    }
}


export default GroupService;