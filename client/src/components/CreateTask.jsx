import { useState, useEffect } from 'react';
import axios from 'axios';

const CreateTask = ({ projectId, onClose, onTaskCreated }) => {
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        priority: 'Medium',
        status: 'To Do',
        dueDate: '',
        dependencies: []
    });
    const [existingTasks, setExistingTasks] = useState([]);

    useEffect(() => {
        const fetchTasks = async () => {
            try {
                const { data } = await axios.get(`/api/tasks?projectId=${projectId}`, {
                    withCredentials: true
                });
                setExistingTasks(data);
            } catch (error) {
                console.error("Error fetching tasks", error);
            }
        };
        fetchTasks();
    }, [projectId]);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleDependencyChange = (e) => {
        const selectedOptions = Array.from(e.target.selectedOptions, option => option.value);
        setFormData({ ...formData, dependencies: selectedOptions });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await axios.post('http://localhost:5000/api/tasks', {
                ...formData,
                project: projectId
            }, {
                withCredentials: true
            });
            onTaskCreated();
            onClose();
        } catch (error) {
            console.error("Error creating task", error);
            alert('Failed to create task');
        }
    };

    return (
        <form onSubmit={handleSubmit}>
            <div className="mb-4">
                <label className="block text-gray-700 mb-2 text-sm">Task Title</label>
                <input
                    type="text"
                    name="title"
                    value={formData.title}
                    onChange={handleChange}
                    className="w-full p-2 border rounded"
                    required
                />
            </div>
            <div className="mb-4">
                <label className="block text-gray-700 mb-2 text-sm">Description</label>
                <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleChange}
                    className="w-full p-2 border rounded"
                    rows="3"
                ></textarea>
            </div>
            <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                    <label className="block text-gray-700 mb-2 text-sm">Priority</label>
                    <select
                        name="priority"
                        value={formData.priority}
                        onChange={handleChange}
                        className="w-full p-2 border rounded"
                    >
                        <option>Low</option>
                        <option>Medium</option>
                        <option>High</option>
                    </select>
                </div>
                <div>
                    <label className="block text-gray-700 mb-2 text-sm">Due Date</label>
                    <input
                        type="date"
                        name="dueDate"
                        value={formData.dueDate}
                        onChange={handleChange}
                        className="w-full p-2 border rounded"
                    />
                </div>
            </div>
            <div className="mb-4">
                <label className="block text-gray-700 mb-2 text-sm">Dependencies (Hold Ctrl/Cmd to select multiple)</label>
                <select
                    multiple
                    name="dependencies"
                    value={formData.dependencies}
                    onChange={handleDependencyChange}
                    className="w-full p-2 border rounded h-24"
                >
                    {existingTasks.map(task => (
                        <option key={task._id} value={task._id}>
                            {task.title}
                        </option>
                    ))}
                </select>
            </div>
            <div className="flex justify-end pt-2">
                <button
                    type="button"
                    onClick={onClose}
                    className="mr-3 px-4 py-2 text-gray-600 hover:text-gray-800 text-sm"
                >
                    Cancel
                </button>
                <button
                    type="submit"
                    className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 text-sm"
                >
                    Add Task
                </button>
            </div>
        </form>
    );
};

export default CreateTask;
