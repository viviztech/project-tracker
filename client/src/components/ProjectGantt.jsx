import { useState, useEffect, useRef } from 'react';
import Gantt from 'frappe-gantt';
import axios from 'axios';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import { FaDownload, FaFilePdf, FaFileImage } from 'react-icons/fa';
import '../frappe-gantt.css';

const ProjectGantt = ({ projectId }) => {
    const [tasks, setTasks] = useState([]);
    const [loading, setLoading] = useState(true);
    const ganttRef = useRef(null);
    const ganttInstance = useRef(null);

    useEffect(() => {
        const fetchTasks = async () => {
            try {
                const { data } = await axios.get(`/api/tasks?projectId=${projectId}`, {
                    withCredentials: true
                });

                // Transform tasks for Frappe Gantt
                const ganttTasks = data.map(task => ({
                    id: task._id,
                    name: task.title,
                    start: task.createdAt.split('T')[0], // Use createdAt as start if no start date
                    end: task.dueDate ? task.dueDate.split('T')[0] : new Date().toISOString().split('T')[0],
                    progress: task.status === 'Done' ? 100 : task.status === 'In Progress' ? 50 : 0,
                    dependencies: task.dependencies ? task.dependencies.join(', ') : ''
                }));

                setTasks(ganttTasks);
            } catch (error) {
                console.error("Error fetching tasks for Gantt", error);
            } finally {
                setLoading(false);
            }
        };

        fetchTasks();
    }, [projectId]);

    useEffect(() => {
        if (tasks.length > 0 && ganttRef.current) {
            // Clear previous instance
            ganttRef.current.innerHTML = '';

            try {
                ganttInstance.current = new Gantt(ganttRef.current, tasks, {
                    view_mode: 'Day',
                    on_click: task => console.log('Clicked:', task),
                    on_date_change: (task, start, end) => console.log('Date change:', task, start, end),
                    on_progress_change: (task, progress) => console.log('Progress change:', task, progress),
                    on_view_change: (mode) => console.log('View change:', mode),
                });
            } catch (error) {
                console.error("Error initializing Gantt:", error);
            }
        }
    }, [tasks]);

    const exportToPNG = async () => {
        if (ganttRef.current) {
            // Frappe Gantt creates an SVG. We need to handle it carefully.
            // html2canvas might struggle with pure SVGs sometimes, but let's try.
            // Often better to find the SVG element specifically.
            const svgElement = ganttRef.current.querySelector('svg');

            if (svgElement) {
                // We might need to convert SVG to canvas manually or use html2canvas on the container
                const canvas = await html2canvas(ganttRef.current);
                const link = document.createElement('a');
                link.download = 'gantt-chart.png';
                link.href = canvas.toDataURL();
                link.click();
            }
        }
    };

    const exportToPDF = async () => {
        if (ganttRef.current) {
            const canvas = await html2canvas(ganttRef.current);
            const imgData = canvas.toDataURL('image/png');
            const pdf = new jsPDF('l', 'mm', 'a4'); // Landscape, mm, A4
            const pdfWidth = pdf.internal.pageSize.getWidth();
            const pdfHeight = (canvas.height * pdfWidth) / canvas.width;

            pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
            pdf.save('gantt-chart.pdf');
        }
    };

    if (loading) return <div>Loading Gantt...</div>;
    if (tasks.length === 0) return <div className="text-gray-500">No tasks to display in Gantt chart.</div>;

    return (
        <div className="bg-white p-4 rounded shadow">
            <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-bold">Project Timeline</h3>
                <div className="flex gap-2">
                    <button
                        onClick={exportToPNG}
                        className="flex items-center gap-2 px-3 py-1.5 bg-green-500 text-white text-sm rounded hover:bg-green-600 transition-colors"
                    >
                        <FaFileImage /> Export PNG
                    </button>
                    <button
                        onClick={exportToPDF}
                        className="flex items-center gap-2 px-3 py-1.5 bg-red-500 text-white text-sm rounded hover:bg-red-600 transition-colors"
                    >
                        <FaFilePdf /> Export PDF
                    </button>
                </div>
            </div>

            <div className="overflow-x-auto">
                <div ref={ganttRef} id="gantt-container"></div>
            </div>
        </div>
    );
};

export default ProjectGantt;
