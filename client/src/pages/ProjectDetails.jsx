import { useState, useEffect } from 'react';
import axios from 'axios';
import { useParams } from 'react-router-dom';
import { FaPlus } from 'react-icons/fa';
import TaskBoard from '../components/TaskBoard';
import ProjectGantt from '../components/ProjectGantt';
import DocumentRepository from '../components/DocumentRepository';
import MilestonesTab from '../components/MilestonesTab';
import CommentsTab from '../components/CommentsTab';
import ActivityLogTab from '../components/ActivityLogTab';
import TeamTab from '../components/TeamTab';
import RisksTab from '../components/RisksTab';
import Modal from '../components/Modal';
import CreateTask from '../components/CreateTask';
import ExpensesTab from '../components/ExpensesTab';

const ProjectDetails = () => {
    const { id } = useParams();
    const [project, setProject] = useState(null);
    const [loading, setLoading] = useState(true);
    const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
    const [refreshTasks, setRefreshTasks] = useState(0);
    const [activeTab, setActiveTab] = useState('tasks');

    useEffect(() => {
        const fetchProject = async () => {
            try {
                const { data } = await axios.get(`/api/projects/${id}`, {
                    withCredentials: true
                });
                setProject(data);
            } catch (error) {
                console.error("Error fetching project details", error);
            } finally {
                setLoading(false);
            }
        };

        fetchProject();
    }, [id]);

    const handleTaskCreated = () => {
        setRefreshTasks(prev => prev + 1);
    };

    if (loading) return <div className="p-6">Loading...</div>;
    if (!project) return <div className="p-6">Project not found</div>;

    const tabs = [
        { id: 'tasks', label: 'Tasks' },
        { id: 'milestones', label: 'Milestones' },
        { id: 'team', label: 'Team' },
        { id: 'gantt', label: 'Timeline' },
        { id: 'expenses', label: 'Expenses' },
        { id: 'documents', label: 'Documents' },
        { id: 'risks', label: 'Risks & Issues' },
        { id: 'comments', label: 'Comments' },
        { id: 'activity', label: 'Activity Log' }
    ];

    return (
        <div className="p-6">
            <div className="bg-white p-6 rounded shadow mb-6">
                <div className="flex justify-between items-start mb-4">
                    <div>
                        <h1 className="text-3xl font-bold mb-2">{project.name}</h1>
                        <p className="text-gray-600">{project.description}</p>
                    </div>
                    <div className="flex flex-col items-end">
                        <span className={`px-3 py-1 rounded-full text-sm font-semibold mb-2 ${project.status === 'Completed' ? 'bg-green-100 text-green-800' :
                            project.status === 'In Progress' ? 'bg-blue-100 text-blue-800' :
                                'bg-gray-100 text-gray-800'
                            }`}>
                            {project.status}
                        </span>
                        <span className="text-sm text-gray-500">Priority: {project.priority}</span>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6 border-t pt-6">
                    <div>
                        <h3 className="text-sm font-bold text-gray-500 uppercase mb-1">Timeline</h3>
                        <p>{new Date(project.startDate).toLocaleDateString()} - {new Date(project.endDate).toLocaleDateString()}</p>
                    </div>
                    <div>
                        <h3 className="text-sm font-bold text-gray-500 uppercase mb-1">Budget</h3>
                        <p>${project.budget?.toLocaleString()}</p>
                    </div>
                    <div>
                        <h3 className="text-sm font-bold text-gray-500 uppercase mb-1">Owner</h3>
                        <p>{project.owner?.name}</p>
                    </div>
                </div>
            </div>

            {/* Tab Navigation */}
            <div className="bg-white rounded-t shadow">
                <div className="flex border-b">
                    {tabs.map(tab => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={`px-6 py-3 font-medium transition-colors ${activeTab === tab.id
                                ? 'border-b-2 border-blue-500 text-blue-600'
                                : 'text-gray-600 hover:text-gray-900'
                                }`}
                        >
                            {tab.label}
                        </button>
                    ))}
                </div>
            </div>

            {/* Tab Content */}
            <div className="bg-white rounded-b shadow mb-6">
                {activeTab === 'tasks' && (
                    <div className="p-6">
                        <div className="mb-6 flex justify-between items-center">
                            <h2 className="text-2xl font-bold">Tasks</h2>
                            <button
                                onClick={() => setIsTaskModalOpen(true)}
                                className="bg-blue-500 text-white px-4 py-2 rounded flex items-center hover:bg-blue-600"
                            >
                                <FaPlus className="mr-2" /> Add Task
                            </button>
                        </div>
                        <TaskBoard projectId={id} key={refreshTasks} />
                    </div>
                )}

                {activeTab === 'milestones' && <MilestonesTab projectId={id} />}

                {activeTab === 'team' && <TeamTab projectId={id} />}

                {activeTab === 'gantt' && (
                    <div className="p-6">
                        <ProjectGantt projectId={id} />
                    </div>
                )}

                {activeTab === 'expenses' && <ExpensesTab projectId={id} budget={project.budget} />}

                {activeTab === 'documents' && <DocumentRepository projectId={id} />}

                {activeTab === 'risks' && <RisksTab projectId={id} />}

                {activeTab === 'comments' && <CommentsTab projectId={id} />}

                {activeTab === 'activity' && <ActivityLogTab projectId={id} />}
            </div>

            <Modal
                isOpen={isTaskModalOpen}
                onClose={() => setIsTaskModalOpen(false)}
                title="Create New Task"
            >
                <CreateTask
                    projectId={id}
                    onClose={() => setIsTaskModalOpen(false)}
                    onTaskCreated={handleTaskCreated}
                />
            </Modal>
        </div>
    );
};

export default ProjectDetails;
