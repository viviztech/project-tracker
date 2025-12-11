import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import { FaEnvelope, FaLock, FaExclamationCircle } from 'react-icons/fa';
import { SiDocker } from 'react-icons/si';

const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [rememberMe, setRememberMe] = useState(true);
    const { login } = useAuth();
    const navigate = useNavigate();
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            const userData = await login(email, password, rememberMe);
            // Role-based redirect
            if (userData.role === 'Admin') {
                navigate('/');
            } else if (userData.role === 'Project Manager') {
                navigate('/projects');
            } else if (userData.role === 'Team Member') {
                navigate('/tasks');
            } else {
                navigate('/'); // Viewer goes to dashboard
            }
        } catch (err) {
            setError(err.toString());
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-[#F5F7FA] p-4 relative overflow-hidden">
            {/* Background Pattern */}
            <div className="absolute inset-0 opacity-5 pointer-events-none">
                <div className="absolute top-0 left-0 w-full h-full bg-[url('https://www.transparenttextures.com/patterns/cubes.png')]"></div>
            </div>

            {/* Login Card */}
            <div className="w-full max-w-[480px] bg-white rounded-lg shadow-xl p-8 md:p-10 relative z-10 border border-gray-100">
                <div className="text-center mb-8">
                    <div className="inline-flex items-center justify-center mb-4">
                        <SiDocker className="text-5xl text-[#1D63ED]" />
                    </div>
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">Sign in to ProjectHub</h2>
                    <p className="text-gray-600 text-sm">Welcome back! Please enter your details.</p>
                </div>

                {/* Social Login Placeholders */}


                {error && (
                    <div className="mb-6 p-4 bg-red-50 border-l-4 border-red-500 flex items-start gap-3">
                        <FaExclamationCircle className="text-red-500 mt-0.5 flex-shrink-0" />
                        <p className="text-sm text-red-700">{error}</p>
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-5">
                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                            Email Address
                        </label>
                        <div className="relative">
                            <input
                                type="email"
                                className="w-full px-4 py-2.5 border border-gray-300 rounded focus:ring-2 focus:ring-[#1D63ED] focus:border-[#1D63ED] outline-none transition-all text-gray-900 placeholder-gray-400"
                                placeholder="name@company.com"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                            />
                            <FaEnvelope className="absolute right-4 top-3 text-gray-400 pointer-events-none" />
                        </div>
                    </div>

                    <div>
                        <div className="flex items-center justify-between mb-1.5">
                            <label className="block text-sm font-semibold text-gray-700">
                                Password
                            </label>
                            <Link to="/forgot-password" className="text-sm text-[#1D63ED] hover:underline font-medium">
                                Forgot password?
                            </Link>
                        </div>
                        <div className="relative">
                            <input
                                type="password"
                                className="w-full px-4 py-2.5 border border-gray-300 rounded focus:ring-2 focus:ring-[#1D63ED] focus:border-[#1D63ED] outline-none transition-all text-gray-900 placeholder-gray-400"
                                placeholder="••••••••"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                            />
                            <FaLock className="absolute right-4 top-3 text-gray-400 pointer-events-none" />
                        </div>
                    </div>

                    <div className="flex items-center">
                        <input
                            id="remember-me"
                            name="remember-me"
                            type="checkbox"
                            checked={rememberMe}
                            onChange={(e) => setRememberMe(e.target.checked)}
                            className="h-4 w-4 text-[#1D63ED] focus:ring-[#1D63ED] border-gray-300 rounded"
                        />
                        <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-900">
                            Remember me
                        </label>
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full py-2.5 px-4 bg-[#1D63ED] hover:bg-[#1153D6] text-white font-bold rounded shadow-sm hover:shadow transition-all duration-200 disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2 mt-2"
                    >
                        {loading ? (
                            <>
                                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                                <span>Signing in...</span>
                            </>
                        ) : (
                            'Sign In'
                        )}
                    </button>
                </form>


            </div>

            <div className="absolute bottom-4 text-center w-full text-gray-400 text-xs">
                &copy; 2024 ProjectHub Inc. All rights reserved.
            </div>
        </div>
    );
};

export default Login;
