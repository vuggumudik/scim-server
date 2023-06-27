import logger from '../logger.js';
import { User, Group, UserGroup } from './models.js';
import pkg from 'pg';

const { Pool } = pkg;

class PGDBOperations {
  constructor() {
    this.init();
  }

  async init() {
    this.db = new Pool({
      user: process.env.DB_USER,
      host: process.env.DB_HOST,
      database: process.env.DB_NAME,
      password: process.env.DB_PASSWORD,
      port: process.env.DB_PORT,
    });

    await this.createTables();
  }

  async createTables() {
    try {
      await this.db.query(`
        CREATE TABLE IF NOT EXISTS users (
          id TEXT PRIMARY KEY,
          externalid TEXT,
          username TEXT,
          firstname TEXT,
          lastname TEXT,
          status TEXT,
          tenant TEXT,
          json TEXT,
          createdat TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
          updatedat TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
        )
      `);

      await this.db.query(`
        CREATE TABLE IF NOT EXISTS groups (
          id TEXT PRIMARY KEY,
          externalid TEXT,
          displayname TEXT,
          groupdescription TEXT,
          status TEXT,
          tenant TEXT,
          createdat TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
          updatedat TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
        )
      `);

      await this.db.query(`
        CREATE TABLE IF NOT EXISTS groupMembers (
          groupid TEXT,
          userid TEXT,
          tenant TEXT,
          createdat TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
          updatedat TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
        )
      `);
    } catch (err) {
      throw new Error(err);
    }
  }

  async createUser(user, tenant) {
    const { id, userName, externalId, firstName, lastName, status, json } = user;

    try {
      const query = `
        INSERT INTO users (id, externalid, username, firstname, lastname, status, tenant, json)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      `;
      const values = [id, externalId, userName, firstName, lastName, status, tenant, json];
      const result = await this.db.query(query, values);
      console.log('Inserted rows:', result.rowCount);
    } catch (err) {
      console.error(err);
      throw new Error(err);
    }
  }

  async getUsers(tenant) {
    try {
      const query = 'SELECT * FROM users WHERE tenant = $1';
      const values = [tenant];
      const result = await this.db.query(query, values);
      const users = result.rows.map(row => new User(row.id, row.externalid, row.username, row.firstname, row.lastname, row.status, row.tenant, row.json));
      return users;
    } catch (err) {
      throw new Error(err);
    }
  }

  async getUserById(userId, tenant) {
    try {
      const query = 'SELECT * FROM users WHERE id = $1 AND tenant = $2';
      const values = [userId, tenant];
      const result = await this.db.query(query, values);
      const row = result.rows[0];
      if (row) {
        return new User(row.id, row.externalid, row.username, row.firstname, row.lastname, row.status, row.tenant, row.json);
      } else {
        return null;
      }
    } catch (err) {
      console.error(err);
      throw new Error(err);
    }
  }

  async getUsersByUserName(userName, tenant) {
    try {
      const query = 'SELECT * FROM users WHERE username = $1 AND tenant = $2';
      const values = [userName, tenant];
      const result = await this.db.query(query, values);

      if (result.rows.length > 0) {
        const row = result.rows[0];
        return new User(row.id, row.externalid, row.username, row.firstname, row.lastname, row.status, row.tenant, row.json);
      } else {
        return null;
      }
    } catch (err) {
      console.error(err);
      throw new Error(err);
    }
  }

  async updateUser(userId, updatedUser, tenant) {
    const { userName, firstName, lastName, status, json } = updatedUser;

    try {
      const query = `
        UPDATE users
        SET username = $1, firstname = $2, lastname = $3, status = $4, json = $5, updatedat = CURRENT_TIMESTAMP
        WHERE id = $6 AND tenant = $7
      `;
      const values = [userName, firstName, lastName, status, json, userId, tenant];
      await this.db.query(query, values);
      console.log('User updated successfully');
    } catch (err) {
      console.error(err);
      throw new Error(err);
    }
  }

  async deleteUser(userId, tenant) {
    try {
      const query = 'DELETE FROM users WHERE id = $1 AND tenant = $2';
      const values = [userId, tenant];
      await this.db.query(query, values);
      console.log('User deleted successfully');
    } catch (err) {
      console.error(err);
      throw new Error(err);
    }
  }

