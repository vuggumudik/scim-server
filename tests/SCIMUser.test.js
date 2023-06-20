import SCIMUser from "../SCIMUser.js";
import { SCIMMY } from "scimmy-routers";
import jest from "jest-mock";

describe("SCIMUser", () => {
    describe("constructor", () => {
        it("should instantiate a new SCIMUser", () => {
            const user = new SCIMUser({ "tenant": "test"});
            expect(user).toBeInstanceOf(SCIMUser);
        });
    });

    describe("read", () => {
        it("should call the parent read method", async () => {
            const user = new SCIMUser({ "tenant": "test"});
            const readSpy = jest.spyOn(SCIMMY.Resources.User.prototype, "read");
            await user.read();
            expect(readSpy).toHaveBeenCalled();
        });
    });

    describe("write", () => {
        it("should call the parent write method", async () => {
            const user = new SCIMUser({});
            const writeSpy = jest.spyOn(SCIMMY.Resources.User.prototype, "write");
            await user.write();
            expect(writeSpy).toHaveBeenCalled();
        });
    });

    describe("patch", () => {
        it("should call the parent patch method", async () => {
            const user = new SCIMUser({ "tenant": "test"});
            const patchSpy = jest.spyOn(SCIMMY.Resources.User.prototype, "patch");
            await user.patch();
            expect(patchSpy).toHaveBeenCalled();
        });
    });

    describe("dispose", () => {
        it("should call the parent dispose method", async () => {
            // Pass params to constructor
            const user = new SCIMUser({"tenant": "test"});
            const disposeSpy = jest.spyOn(SCIMMY.Resources.User.prototype, "dispose");
            await user.dispose();
            expect(disposeSpy).toHaveBeenCalled();
        });
    });
});

