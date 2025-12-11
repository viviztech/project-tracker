import { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import { FaPlus, FaEdit, FaTrash } from 'react-icons/fa';

const MilestonesTab = ({ projectId }) => {
    const [milestones, setMilestones] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [editingMilestone, setEditingMilestone] = useState(null);
    const [formData, setFormData] = useState({
        name: '',
        description: '',
        dueDate: '',
        status: 'Not Started',
        completionPercentage: 0
    });

    useEffect(() => {
        fetchMilestones();
    }, [projectId]);

    const fetchMilestones = async () => {
        try {
            const { data } = await axios.get(`/api/milestones?projectId=${projectId}`, {
                withCredentials: true
            });
            setMilestones(data);
        } catch (error) {
            console.error("Error fetching milestones", error);
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (editingMilestone) {
                await axios.put(`/api/milestones/${editingMilestone._id}`, formData, {
                    withCredentials: true
                });
                toast.success('Milestone updated successfully');
            } else {
                await axios.post('/api/milestones', { ...formData, project: projectId }, {
                    withCredentials: true
                });
                toast.success('Milestone created successfully');
            }
            setShowForm(false);
            setEditingMilestone(null);
            setFormData({ name: '', description: '', dueDate: '', status: 'Not Started', completionPercentage: 0 });
            fetchMilestones();
        } catch (error) {
            toast.error('Failed to save milestone');
        }
    };

    const handleEdit = (milestone) => {
        setEditingMilestone(milestone);
        setFormData({
            name: milestone.name,
            description: milestone.description || '',
            dueDate: milestone.dueDate ? milestone.dueDate.split('T')[0] : '',
            status: milestone.status,
            completionPercentage: milestone.completionPercentage
        });
        setShowForm(true);
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Are you sure you want to delete this milestone?')) return;
        try {
            await axios.delete(`/api/milestones/${id}`, { withCredentials: true });
            toast.success('Milestone deleted');
            fetchMilestones();
        } catch (error) {
            toast.error('Failed to delete milestone');
        }
    };

    if (loading) return <div className="p-4">Loading milestones...</div>;

    return (
        <div className="p-6">
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold">Milestones</h2>
                <button
                    onClick={() => setShowForm(!showForm)}
                    className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 flex items-center"
                >
                    <FaPlus className="mr-2" /> Add Milestone
                </button>
            </div>

            {showForm && (
                <form onSubmit={handleSubmit} className="bg-white p-6 rounded shadow mb-6">
                    <h3 className="text-lg font-bold mb-4">{editingMilestone ? 'Edit' : 'New'} Milestone</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium mb-2">Name *</label>
                            <input
                                type="text"
                                value={formData.name}
                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                className="w-full border rounded px-3 py-2"
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-2">Due Date</label>
                            <input
                                type="date"
                                value={formData.dueDate}
                                onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
                                className="w-full border rounded px-3 py-2"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-2">Status</label>
                            <select
                                value={formData.status}
                                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                                className="w-full border rounded px-3 py-2"
                            >
                                <option>Not Started</option>
                                <option>In Progress</option>
                                <option>Completed</option>
                                <option>Delayed</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-2">Completion %</label>
                            <input
                                type="number"
                                min="0"
                                max="100"
                                value={formData.completionPercentage}
                                onChange={(e) => setFormData({ ...formData, completionPercentage: parseInt(e.target.value) })}
                                className="w-full border rounded px-3 py-2"
                            />
                        </div>
                        <div className="md:col-span-2">
                            <label className="block text-sm font-medium mb-2">Description</label>
                            <textarea
                                value={formData.description}
                                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                className="w-full border rounded px-3 py-2"
                                rows="3"
                            />
                        </div>
                    </div>
                    <div className="flex gap-2 mt-4">
                        <button type="submit" className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600">
                            Save
                        </button>
                        <button
                            type="button"
                            onClick={() => {
                                setShowForm(false);
                                setEditingMilestone(null);
                                setFormData({ name: '', description: '', dueDate: '', status: 'Not Started', completionPercentage: 0 });
                            }}
                            className="bg-gray-300 px-4 py-2 rounded hover:bg-gray-400"
                        >
                            Cancel
                        </button>
                    </div>
                </form>
            )}

            <div className="space-y-4">
                {milestones.map((milestone) => (
                    <div key={milestone._id} className="bg-white p-4 rounded shadow">
                        <div className="flex justify-between items-start">
                            <div className="flex-1">
                                <h3 className="text-lg font-bold">{milestone.name}</h3>
                                {milestone.description && (
                                    <p className="text-gray-600 mt-1">{milestone.description}</p>
                                )}
                                <div className="flex gap-4 mt-2 text-sm">
                                    <span className={`px-2 py-1 rounded ${milestone.status === 'Completed' ? 'bg-green-100 text-green-800' :
                                            milestone.status === 'In Progress' ? 'bg-blue-100 text-blue-800' :
                                                milestone.status === 'Delayed' ? 'bg-red-100 text-red-800' :
                                                    'bg-gray-100 text-gray-800'
                                        }`}>
                                        {milestone.status}
                                    </span>
                                    {milestone.dueDate && (
                                        <span className="text-gray-500">
                                            Due: {new Date(milestone.dueDate).toLocaleDateString()}
                                        </span>
                                    )}
                                </div>
                                <div className="mt-2">
                                    <div className="flex items-center gap-2">
                                        <div className="flex-1 bg-gray-200 rounded-full h-2">
                                            <div
                                                className="bg-blue-500 h-2 rounded-full"
                                                style={{ width: `${milestone.completionPercentage}%` }}
                                            />
                                        </div>
                                        <span className="text-sm text-gray-600">{milestone.completionPercentage}%</span>
                                    </div>
                                </div>
                            </div>
                            <div className="flex gap-2 ml-4">
                                <button
                                    onClick={() => handleEdit(milestone)}
                                    className="text-blue-500 hover:text-blue-700"
                                >
                                    <FaEdit />
                                </button>
                                <button
                                    onClick={() => handleDelete(milestone._id)}
                                    className="text-red-500 hover:text-red-700"
                                >
                                    <FaTrash />
                                </button>
                            </div>
                        </div>
                    </div>
                ))}
                {milestones.length === 0 && (
                    <div className="text-center text-gray-500 py-8">
                        No milestones yet. Click "Add Milestone" to create one.
                    </div>
                )}
            </div>
        </div>
    );
};

export default MilestonesTab;
