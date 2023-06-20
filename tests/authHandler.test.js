import { authHandler, authenticate, getTenant, httpVerbToSCIMOP } from "../authService.js";

import jest from "jest-mock";

describe("authHandler", () => {
    describe("authenticate", () => {
        it("should return true if the key is valid", () => {
            const result = authenticate("test-key");
            expect(result).toBe(true);
        });

        it("should return false if the key is invalid", () => {
            const result = authenticate();
            expect(result).toBe(false);
        });
    });

    describe("getTenant", () => {
        it("should return the tenant", () => {
            const result = getTenant("test-key");
            expect(result).toBe("test-tenant");
        });
    });


    describe("authHandler", () => {
        it("should call the authenticate method", () => {
            const req = {
                method: "GET"
            };
            const authenticateSpy = jest.spyOn(authHandler, "authenticate");
            authHandler(req);
            expect(authenticateSpy).toHaveBeenCalled();
        });

        it("should call the getTenant method", () => {
            const req = {
                method: "GET"
            };
            const getTenantSpy = jest.spyOn(authHandler, "getTenant");
            authHandler(req);
            expect(getTenantSpy).toHaveBeenCalled();
        });

        it("should call the httpVerbToSCIMOP method", () => {
            const req = {
                method: "GET"
            };
            authHandler(req);
            expect(httpVerbToSCIMOP).toHaveBeenCalled();
        });
    });
});
