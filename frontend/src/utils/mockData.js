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
    appointment_Date: '2026-01-15',
    appointment_Time: '09:00',
    date: '2026-01-15', // Alias for dashboard compatibility
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
    appointment_Date: '2026-01-15',
    appointment_Time: '10:30',
    date: '2026-01-15',
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
    appointment_Date: '2026-01-14',
    appointment_Time: '14:00',
    date: '2026-01-14',
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
    appointment_Date: '2026-01-12',
    appointment_Time: '16:00',
    date: '2026-01-12',
    time: '16:00',
    reason: 'Lấy cao răng',
    notes: 'Bệnh nhân yêu cầu hủy',
    status: 'Cancelled',
    created_at: '2026-01-05T09:00:00Z',
    updated_at: '2026-01-12T08:00:00Z',
    patientName: 'Lê Văn Hoàng',
    patientPhone: '0967890123',
    doctorName: 'BS. Trần Thị Bình'
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
 * Authenticate user (for login)
 */
export const authenticateUser = (username, password) => {
  const account = mockAccounts.find(
    a => a.username === username && a.password === password && a.status === 'ACTIVE'
  );

  if (!account) return null;

  return getUserWithAccountAndRole(account.user_id);
};

// ==================== DENTAL RECORD TABLE ====================
/**
 * Dental Record table - Treatment history
 */
export const mockDentalRecords = [
  {
    id: 'rec_001',
    patient_id: '67890abc12345def67890005', // Lê Văn Hoàng
    doctor_id: '67890abc12345def67890002', // BS. Nguyễn Văn Anh
    date: '2025-12-15',
    diagnosis: 'Sâu răng số 6 hàm dưới',
    treatment: 'Trám răng Composite',
    status: 'Completed',
    notes: 'Bệnh nhân chịu đau tốt',
    prescription_id: 'pres_001'
  },
  {
    id: 'rec_002',
    patient_id: '67890abc12345def67890006', // Nguyễn Thị Lan
    doctor_id: '67890abc12345def67890003', // BS. Trần Thị Bình
    date: '2026-01-05',
    diagnosis: 'Viêm lợi',
    treatment: 'Lấy cao răng, vệ sinh răng miệng',
    status: 'Completed',
    notes: 'Hẹn tái khám sau 6 tháng',
    prescription_id: null
  }
];

// ==================== PRESCRIPTION TABLE ====================
/**
 * Prescription table
 */
export const mockPrescriptions = [
  {
    id: 'pres_001',
    record_id: 'rec_001',
    doctor_id: '67890abc12345def67890002',
    date: '2025-12-15',
    medicines: [
      { name: 'Paracetamol 500mg', quantity: 10, dosage: 'Sáng 1, Chiều 1 sau ăn' },
      { name: 'Amoxicillin 500mg', quantity: 15, dosage: 'Sáng 1, Trưa 1, Tối 1 sau ăn' }
    ],
    note: 'Uống nhiều nước'
  }
];

// ==================== APPROVAL REQUEST TABLE ====================
/**
 * Approval Request table - For records/prescriptions needing approval
 */
export const mockApprovalRequests = [
  {
    id: 'req_001',
    type: 'DENTAL_RECORD', // or PRESCRIPTION
    reference_id: 'rec_new_001', // ID of the pending record
    requester_id: '67890abc12345def67890002', // BS. Nguyễn Văn Anh
    approver_id: null, // Any authorized person or specific head doctor
    status: 'PENDING', // PENDING, APPROVED, REJECTED
    created_at: '2026-01-18T10:00:00',
    details: {
      patientName: 'Trần Minh Tuấn',
      diagnosis: 'Nhổ răng khôn số 8',
      treatment: 'Tiểu phẫu nhổ răng'
    }
  },
  {
    id: 'req_002',
    type: 'PRESCRIPTION',
    reference_id: 'pres_new_001',
    requester_id: '67890abc12345def67890003', // BS. Trần Thị Bình
    approver_id: null,
    status: 'PENDING',
    created_at: '2026-01-19T09:30:00',
    details: {
      patientName: 'Lê Văn Hoàng',
      medicines: 'Panadol Extra x10, Alpha Choay x20'
    }
  }
];

// ==================== LEAVE REQUEST TABLE ====================
/**
 * Leave Request table
 */
export const mockLeaveRequests = [
  {
    id: 'leave_001',
    user_id: '67890abc12345def67890002', // BS. Nguyễn Văn Anh
    type: 'SICK_LEAVE',
    start_date: '2026-02-01',
    end_date: '2026-02-03',
    reason: 'Sốt xuất huyết',
    status: 'PENDING',
    created_at: '2026-01-15'
  },
  {
    id: 'leave_002',
    user_id: '67890abc12345def67890010', // Assistant Võ Thị Lan
    type: 'ANNUAL_LEAVE',
    start_date: '2026-01-25',
    end_date: '2026-01-26',
    reason: 'Về quê',
    status: 'PENDING',
    created_at: '2026-01-10',
    approver_id: '67890abc12345def67890002' // Assigned to BS. Nguyễn Văn Anh for approval
  }
];
