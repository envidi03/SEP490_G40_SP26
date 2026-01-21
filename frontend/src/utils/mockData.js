/**
 * Mock Data for DCMS System
 * Based on ERD Schema - Separated by tables
 */

// ==================== USER TABLE ====================
/**
 * User table - Core user information
 * Fields: account_id, full_name, email, dob, phone, status
 */
export const mockUsers = [
    {
        id: '67890abc12345def67890001',
        account_id: 'acc_admin001',
        full_name: 'Nguyễn Văn Admin',
        email: 'admin@dcms.com',
        dob: '1985-05-15',
        phone: '0901234567',
        status: 'ACTIVE'
    },
    {
        id: '67890abc12345def67890002',
        account_id: 'acc_doctor001',
        full_name: 'BS. Nguyễn Văn Anh',
        email: 'bs.nva@dcms.com',
        dob: '1980-03-20',
        phone: '0912345678',
        status: 'ACTIVE'
    },
    {
        id: '67890abc12345def67890003',
        account_id: 'acc_doctor002',
        full_name: 'BS. Trần Thị Bình',
        email: 'bs.ttb@dcms.com',
        dob: '1982-07-10',
        phone: '0923456789',
        status: 'ACTIVE'
    },
    {
        id: '67890abc12345def67890004',
        account_id: 'acc_receptionist001',
        full_name: 'Phạm Thu Hà',
        email: 'receptionist1@dcms.com',
        dob: '1990-06-15',
        phone: '0945678901',
        status: 'ACTIVE'
    },
    {
        id: '67890abc12345def67890005',
        account_id: 'acc_patient001',
        full_name: 'Lê Văn Hoàng',
        email: 'patient1@gmail.com',
        dob: '1995-12-25',
        phone: '0967890123',
        status: 'ACTIVE'
    },
    {
        id: '67890abc12345def67890006',
        account_id: 'acc_patient002',
        full_name: 'Nguyễn Thị Lan',
        email: 'patient2@gmail.com',
        dob: '1988-04-10',
        phone: '0978901234',
        status: 'ACTIVE'
    },
    {
        id: '67890abc12345def67890007',
        account_id: 'acc_patient003',
        full_name: 'Trần Minh Tuấn',
        email: 'patient3@gmail.com',
        dob: '2000-08-15',
        phone: '0989012345',
        status: 'ACTIVE'
    },
    {
        id: '67890abc12345def67890009',
        account_id: 'acc_pharmacy001',
        full_name: 'Nguyễn Thị Mai',
        email: 'pharmacy@dcms.com',
        dob: '1992-02-20',
        phone: '0934567890',
        status: 'ACTIVE'
    },
    {
        id: '67890abc12345def67890010',
        account_id: 'acc_assistant001',
        full_name: 'Võ Thị Lan',
        email: 'assistant@dcms.com',
        dob: '1995-11-25',
        phone: '0945678901',
        status: 'ACTIVE'
    },
    {
        id: '67890abc12345def67890008',
        account_id: 'acc_inactive001',
        full_name: 'Đỗ Văn Khoa',
        email: 'inactive@dcms.com',
        dob: '1991-10-05',
        phone: '0901234999',
        status: 'INACTIVE'
    }
];

// ==================== LICENSE TABLE ====================
/**
 * License table - Doctor licenses and certifications
 * Fields: license_number, document_url (array), issued_by, issued_date, doctor_id
 */
export const mockLicenses = [
    {
        id: 'license_001',
        license_number: 'BYT-NK-2020-001234',
        document_url: [
            '/documents/licenses/doctor_nva_license.pdf',
            '/documents/licenses/doctor_nva_certificate.pdf'
        ],
        issued_by: 'Bộ Y Tế Việt Nam',
        issued_date: '2020-03-15',
        doctor_id: '67890abc12345def67890002' // BS. Nguyễn Văn Anh
    },
    {
        id: 'license_002',
        license_number: 'BYT-NK-2019-005678',
        document_url: [
            '/documents/licenses/doctor_ttb_license.pdf'
        ],
        issued_by: 'Bộ Y Tế Việt Nam',
        issued_date: '2019-07-20',
        doctor_id: '67890abc12345def67890003' // BS. Trần Thị Bình
    }
];

