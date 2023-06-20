
import GroupService from "../groupService.js";
import { SCIMMY } from "scimmy-routers";

describe("GroupService", () => {
    describe("constructor", () => {
        it("should instantiate a new GroupService", () => {
            const groupService = new GroupService();
            expect(groupService).toBeInstanceOf(GroupService);
        });
    });

    describe("read", () => {
        it("should call the parent read method", async () => {
            const groupService = new GroupService();
            const readSpy = jest.spyOn(SCIMMY.Resources.Group.prototype, "read");
            await groupService.read();
            expect(readSpy).toHaveBeenCalled();
        });
    });

    describe("write", () => {
        it("should call the parent write method", async () => {
            const groupService = new GroupService();
            const writeSpy = jest.spyOn(SCIMMY.Resources.Group.prototype, "write");
            await groupService.write();
            expect(writeSpy).toHaveBeenCalled();
        });
    });

    describe("patch", () => {
        it("should call the parent patch method", async () => {
            const groupService = new GroupService();
            const patchSpy = jest.spyOn(SCIMMY.Resources.Group.prototype, "patch");
            await groupService.patch();
            expect(patchSpy).toHaveBeenCalled();
        });
    });

    describe("dispose", () => {
        it("should call the parent dispose method", async () => {
            const groupService = new GroupService();
            const disposeSpy = jest.spyOn(SCIMMY.Resources.Group.prototype, "dispose");
            await groupService.dispose();
            expect(disposeSpy).toHaveBeenCalled();   
        });
    });
});
