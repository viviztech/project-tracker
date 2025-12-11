import { useState, useEffect } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import { FaPlus, FaSearch, FaTrash, FaArchive, FaUndo } from 'react-icons/fa';
import { toast } from 'react-toastify';
import { useAuth } from '../context/AuthContext';

const Projects = () => {
    const [projects, setProjects] = useState([]);
    const [filteredProjects, setFilteredProjects] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('All');
    const [priorityFilter, setPriorityFilter] = useState('All');
    const [showArchived, setShowArchived] = useState(false);
    const { user } = useAuth();

    const fetchProjects = async () => {
        setLoading(true);
        try {
            const { data } = await axios.get('/api/projects', { withCredentials: true });
            setProjects(data);
        } catch (error) {
            console.error('Error fetching projects', error);
        } finally {
            setLoading(false);
        }
    };

    const fetchArchivedProjects = async () => {
        setLoading(true);
        try {
            const { data } = await axios.get('/api/projects/archived', { withCredentials: true });
            setProjects(data);
        } catch (error) {
            console.error('Error fetching archived projects', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (showArchived) {
            fetchArchivedProjects();
        } else {
            fetchProjects();
        }
    }, [showArchived]);

    useEffect(() => {
        let filtered = projects;

        // Search filter
        if (searchTerm) {
            filtered = filtered.filter(project =>
                project.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                project.description?.toLowerCase().includes(searchTerm.toLowerCase())
            );
        }

        // Status filter
        if (statusFilter !== 'All') {
            filtered = filtered.filter(project => project.status === statusFilter);
        }

        // Priority filter
        if (priorityFilter !== 'All') {
            filtered = filtered.filter(project => project.priority === priorityFilter);
        }

        setFilteredProjects(filtered);
    }, [searchTerm, statusFilter, priorityFilter, projects]);

    const handleDelete = async (projectId, projectName) => {
        if (window.confirm(`Are you sure you want to permanently delete "${projectName}"? Consider archiving instead.`)) {
            try {
                await axios.delete(`/api/projects/${projectId}`, { withCredentials: true });
                toast.success('Project deleted successfully');
                if (showArchived) {
                    fetchArchivedProjects();
                } else {
                    fetchProjects();
                }
            } catch (error) {
                console.error('Error deleting project', error);
                toast.error('Failed to delete project');
            }
        }
    };

    const handleArchive = async (projectId, projectName) => {
        if (window.confirm(`Archive "${projectName}"? You can restore it later.`)) {
            try {
                await axios.put(`/api/projects/${projectId}/archive`, {}, { withCredentials: true });
                toast.success('Project archived successfully');
                fetchProjects(); // Refresh non-archived projects
            } catch (error) {
                console.error('Error archiving project', error);
                toast.error('Failed to archive project');
            }
        }
    };

    const handleUnarchive = async (projectId, projectName) => {
        try {
            await axios.put(`/api/projects/${projectId}/unarchive`, {}, { withCredentials: true });
            toast.success('Project restored successfully');
            fetchArchivedProjects(); // Refresh archived projects view
        } catch (error) {
            console.error('Error restoring project', error);
            toast.error('Failed to restore project');
        }
    };

    if (loading) return <div className="p-6">Loading...</div>;

    return (
        <div className="p-8 max-w-7xl mx-auto">
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Projects</h1>
                    <p className="text-sm text-gray-500 mt-1">Manage and track your ongoing projects</p>
                </div>
                <div className="flex gap-3">
                    {user?.role === 'Admin' && (
                        <button
                            onClick={() => setShowArchived(!showArchived)}
                            className={`px-4 py-2 rounded shadow-sm text-sm font-medium transition-colors ${showArchived
                                ? 'bg-gray-600 text-white hover:bg-gray-700'
                                : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
                                }`}
                        >
                            {showArchived ? 'Show Active' : 'Show Archived'}
                        </button>
                    )}
                    <Link to="/projects/create" className="bg-primary text-white px-4 py-2 rounded shadow-sm hover:bg-blue-600 flex items-center text-sm font-medium transition-colors">
                        <FaPlus className="mr-2" /> New Project
                    </Link>
                </div>
            </div>

            {/* Search and Filters */}
            <div className="bg-white p-4 rounded shadow mb-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="relative">
                        <FaSearch className="absolute left-3 top-3 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Search projects..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-10 pr-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                    </div>
                    <div>
                        <select
                            value={statusFilter}
                            onChange={(e) => setStatusFilter(e.target.value)}
                            className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                            <option value="All">All Status</option>
                            <option value="Not Started">Not Started</option>
                            <option value="In Progress">In Progress</option>
                            <option value="On Hold">On Hold</option>
                            <option value="Completed">Completed</option>
                            <option value="Cancelled">Cancelled</option>
                        </select>
                    </div>
                    <div>
                        <select
                            value={priorityFilter}
                            onChange={(e) => setPriorityFilter(e.target.value)}
                            className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                            <option value="All">All Priority</option>
                            <option value="Low">Low</option>
                            <option value="Medium">Medium</option>
                            <option value="High">High</option>
                        </select>
                    </div>
                </div>
            </div>

            {
                loading ? (
                    <div className="text-center py-12">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
                        <p className="mt-4 text-gray-500">Loading projects...</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {filteredProjects.map(project => (
                            <div key={project._id} className="bg-white rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow flex flex-col h-full">
                                <div className="p-5 flex-1">
                                    <div className="flex justify-between items-start mb-2">
                                        <h2 className="text-lg font-bold text-gray-900 truncate pr-2">
                                            <Link to={`/projects/${project._id}`} className="hover:text-primary transition-colors">
                                                {project.name}
                                            </Link>
                                        </h2>
                                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${project.status === 'Completed' ? 'bg-green-100 text-green-800' :
                                            project.status === 'In Progress' ? 'bg-blue-100 text-blue-800' :
                                                'bg-gray-100 text-gray-800'
                                            }`}>
                                            {project.status}
                                        </span>
                                    </div>
                                    <p className="text-gray-500 text-sm mb-4 line-clamp-2 h-10">{project.description}</p>

                                    <div className="space-y-2 text-sm text-gray-600">
                                        <div className="flex justify-between">
                                            <span>Priority:</span>
                                            <span className={`font-medium ${project.priority === 'High' ? 'text-red-600' :
                                                project.priority === 'Medium' ? 'text-yellow-600' :
                                                    'text-green-600'
                                                }`}>{project.priority}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span>Due:</span>
                                            <span>{new Date(project.endDate).toLocaleDateString()}</span>
                                        </div>
                                    </div>

                                    {/* Progress Bar */}
                                    <div className="mt-4">
                                        <div className="flex justify-between text-xs text-gray-500 mb-1">
                                            <span>Progress</span>
                                            <span>{Math.round(project.progress || 0)}%</span>
                                        </div>
                                        <div className="w-full bg-gray-100 rounded-full h-2 overflow-hidden">
                                            <div
                                                className={`h-2 rounded-full ${(project.progress || 0) === 100 ? 'bg-green-500' :
                                                    (project.progress || 0) > 50 ? 'bg-blue-500' : 'bg-yellow-500'
                                                    }`}
                                                style={{ width: `${project.progress || 0}%` }}
                                            ></div>
                                        </div>
                                    </div>
                                </div>

                                <div className="bg-gray-50 px-5 py-3 border-t border-gray-100 flex justify-between items-center rounded-b-lg">
                                    <Link to={`/projects/${project._id}`} className="text-sm font-medium text-primary hover:text-blue-700">
                                        View Details
                                    </Link>
                                    {user?.role === 'Admin' && (
                                        <div className="flex gap-2">
                                            {showArchived ? (
                                                <button
                                                    onClick={() => handleUnarchive(project._id, project.name)}
                                                    className="text-green-600 hover:text-green-700 transition-colors p-1 flex items-center gap-1 text-sm"
                                                    title="Restore Project"
                                                >
                                                    <FaUndo size={14} />
                                                </button>
                                            ) : (
                                                <>
                                                    <button
                                                        onClick={() => handleArchive(project._id, project.name)}
                                                        className="text-gray-400 hover:text-yellow-600 transition-colors p-1"
                                                        title="Archive Project"
                                                    >
                                                        <FaArchive size={14} />
                                                    </button>
                                                    <button
                                                        onClick={() => handleDelete(project._id, project.name)}
                                                        className="text-gray-400 hover:text-red-500 transition-colors p-1"
                                                        title="Delete Project"
                                                    >
                                                        <FaTrash size={14} />
                                                    </button>
                                                </>
                                            )}
                                        </div>
                                    )}
                                </div>
                            </div>
                        ))}

                        {filteredProjects.length === 0 && (
                            <div className="text-center text-gray-500 mt-10">
                                {searchTerm || statusFilter !== 'All' || priorityFilter !== 'All'
                                    ? 'No projects match your filters.'
                                    : 'No projects found. Create one to get started!'}
                            </div>
                        )}
                    </div>
                )
            }
        </div>
    );
};

export default Projects;