// ==================== ACCOUNT TABLE ====================
/**
 * Account table - Authentication credentials
 * Fields: username, email, password, role_id, email_verified, status
 */
export const mockAccounts = [
    {
        id: 'acc_admin001',
        user_id: '67890abc12345def67890001',
        username: 'admin',
        email: 'admin@dcms.com',
        password: 'admin123', // Note: In real app, this would be hashed
        role_id: 'role_001', // Admin
        email_verified: true,
        status: 'ACTIVE'
    },
    {
        id: 'acc_doctor001',
        user_id: '67890abc12345def67890002',
        username: 'doctor1',
        email: 'bs.nva@dcms.com',
        password: 'doctor123',
        role_id: 'role_002', // Doctor
        email_verified: true,
        status: 'ACTIVE'
    },
    {
        id: 'acc_doctor002',
        user_id: '67890abc12345def67890003',
        username: 'doctor2',
        email: 'bs.ttb@dcms.com',
        password: 'doctor123',
        role_id: 'role_002', // Doctor
        email_verified: true,
        status: 'ACTIVE'
    },
    {
        id: 'acc_receptionist001',
        user_id: '67890abc12345def67890004',
        username: 'receptionist1',
        email: 'receptionist1@dcms.com',
        password: 'receptionist123',
        role_id: 'role_003', // Receptionist
        email_verified: true,
        status: 'ACTIVE'
    },
    {
        id: 'acc_patient001',
        user_id: '67890abc12345def67890005',
        username: 'patient1',
        email: 'patient1@gmail.com',
        password: 'patient123',
        role_id: 'role_004', // Patient
        email_verified: true,
        status: 'ACTIVE'
    },
    {
        id: 'acc_patient002',
        user_id: '67890abc12345def67890006',
        username: 'patient2',
        email: 'patient2@gmail.com',
        password: 'patient123',
        role_id: 'role_004', // Patient
        email_verified: true,
        status: 'ACTIVE'
    },
    {
        id: 'acc_patient003',
        user_id: '67890abc12345def67890007',
        username: 'patient3',
        email: 'patient3@gmail.com',
        password: 'patient123',
        role_id: 'role_004', // Patient
        email_verified: true,
        status: 'ACTIVE'
    },
    {
        id: 'acc_pharmacy001',
        user_id: '67890abc12345def67890009',
        username: 'pharmacy',
        email: 'pharmacy@dcms.com',
        password: 'pharmacy123',
        role_id: 'role_005', // Pharmacy
        email_verified: true,
        status: 'ACTIVE'
    },
    {
        id: 'acc_assistant001',
        user_id: '67890abc12345def67890010',
        username: 'assistant',
        email: 'assistant@dcms.com',
        password: '123456',
        role_id: 'role_006', // Assistant
        email_verified: true,
        status: 'ACTIVE'
    },
    {
        id: 'acc_inactive001',
        user_id: '67890abc12345def67890008',
        username: 'inactive1',
        email: 'inactive@dcms.com',
        password: 'inactive123',
        role_id: 'role_004', // Patient
        email_verified: false,
        status: 'INACTIVE'
    }
];

// ==================== ROLE TABLE ====================
/**
 * Role table - User roles
 * Fields: name, description, status, permissions (ObjectId array), is_system
 */
export const mockRoles = [
    {
        id: 'role_001',
        name: 'Admin',
        description: 'Full system access',
        status: 'ACTIVE',
        permissions: ['perm_001', 'perm_002', 'perm_003', 'perm_004', 'perm_005'],
        is_system: true // System-defined role, cannot be deleted
    },
    {
        id: 'role_002',
        name: 'Doctor',
        description: 'Medical staff - can manage appointments and treatments',
        status: 'ACTIVE',
        permissions: ['perm_002', 'perm_003', 'perm_004'],
        is_system: true // System-defined role
    },
    {
        id: 'role_003',
        name: 'Receptionist',
        description: 'Front desk staff - can manage appointments',
        status: 'ACTIVE',
        permissions: ['perm_002', 'perm_005'],
        is_system: true // System-defined role
    },
    {
        id: 'role_004',
        name: 'Patient',
        description: 'Patient portal access',
        status: 'ACTIVE',
        permissions: ['perm_006'],
        is_system: true // System-defined role
    },
    {
        id: 'role_005',
        name: 'Pharmacy',
        description: 'Pharmacy assistant - manages medicines and inventory',
        status: 'ACTIVE',
        permissions: ['perm_007'],
        is_system: true // System-defined role
    },
    {
        id: 'role_006',
        name: 'Assistant',
        description: 'Dental assistant - assists doctors and manages medical records',
        status: 'ACTIVE',
        permissions: ['perm_008'],
        is_system: true // System-defined role
    }
];

