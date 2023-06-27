import { generateUUID, getEgressLogString } from './utils.js';
import logger from './logger.js';
import _ from 'lodash';

class GroupService {
  constructor(repository) {
    this.repo = repository;
  }

  async ingressHandler(resource, data) {
    try {
      logger.info(`${resource.operation} operation from tenant ${resource.tenant}`);
      logger.info(`Group Data: ${JSON.stringify(data)}`);
      if (resource.operation === "CREATE") {
        logger.info(`Create operation received from tenant ${resource.tenant}`);
        const group = this.convertToGroupObject(data);
        group.id = generateUUID();
        await this.repo.createGroup(group, resource.tenant);
        return group;
      } else if (resource.operation === "UPDATE") {
        logger.info(`Update operation received from tenant ${data.tenant}`);
        const group = this.repo.getGroup(resource.id, resource.tenant);
        if (group) {
          const cGroup = this.convertToGroupObject(data);
          cGroup.id = resource.id;
          await this.repo.updateGroup(resource.id, cGroup, resource.tenant);
          return cGroup;
        } else {
          throw new Error("Group not found");
        }
      } else if (resource.operation === "PATCH" || resource.operation === undefined) {
        logger.info(`Patch operation received from tenant ${resource.tenant}`);
        const cGroup = this.convertToGroupObject(data);
        cGroup.id = resource.id;
        await this.repo.updateGroup(resource.id, cGroup, resource.tenant);
        await this.updateGroupMembers(cGroup, resource.tenant);
        return cGroup;
      } else {
        logger.warn(`Unknown operation received from tenant ${resource.tenant}`);
      }
    } catch (err) {
      logger.error(`Error in ingressHandler ${err}`);
      throw err;
    }
    return undefined;
  }

  async egressHandler(resource) {
    try {
        logger.info(`Group : ${getEgressLogString(resource)}`);
      if (resource.id !== undefined) {
        const group = await this.repo.getGroup(resource.id, resource.tenant);
        if (!group)
          throw new Error("Group not found");
        else
          return [group];
      } else if (resource.filter && resource.filter.length > 0) {
        const groups = this.repo.filterGroups(resource.filter, resource.tenant);
        return groups;
      } else {
        const groups = await this.repo.getGroups(resource.tenant);
        if (!groups) {
          logger.error("Groups not found");
          throw new Error("Groups not found");
        } else {
          return groups;
        }
      }
    } catch (err) {
      logger.error(`Error in egressHandler ${err}`);
      throw err;
    }
  }

  async degressHandler(resource) {
    try {
      logger.info(`Delete operation received data with id ${resource.id}`);
      const group = await this.repo.getGroup(resource.id, resource.tenant);
      if (!group)
        throw new Error("Group not found");
      else {
        await this.repo.deleteAllUserGroupAssociation(resource.id, resource.tenant);
        await this.repo.deleteGroup(resource.id, resource.tenant);
      }
    } catch (err) {
      logger.error(`Error in degressHandler ${err}`);
      throw err;
    }
  }

  // Compare group members and update the group members as needed. Members information is in group.members
  async updateGroupMembers(group, tenant) {
    try {
      const existingGroup = await this.repo.getGroup(group.id, tenant);
      if (!existingGroup) {
        throw new Error("Group not found");
      } else {
        const existingMembers = existingGroup.members;
        const newMembers = group.members;
        const membersToAdd = newMembers.filter(obj1 => !existingMembers.some(obj2 => obj2.value === obj1.value));
        const membersToRemove = existingMembers.filter(obj2 => !newMembers.some(obj1 => obj1.value === obj2.value));
        for (const member of membersToAdd) {
          await this.repo.addGroupMember(group.id, member.value, tenant);
        }
        for (const member of membersToRemove) {
          await this.repo.removeGroupMember(group.id, member.value, tenant);
        }
      }
    } catch (err) {
      logger.error(`Error in updateGroupMembers ${err}`);
      throw err;
    }
  }

    

  async patchHandler(resource, data) {
    try {
      logger.info(`Group: Patch operation received data with id ${resource.id}`);
      const membershipPatchOperations = this.getMembershipPatchOperations(data);
      const nonMembershipPatchOperations = this.getNonMembershipPatchOperations(data);
      logger.info(`Group: Patch operation received data with id ${resource.id} membershipPatchOperations ${JSON.stringify(membershipPatchOperations)}`);
      if (membershipPatchOperations.length > 0) {
        for (const element of membershipPatchOperations) {
          if (element.op === "add") {
            // add member
            const values = element.value;
            for (const v of values) {
              await this.repo.addGroupMember(resource.id, v.value, resource.tenant);
            }
          } else if (element.op === "remove") {
            console.log("remove member calles with value" + element.value);
            // remove member
            const values = element.value;
            for (const v of values) {
              await this.repo.removeGroupMember(resource.id, v.value, resource.tenant);
            }
          } else if (element.op === "replace") {
            await this.repo.deleteAllUserGroupAssociation(resource.id, resource.tenant);
            const values = element.value;
            for (const v of values) {
              await this.repo.addGroupMember(resource.id, v.value, resource.tenant);
            }
          }
        }
      }      
    } catch (err) {
      logger.error(`Error in patchHandler ${err}`);
      throw err;
    }
  }

  convertToGroupObject(data) {
    const deepCopy = _.cloneDeep(data, true);
    return deepCopy;
  }

  getMembershipPatchOperations(message) {
    return message.Operations.filter(element => element.path === "members");
  }

  getNonMembershipPatchOperations(message) {
    return message.Operations.filter(element => element.path !== "members");
  }
}

export default GroupService;
