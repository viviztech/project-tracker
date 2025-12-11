import { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import { FaTrash } from 'react-icons/fa';
import { useAuth } from '../context/AuthContext';

const CommentsTab = ({ projectId }) => {
    const [comments, setComments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [newComment, setNewComment] = useState('');
    const { user } = useAuth();

    useEffect(() => {
        fetchComments();
    }, [projectId]);

    const fetchComments = async () => {
        try {
            const { data } = await axios.get(`/api/comments?projectId=${projectId}`, {
                withCredentials: true
            });
            setComments(data);
        } catch (error) {
            console.error("Error fetching comments", error);
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!newComment.trim()) return;

        try {
            await axios.post('/api/comments', {
                project: projectId,
                content: newComment
            }, {
                withCredentials: true
            });
            setNewComment('');
            toast.success('Comment added');
            fetchComments();
        } catch (error) {
            toast.error('Failed to add comment');
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Are you sure you want to delete this comment?')) return;
        try {
            await axios.delete(`/api/comments/${id}`, { withCredentials: true });
            toast.success('Comment deleted');
            fetchComments();
        } catch (error) {
            toast.error('Failed to delete comment');
        }
    };

    if (loading) return <div className="p-4">Loading comments...</div>;

    return (
        <div className="p-6">
            <h2 className="text-2xl font-bold mb-6">Comments & Notes</h2>

            <form onSubmit={handleSubmit} className="mb-6">
                <div className="bg-white p-4 rounded shadow">
                    <textarea
                        value={newComment}
                        onChange={(e) => setNewComment(e.target.value)}
                        placeholder="Add a comment or note..."
                        className="w-full border rounded px-3 py-2 min-h-[100px]"
                        required
                    />
                    <div className="mt-2 flex justify-end">
                        <button
                            type="submit"
                            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
                        >
                            Post Comment
                        </button>
                    </div>
                </div>
            </form>

            <div className="space-y-4">
                {comments.map((comment) => (
                    <div key={comment._id} className="bg-white p-4 rounded shadow">
                        <div className="flex justify-between items-start">
                            <div className="flex items-start gap-3 flex-1">
                                <div className="w-10 h-10 rounded-full bg-blue-500 flex items-center justify-center text-white font-bold">
                                    {comment.user?.name?.charAt(0) || 'U'}
                                </div>
                                <div className="flex-1">
                                    <div className="flex items-center gap-2">
                                        <span className="font-bold">{comment.user?.name || 'Unknown'}</span>
                                        <span className="text-sm text-gray-500">
                                            {new Date(comment.createdAt).toLocaleString()}
                                        </span>
                                    </div>
                                    <p className="mt-2 text-gray-700 whitespace-pre-wrap">{comment.content}</p>
                                </div>
                            </div>
                            {(comment.user?._id === user?._id || user?.role === 'Admin') && (
                                <button
                                    onClick={() => handleDelete(comment._id)}
                                    className="text-red-500 hover:text-red-700 ml-2"
                                >
                                    <FaTrash />
                                </button>
                            )}
                        </div>
                    </div>
                ))}
                {comments.length === 0 && (
                    <div className="text-center text-gray-500 py-8">
                        No comments yet. Be the first to add one!
                    </div>
                )}
            </div>
        </div>
    );
};

export default CommentsTab;
