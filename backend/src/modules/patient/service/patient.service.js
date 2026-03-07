const PatientModel = require('../model/patient.model');
const ProfileModel = require('../../auth/models/profile.model');
const Pagination = require('../../../common/responses/Pagination');
const logger = require('../../../common/utils/logger');
const errorRes = require('../../../common/errors');

const getListService = async (query) => {
    try {
        const search = query.search?.trim();
        const statusFilter = query.status;
        const page = Math.max(1, parseInt(query.page || 1));
        const limit = Math.max(1, parseInt(query.limit || 10));
        const skip = (page - 1) * limit;

        const matchCondition = {};

        if (statusFilter) {
            matchCondition.status = statusFilter;
        }

        if (search) {
            const regex = { $regex: search, $options: 'i' };
            matchCondition.$or = [
                { 'profile.full_name': regex },
                { 'profile.phone': regex },
                { 'profile.email': regex },
            ];
        }

        const pipeline = [
            {
                $lookup: {
                    from: 'profiles',
                    localField: 'profile_id',
                    foreignField: '_id',
                    as: 'profile'
                }
            },

            {
                $unwind: {
                    path: '$profile',
                    preserveNullAndEmptyArrays: true
                }
            },

            // Lookup account để lấy phone/email cho bệnh nhân đã có tài khoản
            {
                $lookup: {
                    from: 'accounts',
                    localField: 'account_id',
                    foreignField: '_id',
                    as: 'account'
                }
            },
            {
                $unwind: {
                    path: '$account',
                    preserveNullAndEmptyArrays: true
                }
            },

            // Gộp phone/email: ưu tiên lấy từ Profile, nếu null thì lấy từ Account
            {
                $addFields: {
                    'profile.phone': {
                        $ifNull: ['$profile.phone', '$account.phone_number']
                    },
                    'profile.email': {
                        $ifNull: ['$profile.email', '$account.email']
                    }
                }
            },

            { $match: matchCondition },

            {
                $facet: {
                    data: [
                        { $sort: { createdAt: -1 } },
                        { $skip: skip },
                        { $limit: limit },
                        {
                            $project: {
                                _id: 1,
                                patient_code: 1,
                                status: 1,
                                createdAt: 1,
                                'profile._id': 1,
                                'profile.full_name': 1,
                                'profile.phone': 1,
                                'profile.email': 1,
                                'profile.dob': 1,
                                'profile.gender': 1,
                            }
                        }
                    ],
                    totalCount: [
                        { $count: 'count' }
                    ]
                }
            }
        ];

        const result = await PatientModel.aggregate(pipeline);

        const patients = result[0]?.data || [];
        const totalItems = result[0]?.totalCount[0]?.count || 0;

        return {
            data: patients,
            pagination: new Pagination({ page, size: limit, totalItems })
        };

    } catch (error) {
        logger.error('Error getting patient list', {
            context: 'PatientService.getListService',
            message: error.message,
        });
        throw new errorRes.InternalServerError(error.message);
    }
};


const getPatientById = async (id) => {
    try {
        const patient = await PatientModel.findById(id)
            .populate('profile_id', 'full_name phone email dob gender address avatar_url')
            .populate('account_id', 'email phone_number');

        if (!patient) {
            throw new errorRes.NotFoundError('Patient not found');
        }

        const result = patient.toObject();
        if (result.profile_id) {
            result.profile_id.phone = result.profile_id.phone ?? result.account_id?.phone_number;
            result.profile_id.email = result.profile_id.email ?? result.account_id?.email;
        }
        delete result.account_id;

        return result;

    } catch (error) {
        if (error.name === 'NotFoundError') throw error;
        logger.error('Error getting patient by id', {
            context: 'PatientService.getPatientById',
            message: error.message,
        });
        throw new errorRes.InternalServerError(error.message);
    }
};

const createPatientService = async (data) => {
    let createdProfile = null;
    try {
        const { full_name, phone, email, dob, gender, address } = data;

        if (!full_name?.trim()) {
            throw new errorRes.BadRequestError('Họ tên không được để trống');
        }

        createdProfile = await ProfileModel.create({
            full_name: full_name.trim(),
            phone,
            email,
            dob,
            gender,
            address,
        });

        const patient = await PatientModel.create({
            profile_id: createdProfile._id,
            status: 'active',
        });

        return await PatientModel.findById(patient._id)
            .populate('profile_id', 'full_name phone email dob gender address');

    } catch (error) {
        if (createdProfile) {
            await ProfileModel.findByIdAndDelete(createdProfile._id).catch(() => { });
        }

        if (error.name === 'BadRequestError') throw error;
        logger.error('Error creating patient', {
            context: 'PatientService.createPatientService',
            message: error.message,
        });
        throw new errorRes.InternalServerError(error.message);
    }
};

const updatePatientService = async (id, data) => {
    try {
        const patient = await PatientModel.findById(id);
        if (!patient) {
            throw new errorRes.NotFoundError('Patient not found');
        }

        const { full_name, phone, email, dob, gender, address, status } = data;

        const profileUpdate = {};
        if (full_name !== undefined) profileUpdate.full_name = full_name;
        if (phone !== undefined) profileUpdate.phone = phone;
        if (email !== undefined) profileUpdate.email = email;
        if (dob !== undefined) profileUpdate.dob = dob;
        if (gender !== undefined) profileUpdate.gender = gender;
        if (address !== undefined) profileUpdate.address = address;

        if (Object.keys(profileUpdate).length > 0) {
            await ProfileModel.findByIdAndUpdate(
                patient.profile_id,
                profileUpdate,
                { new: true }
            );
        }

        if (status !== undefined) {
            if (!['active', 'inactive'].includes(status)) {
                throw new errorRes.BadRequestError('Status phải là active hoặc inactive');
            }
            await PatientModel.findByIdAndUpdate(id, { status });
        }

        return await PatientModel.findById(id)
            .populate('profile_id', 'full_name phone email dob gender address');

    } catch (error) {
        if (error.name === 'NotFoundError' || error.name === 'BadRequestError') throw error;
        logger.error('Error updating patient', {
            context: 'PatientService.updatePatientService',
            message: error.message,
        });
        throw new errorRes.InternalServerError(error.message);
    }
};


module.exports = { getListService, getPatientById, createPatientService, updatePatientService };
