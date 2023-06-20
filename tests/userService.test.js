// Implement unit tests for userService.js

// Path: tests/userService.test.js

import logger from "./logger.js";
import { SCIMMY } from "scimmy-routers";
import { extractTenant } from "./utils.js";
import SCIMUser from "./SCIMUser.js";

describe("userService", () => {
    describe("constructor", () => {
        it("should instantiate a new userService", () => {
            const userService = new SCIMMY.Services.UserService();
            expect(userService).toBeInstanceOf(SCIMMY.Services.UserService);
        });
    });

    describe("read", () => {
        it("should call the parent read method", async () => {
            const userService = new SCIMMY.Services.UserService();
            const readSpy = jest.spyOn(SCIMMY.Services.UserService.prototype, "read");
            await userService.read();
            expect(readSpy).toHaveBeenCalled();
        });
    });

    describe("write", () => {
        it("should call the parent write method", async () => {
            const userService = new SCIMMY.Services.UserService();
            const writeSpy = jest.spyOn(SCIMMY.Services.UserService.prototype, "write");
            await userService.write();
            expect(writeSpy).toHaveBeenCalled();
        });
    });

    describe("patch", () => {
        it("should call the parent patch method", async () => {
            const userService = new SCIMMY.Services.UserService();
            const patchSpy = jest.spyOn(SCIMMY.Services.UserService.prototype, "patch");
            await userService.patch();
            expect(patchSpy).toHaveBeenCalled();
        });
    });

    describe("dispose", () => {
        it("should call the parent dispose method", async () => {
            const userService = new SCIMMY.Services.UserService();
            const disposeSpy = jest.spyOn(SCIMMY.Services.UserService.prototype, "dispose");
            await userService.dispose();
            expect(disposeSpy).toHaveBeenCalled();
        });
    });

    describe("getUsers", () => {
        it("should call the parent getUsers method", async () => {
            const userService = new SCIMMY.Services.UserService();
            const getUsersSpy = jest.spyOn(SCIMMY.Services.UserService.prototype, "getUsers");
            await userService.getUsers();
            expect(getUsersSpy).toHaveBeenCalled();
        });
    });

    describe("getUser", () => {
        it("should call the parent getUser method", async () => {
            const userService = new SCIMMY.Services.UserService();
            const getUserSpy = jest.spyOn(SCIMMY.Services.UserService.prototype, "getUser");
            await userService.getUser();
            expect(getUserSpy).toHaveBeenCalled();
        });
    });

    describe("createUser", () => {
        it("should call the parent createUser method", async () => {
            const userService = new SCIMMY.Services.UserService();
            const createUserSpy = jest.spyOn(SC = SCIMMY.Services.UserService.prototype, "createUser");
            await userService.createUser();
            expect(createUserSpy).toHaveBeenCalled();
        });
    });

    describe("updateUser", () => {
        it("should call the parent updateUser method", async () => {
            const userService = new SCIMMY.Services.UserService();
            const updateUserSpy = jest.spyOn(SCIMMY.Services.UserService.prototype, "updateUser");
            await userService.updateUser();
            expect(updateUserSpy).toHaveBeenCalled();
        });
    });

    describe("patchUser", () => {
        it("should call the parent patchUser method", async () => {
            const userService = new SCIMMY.Services.UserService();
            const patchUserSpy = jest.spyOn(SCIMMY.Services.UserService.prototype, "patchUser");
            await userService.patchUser();
            expect(patchUserSpy).toHaveBeenCalled();
        });
    });

    describe("deleteUser", () => {

        it("should call the parent deleteUser method", async () => {
            const userService = new SCIMMY.Services.UserService();
            const deleteUserSpy = jest.spyOn(SCIMMY.Services.UserService.prototype, "deleteUser");
            await userService.deleteUser();
            expect(deleteUserSpy).toHaveBeenCalled();
        });
    });
});