// ==================== PERMISSION TABLE ====================
/**
 * Permission table - System permissions
 * Fields: name, code, module, description
 */
export const mockPermissions = [
    {
        id: 'perm_001',
        name: 'Manage Users',
        code: 'USER_MANAGE',
        module: 'User Management',
        description: 'Create, update, delete users'
    },
    {
        id: 'perm_002',
        name: 'View Appointments',
        code: 'APPOINTMENT_VIEW',
        module: 'Appointment',
        description: 'View appointment list'
    },
    {
        id: 'perm_003',
        name: 'Manage Appointments',
        code: 'APPOINTMENT_MANAGE',
        module: 'Appointment',
        description: 'Create, update, cancel appointments'
    },
    {
        id: 'perm_004',
        name: 'Manage Treatments',
        code: 'TREATMENT_MANAGE',
        module: 'Treatment',
        description: 'Create and update treatment records'
    },
    {
        id: 'perm_005',
        name: 'Manage Invoices',
        code: 'INVOICE_MANAGE',
        module: 'Invoice',
        description: 'Create and manage invoices'
    },
    {
        id: 'perm_006',
        name: 'View Own Records',
        code: 'RECORDS_VIEW_OWN',
        module: 'Patient Portal',
        description: 'View own appointments and medical records'
    }
];

// ==================== CLINIC TABLE ====================
/**
 * Clinic table - Dental clinic information
 * Fields: clinic_name, clinic_address, logo, phone, email, working_hours, 
 *         tax_code, license_number, latitude, longitude, status
 */
export const mockClinics = [
    {
        id: 'clinic_001',
        clinic_name: 'Nha Khoa DCMS',
        clinic_address: '123 Nguyễn Huệ, Phường Bến Nghé, Quận 1, TP.HCM',
        logo: '/images/clinics/dcms_logo.png',
        phone: '028-3822-1234',
        email: 'contact@dcms.vn',
        working_hours: 'T2-T7: 8:00-20:00, CN: 8:00-17:00',
        tax_code: '0123456789',
        license_number: 'BYT-Q1-2020-001',
        latitude: '10.7769',
        longitude: '106.7009',
        status: 'ACTIVE'
    }
];

// ==================== ROOM TABLE ====================
/**
 * Room table - Treatment rooms in clinic
 * Fields: room_number, status, clinic_id
 */
export const mockRooms = [
    {
        id: 'room_001',
        room_number: 'P101',
        status: 'ACTIVE',
        clinic_id: 'clinic_001'
    },
    {
        id: 'room_002',
        room_number: 'P102',
        status: 'ACTIVE',
        clinic_id: 'clinic_001'
    },
    {
        id: 'room_003',
        room_number: 'P103',
        status: 'ACTIVE',
        clinic_id: 'clinic_001'
    },
    {
        id: 'room_004',
        room_number: 'P104',
        status: 'MAINTENANCE',
        clinic_id: 'clinic_001'
    },
    {
        id: 'room_005',
        room_number: 'P105',
        status: 'ACTIVE',
        clinic_id: 'clinic_001'
    }
];

// ==================== ROOM_USER TABLE ====================
/**
 * Room_User table - Assigns doctors to rooms
 * Fields: room_id, doctor_id, working_start_Date
 */
