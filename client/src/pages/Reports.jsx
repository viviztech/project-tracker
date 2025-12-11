import { useState, useEffect } from 'react';
import axios from 'axios';
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

const Reports = () => {
    const [reportData, setReportData] = useState(null);
    const [loading, setLoading] = useState(false);
    const [projects, setProjects] = useState([]);
    const [filters, setFilters] = useState({
        startDate: new Date(new Date().setMonth(new Date().getMonth() - 1)).toISOString().split('T')[0],
        endDate: new Date().toISOString().split('T')[0],
        projectId: '',
        department: ''
    });

    const departments = ['Engineering', 'Marketing', 'Sales', 'HR', 'Finance', 'Design'];

    useEffect(() => {
        const fetchProjects = async () => {
            try {
                const { data } = await axios.get('/api/projects', { withCredentials: true });
                setProjects(data);
            } catch (error) {
                console.error("Error fetching projects", error);
            }
        };
        fetchProjects();
    }, []);

    const fetchReports = async () => {
        setLoading(true);
        try {
            const queryParams = new URLSearchParams(filters).toString();
            const { data } = await axios.get(`/api/reports/detailed?${queryParams}`, {
                withCredentials: true
            });
            setReportData(data);
        } catch (error) {
            console.error("Error fetching reports", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchReports();
    }, []);

    const handleFilterChange = (e) => {
        setFilters({ ...filters, [e.target.name]: e.target.value });
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
        }
    };

    if (!reportData && loading) return <div className="p-6">Loading reports...</div>;

    const projectStatusData = reportData ? {
        labels: reportData.projectStatusDist.map(item => item._id),
        datasets: [
            {
                label: '# of Projects',
                data: reportData.projectStatusDist.map(item => item.count),
                backgroundColor: [
                    'rgba(255, 99, 132, 0.2)',
                    'rgba(54, 162, 235, 0.2)',
                    'rgba(255, 206, 86, 0.2)',
                    'rgba(75, 192, 192, 0.2)',
                ],
                borderColor: [
                    'rgba(255, 99, 132, 1)',
                    'rgba(54, 162, 235, 1)',
                    'rgba(255, 206, 86, 1)',
                    'rgba(75, 192, 192, 1)',
                ],
                borderWidth: 1,
            },
        ],
    } : null;

    const taskPriorityData = reportData ? {
        labels: reportData.taskPriorityDist.map(item => item._id),
        datasets: [
            {
                label: '# of Tasks',
                data: reportData.taskPriorityDist.map(item => item.count),
                backgroundColor: 'rgba(153, 102, 255, 0.5)',
            },
        ],
    } : null;

    return (
        <div className="p-6">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-3xl font-bold">Reports & Analytics</h1>
                <button
                    onClick={handleExport}
                    className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
                >
                    Export Projects (CSV)
                </button>
            </div>

            {/* Filters */}
            <div className="bg-white p-4 rounded shadow mb-6 flex flex-wrap gap-4 items-end">
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Start Date</label>
                    <input
                        type="date"
                        name="startDate"
                        value={filters.startDate}
                        onChange={handleFilterChange}
                        className="border rounded px-3 py-2"
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">End Date</label>
                    <input
                        type="date"
                        name="endDate"
                        value={filters.endDate}
                        onChange={handleFilterChange}
                        className="border rounded px-3 py-2"
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Project</label>
                    <select
                        name="projectId"
                        value={filters.projectId}
                        onChange={handleFilterChange}
                        className="border rounded px-3 py-2 w-48"
                    >
                        <option value="">All Projects</option>
                        {projects.map(p => (
                            <option key={p._id} value={p._id}>{p.name}</option>
                        ))}
                    </select>
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Department</label>
                    <select
                        name="department"
                        value={filters.department}
                        onChange={handleFilterChange}
                        className="border rounded px-3 py-2 w-40"
                    >
                        <option value="">All Departments</option>
                        {departments.map(d => (
                            <option key={d} value={d}>{d}</option>
                        ))}
                    </select>
                </div>
                <button
                    onClick={fetchReports}
                    className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 h-10"
                >
                    Apply Filter
                </button>
            </div>

            {loading && <div className="text-center py-4">Updating data...</div>}

            {reportData && (
                <>
                    {/* KPIs */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                        <div className="bg-white p-6 rounded shadow border-t-4 border-blue-500">
                            <h3 className="text-gray-500 text-sm font-bold uppercase">Projects Created</h3>
                            <p className="text-3xl font-bold">{reportData.projectsCreated}</p>
                            <p className="text-xs text-gray-400 mt-1">In selected period</p>
                        </div>
                        <div className="bg-white p-6 rounded shadow border-t-4 border-green-500">
                            <h3 className="text-gray-500 text-sm font-bold uppercase">Projects Completed</h3>
                            <p className="text-3xl font-bold">{reportData.projectsCompleted}</p>
                            <p className="text-xs text-gray-400 mt-1">In selected period</p>
                        </div>
                        <div className="bg-white p-6 rounded shadow border-t-4 border-purple-500">
                            <h3 className="text-gray-500 text-sm font-bold uppercase">Tasks Created</h3>
                            <p className="text-3xl font-bold">{reportData.tasksCreated}</p>
                            <p className="text-xs text-gray-400 mt-1">In selected period</p>
                        </div>
                        <div className="bg-white p-6 rounded shadow border-t-4 border-indigo-500">
                            <h3 className="text-gray-500 text-sm font-bold uppercase">Tasks Completed</h3>
                            <p className="text-3xl font-bold">{reportData.tasksCompleted}</p>
                            <p className="text-xs text-gray-400 mt-1">In selected period</p>
                        </div>
                    </div>

                    {/* Charts */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                        <div className="bg-white p-6 rounded shadow">
                            <h2 className="text-xl font-bold mb-4">Project Status Distribution</h2>
                            <div className="h-64 flex justify-center">
                                {projectStatusData && <Pie data={projectStatusData} />}
                            </div>
                        </div>
                        <div className="bg-white p-6 rounded shadow">
                            <h2 className="text-xl font-bold mb-4">Task Priority Distribution</h2>
                            <div className="h-64">
                                {taskPriorityData && <Bar options={{ responsive: true, maintainAspectRatio: false }} data={taskPriorityData} />}
                            </div>
                        </div>
                    </div>
                </>
            )}
        </div>
    );
};

export default Reports;
