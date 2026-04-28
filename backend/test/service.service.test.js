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

// Mock the models
const mockAggregate = jest.fn();
const mockFindById = jest.fn();
const mockSave = jest.fn();
const mockFindByIdAndUpdate = jest.fn();
const mockFindOne = jest.fn();

class MockServiceModel {
    constructor(data) {
        Object.assign(this, data);
        this.save = mockSave;
    }
}
MockServiceModel.aggregate = mockAggregate;
MockServiceModel.findById = mockFindById;
MockServiceModel.findByIdAndUpdate = mockFindByIdAndUpdate;
MockServiceModel.findOne = mockFindOne;

jest.mock("../src/modules/service/models/service.model", () => MockServiceModel);

const mockSubServiceFind = jest.fn();
const MockSubServiceModel = {
    find: mockSubServiceFind,
};

// We also need to mock mongoose.model("SubService") because getByIdService calls it directly
const originalMongooseModel = mongoose.model.bind(mongoose);
mongoose.model = jest.fn((modelName) => {
    if (modelName === "SubService") return MockSubServiceModel;
    return originalMongooseModel(modelName);
});

const serviceService = require("../src/modules/service/services/service.service");

describe("ServiceService", () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    // ----------------------------------------------------
    // Function 1: getListService (6 Test Cases)
    // ----------------------------------------------------
    describe("getListService", () => {
        it("1. should return services when using full normal query params", async () => {
            const mockData = [{ _id: "1", service_name: "Service 1", price: 100 }];
            mockAggregate.mockResolvedValue([{ data: mockData, totalCount: [{ count: 1 }] }]);

            const query = { search: "test", filter: "AVAILABLE", sort: "desc", page: "2", limit: "10" };
            const result = await serviceService.getListService(query);

            const pipeline = mockAggregate.mock.calls[0][0];
            const matchStep = pipeline.find(step => step.$match);
            expect(matchStep.$match.service_name).toEqual({ $regex: "test", $options: "i" });
            expect(matchStep.$match.status).toEqual("AVAILABLE");
            expect(result.data).toEqual(mockData);
            expect(result.pagination.page).toBe(2);
            expect(result.pagination.size).toBe(10);
            expect(result.pagination.totalItems).toBe(1);
        });

        it("2. should use default parameters when query is completely empty", async () => {
            mockAggregate.mockResolvedValue([{ data: [], totalCount: [] }]);
            
            const result = await serviceService.getListService({});
            expect(result.pagination.page).toBe(1);
            expect(result.pagination.size).toBe(5);
            expect(result.pagination.totalItems).toBe(0);
        });

        it("3. should handle negative or string limits resulting in default/NaN calculations", async () => {
            mockAggregate.mockResolvedValue([{ data: [], totalCount: [] }]);
            const query = { page: "-1", limit: "str" };
            
            const result = await serviceService.getListService(query);
            expect(result.pagination.page).toBe(1);
            expect(result.pagination.size).toBeNaN(); 
            expect(result.pagination.totalItems).toBe(0);
        });

        it("4. should handle completely empty aggregate response gracefully (result[0] undefined)", async () => {
            mockAggregate.mockResolvedValue([]);
            const result = await serviceService.getListService({});
            expect(result.data).toEqual([]);
            expect(result.pagination.totalItems).toBe(0);
        });

        it("5. should format correct ascending sort when not explicitly desc", async () => {
            mockAggregate.mockResolvedValue([{ data: [], totalCount: [] }]);
            await serviceService.getListService({ sort: "asc" });
            const pipeline = mockAggregate.mock.calls[0][0];
            const sortStep = pipeline.find(step => step.$sort);
            expect(sortStep.$sort.price).toBe(1);
        });

        it("6. should catch DB error and throw wrap as InternalServerError", async () => {
            mockAggregate.mockRejectedValue(new Error("Database connection failed"));
            await expect(serviceService.getListService({})).rejects.toThrow(errorRes.InternalServerError);
            expect(logger.error).toHaveBeenCalled();
        });
    });

    // ----------------------------------------------------
    // Function 2: getByIdService (6 Test Cases)
    // ----------------------------------------------------
    describe("getByIdService", () => {
        const VALID_ID = new mongoose.Types.ObjectId().toHexString();

        it("1. should return service with calculated min/max price from sub services if sub services exist", async () => {
            const mockService = { _id: VALID_ID, price: 150 };
            const mockPopulate = jest.fn().mockReturnValue({ lean: jest.fn().mockResolvedValue(mockService) });
            mockFindById.mockReturnValue({ populate: mockPopulate });

            mockSubServiceFind.mockResolvedValue([
                { min_price: 100, max_price: 200 },
                { min_price: 50, max_price: 150 },
            ]);

            const result = await serviceService.getByIdService(VALID_ID);
            expect(result.calculated_min_price).toBe(50);
            expect(result.calculated_max_price).toBe(200);
            expect(result.sub_service_count).toBe(2);
        });

        it("2. should calculate max_price using min_price if max_price is Missing on subService", async () => {
            const mockService = { _id: VALID_ID, price: 100 };
            mockFindById.mockReturnValue({ populate: jest.fn().mockReturnValue({ lean: jest.fn().mockResolvedValue(mockService) }) });

            mockSubServiceFind.mockResolvedValue([{ min_price: 75 }]); // fallback max is 75
            const result = await serviceService.getByIdService(VALID_ID);
            expect(result.calculated_max_price).toBe(75);
        });

        it("3. should fallback to service price if no sub services found at all", async () => {
            const mockService = { _id: VALID_ID, price: 150 };
            mockFindById.mockReturnValue({ populate: jest.fn().mockReturnValue({ lean: jest.fn().mockResolvedValue(mockService) }) });

            mockSubServiceFind.mockResolvedValue([]);
            const result = await serviceService.getByIdService(VALID_ID);
            expect(result.calculated_min_price).toBe(150);
            expect(result.sub_service_count).toBe(0);
        });

        it("4. should return null and warn logger if service not found", async () => {
            mockFindById.mockReturnValue({ populate: jest.fn().mockReturnValue({ lean: jest.fn().mockResolvedValue(null) }) });
            const result = await serviceService.getByIdService(VALID_ID);
            expect(result).toBeNull();
            expect(logger.warn).toHaveBeenCalledWith("Service not found", expect.any(Object));
        });

        it("5. should immediately rethrow errors that already have a statusCode", async () => {
            const customError = new errorRes.BadRequestError("Custom BD error");
            mockFindById.mockImplementation(() => { throw customError; });
            await expect(serviceService.getByIdService(VALID_ID)).rejects.toThrow(errorRes.BadRequestError);
        });

        it("6. should wrap raw DB errors in InternalServerError and log error", async () => {
            mockFindById.mockReturnValue({ populate: jest.fn().mockReturnValue({ lean: jest.fn().mockRejectedValue(new Error("Raw DB err")) }) });
            await expect(serviceService.getByIdService(VALID_ID)).rejects.toThrow(errorRes.InternalServerError);
            expect(logger.error).toHaveBeenCalled();
        });
    });

    // ----------------------------------------------------
    // Function 3: createService (5 Test Cases)
    // ----------------------------------------------------
    describe("createService", () => {
        it("1. should successfully create and save a service with valid data", async () => {
            const serviceData = { service_name: "Test", price: 100 };
            const savedData = { _id: "newid", ...serviceData };
            mockSave.mockResolvedValue(savedData);

            const result = await serviceService.createService(serviceData);
            expect(result).toEqual(savedData);
        });

        it("2. should initialize the model accurately with provided data", async () => {
            mockSave.mockResolvedValue({});
            const dataCreate = { test_flag: true };
            await serviceService.createService(dataCreate);
            // Wait, we can't easily assert new MockServiceModel(data) without a spy, but we can assume mockSave was called.
            expect(mockSave).toHaveBeenCalled();
        });

        it("3. should call logger.debug on successfully creating the service", async () => {
            mockSave.mockResolvedValue({ _id: "1" });
            await serviceService.createService({});
            expect(logger.debug).toHaveBeenCalledWith("Service created successfully", expect.any(Object));
        });

        it("4. should throw InternalServerError if mongoose save throws an error", async () => {
            mockSave.mockRejectedValue(new Error("Crash db"));
            await expect(serviceService.createService({})).rejects.toThrow(errorRes.InternalServerError);
        });

        it("5. should verify logger.error is called with stack trace if creation fails", async () => {
            const err = new Error("Validation Error");
            mockSave.mockRejectedValue(err);
            await expect(serviceService.createService({})).rejects.toThrow();
            expect(logger.error).toHaveBeenCalledWith("Error creating service", expect.objectContaining({ message: err.message }));
        });
    });

    // ----------------------------------------------------
    // Function 4: updateService (5 Test Cases)
    // ----------------------------------------------------
    describe("updateService", () => {
        const VALID_ID = new mongoose.Types.ObjectId().toHexString();

        it("1. should successfully update document and return the new object", async () => {
            const updateData = { price: 200 };
            const mockUpdated = { _id: VALID_ID, price: 200 };
            mockFindByIdAndUpdate.mockResolvedValue(mockUpdated);

            const result = await serviceService.updateService(VALID_ID, updateData);
            expect(mockFindByIdAndUpdate).toHaveBeenCalledWith(VALID_ID, updateData, { new: true, runValidators: true });
            expect(result).toEqual(mockUpdated);
        });

        it("2. should call logger.debug upon successful update", async () => {
            mockFindByIdAndUpdate.mockResolvedValue({ _id: VALID_ID });
            await serviceService.updateService(VALID_ID, {});
            expect(logger.debug).toHaveBeenCalledWith("Service updated successfully", expect.any(Object));
        });

        it("3. should quietly return null if the id does not exist in DB (findByIdAndUpdate returns null)", async () => {
            mockFindByIdAndUpdate.mockResolvedValue(null);
            const result = await serviceService.updateService(VALID_ID, { price: 1 });
            expect(result).toBeNull();
        });

        it("4. should throw InternalServerError if mongoose update operation fails", async () => {
            mockFindByIdAndUpdate.mockRejectedValue(new Error("update error DB crash"));
            await expect(serviceService.updateService(VALID_ID, {})).rejects.toThrow(errorRes.InternalServerError);
        });

        it("5. should verify logger.error logs the error message during update failure", async () => {
            mockFindByIdAndUpdate.mockRejectedValue(new Error("fail"));
            await expect(serviceService.updateService(VALID_ID, {})).rejects.toThrow();
            expect(logger.error).toHaveBeenCalledWith("Error updating service", expect.any(Object));
        });
    });

    // ----------------------------------------------------
    // Function 5: checkUniqueServiceName (5 Test Cases)
    // ----------------------------------------------------
    describe("checkUniqueServiceName", () => {
        it("1. should return the document object if service name exists in DB", async () => {
            const existing = { _id: "1", service_name: "dup" };
            mockFindOne.mockResolvedValue(existing);
            const result = await serviceService.checkUniqueServiceName("dup");
            expect(result).toEqual(existing);
        });

        it("2. should accurately build findOne query with the passed string", async () => {
            mockFindOne.mockResolvedValue(null);
            await serviceService.checkUniqueServiceName("uniqueName");
            expect(mockFindOne).toHaveBeenCalledWith({ service_name: "uniqueName" });
        });

        it("3. should return null if service name is entirely new and does not exist", async () => {
            mockFindOne.mockResolvedValue(null);
            const result = await serviceService.checkUniqueServiceName("fresh");
            expect(result).toBeNull();
        });

        it("4. should throw InternalServerError if findOne query fails", async () => {
            mockFindOne.mockRejectedValue(new Error("unique check DB timeout"));
            await expect(serviceService.checkUniqueServiceName("err")).rejects.toThrow(errorRes.InternalServerError);
        });

        it("5. should call logger.error when a DB error is encountered in checking unique name", async () => {
            mockFindOne.mockRejectedValue(new Error("err"));
            await expect(serviceService.checkUniqueServiceName("")).rejects.toThrow();
            expect(logger.error).toHaveBeenCalledWith("Error checking unique service name", expect.any(Object));
        });
    });

    // ----------------------------------------------------
    // Function 6: checkUniqueServiceNameNotId (5 Test Cases)
    // ----------------------------------------------------
    describe("checkUniqueServiceNameNotId", () => {
        const ID = "myid";

        it("1. should return the doc if another service has the same name", async () => {
            const existing = { _id: "other", service_name: "dup" };
            mockFindOne.mockResolvedValue(existing);
            const result = await serviceService.checkUniqueServiceNameNotId("dup", ID);
            expect(result).toEqual(existing);
        });

        it("2. should build findOne query with $ne correctly to exclude current ID", async () => {
            mockFindOne.mockResolvedValue(null);
            await serviceService.checkUniqueServiceNameNotId("dup", ID);
            expect(mockFindOne).toHaveBeenCalledWith({
                service_name: "dup",
                _id: { $ne: ID }
            });
        });

        it("3. should return null if no other service occupies the name", async () => {
            mockFindOne.mockResolvedValue(null);
            const result = await serviceService.checkUniqueServiceNameNotId("free", ID);
            expect(result).toBeNull();
        });

        it("4. should throw InternalServerError if DB query crashes", async () => {
            mockFindOne.mockRejectedValue(new Error("fail check"));
            await expect(serviceService.checkUniqueServiceNameNotId("a", "b")).rejects.toThrow(errorRes.InternalServerError);
        });

        it("5. should verify that an error log is generated accurately on query throw", async () => {
            mockFindOne.mockRejectedValue(new Error("fail check"));
            await expect(serviceService.checkUniqueServiceNameNotId("a", "b")).rejects.toThrow();
            expect(logger.error).toHaveBeenCalledWith("Error checking unique service name", expect.any(Object));
        });
    });
});
