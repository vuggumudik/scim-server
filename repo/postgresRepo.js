
// This is a simple in-memory store for users.  It is not intended for production use.
// It is only used to demonstrate the capabilities of the service.
// DEMONSTRATION ONLY.  NOT FOR PRODUCTION USE.

import { User, Group, UserGroup } from './models.js';

import pkg from 'pg';
const { Pool } = pkg;

/// -------------- Database operations ------------------
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
    // createDbConnection() {
    //     return open({
    //         filename: './db/scim.db',
    //         driver: sqlite3.Database
    //     });
    // }

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
            )`);

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
            )`);

            await this.db.query(`
            CREATE TABLE IF NOT EXISTS groupMembers (
            groupid TEXT,
            userid TEXT,
            tenant TEXT,
            createdat TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
            updatedat TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
            )`);
        } catch (err) {
            throw new Error(err);
        }
    }

    async createUser(user, tenant) {
        const { id, userName, externalId, firstName, lastName, status, json } = user;

        try {
            const query = `INSERT INTO users (id, externalid, username, firstname, lastname, status, tenant, json)
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`;
            const values = [id, externalId, userName, firstName, lastName, status, tenant, json];
            const result = await this.db.query(query, values);
            console.log('------------ Inserted rows:', result.rowCount);
        } catch (err) {
            console.error('------------' + err);
            throw new Error(err);
        }
    }

    async getUsers(tenant) {
        try {
            const query = 'SELECT * FROM users WHERE tenant = $1';
            const values = [tenant];
            const result = await this.db.query(query, values);

            const users = result.rows.map(row => {
                return new User(row.id, row.externalid, row.username, row.firstname, row.lastname, row.status, row.tenant, row.json);
            });

            return users;
        } catch (err) {
            throw new Error(err);
        }
    }


    // Read a user by ID
    async getUserById(userId, tenant) {
        try {
            const query = 'SELECT * FROM users WHERE id = $1 AND tenant = $2';
            const values = [userId, tenant];
            const result = await this.db.query(query, values);
            const row = result.rows[0];
            if (row) {
                const user = new User(row.id, row.externalid, row.username, row.firstname, row.lastname, row.status, row.tenant, row.json);
                return user;
            } else {
                return null;
            }
        } catch (err) {
            console.error('------------' + err);
            throw new Error(err);
        }
    }

    async getUsersByUserName(userName, tenant) {
        try {
            const query = 'SELECT * FROM users WHERE userName = $1 AND tenant = $2';
            const values = [userName, tenant];
            const result = await this.db.query(query, values);

            if (result.rows.length > 0) {
                const row = result.rows[0];
                const user = new User(row.id, row.externalid, row.username, row.firstname, row.lastname, row.status, row.tenant, row.json);
                return user;
            } else {
                return null;
            }
        } catch (err) {
            console.error(err);
            throw new Error(err);
        }
    }


    // Update a user by ID
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
            console.log('------------ User updated successfully');
        } catch (err) {
            console.error('------------' + err);
            throw new Error(err);
        }
    }


    // Delete a user by ID
    async deleteUser(userId, tenant) {
        try {
            const query = 'DELETE FROM users WHERE id = $1 AND tenant = $2';
            const values = [userId, tenant];
            await this.db.query(query, values);
            console.log('------------ User deleted successfully');
        } catch (err) {
            console.error('------------' + err);
            throw new Error(err);
        }
    }


    // get groups
    async getGroups(tenant) {
        try {
            const query = 'SELECT * FROM groups WHERE tenant = $1';
            const values = [tenant];
            const result = await this.db.query(query, values);

            const groups = result.rows.map(row => {
                return new Group(row.id, row.externalid, row.displayname, row.groupdescription, row.status, row.tenant);
            });

            return groups;
        } catch (err) {
            throw new Error(err);
        }
    }


    // Read a group by ID
    async getGroupById(groupId, tenant) {
        try {
            const query = 'SELECT * FROM groups WHERE id = $1 and tenant = $2';
            const values = [groupId, tenant];
            const result = await this.db.query(query, values);

            if (result.rows.length > 0) {
                const row = result.rows[0];
                const group = new Group(row.id, row.externalid, row.displayname, row.groupdescription, row.status, row.tenant);
                return group;
            } else {
                return null;
            }
        } catch (err) {
            throw new Error(err);
        }
    }

    // get group by name
    async getGroupByName(groupName, tenant) {
        try {
            const query = 'SELECT * FROM groups WHERE displayName = $1 and tenant = $2';
            const values = [groupName, tenant];
            const result = await this.db.query(query, values);

            if (result.rows.length > 0) {
                const row = result.rows[0];
                const group = new Group(row.id, row.externalid, row.displayname, row.groupdescription, row.status, row.tenant);
                return group;
            } else {
                return null;
            }
        } catch (err) {
            throw new Error(err);
        }
    }


    // Create a new group
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


    // Update a group by ID
    async updateGroup(groupId, updatedGroup, tenant) {
        const { displayName, groupDescription, status } = updatedGroup;

        try {
            const query = `
            UPDATE groups SET displayname = $1, groupdescription = $2, status = $3, updatedat = CURRENT_TIMESTAMP
            WHERE id = $4 AND tenant = $5
          `;
            const values = [displayName, groupDescription, status, groupId, tenant];
            await this.db.query(query, values);
        } catch (err) {
            throw new Error(err);
        }
    }


    // Delete a group by ID
    async deleteGroup(groupId, tenant) {
        try {
            await this.db.query(`DELETE FROM groups WHERE id = $1 AND tenant = $2`, [groupId, tenant]);
        } catch (err) {
            throw new Error(err);
        }
    }

    async addGroupMember(groupId, userId, tenant) {
        try {
            await this.db.query(`INSERT INTO groupMembers (groupid, userid, tenant) VALUES ($1, $2, $3)`, [groupId, userId, tenant]);
        } catch (err) {
            throw new Error(err);
        }
    }

    async removeGroupMember(groupId, userId) {
        try {
            await this.db.query(`DELETE FROM groupMembers WHERE groupid = $1 AND userid = $2`, [groupId, userId]);
        } catch (err) {
            throw new Error(err);
        }
    }

    async deleteAllUserGroupAssociation(groupId, tenant) {
        try {
            await this.db.query(`DELETE FROM groupMembers WHERE groupid = $1 AND tenant = $2`, [groupId, tenant]);
        } catch (err) {
            throw new Error(err);
        }
    }

}

export default PGDBOperations;