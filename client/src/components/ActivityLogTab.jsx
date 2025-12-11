import { useState, useEffect } from 'react';
import axios from 'axios';

const ActivityLogTab = ({ projectId }) => {
    const [logs, setLogs] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchActivityLogs();
    }, [projectId]);

    const fetchActivityLogs = async () => {
        try {
            const { data } = await axios.get(`/api/activity?projectId=${projectId}`, {
                withCredentials: true
            });
            setLogs(data);
        } catch (error) {
            console.error("Error fetching activity logs", error);
        } finally {
            setLoading(false);
        }
    };

    const getActivityIcon = (entity) => {
        const icons = {
            'Project': '📋',
            'Task': '✓',
            'Milestone': '🎯',
            'Document': '📄',
            'Comment': '💬'
        };
        return icons[entity] || '📝';
    };

    if (loading) return <div className="p-4">Loading activity log...</div>;

    return (
        <div className="p-6">
            <h2 className="text-2xl font-bold mb-6">Activity Log</h2>

            <div className="space-y-3">
                {logs.map((log) => (
                    <div key={log._id} className="bg-white p-4 rounded shadow border-l-4 border-blue-500">
                        <div className="flex items-start gap-3">
                            <span className="text-2xl">{getActivityIcon(log.entity)}</span>
                            <div className="flex-1">
                                <div className="flex items-center gap-2">
                                    <span className="font-bold">{log.user?.name || 'System'}</span>
                                    <span className="text-gray-500">·</span>
                                    <span className="text-sm text-gray-500">
                                        {new Date(log.createdAt).toLocaleString()}
                                    </span>
                                </div>
                                <p className="mt-1 text-gray-700">
                                    <span className="font-medium">{log.action}</span>
                                    {log.details && <span className="text-gray-600"> - {log.details}</span>}
                                </p>
                                <span className="text-xs text-gray-500 mt-1 inline-block">
                                    {log.entity}
                                </span>
                            </div>
                        </div>
                    </div>
                ))}
                {logs.length === 0 && (
                    <div className="text-center text-gray-500 py-8">
                        No activity recorded yet.
                    </div>
                )}
            </div>
        </div>
    );
};

export default ActivityLogTab;
