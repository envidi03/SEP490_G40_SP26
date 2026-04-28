const mongoose = require("mongoose");
const errorRes = require("../src/common/errors");
const logger = require("../src/common/utils/logger");

// Mock dependencies
jest.mock("../src/common/utils/logger", () => ({
    debug: jest.fn(),
    info: jest.fn(),
    warn: jest.fn(),
    error: jest.fn(),
}));

jest.mock("../src/common/errors", () => ({
    BadRequestError: class extends Error {
        constructor(message) {
            super(message);
            this.name = "BadRequestError";
            this.statusCode = 400;
        }
    },
    NotFoundError: class extends Error {
        constructor(message) {
            super(message);
            this.name = "NotFoundError";
            this.statusCode = 404;
        }
    },
    InternalServerError: class extends Error {
        constructor(message) {
            super(message);
            this.name = "InternalServerError";
            this.statusCode = 500;
        }
    },
}));

// Mock Models
const mockServiceFindById = jest.fn();
jest.mock("../src/modules/service/models/service.model", () => ({
    findById: mockServiceFindById
}));

const mockSubFind = jest.fn();
const mockSubFindById = jest.fn();
const mockSubFindOne = jest.fn();
const mockSubFindByIdAndUpdate = jest.fn();
const mockSubFindByIdAndDelete = jest.fn();
const mockSubSave = jest.fn();

class MockSubServiceModel {
    constructor(data) {
        Object.assign(this, data);
        this.save = mockSubSave;
    }
}
MockSubServiceModel.find = mockSubFind;
MockSubServiceModel.findById = mockSubFindById;
MockSubServiceModel.findOne = mockSubFindOne;
MockSubServiceModel.findByIdAndUpdate = mockSubFindByIdAndUpdate;
MockSubServiceModel.findByIdAndDelete = mockSubFindByIdAndDelete;

jest.mock("../src/modules/service/models/sub_service.model", () => MockSubServiceModel);

const subServiceService = require("../src/modules/service/services/sub_service.service");