export const mockRoomUsers = [
    // BS. Nguyễn Văn Anh - Room P101
    {
        id: 'ru_001',
        room_id: 'room_001',
        doctor_id: '67890abc12345def67890002',
        working_start_Date: '2024-01-15'
    },
    // BS. Nguyễn Văn Anh - Room P102 (backup)
    {
        id: 'ru_002',
        room_id: 'room_002',
        doctor_id: '67890abc12345def67890002',
        working_start_Date: '2024-02-01'
    },

    // BS. Trần Thị Bình - Room P103
    {
        id: 'ru_003',
        room_id: 'room_003',
        doctor_id: '67890abc12345def67890003',
        working_start_Date: '2024-01-20'
    },
    // BS. Trần Thị Bình - Room P105 (backup)
    {
        id: 'ru_004',
        room_id: 'room_005',
        doctor_id: '67890abc12345def67890003',
        working_start_Date: '2024-03-01'
    }
];

// ==================== APPOINTMENT TABLE ====================
/**
 * Appointment table
 */
export const mockAppointments = [
    {
        id: 'apt_001',
        code: 'APT001',
        patient_id: '67890abc12345def67890005',
        doctor_id: '67890abc12345def67890002',
        room_id: 'room_001',
        appointment_Date: '2026-01-22',
        appointment_Time: '09:00',
        date: '2026-01-22', // Alias for dashboard compatibility
        time: '09:00', // Alias for dashboard compatibility
        reason: 'Đau răng số 6',
        notes: 'Bệnh nhân cảm thấy đau nhức khi nhai',
        status: 'Pending',
        created_at: '2026-01-10T08:00:00Z',
        updated_at: '2026-01-10T08:00:00Z',
        // Helper fields for display (joined from User table)
        patientName: 'Lê Văn Hoàng',
        patientPhone: '0967890123',
        doctorName: 'BS. Nguyễn Văn Anh'
    },
    {
        id: 'apt_002',
        code: 'APT002',
        patient_id: '67890abc12345def67890006',
        doctor_id: '67890abc12345def67890003',
        room_id: 'room_002',
        appointment_Date: '2026-01-23',
        appointment_Time: '10:30',
        date: '2026-01-23',
        time: '10:30',
        reason: 'Khám định kỳ',
        notes: 'Khám định kỳ 6 tháng',
        status: 'Confirmed',
        created_at: '2026-01-08T10:30:00Z',
        updated_at: '2026-01-08T10:30:00Z',
        patientName: 'Nguyễn Thị Lan',
        patientPhone: '0978901234',
        doctorName: 'BS. Trần Thị Bình'
    },
    {
        id: 'apt_003',
        code: 'APT003',
        patient_id: '67890abc12345def67890007',
        doctor_id: '67890abc12345def67890002',
        room_id: 'room_001',
        appointment_Date: '2026-01-21',
        appointment_Time: '14:00',
        date: '2026-01-21',
        time: '14:00',
        reason: 'Trám răng',
        notes: 'Hoàn thành trám răng số 7',
        status: 'Completed',
        created_at: '2026-01-10T14:00:00Z',
        updated_at: '2026-01-14T15:00:00Z',
        patientName: 'Trần Minh Tuấn',
        patientPhone: '0989012345',
        doctorName: 'BS. Nguyễn Văn Anh'
    },
    {
        id: 'apt_004',
        code: 'APT004',
        patient_id: '67890abc12345def67890005',
        doctor_id: '67890abc12345def67890003',
        room_id: 'room_002',
        appointment_Date: '2026-01-20',
        appointment_Time: '16:00',
        date: '2026-01-20',
        time: '16:00',
        reason: 'Lấy cao răng',
        notes: 'Bệnh nhân yêu cầu hủy',
        status: 'Cancelled',
        created_at: '2026-01-05T09:00:00Z',
        updated_at: '2026-01-12T08:00:00Z',
        patientName: 'Lê Văn Hoàng',
        patientPhone: '0967890123',
        doctorName: 'BS. Trần Thị Bình'
    },
    {
        id: 'apt_005',
        code: 'APT005',
        patient_id: '67890abc12345def67890006',
        doctor_id: '67890abc12345def67890002',
        room_id: 'room_001',
        appointment_Date: '2026-01-24',
        appointment_Time: '11:00',
        date: '2026-01-24',
        time: '11:00',
        reason: 'Nhổ răng khôn',
        notes: 'Răng khôn mọc lệch cần nhổ',
        status: 'Confirmed',
        created_at: '2026-01-15T10:00:00Z',
        updated_at: '2026-01-15T10:00:00Z',
        patientName: 'Nguyễn Thị Lan',
        patientPhone: '0978901234',
        doctorName: 'BS. Nguyễn Văn Anh'
    },
    {
        id: 'apt_006',
        code: 'APT006',
        patient_id: '67890abc12345def67890007',
        doctor_id: '67890abc12345def67890002',
        room_id: 'room_001',
        appointment_Date: '2026-01-25',
        appointment_Time: '15:30',
        date: '2026-01-25',
        time: '15:30',
        reason: 'Tái khám',
        notes: 'Tái khám sau trám răng',
        status: 'Pending',
        created_at: '2026-01-18T09:00:00Z',
        updated_at: '2026-01-18T09:00:00Z',
        patientName: 'Trần Minh Tuấn',
        patientPhone: '0989012345',
        doctorName: 'BS. Nguyễn Văn Anh'
    }
];

