import { useState, useEffect } from 'react';
import axios from 'axios';

const Users = () => {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchUsers = async () => {
            try {
                // We need an endpoint to get all users. 
                // Assuming GET /api/auth/users or similar exists. 
                // If not, we might need to create it.
                // Let's try /api/auth/users first, if not we'll create it.
                const { data } = await axios.get('/api/auth/users', {
                    withCredentials: true
                });
                setUsers(data);
            } catch (error) {
                console.error("Error fetching users", error);
            } finally {
                setLoading(false);
            }
        };

        fetchUsers();
    }, []);

    if (loading) return <div className="p-6">Loading users...</div>;

    return (
        <div className="p-6">
            <h1 className="text-3xl font-bold mb-6">Users</h1>

            <div className="bg-white rounded shadow overflow-x-auto">
                <table className="min-w-full text-left text-sm">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-3 font-medium text-gray-500 uppercase tracking-wider">Name</th>
                            <th className="px-6 py-3 font-medium text-gray-500 uppercase tracking-wider">Email</th>
                            <th className="px-6 py-3 font-medium text-gray-500 uppercase tracking-wider">Role</th>
                            <th className="px-6 py-3 font-medium text-gray-500 uppercase tracking-wider">Department</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                        {users.map((user) => (
                            <tr key={user._id} className="hover:bg-gray-50">
                                <td className="px-6 py-4 font-medium text-gray-900">
                                    <div className="flex items-center">
                                        <div className="h-8 w-8 rounded-full bg-blue-500 flex items-center justify-center text-white mr-3">
                                            {user.name.charAt(0)}
                                        </div>
                                        {user.name}
                                    </div>
                                </td>
                                <td className="px-6 py-4 text-gray-500">{user.email}</td>
                                <td className="px-6 py-4">
                                    <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">
                                        {user.role}
                                    </span>
                                </td>
                                <td className="px-6 py-4 text-gray-500">{user.department || '-'}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default Users;
