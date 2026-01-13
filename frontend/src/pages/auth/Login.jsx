import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { mockUsers } from '../../utils/mockData';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import { LogIn, User, Lock } from 'lucide-react';

const Login = () => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const { login } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        // Simulate API call delay
        setTimeout(() => {
            const user = mockUsers.find(
                u => u.username === username && u.password === password
            );

            if (user) {
                // Remove password from user object before storing
                const { password, ...userWithoutPassword } = user;
                login(userWithoutPassword);
                navigate('/dashboard');
            } else {
                setError('Tên đăng nhập hoặc mật khẩu không đúng');
            }
            setLoading(false);
        }, 500);
    };

    const handleDemoLogin = (role) => {
        const demoUser = mockUsers.find(u => u.role === role);
        if (demoUser) {
            setUsername(demoUser.username);
            setPassword(demoUser.password);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
            <div className="max-w-md w-full">
                {/* Logo & Title */}
                <div className="text-center mb-8">
                    <div className="inline-flex items-center justify-center w-16 h-16 bg-primary-600 rounded-full mb-4">
                        <LogIn size={32} className="text-white" />
                    </div>
                    <h1 className="text-3xl font-bold text-gray-900">DCMS</h1>
                    <p className="text-gray-600 mt-2">Dental Clinic Management System</p>
                </div>

                {/* Login Form */}
                <div className="bg-white rounded-lg shadow-lg p-8">
                    <h2 className="text-2xl font-bold text-gray-900 mb-6">Đăng nhập</h2>

                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                <User size={16} className="inline mr-1" />
                                Tên đăng nhập
                            </label>
                            <Input
                                type="text"
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                                placeholder="Nhập tên đăng nhập"
                                required
                                className="w-full"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                <Lock size={16} className="inline mr-1" />
                                Mật khẩu
                            </label>
                            <Input
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                placeholder="Nhập mật khẩu"
                                required
                                className="w-full"
                            />
                        </div>

                        {error && (
                            <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg text-sm">
                                {error}
                            </div>
                        )}

                        <Button
                            type="submit"
                            className="w-full"
                            disabled={loading}
                        >
                            {loading ? 'Đang đăng nhập...' : 'Đăng nhập'}
                        </Button>
                    </form>

                    {/* Demo Accounts */}
                    <div className="mt-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
                        <p className="text-sm font-semibold text-gray-700 mb-3">
                            🎭 Tài khoản Demo:
                        </p>
                        <div className="space-y-2">
                            <button
                                type="button"
                                onClick={() => handleDemoLogin('Admin')}
                                className="w-full text-left px-3 py-2 text-sm bg-white hover:bg-blue-50 border border-gray-200 rounded transition-colors"
                            >
                                <span className="font-medium text-blue-600">Admin:</span>
                                <span className="text-gray-600 ml-2">admin / admin123</span>
                            </button>
                            <button
                                type="button"
                                onClick={() => handleDemoLogin('Doctor')}
                                className="w-full text-left px-3 py-2 text-sm bg-white hover:bg-green-50 border border-gray-200 rounded transition-colors"
                            >
                                <span className="font-medium text-green-600">Bác sĩ:</span>
                                <span className="text-gray-600 ml-2">doctor1 / doctor123</span>
                            </button>
                            <button
                                type="button"
                                onClick={() => handleDemoLogin('Receptionist')}
                                className="w-full text-left px-3 py-2 text-sm bg-white hover:bg-purple-50 border border-gray-200 rounded transition-colors"
                            >
                                <span className="font-medium text-purple-600">Lễ tân:</span>
                                <span className="text-gray-600 ml-2">receptionist1 / receptionist123</span>
                            </button>
                        </div>
                        <p className="text-xs text-gray-500 mt-3 italic">
                            💡 Click vào tài khoản để tự động điền form
                        </p>
                    </div>
                </div>

                {/* Footer */}
                <p className="text-center text-sm text-gray-600 mt-6">
                    © 2026 DCMS - Dental Clinic Management System
                </p>
            </div>
        </div>
    );
};

export default Login;