// ==================== INVOICE TABLE ====================
/**
 * Invoice table - Patient invoices
 */
export const mockInvoices = [
    {
        id: 'inv_001',
        code: 'INV001',
        patient_id: '67890abc12345def67890005',
        patientName: 'Lê Văn Hoàng',
        date: '2026-01-15',
        total: 2500000,
        paid: 2500000,
        status: 'Paid'
    },
    {
        id: 'inv_002',
        code: 'INV002',
        patient_id: '67890abc12345def67890006',
        patientName: 'Nguyễn Thị Lan',
        date: '2026-01-14',
        total: 1800000,
        paid: 0,
        status: 'Pending'
    },
    {
        id: 'inv_003',
        code: 'INV003',
        patient_id: '67890abc12345def67890007',
        patientName: 'Trần Minh Tuấn',
        date: '2026-01-13',
        total: 3200000,
        paid: 1500000,
        status: 'Partial'
    },
    {
        id: 'inv_004',
        code: 'INV004',
        patient_id: '67890abc12345def67890005',
        patientName: 'Lê Văn Hoàng',
        date: '2026-01-12',
        total: 950000,
        paid: 0,
        status: 'Pending'
    }
];

// Services Gallery Data (Homepage)
export const servicesGalleryData = [
    {
        image: "https://nhakhoaparkway.com/wp-content/uploads/2024/03/Nieng-rang-trong-suot.jpg",
        title: "Niềng răng trong suốt",
        subtitle: "Invisalign"
    },
    {
        image: "https://nhakhoaparkway.com/wp-content/uploads/2024/03/Nieng-rang-mac-cai_.jpg",
        title: "Niềng răng mắc cài tiết",
        subtitle: "kiệm"
    },
    {
        image: "https://nhakhoaparkway.com/wp-content/uploads/2024/04/Nha-tre%CC%89-em.jpg",
        title: "Nha trẻ em",
        subtitle: null
    },
    {
        image: "https://nhakhoaparkway.com/wp-content/uploads/2024/03/Trong-rang-Implant-2.jpg",
        title: "Trồng răng Implant",
        subtitle: null
    },
    {
        image: "https://nhakhoaparkway.com/wp-content/uploads/2024/03/Lay-cao-rang.jpg",
        title: "Lấy cao răng",
        subtitle: null
    },
    {
        image: "https://nhakhoaparkway.com/wp-content/uploads/2024/03/Nieng-rang-trong-suot-Clear-correct_.jpg",
        title: "Niềng răng trong suốt",
        subtitle: "cho Teen"
    },
    {
        image: "https://nhakhoaparkway.com/wp-content/uploads/2024/03/Nieng-rang-Mac-cai-truyen-thong.jpg",
        title: "Niềng răng mắc cài",
        subtitle: null
    },
    {
        image: "https://nhakhoaparkway.com/wp-content/uploads/2024/01/Nho%CC%82%CC%89-ra%CC%86ng-kho%CC%82n.png",
        title: "Nhổ răng khôn",
        subtitle: null
    },
    {
        image: "https://nhakhoaparkway.com/wp-content/uploads/2024/03/Tay-trang-rang.jpg",
        title: "Răng sứ thẩm mỹ &",
        subtitle: "veneer"
    },
    {
        image: "https://nhakhoaparkway.com/wp-content/uploads/2024/03/Tram-rang.jpg",
        title: "Trám răng",
        subtitle: null
    }
];

