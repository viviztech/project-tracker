import { useState, useEffect } from 'react';
import axios from 'axios';
import { FaChevronLeft, FaChevronRight } from 'react-icons/fa';

const ResourceCalendar = () => {
    const [users, setUsers] = useState([]);
    const [tasks, setTasks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [currentDate, setCurrentDate] = useState(new Date());

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            const [usersRes, tasksRes] = await Promise.all([
                axios.get('/api/auth/users', { withCredentials: true }),
                axios.get('/api/tasks', { withCredentials: true })
            ]);
            setUsers(usersRes.data);
            setTasks(tasksRes.data);
        } catch (error) {
            console.error("Error fetching data", error);
        } finally {
            setLoading(false);
        }
    };

    const getDaysOfWeek = (date) => {
        const start = new Date(date);
        start.setDate(start.getDate() - start.getDay() + 1); // Start on Monday
        const days = [];
        for (let i = 0; i < 7; i++) {
            const day = new Date(start);
            day.setDate(start.getDate() + i);
            days.push(day);
        }
        return days;
    };

    const weekDays = getDaysOfWeek(currentDate);

    const nextWeek = () => {
        const next = new Date(currentDate);
        next.setDate(currentDate.getDate() + 7);
        setCurrentDate(next);
    };

    const prevWeek = () => {
        const prev = new Date(currentDate);
        prev.setDate(currentDate.getDate() - 7);
        setCurrentDate(prev);
    };

    const getTasksForUserAndDate = (userId, date) => {
        const dateStr = date.toISOString().split('T')[0];
        return tasks.filter(task => {
            if (!task.assignedTo || task.assignedTo._id !== userId) return false;
            if (!task.dueDate) return false;

            // Simple logic: show task on its due date
            // Ideally, we'd check start/end ranges if available
            const taskDate = new Date(task.dueDate).toISOString().split('T')[0];
            return taskDate === dateStr;
        });
    };

    if (loading) return <div>Loading calendar...</div>;

    return (
        <div className="bg-white p-6 rounded shadow mt-6">
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold">Resource Calendar</h2>
                <div className="flex items-center space-x-4">
                    <button onClick={prevWeek} className="p-2 hover:bg-gray-100 rounded">
                        <FaChevronLeft />
                    </button>
                    <span className="font-medium">
                        {weekDays[0].toLocaleDateString()} - {weekDays[6].toLocaleDateString()}
                    </span>
                    <button onClick={nextWeek} className="p-2 hover:bg-gray-100 rounded">
                        <FaChevronRight />
                    </button>
                </div>
            </div>

            <div className="overflow-x-auto">
                <table className="min-w-full border-collapse border border-gray-200">
                    <thead>
                        <tr>
                            <th className="border border-gray-200 p-3 bg-gray-50 w-48 text-left">Team Member</th>
                            {weekDays.map((day, index) => (
                                <th key={index} className="border border-gray-200 p-3 bg-gray-50 min-w-[120px]">
                                    <div className="text-xs text-gray-500 uppercase">{day.toLocaleDateString('en-US', { weekday: 'short' })}</div>
                                    <div className="text-sm font-bold">{day.getDate()}</div>
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {users.map(user => (
                            <tr key={user._id}>
                                <td className="border border-gray-200 p-3">
                                    <div className="font-medium text-gray-900">{user.name}</div>
                                    <div className="text-xs text-gray-500">{user.role}</div>
                                </td>
                                {weekDays.map((day, index) => {
                                    const dayTasks = getTasksForUserAndDate(user._id, day);
                                    return (
                                        <td key={index} className="border border-gray-200 p-2 align-top h-24">
                                            {dayTasks.map(task => (
                                                <div
                                                    key={task._id}
                                                    className={`text-xs p-1 mb-1 rounded border ${task.priority === 'High' ? 'bg-red-50 border-red-200 text-red-700' :
                                                            task.priority === 'Medium' ? 'bg-yellow-50 border-yellow-200 text-yellow-700' :
                                                                'bg-green-50 border-green-200 text-green-700'
                                                        }`}
                                                    title={task.title}
                                                >
                                                    <div className="font-semibold truncate">{task.title}</div>
                                                    <div className="text-[10px] opacity-75 truncate">{task.project?.name}</div>
                                                </div>
                                            ))}
                                        </td>
                                    );
                                })}
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default ResourceCalendar;
