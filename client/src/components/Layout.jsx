import { Outlet, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { FaProjectDiagram, FaTasks, FaUsers, FaChartBar, FaSignOutAlt, FaQuestionCircle } from 'react-icons/fa';

const Layout = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    return (
        <div className="flex h-screen bg-gray-100">
            {/* Sidebar */}
            <div className="w-64 bg-dark text-white flex flex-col shadow-xl z-10">
                <div className="h-16 flex items-center px-6 bg-[#071633] border-b border-[#1a2b4d]">
                    <div className="text-xl font-bold tracking-tight flex items-center">
                        <span className="text-blue-400 mr-2">●</span> ProjectTracker
                    </div>
                </div>

                <nav className="flex-1 py-6 px-3 space-y-1">
                    <Link to="/" className="flex items-center px-3 py-2.5 text-sm font-medium rounded-md hover:bg-[#1a2b4d] text-gray-300 hover:text-white transition-colors group">
                        <FaChartBar className="mr-3 text-gray-400 group-hover:text-blue-400" /> Dashboard
                    </Link>
                    <Link to="/projects" className="flex items-center px-3 py-2.5 text-sm font-medium rounded-md hover:bg-[#1a2b4d] text-gray-300 hover:text-white transition-colors group">
                        <FaProjectDiagram className="mr-3 text-gray-400 group-hover:text-blue-400" /> Projects
                    </Link>
                    <Link to="/tasks" className="flex items-center px-3 py-2.5 text-sm font-medium rounded-md hover:bg-[#1a2b4d] text-gray-300 hover:text-white transition-colors group">
                        <FaTasks className="mr-3 text-gray-400 group-hover:text-blue-400" /> Tasks
                    </Link>
                    <Link to="/reports" className="flex items-center px-3 py-2.5 text-sm font-medium rounded-md hover:bg-[#1a2b4d] text-gray-300 hover:text-white transition-colors group">
                        <FaChartBar className="mr-3 text-gray-400 group-hover:text-blue-400" /> Reports
                    </Link>

                    <div className="pt-4 pb-2">
                        <div className="px-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                            Management
                        </div>
                    </div>

                    {user?.role === 'Admin' && (
                        <Link to="/users" className="flex items-center px-3 py-2.5 text-sm font-medium rounded-md hover:bg-[#1a2b4d] text-gray-300 hover:text-white transition-colors group">
                            <FaUsers className="mr-3 text-gray-400 group-hover:text-blue-400" /> Users
                        </Link>
                    )}
                    <Link to="/help" className="flex items-center px-3 py-2.5 text-sm font-medium rounded-md hover:bg-[#1a2b4d] text-gray-300 hover:text-white transition-colors group">
                        <FaQuestionCircle className="mr-3 text-gray-400 group-hover:text-blue-400" /> Help
                    </Link>
                </nav>

                <div className="p-4 bg-[#071633] border-t border-[#1a2b4d]">
                    <div className="flex items-center mb-4">
                        <div className="w-8 h-8 rounded bg-blue-600 flex items-center justify-center mr-3 text-sm font-bold shadow-sm">
                            {user?.name?.charAt(0) || 'U'}
                        </div>
                        <div className="overflow-hidden">
                            <div className="font-medium text-sm truncate">{user?.name}</div>
                            <div className="text-xs text-gray-400 truncate">{user?.role}</div>
                        </div>
                    </div>
                    <button
                        onClick={handleLogout}
                        className="flex items-center w-full px-3 py-2 text-sm text-red-400 hover:bg-[#1a2b4d] rounded-md transition-colors"
                    >
                        <FaSignOutAlt className="mr-3" /> Sign Out
                    </button>
                </div>
            </div>

            {/* Main Content */}
            <div className="flex-1 overflow-auto">
                <Outlet />
            </div>
        </div>
    );
};

export default Layout;