// Featured Services Data (Homepage)
export const featuredServicesData = [
    {
        image: "https://images.unsplash.com/photo-1606811841689-23dfddce3e95?w=600&h=400&fit=crop",
        title: "Trám răng mặt nhai",
        category: "Nha khoa tổng quát",
        price: "350.000đ - 450.000đ",
        discount: null
    },
    {
        image: "https://nhakhoaparkway.com/wp-content/uploads/2024/02/Ta%CC%82%CC%89y-tra%CC%86%CC%81ng-3-1536x864.png",
        title: "Tẩy trắng răng cấp tốc Express",
        category: "Nha khoa thẩm mỹ",
        price: "1.250.000đ - 1.400.000đ",
        discount: null
    },
    {
        image: "https://nhakhoaparkway.com/wp-content/uploads/2024/02/Go%CC%81i-nie%CC%82%CC%80ng-ra%CC%86ng-trong-suo%CC%82%CC%81t-Comprehensive-3-na%CC%86m-1536x1024.jpg",
        title: "Gói niềng trong suốt Invisalign Comprehensive 3 năm",
        category: "Niềng răng trong suốt invisalign",
        price: "77.350.000đ - 79.300.000đ",
        originalPrice: "119.000.000đ - 125.000.000đ",
        discount: "Giảm 35%"
    }
];

// Doctors Team Data (Homepage)
export const doctorsTeamData = [
    {
        image: "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=300&h=400&fit=crop&crop=faces",
        name: "Phạm Thị Hà Xuyên",
        credentials: [
            "Bác sĩ răng hàm mặt",
            "Tốt nghiệp Đại học Y Dược TP.HCM (2012)",
            "Chứng chỉ Nha khoa thẩm mỹ - Hàn Quốc (2018)",
            "10+ năm kinh nghiệm lâm sàng",
            "Chuyên về: Răng sứ thẩm mỹ, Veneer, Tẩy trắng răng"
        ]
    },
    {
        image: "https://images.unsplash.com/photo-1594824476967-48c8b964273f?w=300&h=400&fit=crop&crop=faces",
        name: "Nguyễn Xuân Nhi",
        credentials: [
            "Bác sĩ răng hàm mặt",
            "Tốt nghiệp Đại học Y Hà Nội (2014)",
            "Chứng chỉ Niềng răng Invisalign - Mỹ (2017)",
            "8+ năm kinh nghiệm lâm sàng",
            "Chuyên về: Niềng răng trong suốt, Chỉnh nha"
        ]
    },
    {
        image: "https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?w=300&h=400&fit=crop&crop=faces",
        name: "Trần Minh Tuấn",
        credentials: [
            "Bác sĩ răng hàm mặt",
            "Tốt nghiệp ĐH Y Dược TP.HCM (2010)",
            "Chứng chỉ Cấy ghép Implant - Đức (2015)",
            "12+ năm kinh nghiệm lâm sàng",
            "Chuyên về: Cấy ghép Implant, Phục hồi răng"
        ]
    },
    {
        image: "https://images.unsplash.com/photo-1638202993928-7267aad84c31?w=300&h=400&fit=crop&crop=faces",
        name: "Lê Thị Mai",
        credentials: [
            "Bác sĩ răng hàm mặt",
            "Tốt nghiệp ĐH Y Phạm Ngọc Thạch (2015)",
            "Chứng chỉ Nha khoa trẻ em - Singapore (2019)",
            "7+ năm kinh nghiệm lâm sàng",
            "Chuyên về: Nha khoa trẻ em, Dự phòng răng miệng"
        ]
    }
];

// ==================== LEAVE REQUEST TABLE ====================
/**
 * Leave Request table - Staff leave requests
 * Fields: user_id, type, startDate, endDate, reason, status, createdAt, approvedBy, approvedAt
 */