  async getGroups(tenant) {
    try {
      const query = 'SELECT * FROM groups WHERE tenant = $1';
      const values = [tenant];
      const result = await this.db.query(query, values);
      const groups = result.rows.map(row => new Group(row.id, row.externalid, row.displayname, row.groupdescription, row.status, row.tenant));
      return groups;
    } catch (err) {
      throw new Error(err);
    }
  }

  async getGroupById(groupId, tenant) {
    try {

      const query = 'SELECT * FROM groups g WHERE id = $1 AND tenant = $2';

      const values = [groupId, tenant];
      const result = await this.db.query(query, values);
      if (result.rows.length > 0) {
        const row = result.rows[0];
        let group = new Group(row.id, row.externalid, row.displayname, row.groupdescription, row.status, row.tenant);
        group.members = await this.getGroupMembers(groupId);
        return group;
      }
    } catch (err) {
      throw new Error(err);
    }
  }

  async getGroupMembers(groupId) {
    try {
      let groupMembers = [];
      const query = 'SELECT * FROM groupmembers WHERE groupid = $1';
      const values = [groupId];
      const result = await this.db.query(query, values);
      if (result.rows.length > 0) {
        for (const row of result.rows) {
          const groupMember = {
            value: row.userid
          };
          groupMembers.push(groupMember);
        }
      }
      return groupMembers;
    } catch (err) {
      throw new Error(err);
    }
  }

  async getGroupByName(groupName, tenant) {
    try {
      const query = 'SELECT * FROM groups WHERE displayname = $1 AND tenant = $2';
      const values = [groupName, tenant];
      const result = await this.db.query(query, values);
      if (result.rows.length > 0) {
        const row = result.rows[0];
        let group = Group(row.id, row.externalid, row.displayname, row.groupdescription, row.status, row.tenant);
        group.members = getGroupMembers(groupId);
        return group;
      } else {
        return null;
      }
    } catch (err) {
      throw new Error(err);
    }
  }

  async createGroup(group, tenant) {
    const { id, externalId, displayName, groupDescription, status } = group;

    try {
      const query = `
        INSERT INTO groups (id, externalid, displayname, groupdescription, status, tenant)
        VALUES ($1, $2, $3, $4, $5, $6)
      `;
      const values = [id, externalId, displayName, groupDescription, status, tenant];
      await this.db.query(query, values);
    } catch (err) {
      throw new Error(err);
    }
  }

  async updateGroup(groupId, updatedGroup, tenant) {
    const { displayName, groupDescription, status } = updatedGroup;

    try {
      const query = `
        UPDATE groups
        SET displayname = $1, groupdescription = $2, status = $3, updatedat = CURRENT_TIMESTAMP
        WHERE id = $4 AND tenant = $5
      `;
      const values = [displayName, groupDescription, status, groupId, tenant];
      await this.db.query(query, values);
    } catch (err) {
      throw new Error(err);
    }
  }

  async deleteGroup(groupId, tenant) {
    try {
      const query = 'DELETE FROM groups WHERE id = $1 AND tenant = $2';
      const values = [groupId, tenant];
      await this.db.query(query, values);
    } catch (err) {
      throw new Error(err);
    }
  }

  async addGroupMember(groupId, userId, tenant) {
    try {
      const query = 'INSERT INTO groupMembers (groupid, userid, tenant) VALUES ($1, $2, $3)';
      const values = [groupId, userId, tenant];
      await this.db.query(query, values);
    } catch (err) {
      throw new Error(err);
    }
  }

  async removeGroupMember(groupId, userId) {
    try {
      const query = 'DELETE FROM groupMembers WHERE groupid = $1 AND userid = $2';
      const values = [groupId, userId];
      await this.db.query(query, values);
    } catch (err) {
      throw new Error(err);
    }
  }

  async deleteAllUserGroupAssociation(groupId, tenant) {
    try {
      const query = 'DELETE FROM groupMembers WHERE groupid = $1 AND tenant = $2';
      const values = [groupId, tenant];
      await this.db.query(query, values);
    } catch (err) {
      throw new Error(err);
    }
  }
}

export default PGDBOperations;
