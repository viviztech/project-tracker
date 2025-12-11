import { useState, useEffect } from 'react';
import axios from 'axios';

const TeamTab = ({ projectId }) => {
    const [project, setProject] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchProject();
    }, [projectId]);

    const fetchProject = async () => {
        try {
            const { data } = await axios.get(`/api/projects/${projectId}`, {
                withCredentials: true
            });
            setProject(data);
        } catch (error) {
            console.error("Error fetching project", error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) return <div className="p-4">Loading team...</div>;

    return (
        <div className="p-6">
            <h2 className="text-2xl font-bold mb-6">Team Members</h2>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {/* Project Owner */}
                {project?.owner && (
                    <div className="bg-white p-6 rounded shadow border-l-4 border-blue-500">
                        <div className="flex items-center mb-4">
                            <div className="w-16 h-16 rounded-full bg-blue-500 flex items-center justify-center text-white text-2xl font-bold mr-4">
                                {project.owner.name?.charAt(0) || 'U'}
                            </div>
                            <div>
                                <h3 className="text-lg font-bold">{project.owner.name}</h3>
                                <p className="text-sm text-gray-500">Project Owner</p>
                            </div>
                        </div>
                        <div className="space-y-2">
                            <div className="flex items-center text-sm text-gray-600">
                                <span className="font-medium mr-2">Email:</span>
                                <a href={`mailto:${project.owner.email}`} className="text-blue-500 hover:underline">
                                    {project.owner.email}
                                </a>
                            </div>
                            {project.owner.department && (
                                <div className="flex items-center text-sm text-gray-600">
                                    <span className="font-medium mr-2">Department:</span>
                                    <span>{project.owner.department}</span>
                                </div>
                            )}
                            <div className="mt-3">
                                <span className="px-3 py-1 bg-blue-100 text-blue-800 text-xs font-semibold rounded-full">
                                    {project.owner.role}
                                </span>
                            </div>
                        </div>
                    </div>
                )}

                {/* Team Members */}
                {project?.team && project.team.length > 0 ? (
                    project.team.map((member) => (
                        <div key={member._id} className="bg-white p-6 rounded shadow">
                            <div className="flex items-center mb-4">
                                <div className="w-16 h-16 rounded-full bg-green-500 flex items-center justify-center text-white text-2xl font-bold mr-4">
                                    {member.name?.charAt(0) || 'U'}
                                </div>
                                <div>
                                    <h3 className="text-lg font-bold">{member.name}</h3>
                                    <p className="text-sm text-gray-500">Team Member</p>
                                </div>
                            </div>
                            <div className="space-y-2">
                                <div className="flex items-center text-sm text-gray-600">
                                    <span className="font-medium mr-2">Email:</span>
                                    <a href={`mailto:${member.email}`} className="text-blue-500 hover:underline">
                                        {member.email}
                                    </a>
                                </div>
                                {member.department && (
                                    <div className="flex items-center text-sm text-gray-600">
                                        <span className="font-medium mr-2">Department:</span>
                                        <span>{member.department}</span>
                                    </div>
                                )}
                                <div className="mt-3">
                                    <span className="px-3 py-1 bg-green-100 text-green-800 text-xs font-semibold rounded-full">
                                        {member.role}
                                    </span>
                                </div>
                            </div>
                        </div>
                    ))
                ) : (
                    <div className="col-span-full text-center text-gray-500 py-8">
                        No team members assigned yet.
                    </div>
                )}
            </div>

            <div className="mt-6 p-4 bg-blue-50 rounded">
                <p className="text-sm text-gray-700">
                    <strong>Note:</strong> Team members can be assigned when creating or editing a project.
                    Currently showing {project?.team?.length || 0} team member(s) plus 1 project owner.
                </p>
            </div>
        </div>
    );
};

export default TeamTab;
