import { useState, useEffect } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import { FaSearch, FaPlus } from 'react-icons/fa';
import { useAuth } from '../context/AuthContext';

const Tasks = () => {
    const [tasks, setTasks] = useState([]);
    const [filteredTasks, setFilteredTasks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('All');
    const [priorityFilter, setPriorityFilter] = useState('All');
    const [myTasksOnly, setMyTasksOnly] = useState(false);
    const { user } = useAuth();

    useEffect(() => {
        const fetchTasks = async () => {
            try {
                const { data } = await axios.get('/api/tasks', {
                    withCredentials: true
                });
                setTasks(data);
                setFilteredTasks(data);
            } catch (error) {
                console.error("Error fetching tasks", error);
            } finally {
                setLoading(false);
            }
        };

        fetchTasks();
    }, []);

    useEffect(() => {
        let filtered = tasks;

        // Search filter
        if (searchTerm) {
            filtered = filtered.filter(task =>
                task.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                task.description?.toLowerCase().includes(searchTerm.toLowerCase())
            );
        }

        // Status filter
        if (statusFilter !== 'All') {
            filtered = filtered.filter(task => task.status === statusFilter);
        }

        // Priority filter
        if (priorityFilter !== 'All') {
            filtered = filtered.filter(task => task.priority === priorityFilter);
        }

        // My Tasks filter
        if (myTasksOnly && user) {
            filtered = filtered.filter(task =>
                task.assignedTo === user._id ||
                (task.assignedTo && task.assignedTo._id === user._id)
            );
        }

        setFilteredTasks(filtered);
    }, [searchTerm, statusFilter, priorityFilter, myTasksOnly, tasks, user]);

    if (loading) return <div className="p-8 max-w-7xl mx-auto">Loading tasks...</div>;

    return (
        <div className="p-8 max-w-7xl mx-auto">
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Tasks</h1>
                    <p className="text-sm text-gray-500 mt-1">Track and manage project tasks</p>
                </div>
                <Link to="/projects" className="bg-primary text-white px-4 py-2 rounded shadow-sm hover:bg-blue-600 flex items-center text-sm font-medium transition-colors">
                    <FaPlus className="mr-2" /> New Task
                </Link>
            </div>

            <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200 mb-6">
                <div className="flex flex-col md:flex-row gap-4">
                    <div className="flex-1 relative">
                        <FaSearch className="absolute left-3 top-3 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Search tasks..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                        />
                    </div>
                    <div className="flex gap-4">
                        <select
                            value={statusFilter}
                            onChange={(e) => setStatusFilter(e.target.value)}
                            className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm bg-white"
                        >
                            <option value="All">All Status</option>
                            <option value="To Do">To Do</option>
                            <option value="In Progress">In Progress</option>
                            <option value="Review">Review</option>
                            <option value="Done">Done</option>
                        </select>
                        <select
                            value={priorityFilter}
                            onChange={(e) => setPriorityFilter(e.target.value)}
                            className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm bg-white"
                        >
                            <option value="All">All Priority</option>
                            <option value="Low">Low</option>
                            <option value="Medium">Medium</option>
                            <option value="High">High</option>
                        </select>
                    </div>
                </div>
                <div className="mt-4 flex items-center">
                    <input
                        type="checkbox"
                        id="myTasks"
                        checked={myTasksOnly}
                        onChange={(e) => setMyTasksOnly(e.target.checked)}
                        className="mr-2 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <label htmlFor="myTasks" className="text-sm text-gray-700 font-medium cursor-pointer select-none">
                        Show My Tasks Only
                    </label>
                </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-gray-50 border-b border-gray-200 text-xs uppercase text-gray-500 font-semibold tracking-wider">
                                <th className="p-4">Task</th>
                                <th className="p-4">Project</th>
                                <th className="p-4">Assigned To</th>
                                <th className="p-4">Status</th>
                                <th className="p-4">Priority</th>
                                <th className="p-4">Due Date</th>
                                <th className="p-4 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {filteredTasks.map(task => (
                                <tr key={task._id} className="hover:bg-gray-50 transition-colors">
                                    <td className="p-4">
                                        <div className="font-medium text-gray-900">{task.title}</div>
                                        <div className="text-xs text-gray-500 mt-0.5 line-clamp-1">{task.description}</div>
                                    </td>
                                    <td className="p-4 text-sm text-gray-600">
                                        {task.project?.name || 'N/A'}
                                    </td>
                                    <td className="p-4 text-sm text-gray-600">
                                        <div className="flex items-center">
                                            <div className="w-6 h-6 rounded bg-blue-100 text-blue-600 flex items-center justify-center text-xs font-bold mr-2">
                                                {task.assignedTo?.name?.charAt(0) || '?'}
                                            </div>
                                            {task.assignedTo?.name || 'Unassigned'}
                                        </div>
                                    </td>
                                    <td className="p-4">
                                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${task.status === 'Done' ? 'bg-green-100 text-green-800' :
                                            task.status === 'In Progress' ? 'bg-blue-100 text-blue-800' :
                                                task.status === 'Review' ? 'bg-purple-100 text-purple-800' :
                                                    'bg-gray-100 text-gray-800'
                                            }`}>
                                            {task.status}
                                        </span>
                                    </td>
                                    <td className="p-4">
                                        <span className={`text-sm font-medium ${task.priority === 'High' ? 'text-red-600' :
                                            task.priority === 'Medium' ? 'text-yellow-600' :
                                                'text-green-600'
                                            }`}>
                                            {task.priority}
                                        </span>
                                    </td>
                                    <td className="p-4 text-sm text-gray-600">
                                        {new Date(task.dueDate).toLocaleDateString()}
                                    </td>
                                    <td className="p-4 text-right">
                                        <Link to={`/projects/${task.project?._id}`} className="text-sm font-medium text-primary hover:text-blue-700">
                                            View
                                        </Link>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
                {filteredTasks.length === 0 && (
                    <div className="p-8 text-center text-gray-500 text-sm">
                        No tasks found matching your filters.
                    </div>
                )}
            </div>
        </div>
    );
};

export default Tasks;
