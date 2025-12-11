import { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import { FaPlus, FaEdit, FaTrash } from 'react-icons/fa';

const RisksTab = ({ projectId }) => {
    const [risks, setRisks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [editingRisk, setEditingRisk] = useState(null);
    const [formData, setFormData] = useState({
        description: '',
        severity: 'Medium',
        impact: '',
        mitigation: '',
        status: 'Identified'
    });

    useEffect(() => {
        fetchRisks();
    }, [projectId]);

    const fetchRisks = async () => {
        try {
            const { data } = await axios.get(`/api/risks?projectId=${projectId}`, {
                withCredentials: true
            });
            setRisks(data);
        } catch (error) {
            console.error("Error fetching risks", error);
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (editingRisk) {
                await axios.put(`/api/risks/${editingRisk._id}`, formData, {
                    withCredentials: true
                });
                toast.success('Risk updated successfully');
            } else {
                await axios.post('/api/risks', { ...formData, project: projectId }, {
                    withCredentials: true
                });
                toast.success('Risk created successfully');
            }
            setShowForm(false);
            setEditingRisk(null);
            setFormData({ description: '', severity: 'Medium', impact: '', mitigation: '', status: 'Identified' });
            fetchRisks();
        } catch (error) {
            toast.error('Failed to save risk');
        }
    };

    const handleEdit = (risk) => {
        setEditingRisk(risk);
        setFormData({
            description: risk.description,
            severity: risk.severity,
            impact: risk.impact || '',
            mitigation: risk.mitigation || '',
            status: risk.status
        });
        setShowForm(true);
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Are you sure you want to delete this risk?')) return;
        try {
            await axios.delete(`/api/risks/${id}`, { withCredentials: true });
            toast.success('Risk deleted');
            fetchRisks();
        } catch (error) {
            toast.error('Failed to delete risk');
        }
    };

    if (loading) return <div className="p-4">Loading risks...</div>;

    return (
        <div className="p-6">
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold">Risks & Issues</h2>
                <button
                    onClick={() => setShowForm(!showForm)}
                    className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600 flex items-center"
                >
                    <FaPlus className="mr-2" /> Add Risk
                </button>
            </div>

            {showForm && (
                <form onSubmit={handleSubmit} className="bg-white p-6 rounded shadow mb-6">
                    <h3 className="text-lg font-bold mb-4">{editingRisk ? 'Edit Risk' : 'New Risk'}</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="md:col-span-2">
                            <label className="block text-sm font-medium mb-2">Risk Description *</label>
                            <textarea
                                value={formData.description}
                                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                className="w-full border rounded px-3 py-2"
                                rows="3"
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-2">Severity *</label>
                            <select
                                value={formData.severity}
                                onChange={(e) => setFormData({ ...formData, severity: e.target.value })}
                                className="w-full border rounded px-3 py-2"
                            >
                                <option>Low</option>
                                <option>Medium</option>
                                <option>High</option>
                                <option>Critical</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-2">Status *</label>
                            <select
                                value={formData.status}
                                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                                className="w-full border rounded px-3 py-2"
                            >
                                <option>Identified</option>
                                <option>Mitigating</option>
                                <option>Resolved</option>
                                <option>Accepted</option>
                            </select>
                        </div>
                        <div className="md:col-span-2">
                            <label className="block text-sm font-medium mb-2">Impact</label>
                            <textarea
                                value={formData.impact}
                                onChange={(e) => setFormData({ ...formData, impact: e.target.value })}
                                className="w-full border rounded px-3 py-2"
                                rows="2"
                                placeholder="What is the potential impact?"
                            />
                        </div>
                        <div className="md:col-span-2">
                            <label className="block text-sm font-medium mb-2">Mitigation Plan</label>
                            <textarea
                                value={formData.mitigation}
                                onChange={(e) => setFormData({ ...formData, mitigation: e.target.value })}
                                className="w-full border rounded px-3 py-2"
                                rows="2"
                                placeholder="How will this risk be mitigated?"
                            />
                        </div>
                    </div>
                    <div className="flex gap-2 mt-4">
                        <button type="submit" className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600">
                            Save
                        </button>
                        <button
                            type="button"
                            onClick={() => {
                                setShowForm(false);
                                setEditingRisk(null);
                                setFormData({ description: '', severity: 'Medium', impact: '', mitigation: '', status: 'Identified' });
                            }}
                            className="bg-gray-300 px-4 py-2 rounded hover:bg-gray-400"
                        >
                            Cancel
                        </button>
                    </div>
                </form>
            )}

            <div className="space-y-4">
                {risks.map((risk) => (
                    <div key={risk._id} className={`bg-white p-4 rounded shadow border-l-4 ${risk.severity === 'Critical' ? 'border-red-700' :
                            risk.severity === 'High' ? 'border-red-500' :
                                risk.severity === 'Medium' ? 'border-yellow-500' :
                                    'border-green-500'
                        }`}>
                        <div className="flex justify-between items-start">
                            <div className="flex-1">
                                <div className="flex items-center gap-2 mb-2">
                                    <span className={`px-2 py-1 rounded text-xs font-semibold ${risk.severity === 'Critical' ? 'bg-red-700 text-white' :
                                            risk.severity === 'High' ? 'bg-red-500 text-white' :
                                                risk.severity === 'Medium' ? 'bg-yellow-500 text-white' :
                                                    'bg-green-500 text-white'
                                        }`}>
                                        {risk.severity}
                                    </span>
                                    <span className={`px-2 py-1 rounded text-xs font-semibold ${risk.status === 'Resolved' ? 'bg-green-100 text-green-800' :
                                            risk.status === 'Mitigating' ? 'bg-blue-100 text-blue-800' :
                                                risk.status === 'Accepted' ? 'bg-gray-100 text-gray-800' :
                                                    'bg-orange-100 text-orange-800'
                                        }`}>
                                        {risk.status}
                                    </span>
                                </div>
                                <h3 className="font-bold text-gray-800 mb-2">{risk.description}</h3>
                                {risk.impact && (
                                    <div className="mb-2">
                                        <span className="font-medium text-sm text-gray-600">Impact: </span>
                                        <span className="text-sm text-gray-700">{risk.impact}</span>
                                    </div>
                                )}
                                {risk.mitigation && (
                                    <div className="mb-2">
                                        <span className="font-medium text-sm text-gray-600">Mitigation: </span>
                                        <span className="text-sm text-gray-700">{risk.mitigation}</span>
                                    </div>
                                )}
                                <div className="text-xs text-gray-500 mt-2">
                                    Created: {new Date(risk.createdAt).toLocaleDateString()}
                                </div>
                            </div>
                            <div className="flex gap-2 ml-4">
                                <button
                                    onClick={() => handleEdit(risk)}
                                    className="text-blue-500 hover:text-blue-700"
                                >
                                    <FaEdit />
                                </button>
                                <button
                                    onClick={() => handleDelete(risk._id)}
                                    className="text-red-500 hover:text-red-700"
                                >
                                    <FaTrash />
                                </button>
                            </div>
                        </div>
                    </div>
                ))}
                {risks.length === 0 && (
                    <div className="text-center text-gray-500 py-8">
                        No risks identified yet. Click "Add Risk" to create one.
                    </div>
                )}
            </div>
        </div>
    );
};

export default RisksTab;
