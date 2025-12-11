import { useState, useEffect } from 'react';
import axios from 'axios';
import { FaFileUpload, FaTrash, FaFileDownload, FaHistory, FaTimes } from 'react-icons/fa';

const DocumentRepository = ({ projectId }) => {
    const [documents, setDocuments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [uploading, setUploading] = useState(false);
    const [selectedDocHistory, setSelectedDocHistory] = useState(null);

    useEffect(() => {
        fetchDocuments();
    }, [projectId]);

    const fetchDocuments = async () => {
        try {
            const { data } = await axios.get(`/api/documents?projectId=${projectId}`, {
                withCredentials: true
            });
            setDocuments(data);
        } catch (error) {
            console.error("Error fetching documents", error);
        } finally {
            setLoading(false);
        }
    };

    const handleFileUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const formData = new FormData();
        formData.append('file', file);
        formData.append('projectId', projectId);
        formData.append('name', file.name);

        setUploading(true);
        try {
            await axios.post('/api/documents', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data'
                },
                withCredentials: true
            });
            fetchDocuments();
        } catch (error) {
            console.error("Error uploading document", error);
            alert('Failed to upload document');
        } finally {
            setUploading(false);
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Are you sure you want to delete this document?')) return;
        try {
            await axios.delete(`/api/documents/${id}`, {
                withCredentials: true
            });
            setDocuments(documents.filter(doc => doc._id !== id));
        } catch (error) {
            console.error("Error deleting document", error);
        }
    };

    const openHistory = (doc) => {
        setSelectedDocHistory(doc);
    };

    const closeHistory = () => {
        setSelectedDocHistory(null);
    };

    if (loading) return <div>Loading documents...</div>;

    return (
        <div className="bg-white p-6 rounded shadow mt-8">
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold">Documents</h2>
                <div className="relative">
                    <input
                        type="file"
                        onChange={handleFileUpload}
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                        disabled={uploading}
                    />
                    <button className={`bg-blue-500 text-white px-4 py-2 rounded flex items-center hover:bg-blue-600 ${uploading ? 'opacity-50 cursor-not-allowed' : ''}`}>
                        <FaFileUpload className="mr-2" /> {uploading ? 'Uploading...' : 'Upload File'}
                    </button>
                </div>
            </div>

            {documents.length === 0 ? (
                <p className="text-gray-500">No documents uploaded yet.</p>
            ) : (
                <div className="overflow-x-auto">
                    <table className="min-w-full text-left text-sm">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-4 py-2">Name</th>
                                <th className="px-4 py-2">Version</th>
                                <th className="px-4 py-2">Size</th>
                                <th className="px-4 py-2">Uploaded By</th>
                                <th className="px-4 py-2">Date</th>
                                <th className="px-4 py-2">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {documents.map((doc) => (
                                <tr key={doc._id} className="hover:bg-gray-50">
                                    <td className="px-4 py-2 font-medium">{doc.name}</td>
                                    <td className="px-4 py-2">
                                        <span className="bg-gray-100 text-gray-800 text-xs font-medium px-2.5 py-0.5 rounded">v{doc.version || 1}</span>
                                    </td>
                                    <td className="px-4 py-2">{(doc.size / 1024).toFixed(2)} KB</td>
                                    <td className="px-4 py-2">{doc.uploadedBy?.name}</td>
                                    <td className="px-4 py-2">{new Date(doc.updatedAt || doc.createdAt).toLocaleDateString()}</td>
                                    <td className="px-4 py-2 flex space-x-2">
                                        <a
                                            href={`http://localhost:5000/${doc.path}`}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="text-blue-500 hover:text-blue-700"
                                            title="Download"
                                        >
                                            <FaFileDownload />
                                        </a>
                                        {doc.versions && doc.versions.length > 0 && (
                                            <button
                                                onClick={() => openHistory(doc)}
                                                className="text-gray-500 hover:text-gray-700"
                                                title="History"
                                            >
                                                <FaHistory />
                                            </button>
                                        )}
                                        <button
                                            onClick={() => handleDelete(doc._id)}
                                            className="text-red-500 hover:text-red-700"
                                            title="Delete"
                                        >
                                            <FaTrash />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            {/* History Modal */}
            {selectedDocHistory && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg p-6 w-full max-w-2xl">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-lg font-bold">Version History: {selectedDocHistory.name}</h3>
                            <button onClick={closeHistory} className="text-gray-500 hover:text-gray-700">
                                <FaTimes />
                            </button>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="min-w-full text-left text-sm">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-4 py-2">Version</th>
                                        <th className="px-4 py-2">Date</th>
                                        <th className="px-4 py-2">Size</th>
                                        <th className="px-4 py-2">Action</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100">
                                    {/* Current Version */}
                                    <tr className="bg-blue-50">
                                        <td className="px-4 py-2 font-medium">v{selectedDocHistory.version || 1} (Current)</td>
                                        <td className="px-4 py-2">{new Date(selectedDocHistory.updatedAt).toLocaleString()}</td>
                                        <td className="px-4 py-2">{(selectedDocHistory.size / 1024).toFixed(2)} KB</td>
                                        <td className="px-4 py-2">
                                            <a
                                                href={`http://localhost:5000/${selectedDocHistory.path}`}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="text-blue-600 hover:underline"
                                            >
                                                Download
                                            </a>
                                        </td>
                                    </tr>
                                    {/* Past Versions */}
                                    {selectedDocHistory.versions.slice().reverse().map((ver, index) => (
                                        <tr key={index}>
                                            <td className="px-4 py-2">v{selectedDocHistory.version - 1 - index}</td>
                                            <td className="px-4 py-2">{new Date(ver.createdAt).toLocaleString()}</td>
                                            <td className="px-4 py-2">{(ver.size / 1024).toFixed(2)} KB</td>
                                            <td className="px-4 py-2">
                                                <a
                                                    href={`http://localhost:5000/${ver.path}`}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="text-blue-600 hover:underline"
                                                >
                                                    Download
                                                </a>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                        <div className="mt-4 flex justify-end">
                            <button onClick={closeHistory} className="bg-gray-200 text-gray-800 px-4 py-2 rounded hover:bg-gray-300">
                                Close
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default DocumentRepository;
