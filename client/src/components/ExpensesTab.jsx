import { useState, useEffect } from 'react';
import axios from 'axios';
import { FaPlus, FaTrash } from 'react-icons/fa';
import { toast } from 'react-toastify';

const ExpensesTab = ({ projectId, budget }) => {
    const [expenses, setExpenses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [formData, setFormData] = useState({
        amount: '',
        description: '',
        category: 'Other',
        date: new Date().toISOString().split('T')[0]
    });

    const fetchExpenses = async () => {
        try {
            const { data } = await axios.get(`/api/expenses?projectId=${projectId}`, {
                withCredentials: true
            });
            setExpenses(data);
        } catch (error) {
            console.error("Error fetching expenses", error);
            toast.error("Failed to load expenses");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchExpenses();
    }, [projectId]);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await axios.post('/api/expenses', {
                ...formData,
                project: projectId
            }, {
                withCredentials: true
            });
            toast.success("Expense added successfully");
            setFormData({
                amount: '',
                description: '',
                category: 'Other',
                date: new Date().toISOString().split('T')[0]
            });
            setShowForm(false);
            fetchExpenses();
        } catch (error) {
            console.error("Error adding expense", error);
            toast.error("Failed to add expense");
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm("Are you sure you want to delete this expense?")) {
            try {
                await axios.delete(`/api/expenses/${id}`, {
                    withCredentials: true
                });
                toast.success("Expense deleted");
                fetchExpenses();
            } catch (error) {
                console.error("Error deleting expense", error);
                toast.error("Failed to delete expense");
            }
        }
    };

    const totalActual = expenses.reduce((sum, expense) => sum + expense.amount, 0);
    const budgetUtilization = budget ? (totalActual / budget) * 100 : 0;

    if (loading) return <div>Loading expenses...</div>;

    return (
        <div className="p-6">
            {/* Budget Summary */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <div className="bg-white p-5 rounded-lg shadow-sm border border-gray-200">
                    <h3 className="text-gray-500 text-xs font-semibold uppercase tracking-wider mb-2">Total Budget</h3>
                    <p className="text-2xl font-bold text-gray-900">${budget?.toLocaleString() || '0'}</p>
                </div>
                <div className="bg-white p-5 rounded-lg shadow-sm border border-gray-200">
                    <h3 className="text-gray-500 text-xs font-semibold uppercase tracking-wider mb-2">Total Actual</h3>
                    <p className={`text-2xl font-bold ${totalActual > budget ? 'text-red-600' : 'text-green-600'}`}>
                        ${totalActual.toLocaleString()}
                    </p>
                </div>
                <div className="bg-white p-5 rounded-lg shadow-sm border border-gray-200">
                    <h3 className="text-gray-500 text-xs font-semibold uppercase tracking-wider mb-2">Utilization</h3>
                    <div className="flex items-center">
                        <div className="flex-1 bg-gray-200 rounded-full h-2 mr-3">
                            <div
                                className={`h-2 rounded-full ${budgetUtilization > 100 ? 'bg-red-500' : 'bg-blue-500'}`}
                                style={{ width: `${Math.min(budgetUtilization, 100)}%` }}
                            ></div>
                        </div>
                        <span className="text-sm font-medium text-gray-700">{Math.round(budgetUtilization)}%</span>
                    </div>
                </div>
            </div>

            <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold text-gray-900">Expense Log</h2>
                <button
                    onClick={() => setShowForm(!showForm)}
                    className="bg-primary text-white px-4 py-2 rounded shadow-sm hover:bg-blue-600 flex items-center text-sm font-medium transition-colors"
                >
                    <FaPlus className="mr-2" /> {showForm ? 'Cancel' : 'Add Expense'}
                </button>
            </div>

            {showForm && (
                <div className="bg-gray-50 p-6 rounded-lg border border-gray-200 mb-6">
                    <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                            <input
                                type="text"
                                name="description"
                                value={formData.description}
                                onChange={handleChange}
                                required
                                className="w-full p-2 border rounded focus:ring-blue-500 focus:border-blue-500"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Amount ($)</label>
                            <input
                                type="number"
                                name="amount"
                                value={formData.amount}
                                onChange={handleChange}
                                required
                                min="0"
                                step="0.01"
                                className="w-full p-2 border rounded focus:ring-blue-500 focus:border-blue-500"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                            <select
                                name="category"
                                value={formData.category}
                                onChange={handleChange}
                                className="w-full p-2 border rounded focus:ring-blue-500 focus:border-blue-500"
                            >
                                <option>Labor</option>
                                <option>Software</option>
                                <option>Hardware</option>
                                <option>Marketing</option>
                                <option>Other</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
                            <input
                                type="date"
                                name="date"
                                value={formData.date}
                                onChange={handleChange}
                                required
                                className="w-full p-2 border rounded focus:ring-blue-500 focus:border-blue-500"
                            />
                        </div>
                        <div className="md:col-span-2 flex justify-end">
                            <button
                                type="submit"
                                className="bg-green-600 text-white px-6 py-2 rounded hover:bg-green-700 font-medium"
                            >
                                Save Expense
                            </button>
                        </div>
                    </form>
                </div>
            )}

            <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="bg-gray-50 border-b border-gray-200 text-xs uppercase text-gray-500 font-semibold tracking-wider">
                            <th className="p-4">Date</th>
                            <th className="p-4">Description</th>
                            <th className="p-4">Category</th>
                            <th className="p-4">Recorded By</th>
                            <th className="p-4 text-right">Amount</th>
                            <th className="p-4 text-center">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                        {expenses.map(expense => (
                            <tr key={expense._id} className="hover:bg-gray-50 transition-colors">
                                <td className="p-4 text-sm text-gray-600">
                                    {new Date(expense.date).toLocaleDateString()}
                                </td>
                                <td className="p-4 text-sm font-medium text-gray-900">
                                    {expense.description}
                                </td>
                                <td className="p-4 text-sm text-gray-600">
                                    <span className="px-2 py-1 bg-gray-100 rounded-full text-xs">
                                        {expense.category}
                                    </span>
                                </td>
                                <td className="p-4 text-sm text-gray-600">
                                    {expense.recordedBy?.name || 'Unknown'}
                                </td>
                                <td className="p-4 text-sm font-bold text-gray-900 text-right">
                                    ${expense.amount.toLocaleString()}
                                </td>
                                <td className="p-4 text-center">
                                    <button
                                        onClick={() => handleDelete(expense._id)}
                                        className="text-red-500 hover:text-red-700 transition-colors"
                                    >
                                        <FaTrash />
                                    </button>
                                </td>
                            </tr>
                        ))}
                        {expenses.length === 0 && (
                            <tr>
                                <td colSpan="6" className="p-8 text-center text-gray-500">
                                    No expenses recorded yet.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default ExpensesTab;
