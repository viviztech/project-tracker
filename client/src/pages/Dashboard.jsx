import { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import { Link } from 'react-router-dom';
import { FaPlus, FaBell, FaExclamationTriangle, FaCalendarTimes } from 'react-icons/fa';
import {
    Chart as ChartJS,
    ArcElement,
    Tooltip,
    Legend,
    CategoryScale,
    LinearScale,
    BarElement,
    Title,
} from 'chart.js';
import { Pie, Bar } from 'react-chartjs-2';

ChartJS.register(
    ArcElement,
    Tooltip,
    Legend,
    CategoryScale,
    LinearScale,
    BarElement,
    Title
);

const Dashboard = () => {
    const [stats, setStats] = useState(null);
    const [workload, setWorkload] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [statsRes, workloadRes] = await Promise.all([
                    axios.get('/api/reports/dashboard', { withCredentials: true }),
                    axios.get('/api/reports/workload', { withCredentials: true })
                ]);
                setStats(statsRes.data);
                setWorkload(workloadRes.data);
            } catch (error) {
                console.error("Error fetching dashboard data", error);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    if (loading) return <div className="p-6">Loading dashboard...</div>;
    if (!stats || !workload) return <div className="p-6">Error loading dashboard</div>;

    const projectStatusData = {
        labels: stats.charts.projectsByStatus.map(item => item._id),
        datasets: [
            {
                label: '# of Projects',
                data: stats.charts.projectsByStatus.map(item => item.count),
                backgroundColor: [
                    'rgba(255, 99, 132, 0.2)',
                    'rgba(54, 162, 235, 0.2)',
                    'rgba(255, 206, 86, 0.2)',
                    'rgba(75, 192, 192, 0.2)',
                    'rgba(153, 102, 255, 0.2)',
                ],
                borderColor: [
                    'rgba(255, 99, 132, 1)',
                    'rgba(54, 162, 235, 1)',
                    'rgba(255, 206, 86, 1)',
                    'rgba(75, 192, 192, 1)',
                    'rgba(153, 102, 255, 1)',
                ],
                borderWidth: 1,
            },
        ],
    };

    const taskPriorityData = {
        labels: stats.charts.tasksByPriority.map(item => item._id),
        datasets: [
            {
                label: '# of Tasks',
                data: stats.charts.tasksByPriority.map(item => item.count),
                backgroundColor: 'rgba(53, 162, 235, 0.5)',
            },
        ],
    };

    const workloadData = {
        labels: workload.map(item => item.name),
        datasets: [
            {
                label: 'Tasks Assigned',
                data: workload.map(item => item.count),
                backgroundColor: 'rgba(153, 102, 255, 0.5)',
            },
        ],
    };

    const handleExport = async () => {
        try {
            const response = await axios.get('/api/reports/export/projects', {
                withCredentials: true,
                responseType: 'blob',
            });
            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', 'projects.csv');
            document.body.appendChild(link);
            link.click();
            link.remove();
        } catch (error) {
            console.error("Error exporting projects", error);
            toast.error("Failed to export projects");
        }
    };

    return (
        <div className="p-8 max-w-7xl mx-auto">
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
                    <p className="text-sm text-gray-500 mt-1">Overview of your projects and tasks</p>
                </div>
                <div className="flex gap-3">
                    <Link to="/projects/create" className="bg-primary text-white px-4 py-2 rounded shadow-sm hover:bg-blue-600 flex items-center text-sm font-medium transition-colors">
                        <FaPlus className="mr-2" /> New Project
                    </Link>
                    <button
                        onClick={handleExport}
                        className="bg-white text-gray-700 border border-gray-300 px-4 py-2 rounded shadow-sm hover:bg-gray-50 text-sm font-medium transition-colors"
                    >
                        Export CSV
                    </button>
                </div>
            </div>

            {/* Quick Stats Row */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                <div className="bg-white p-5 rounded-lg shadow-sm border border-gray-200">
                    <h3 className="text-gray-500 text-xs font-semibold uppercase tracking-wider mb-2">Total Projects</h3>
                    <div className="flex items-end justify-between">
                        <p className="text-3xl font-bold text-gray-900">{stats.counts.totalProjects}</p>
                        <span className="text-xs font-medium bg-blue-100 text-blue-800 px-2 py-1 rounded-full">{stats.counts.activeProjects} Active</span>
                    </div>
                </div>
                <div className="bg-white p-5 rounded-lg shadow-sm border border-gray-200">
                    <h3 className="text-gray-500 text-xs font-semibold uppercase tracking-wider mb-2">Total Tasks</h3>
                    <div className="flex items-end justify-between">
                        <p className="text-3xl font-bold text-gray-900">{stats.counts.totalTasks}</p>
                        <span className="text-xs font-medium bg-green-100 text-green-800 px-2 py-1 rounded-full">{stats.counts.completedTasks} Done</span>
                    </div>
                </div>
                <div className="bg-white p-5 rounded-lg shadow-sm border border-gray-200">
                    <h3 className="text-gray-500 text-xs font-semibold uppercase tracking-wider mb-2">Pending Tasks</h3>
                    <p className="text-3xl font-bold text-gray-900">{stats.counts.pendingTasks}</p>
                </div>
                <div className="bg-white p-5 rounded-lg shadow-sm border border-gray-200">
                    <h3 className="text-gray-500 text-xs font-semibold uppercase tracking-wider mb-2">Overdue Items</h3>
                    <div className="flex items-end justify-between">
                        <p className="text-3xl font-bold text-red-600">{stats.counts.overdueTasks + stats.counts.overdueMilestones}</p>
                        <span className="text-xs text-red-600 font-medium">{stats.counts.overdueTasks} Tasks</span>
                    </div>
                </div>
            </div>

            {/* Notifications & Quick Actions */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
                {/* Notifications Panel */}
                <div className="lg:col-span-2 bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                    <div className="flex items-center mb-5 border-b border-gray-100 pb-3">
                        <FaBell className="text-gray-400 mr-2" />
                        <h2 className="text-lg font-bold text-gray-900">Notifications</h2>
                    </div>
                    <div className="space-y-3">
                        {stats.notifications?.overdueTasks.length > 0 || stats.notifications?.overdueMilestones.length > 0 ? (
                            <>
                                {stats.notifications.overdueTasks.map(task => (
                                    <div key={task._id} className="flex items-start p-3 bg-red-50 rounded-md border border-red-100">
                                        <FaExclamationTriangle className="text-red-500 mt-1 mr-3 flex-shrink-0" />
                                        <div>
                                            <p className="font-medium text-red-900 text-sm">Overdue Task: {task.title}</p>
                                            <p className="text-xs text-red-700 mt-1">
                                                {task.project?.name} • Due: {new Date(task.dueDate).toLocaleDateString()}
                                            </p>
                                        </div>
                                    </div>
                                ))}
                                {stats.notifications.overdueMilestones.map(milestone => (
                                    <div key={milestone._id} className="flex items-start p-3 bg-orange-50 rounded-md border border-orange-100">
                                        <FaCalendarTimes className="text-orange-500 mt-1 mr-3 flex-shrink-0" />
                                        <div>
                                            <p className="font-medium text-orange-900 text-sm">Overdue Milestone: {milestone.title}</p>
                                            <p className="text-xs text-orange-700 mt-1">
                                                {milestone.project?.name} • Due: {new Date(milestone.dueDate).toLocaleDateString()}
                                            </p>
                                        </div>
                                    </div>
                                ))}
                            </>
                        ) : (
                            <div className="text-center py-8 text-gray-500">
                                <p className="text-sm">No new notifications.</p>
                            </div>
                        )}
                    </div>
                </div>

                {/* Quick Actions */}
                <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                    <h2 className="text-lg font-bold text-gray-900 mb-5 border-b border-gray-100 pb-3">Quick Actions</h2>
                    <div className="space-y-3">
                        <Link to="/projects/create" className="block w-full text-left px-4 py-3 bg-gray-50 text-gray-700 rounded-md hover:bg-blue-50 hover:text-blue-700 font-medium text-sm transition-colors border border-gray-200 hover:border-blue-200">
                            + Create New Project
                        </Link>
                        <Link to="/tasks" className="block w-full text-left px-4 py-3 bg-gray-50 text-gray-700 rounded-md hover:bg-green-50 hover:text-green-700 font-medium text-sm transition-colors border border-gray-200 hover:border-green-200">
                            View My Tasks
                        </Link>
                        <Link to="/users" className="block w-full text-left px-4 py-3 bg-gray-50 text-gray-700 rounded-md hover:bg-purple-50 hover:text-purple-700 font-medium text-sm transition-colors border border-gray-200 hover:border-purple-200">
                            Manage Team
                        </Link>
                        <Link to="/help" className="block w-full text-left px-4 py-3 bg-gray-50 text-gray-700 rounded-md hover:bg-gray-100 font-medium text-sm transition-colors border border-gray-200">
                            Help & Support
                        </Link>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
                <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                    <h2 className="text-lg font-bold text-gray-900 mb-4">Projects by Status</h2>
                    <div className="h-64 flex justify-center">
                        <Pie data={projectStatusData} />
                    </div>
                </div>
                <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                    <h2 className="text-lg font-bold text-gray-900 mb-4">Tasks by Priority</h2>
                    <div className="h-64">
                        <Bar options={{ responsive: true, maintainAspectRatio: false }} data={taskPriorityData} />
                    </div>
                </div>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                <h2 className="text-lg font-bold text-gray-900 mb-4">Resource Workload</h2>
                <div className="h-64">
                    <Bar options={{ responsive: true, maintainAspectRatio: false }} data={workloadData} />
                </div>
            </div>
        </div>
    );
};

export default Dashboard;