export const mockLeaveRequests = [
    {
        id: 'leave_001',
        user_id: '67890abc12345def67890002', // BS. Nguyễn Văn Anh
        type: 'ANNUAL_LEAVE',
        startDate: '2026-02-01',
        endDate: '2026-02-03',
        reason: 'Nghỉ phép năm, về quê thăm gia đình',
        status: 'APPROVED',
        createdAt: '2026-01-15',
        approvedBy: '67890abc12345def67890001', // Admin
        approvedAt: '2026-01-16'
    },
    {
        id: 'leave_002',
        user_id: '67890abc12345def67890002', // BS. Nguyễn Văn Anh
        type: 'SICK_LEAVE',
        startDate: '2026-01-25',
        endDate: '2026-01-25',
        reason: 'Bị cảm sốt, cần nghỉ ngơi',
        status: 'PENDING',
        createdAt: '2026-01-24',
        approvedBy: null,
        approvedAt: null
    },
    {
        id: 'leave_003',
        user_id: '67890abc12345def67890003', // BS. Trần Thị Bình
        type: 'PERSONAL_LEAVE',
        startDate: '2026-01-28',
        endDate: '2026-01-29',
        reason: 'Giải quyết công việc cá nhân',
        status: 'APPROVED',
        createdAt: '2026-01-20',
        approvedBy: '67890abc12345def67890001', // Admin
        approvedAt: '2026-01-21'
    },
    {
        id: 'leave_004',
        user_id: '67890abc12345def67890010', // Võ Thị Lan (Assistant)
        type: 'ANNUAL_LEAVE',
        startDate: '2026-02-10',
        endDate: '2026-02-12',
        reason: 'Nghỉ phép năm',
        status: 'REJECTED',
        createdAt: '2026-01-18',
        approvedBy: '67890abc12345def67890001',
        approvedAt: '2026-01-19',
        rejectionReason: 'Thời gian này cần đủ nhân sự'
    },
    {
        id: 'leave_005',
        user_id: '67890abc12345def67890010', // Võ Thị Lan (Assistant)
        type: 'SICK_LEAVE',
        startDate: '2026-01-22',
        endDate: '2026-01-22',
        reason: 'Khám sức khỏe định kỳ',
        status: 'APPROVED',
        createdAt: '2026-01-20',
        approvedBy: '67890abc12345def67890001',
        approvedAt: '2026-01-20'
    }
];

// ==================== MEDICAL RECORD TABLE ====================
/**
 * Medical Record table - Patient medical records
 * Fields: patient_id, doctor_id, appointment_id, created_by, diagnosis, treatment, 
 *         notes, medications, status, approved_by, approved_at, created_at
 */
export const mockMedicalRecords = [
    {
        id: 'record_001',
        patient_id: '67890abc12345def67890005', // Lê Văn Hoàng
        doctor_id: '67890abc12345def67890002', // BS. Nguyễn Văn Anh
        appointment_id: 'apt_001',
        created_by: '67890abc12345def67890002', // Created by doctor
        diagnosis: 'Sâu răng số 6, viêm tủy',
        treatment: 'Điều trị tủy, trám răng',
        notes: 'Bệnh nhân cần tái khám sau 1 tuần',
        medications: 'Kháng sinh Amoxicillin 500mg, uống 3 lần/ngày',
        status: 'APPROVED', // Auto-approved because created by doctor
        approved_by: null,
        approved_at: null,
        created_at: '2026-01-15T10:30:00Z'
    },
    {
        id: 'record_002',
        patient_id: '67890abc12345def67890006', // Nguyễn Thị Lan
        doctor_id: '67890abc12345def67890003', // BS. Trần Thị Bình
        appointment_id: 'apt_002',
        created_by: '67890abc12345def67890010', // Created by assistant
        diagnosis: 'Viêm lợi nhẹ, cần lấy cao răng',
        treatment: 'Lấy cao răng, vệ sinh răng miệng',
        notes: 'Hướng dẫn bệnh nhân đánh răng đúng cách',
        medications: 'Nước súc miệng Listerine',
        status: 'PENDING', // Needs doctor approval
        approved_by: null,
        approved_at: null,
        created_at: '2026-01-15T11:00:00Z'
    },
    {
        id: 'record_003',
        patient_id: '67890abc12345def67890007', // Trần Minh Tuấn
        doctor_id: '67890abc12345def67890002', // BS. Nguyễn Văn Anh
        appointment_id: 'apt_003',
        created_by: '67890abc12345def67890010', // Created by assistant
        diagnosis: 'Răng số 7 bị sâu sâu, cần trám',
        treatment: 'Trám răng composite',
        notes: 'Hoàn thành trám răng, không có biến chứng',
        medications: 'Không',
        status: 'APPROVED', // Approved by doctor
        approved_by: '67890abc12345def67890002',
        approved_at: '2026-01-14T16:00:00Z',
        created_at: '2026-01-14T15:30:00Z'
    },
    {
        id: 'record_004',
        patient_id: '67890abc12345def67890005', // Lê Văn Hoàng
        doctor_id: '67890abc12345def67890003', // BS. Trần Thị Bình
        appointment_id: 'apt_004',
        created_by: '67890abc12345def67890004', // Created by receptionist
        diagnosis: 'Cao răng nhiều, viêm lợi',
        treatment: 'Lấy cao răng toàn hàm',
        notes: 'Cần tái khám sau 6 tháng',
        medications: 'Nước súc miệng',
        status: 'REJECTED',
        approved_by: '67890abc12345def67890003',
        approved_at: '2026-01-13T09:00:00Z',
        rejectionReason: 'Chẩn đoán chưa chính xác, cần bổ sung thông tin về mức độ viêm lợi',
        created_at: '2026-01-12T17:00:00Z'
    }
];

