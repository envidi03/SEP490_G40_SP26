import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ClipboardList, Search, DollarSign, Clock, Loader2, RefreshCw, ChevronLeft } from 'lucide-react';
import Card from '../../components/ui/Card';
import Badge from '../../components/ui/Badge';
import Toast from '../../components/ui/Toast';
import serviceService from '../../services/serviceService';

const ReceptionistSubServices = () => {
    const { parentId } = useParams();
    const navigate = useNavigate();
    const [subServices, setSubServices] = useState([]);
    const [parentService, setParentService] = useState(null);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [toast, setToast] = useState({ show: false, message: '', type: 'success' });

    const fetchData = async () => {
        setLoading(true);
        try {
            const [parentRes, subRes] = await Promise.all([
                serviceService.getServiceById(parentId),
                serviceService.getSubServicesByParent(parentId)
            ]);

            setParentService(parentRes?.data || null);
            setSubServices(subRes?.data || []);
        } catch (error) {
            console.error('Error fetching sub-services:', error);
            setToast({ show: true, message: 'Lỗi khi tải danh sách gói dịch vụ', type: 'error' });
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (parentId) fetchData();
    }, [parentId]);

    const filteredSubServices = subServices.filter(sub => {
        const sName = sub.sub_service_name || '';
        const sDesc = sub.description || '';
        return sName.toLowerCase().includes(searchTerm.toLowerCase()) ||
            sDesc.toLowerCase().includes(searchTerm.toLowerCase());
    });

    return (
        <div>
            {/* Header */}
            <div className="mb-8">
                <button
                    onClick={() => navigate('/receptionist/services')}
                    className="flex items-center text-primary-600 hover:text-primary-700 font-medium mb-4 transition-colors"
                >
                    <ChevronLeft size={20} className="mr-1" />
                    Quay lại danh sách dịch vụ
                </button>
                <div className="flex justify-between items-center">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900">
                            {parentService ? `Gói Dịch Vụ: ${parentService.service_name}` : 'Danh Sách Gói Dịch Vụ'}
                        </h1>
                        <p className="text-gray-600 mt-1">Quản lý chi tiết các gói dịch vụ thành phần</p>
                    </div>
                    <button
                        onClick={fetchData}
                        className="p-2 border border-gray-300 rounded-lg hover:bg-gray-50 text-gray-600 transition-colors"
                        title="Tải lại"
                    >
                        <RefreshCw size={20} className={loading ? 'animate-spin' : ''} />
                    </button>
                </div>
            </div>

            {/* Filters */}
            <Card className="mb-6">
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                    <input
                        type="text"
                        placeholder="Tìm kiếm gói dịch vụ..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                    />
                </div>
            </Card>

            {/* Sub-Services Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {loading ? (
                    <div className="col-span-full text-center py-12">
                        <Loader2 size={40} className="mx-auto text-primary-500 animate-spin mb-4" />
                        <p className="text-gray-500">Đang tải danh sách gói dịch vụ...</p>
                    </div>
                ) : filteredSubServices.length > 0 ? (
                    filteredSubServices.map((sub) => (
                        <Card key={sub._id} className="hover:shadow-lg transition-shadow">
                            <div className="flex justify-between items-start mb-3">
                                <Badge variant="primary">Gói dịch vụ</Badge>
                                <Badge variant={sub.status === 'AVAILABLE' ? 'success' : 'danger'}>
                                    {sub.status === 'AVAILABLE' ? 'Hoạt động' : 'Ngưng'}
                                </Badge>
                            </div>

                            <h3 className="text-lg font-bold text-gray-900 mb-2">{sub.sub_service_name}</h3>
                            <p className="text-sm text-gray-600 mb-4 line-clamp-3">{sub.description || 'Không có mô tả'}</p>

                            <div className="space-y-2 border-t border-gray-200 pt-4">
                                <div className="flex justify-between items-center">
                                    <span className="text-sm text-gray-600 flex items-center">
                                        <DollarSign size={16} className="mr-1" />
                                        Giá
                                    </span>
                                    <span className="text-lg font-bold text-primary-600">
                                        {sub.min_price === sub.max_price
                                            ? `${(sub.min_price || 0).toLocaleString('vi-VN')}đ`
                                            : `${(sub.min_price || 0).toLocaleString('vi-VN')}đ - ${(sub.max_price || 0).toLocaleString('vi-VN')}đ`
                                        }
                                    </span>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className="text-sm text-gray-600 flex items-center">
                                        <Clock size={16} className="mr-1" />
                                        Thời gian
                                    </span>
                                    <span className="text-sm font-medium text-gray-900">
                                        {sub.duration || parentService?.duration || 30} phút
                                    </span>
                                </div>
                            </div>
                        </Card>
                    ))
                ) : (
                    <div className="col-span-full">
                        <Card>
                            <div className="text-center py-12">
                                <ClipboardList size={48} className="mx-auto text-gray-300 mb-4" />
                                <p className="text-gray-500">Không tìm thấy gói dịch vụ nào</p>
                            </div>
                        </Card>
                    </div>
                )}
            </div>

            <Toast
                show={toast.show}
                message={toast.message}
                type={toast.type}
                onClose={() => setToast({ ...toast, show: false })}
            />
        </div>
    );
};

export default ReceptionistSubServices;
