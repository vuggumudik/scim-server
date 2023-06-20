
// Implement unit tests for SCIMGroup.js
// Path: SCIMGroup.test.js

import SCIMGroup from "../SCIMGroup.js";
import { SCIMMY } from "scimmy-routers";

describe("SCIMGroup", () => {
    describe("constructor", () => {
        it("should instantiate a new SCIMGroup", () => {
            const group = new SCIMGroup();
            expect(group).toBeInstanceOf(SCIMGroup);
        });
    });

    describe("read", () => {
        it("should call the parent read method", async () => {
            const group = new SCIMGroup();
            const readSpy = jest.spyOn(SCIMMY.Resources.Group.prototype, "read");
            await group.read();
            expect(readSpy).toHaveBeenCalled();
        });
    });

    describe("write", () => {
        it("should call the parent write method", async () => {
            const group = new SCIMGroup();
            const writeSpy = jest.spyOn(SCIMMY.Resources.Group.prototype, "write");
            await group.write();
            expect(writeSpy).toHaveBeenCalled();
        });
    });

    describe("patch", () => {
        it("should call the parent patch method", async () => {
            const group = new SCIMGroup();
            const patchSpy = jest.spyOn(SCIMMY.Resources.Group.prototype, "patch");
            await group.patch();
            expect(patchSpy).toHaveBeenCalled();
        });
    });

    describe("dispose", () => {
        it("should call the parent dispose method", async () => {
            const group = new SCIMGroup();
            const disposeSpy = jest.spyOn(SCIMMY.Resources.Group.prototype, "dispose");
            await group.dispose();
            expect(disposeSpy).toHaveBeenCalled();
        });
    });

    describe("getMembers", () => {
        it("should call the parent getMembers method", async () => {
            const group = new SCIMGroup();
            const getMembersSpy = jest.spyOn(SCIMMY.Resources.Group.prototype, "getMembers");
            await group.getMembers();
            expect(getMembersSpy).toHaveBeenCalled();
        });
    });
});


