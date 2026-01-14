// Mock Users for Authentication
export const mockUsers = [
    {
        id: 1,
        username: 'admin',
        password: 'admin123',
        role: 'Admin',
        name: 'Quản trị viên',
        email: 'admin@dcms.com',
        phone: '0901000001',
        avatar: null
    },
    {
        id: 2,
        username: 'doctor1',
        password: 'doctor123',
        role: 'Doctor',
        name: 'BS. Nguyễn Văn A',
        email: 'doctor1@dcms.com',
        phone: '0901000002',
        specialization: 'Nha khoa tổng quát',
        avatar: null
    },
    {
        id: 3,
        username: 'doctor2',
        password: 'doctor123',
        role: 'Doctor',
        name: 'BS. Trần Thị B',
        email: 'doctor2@dcms.com',
        phone: '0901000003',
        specialization: 'Chỉnh nha',
        avatar: null
    },
    {
        id: 4,
        username: 'receptionist1',
        password: 'receptionist123',
        role: 'Receptionist',
        name: 'Lê Thị C',
        email: 'receptionist1@dcms.com',
        phone: '0901000004',
        avatar: null
    },
    {
        id: 5,
        username: 'patient1',
        password: 'patient123',
        role: 'Patient',
        name: 'Nguyễn Văn A',
        email: 'patient1@gmail.com',
        phone: '0123456789',
        dateOfBirth: '1990-05-15',
        gender: 'Nam',
        address: '123 Đường ABC, Quận 1, TP.HCM',
        avatar: null
    },
];

// Mock Patients
export const mockPatients = [
    {
        id: 1,
        code: 'BN001',
        name: 'Trần Văn Nam',
        dob: '1990-05-15',
        gender: 'Nam',
        phone: '0902222001',
        email: 'tranvannam@email.com',
        address: '123 Nguyễn Huệ, Q1, TP.HCM',
        createdAt: '2026-01-01',
        status: 'active'
    },
    {
        id: 2,
        code: 'BN002',
        name: 'Nguyễn Thị Hoa',
        dob: '1985-08-20',
        gender: 'Nữ',
        phone: '0902222002',
        email: 'nguyenthihoa@email.com',
        address: '456 Lê Lợi, Q3, TP.HCM',
        createdAt: '2026-01-02',
        status: 'active'
    },
    {
        id: 3,
        code: 'BN003',
        name: 'Lê Minh Tuấn',
        dob: '1995-03-10',
        gender: 'Nam',
        phone: '0902222003',
        email: 'leminhtuan@email.com',
        address: '789 Hai Bà Trưng, Q1, TP.HCM',
        createdAt: '2026-01-03',
        status: 'active'
    },
    {
        id: 4,
        code: 'BN004',
        name: 'Phạm Thị Lan',
        dob: '1992-11-25',
        gender: 'Nữ',
        phone: '0902222004',
        email: 'phamthilan@email.com',
        address: '321 Võ Văn Tần, Q3, TP.HCM',
        createdAt: '2026-01-04',
        status: 'active'
    },
    {
        id: 5,
        code: 'BN005',
        name: 'Hoàng Văn Sơn',
        dob: '1988-07-18',
        gender: 'Nam',
        phone: '0902222005',
        email: 'hoangvanson@email.com',
        address: '654 Trần Hưng Đạo, Q5, TP.HCM',
        createdAt: '2026-01-05',
        status: 'active'
    },
];

// Mock Appointments
export const mockAppointments = [
    {
        id: 1,
        code: 'LH001',
        patientId: 1,
        patientName: 'Trần Văn Nam',
        patientPhone: '0902222001',
        doctorId: 2,
        doctorName: 'BS. Nguyễn Văn A',
        date: '2026-01-15',
        time: '09:00',
        status: 'Confirmed',
        reason: 'Khám định kỳ',
        notes: '',
        createdAt: '2026-01-10'
    },
    {
        id: 2,
        code: 'LH002',
        patientId: 2,
        patientName: 'Nguyễn Thị Hoa',
        patientPhone: '0902222002',
        doctorId: 2,
        doctorName: 'BS. Nguyễn Văn A',
        date: '2026-01-15',
        time: '10:00',
        status: 'Pending',
        reason: 'Đau răng',
        notes: '',
        createdAt: '2026-01-10'
    },
    {
        id: 3,
        code: 'LH003',
        patientId: 3,
        patientName: 'Lê Minh Tuấn',
        patientPhone: '0902222003',
        doctorId: 3,
        doctorName: 'BS. Trần Thị B',
        date: '2026-01-15',
        time: '14:00',
        status: 'Confirmed',
        reason: 'Niềng răng - tái khám',
        notes: '',
        createdAt: '2026-01-10'
    },
    {
        id: 4,
        code: 'LH004',
        patientId: 4,
        patientName: 'Phạm Thị Lan',
        patientPhone: '0902222004',
        doctorId: 2,
        doctorName: 'BS. Nguyễn Văn A',
        date: '2026-01-16',
        time: '09:30',
        status: 'Pending',
        reason: 'Tư vấn cấy ghép implant',
        notes: '',
        createdAt: '2026-01-11'
    },
    {
        id: 5,
        code: 'LH005',
        patientId: 5,
        patientName: 'Hoàng Văn Sơn',
        patientPhone: '0902222005',
        doctorId: 3,
        doctorName: 'BS. Trần Thị B',
        date: '2026-01-16',
        time: '15:00',
        status: 'Completed',
        reason: 'Lấy cao răng',
        notes: 'Đã hoàn thành',
        createdAt: '2026-01-09'
    },
];

