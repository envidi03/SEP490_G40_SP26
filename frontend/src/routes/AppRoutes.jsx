const AppRoutes = () => {
    return (
        <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/login" element={<Login />} />
            <Route path="/admin-clinic-dashboard" element={<AdminClinicDashboard />} />
            <Route path="/doctor-dashboard" element={<DoctorDashboard />} />
            <Route path="/receptionist-dashboard" element={<ReceptionistDashboard />} />
        </Routes>
    );
};

export default AppRoutes;
