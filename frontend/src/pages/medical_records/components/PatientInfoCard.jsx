import React from 'react';
import { User, Calendar, Phone, MapPin } from 'lucide-react';
import Card from '../../../components/ui/Card';
import Badge from '../../../components/ui/Badge';

const PatientInfoCard = ({ patient }) => {
    if (!patient) return null;

    const calculateAge = (dob) => {
        return new Date().getFullYear() - new Date(dob).getFullYear();
    };

    return (
        <Card className="mb-6">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div className="flex items-start gap-4">
                    <div className="p-4 bg-blue-100 rounded-full">
                        <User size={32} className="text-blue-600" />
                    </div>
                    <div>
                        <h2 className="text-xl font-bold text-gray-900">{patient.name}</h2>
                        <div className="flex items-center gap-2 mt-1">
                            <span className="text-gray-500 text-sm">Mã BN:</span>
                            <span className="font-medium text-blue-600">{patient.code || 'N/A'}</span>
                        </div>
                        <div className="flex flex-wrap gap-4 mt-2 text-sm text-gray-600">
                            <div className="flex items-center gap-1">
                                <Calendar size={16} />
                                <span>{patient.dob} ({calculateAge(patient.dob)} tuổi)</span>
                            </div>
                            <div className="flex items-center gap-1">
                                <Phone size={16} />
                                <span>{patient.phone}</span>
                            </div>
                        </div>
                    </div>
                </div>
                <div className="flex flex-col items-end gap-2">
                    <Badge variant={patient.status === 'ACTIVE' ? 'success' : 'default'}>
                        {patient.status === 'ACTIVE' ? 'Đang điều trị' : 'Không hoạt động'}
                    </Badge>
                    <div className="text-sm text-gray-500 flex items-center gap-1">
                        <MapPin size={14} />
                        {patient.address}
                    </div>
                </div>
            </div>
        </Card>
    );
};

export default PatientInfoCard;