// Mock Services
export const mockServices = [
    { id: 1, code: 'DV001', name: 'Khám tổng quát', price: 100000, duration: 30, category: 'Khám' },
    { id: 2, code: 'DV002', name: 'Nhổ răng', price: 200000, duration: 45, category: 'Phẫu thuật' },
    { id: 3, code: 'DV003', name: 'Trám răng', price: 300000, duration: 60, category: 'Điều trị' },
    { id: 4, code: 'DV004', name: 'Tẩy trắng răng', price: 1000000, duration: 90, category: 'Thẩm mỹ' },
    { id: 5, code: 'DV005', name: 'Niềng răng', price: 15000000, duration: 60, category: 'Chỉnh nha' },
    { id: 6, code: 'DV006', name: 'Lấy cao răng', price: 150000, duration: 30, category: 'Vệ sinh' },
    { id: 7, code: 'DV007', name: 'Cấy ghép Implant', price: 20000000, duration: 120, category: 'Phẫu thuật' },
];

// Mock Invoices
export const mockInvoices = [
    {
        id: 1,
        code: 'HD001',
        patientId: 5,
        patientName: 'Hoàng Văn Sơn',
        date: '2026-01-10',
        services: [
            { serviceId: 6, serviceName: 'Lấy cao răng', quantity: 1, price: 150000 }
        ],
        total: 150000,
        paid: 150000,
        status: 'Paid',
        paymentMethod: 'Cash',
        createdBy: 'Lê Thị C'
    },
    {
        id: 2,
        code: 'HD002',
        patientId: 1,
        patientName: 'Trần Văn Nam',
        date: '2026-01-12',
        services: [
            { serviceId: 1, serviceName: 'Khám tổng quát', quantity: 1, price: 100000 },
            { serviceId: 3, serviceName: 'Trám răng', quantity: 2, price: 300000 }
        ],
        total: 700000,
        paid: 0,
        status: 'Pending',
        paymentMethod: null,
        createdBy: 'Lê Thị C'
    },
];

// Mock Medicines
export const mockMedicines = [
    { id: 1, code: 'TH001', name: 'Paracetamol 500mg', unit: 'Viên', quantity: 100, price: 5000, minStock: 20 },
    { id: 2, code: 'TH002', name: 'Amoxicillin 500mg', unit: 'Viên', quantity: 50, price: 10000, minStock: 15 },
    { id: 3, code: 'TH003', name: 'Ibuprofen 400mg', unit: 'Viên', quantity: 75, price: 7000, minStock: 20 },
    { id: 4, code: 'TH004', name: 'Novoscaine 3%', unit: 'Ống', quantity: 30, price: 15000, minStock: 10 },
    { id: 5, code: 'TH005', name: 'Nước súc miệng Chlorhexidine', unit: 'Chai', quantity: 20, price: 50000, minStock: 10 },
];

// Mock Equipment
export const mockEquipment = [
    { id: 1, code: 'TB001', name: 'Máy X-Quang', status: 'Active', location: 'Phòng 1', purchaseDate: '2023-05-10', lastMaintenance: '2025-12-15' },
    { id: 2, code: 'TB002', name: 'Ghế nha khoa', status: 'Active', location: 'Phòng 2', purchaseDate: '2023-06-20', lastMaintenance: '2026-01-05' },
    { id: 3, code: 'TB003', name: 'Máy cạo vôi', status: 'Maintenance', location: 'Phòng 3', purchaseDate: '2024-01-15', lastMaintenance: '2025-11-20' },
    { id: 4, code: 'TB004', name: 'Máy nội soi răng', status: 'Active', location: 'Phòng 1', purchaseDate: '2024-03-10', lastMaintenance: '2025-12-28' },
];

// Helper functions
export const getPatientById = (id) => mockPatients.find(p => p.id === id);
export const getDoctorById = (id) => mockUsers.find(u => u.id === id && u.role === 'Doctor');
export const getAppointmentsByDate = (date) => mockAppointments.filter(a => a.date === date);
export const getAppointmentsByDoctor = (doctorId) => mockAppointments.filter(a => a.doctorId === doctorId);
export const getPendingInvoices = () => mockInvoices.filter(i => i.status === 'Pending');
export const getLowStockMedicines = () => mockMedicines.filter(m => m.quantity <= m.minStock);