// ==================== DERIVED DATA ====================
/**
 * mockPatients - Derived from mockUsers where role is Patient
 */
export const mockPatients = mockUsers
    .filter(user => {
        const account = mockAccounts.find(a => a.id === user.account_id);
        return account && account.role_id === 'role_004'; // Patient role
    })
    .map(user => ({
        id: user.id,
        name: user.full_name,
        email: user.email,
        phone: user.phone,
        dob: user.dob,
        status: user.status,
        createdAt: '2025-12-01' // Default created date
    }));

// ==================== HELPER FUNCTIONS ====================

/**
 * Get user with full account and role information
 * Simulates JOIN operation in database
 */
export const getUserWithAccountAndRole = (userId) => {
    const user = mockUsers.find(u => u.id === userId);
    if (!user) return null;

    const account = mockAccounts.find(a => a.id === user.account_id);
    if (!account) return null;

    const role = mockRoles.find(r => r.id === account.role_id);

    return {
        ...user,
        username: account.username,
        email_verified: account.email_verified,
        role: role?.name || null,
        permissions: role?.permissions || []
    };
};

/**
 * Get appointments by doctor ID
 * @param {string} doctorId - Doctor's user ID
 * @returns {Array} Filtered appointments for the doctor
 */
export const getAppointmentsByDoctor = (doctorId) => {
    if (!doctorId) return [];
    return mockAppointments.filter(apt => apt.doctor_id === doctorId);
};

/**
 * Get medical records pending approval for a doctor
 * @param {string} doctorId - Doctor's user ID
 * @returns {Array} Filtered medical records pending approval with patient info
 */
export const getMedicalRecordsPendingApproval = (doctorId) => {
    if (!doctorId) return [];

    return mockMedicalRecords
        .filter(record => record.doctor_id === doctorId && record.status === 'PENDING')
        .map(record => {
            // Get patient info
            const patient = mockUsers.find(u => u.id === record.patient_id);
            // Get appointment info
            const appointment = mockAppointments.find(a => a.id === record.appointment_id);
            // Get creator info
            const creator = mockUsers.find(u => u.id === record.created_by);

            return {
                ...record,
                patientName: patient?.full_name || 'Unknown',
                patientPhone: patient?.phone || '',
                appointmentDate: appointment?.date || '',
                appointmentTime: appointment?.time || '',
                creatorName: creator?.full_name || 'Unknown'
            };
        });
};

/**
 * Authenticate user (for login)
 */
export const authenticateUser = (username, password) => {
    const account = mockAccounts.find(
        a => a.username === username && a.password === password && a.status === 'ACTIVE'
    );

    if (!account) return null;

    return getUserWithAccountAndRole(account.user_id);
};