describe("SubServiceService", () => {
    const VALID_ID = new mongoose.Types.ObjectId().toHexString();
    const VALID_PARENT_ID = new mongoose.Types.ObjectId().toHexString();
    const INVALID_ID = "123";

    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe("getSubServicesByParentId", () => {
        it("should throw BadRequestError if parentId format is invalid", async () => {
            await expect(subServiceService.getSubServicesByParentId(INVALID_ID)).rejects.toThrow(errorRes.BadRequestError);
        });

        it("should throw NotFoundError if parent service not found", async () => {
            mockServiceFindById.mockReturnValue({ lean: jest.fn().mockResolvedValue(null) });

            await expect(subServiceService.getSubServicesByParentId(VALID_PARENT_ID)).rejects.toThrow(errorRes.NotFoundError);
        });

        it("should successfully return sub services without statusFilter", async () => {
            mockServiceFindById.mockReturnValue({ lean: jest.fn().mockResolvedValue({ _id: VALID_PARENT_ID }) });
            
            const mockSubServices = [{ _id: '1' }];
            const mockSort = jest.fn().mockReturnValue({ lean: jest.fn().mockResolvedValue(mockSubServices) });
            mockSubFind.mockReturnValue({ sort: mockSort });

            const result = await subServiceService.getSubServicesByParentId(VALID_PARENT_ID);
            expect(result).toEqual(mockSubServices);
            expect(mockSubFind).toHaveBeenCalledWith({ parent_id: VALID_PARENT_ID });
        });

        it("should apply statusFilter correctly", async () => {
            mockServiceFindById.mockReturnValue({ lean: jest.fn().mockResolvedValue({ _id: VALID_PARENT_ID }) });
            
            const mockSort = jest.fn().mockReturnValue({ lean: jest.fn().mockResolvedValue([]) });
            mockSubFind.mockReturnValue({ sort: mockSort });

            await subServiceService.getSubServicesByParentId(VALID_PARENT_ID, { filter: 'AVAILABLE' });
            expect(mockSubFind).toHaveBeenCalledWith({ parent_id: VALID_PARENT_ID, status: 'AVAILABLE' });
        });

        it("should rethrow structural errors (statusCode)", async () => {
            const spyOnType = jest.spyOn(mongoose.Types.ObjectId, 'isValid').mockImplementation(() => {
                const err = new Error("DB Error");
                err.statusCode = 400;
                throw err;
            });
            
            await expect(subServiceService.getSubServicesByParentId(VALID_PARENT_ID)).rejects.toThrow(Error);
            spyOnType.mockRestore();
        });

        it("should throw InternalServerError on general DB failure", async () => {
            mockServiceFindById.mockReturnValue({ lean: jest.fn().mockRejectedValue(new Error("Raw error")) });
            await expect(subServiceService.getSubServicesByParentId(VALID_PARENT_ID)).rejects.toThrow(errorRes.InternalServerError);
        });
    });

    describe("getSubServiceById", () => {
        it("should throw BadRequestError if id is invalid", async () => {
            await expect(subServiceService.getSubServiceById(INVALID_ID)).rejects.toThrow(errorRes.BadRequestError);
        });

        it("should throw NotFoundError if sub-service not found", async () => {
            mockSubFindById.mockReturnValue({
                populate: jest.fn().mockReturnValue({ lean: jest.fn().mockResolvedValue(null) })
            });

            await expect(subServiceService.getSubServiceById(VALID_ID)).rejects.toThrow(errorRes.NotFoundError);
        });

        it("should return sub-service successfully", async () => {
            const mockSub = { _id: VALID_ID };
            mockSubFindById.mockReturnValue({
                populate: jest.fn().mockReturnValue({ lean: jest.fn().mockResolvedValue(mockSub) })
            });

            const result = await subServiceService.getSubServiceById(VALID_ID);
            expect(result).toEqual(mockSub);
        });

        it("should rethrow structured errors", async () => {
            const spyOnType = jest.spyOn(mongoose.Types.ObjectId, 'isValid').mockImplementation(() => {
                const err = new Error("Custom Error");
                err.statusCode = 400;
                throw err;
            });
            await expect(subServiceService.getSubServiceById(VALID_ID)).rejects.toThrow(Error);
            spyOnType.mockRestore();
        });

        it("should wrap raw DB errors into InternalServerError", async () => {
            mockSubFindById.mockReturnValue({
                populate: jest.fn().mockReturnValue({ lean: jest.fn().mockRejectedValue(new Error("Database offline")) })
            });

            await expect(subServiceService.getSubServiceById(VALID_ID)).rejects.toThrow(errorRes.InternalServerError);
        });
    });

    describe("createSubService", () => {
        it("should throw BadRequestError if parentId is invalid", async () => {
            await expect(subServiceService.createSubService(INVALID_ID, {})).rejects.toThrow(errorRes.BadRequestError);
        });

        it("should throw NotFoundError if parent service not found", async () => {
            mockServiceFindById.mockReturnValue({ lean: jest.fn().mockResolvedValue(null) });

            await expect(subServiceService.createSubService(VALID_PARENT_ID, {})).rejects.toThrow(errorRes.NotFoundError);
        });

        it("should throw BadRequestError if sub_service_name exists for same parent", async () => {
            mockServiceFindById.mockReturnValue({ lean: jest.fn().mockResolvedValue({ _id: VALID_PARENT_ID }) });
            mockSubFindOne.mockReturnValue({ lean: jest.fn().mockResolvedValue({ _id: '1' }) });

            await expect(subServiceService.createSubService(VALID_PARENT_ID, { sub_service_name: "test" })).rejects.toThrow(errorRes.BadRequestError);
        });

        it("should create successfully if no duplicate name", async () => {
            mockServiceFindById.mockReturnValue({ lean: jest.fn().mockResolvedValue({ _id: VALID_PARENT_ID }) });
            mockSubFindOne.mockReturnValue({ lean: jest.fn().mockResolvedValue(null) });

            const savedDoc = { _id: 'new1', parent_id: VALID_PARENT_ID };
            mockSubSave.mockResolvedValue(savedDoc);

            const result = await subServiceService.createSubService(VALID_PARENT_ID, { sub_service_name: "new one" });
            expect(result).toEqual(savedDoc);
        });

        it("should wrap DB errors correctly", async () => {
            mockServiceFindById.mockReturnValue({ lean: jest.fn().mockRejectedValue(new Error("Crash")) });

            await expect(subServiceService.createSubService(VALID_PARENT_ID, {})).rejects.toThrow(errorRes.InternalServerError);
        });

        it("should rethrow structured errors", async () => {
            const spyOnType = jest.spyOn(mongoose.Types.ObjectId, 'isValid').mockImplementation(() => {
                const err = new Error("DB"); err.statusCode = 400; throw err;
            });
            await expect(subServiceService.createSubService(VALID_PARENT_ID, {})).rejects.toThrow(Error);
            spyOnType.mockRestore();
        });
    });

    describe("updateSubService", () => {
        it("should throw BadRequestError if sub-service ID invalid", async () => {
            await expect(subServiceService.updateSubService(INVALID_ID, {})).rejects.toThrow(errorRes.BadRequestError);
        });

        it("should remove parent_id from data if provided", async () => {
             mockSubFindByIdAndUpdate.mockResolvedValue({ _id: VALID_ID });
             const data = { parent_id: "dont update", other: 1 };
             
             await subServiceService.updateSubService(VALID_ID, data);
             expect(mockSubFindByIdAndUpdate).toHaveBeenCalledWith(VALID_ID, { $set: { other: 1 } }, { new: true, runValidators: true });
        });

        it("should throw NotFoundError if checking existing name but sub-service not found", async () => {
             mockSubFindById.mockReturnValue({ lean: jest.fn().mockResolvedValue(null) });
             
             await expect(subServiceService.updateSubService(VALID_ID, { sub_service_name: "x" })).rejects.toThrow(errorRes.NotFoundError);
        });

        it("should throw BadRequestError if checking existing name and duplicate is found", async () => {
             mockSubFindById.mockReturnValue({ lean: jest.fn().mockResolvedValue({ _id: VALID_ID, parent_id: VALID_PARENT_ID }) });
             mockSubFindOne.mockReturnValue({ lean: jest.fn().mockResolvedValue({ _id: "other" }) });

             await expect(subServiceService.updateSubService(VALID_ID, { sub_service_name: "x" })).rejects.toThrow(errorRes.BadRequestError);
        });

        it("should throw NotFoundError if findByIdAndUpdate returns null", async () => {
            // No name conflict check, just update directly
            mockSubFindByIdAndUpdate.mockResolvedValue(null);

            await expect(subServiceService.updateSubService(VALID_ID, { other: 1 })).rejects.toThrow(errorRes.NotFoundError);
        });

        it("should successfully update and return object", async () => {
            // check unique pass
            mockSubFindById.mockReturnValue({ lean: jest.fn().mockResolvedValue({ _id: VALID_ID, parent_id: VALID_PARENT_ID }) });
            mockSubFindOne.mockReturnValue({ lean: jest.fn().mockResolvedValue(null) });

            const updated = { _id: VALID_ID, sub_service_name: "brand new" };
            mockSubFindByIdAndUpdate.mockResolvedValue(updated);

            const result = await subServiceService.updateSubService(VALID_ID, { sub_service_name: "brand new" });
            expect(result).toEqual(updated);
        });

        it("should handle raw db err", async () => {
            mockSubFindByIdAndUpdate.mockRejectedValue(new Error("Crash"));

            await expect(subServiceService.updateSubService(VALID_ID, { other: 1 })).rejects.toThrow(errorRes.InternalServerError);
        });

        it("should handle error with auth error pattern", async () => {
            const custom = new Error("auth"); custom.statusCode = 401;
            mockSubFindByIdAndUpdate.mockRejectedValue(custom);

            await expect(subServiceService.updateSubService(VALID_ID, { other: 1 })).rejects.toThrow(Error);
        });
    });

    describe("deleteSubService", () => {
        it("should throw BadRequestError if id is invalid", async () => {
            await expect(subServiceService.deleteSubService(INVALID_ID)).rejects.toThrow(errorRes.BadRequestError);
        });

        it("should throw NotFoundError if not found internally", async () => {
            mockSubFindByIdAndDelete.mockResolvedValue(null);

            await expect(subServiceService.deleteSubService(VALID_ID)).rejects.toThrow(errorRes.NotFoundError);
        });

        it("should return deleted doc successfully", async () => {
            const deleted = { _id: VALID_ID };
            mockSubFindByIdAndDelete.mockResolvedValue(deleted);

            const result = await subServiceService.deleteSubService(VALID_ID);
            expect(result).toEqual(deleted);
        });

        it("should handle db error internally", async () => {
            mockSubFindByIdAndDelete.mockRejectedValue(new Error("Crash db"));

            await expect(subServiceService.deleteSubService(VALID_ID)).rejects.toThrow(errorRes.InternalServerError);
        });

        it("should rethrow structured err", async () => {
            const err = new Error("err"); err.statusCode = 400;
            mockSubFindByIdAndDelete.mockRejectedValue(err);

            await expect(subServiceService.deleteSubService(VALID_ID)).rejects.toThrow(Error);
        });
    });
});
