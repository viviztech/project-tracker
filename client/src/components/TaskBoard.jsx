import { useState, useEffect } from 'react';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import axios from 'axios';

const TaskBoard = ({ projectId }) => {
    const [tasks, setTasks] = useState([]);
    const [columns, setColumns] = useState({
        'To Do': [],
        'In Progress': [],
        'Review': [],
        'Done': []
    });

    useEffect(() => {
        fetchTasks();
    }, [projectId]);

    const fetchTasks = async () => {
        try {
            const { data } = await axios.get(`http://localhost:5000/api/tasks?projectId=${projectId}`, {
                withCredentials: true
            });
            setTasks(data);
            organizeTasks(data);
        } catch (error) {
            console.error("Error fetching tasks", error);
        }
    };

    const organizeTasks = (taskList) => {
        const newColumns = {
            'To Do': [],
            'In Progress': [],
            'Review': [],
            'Done': []
        };
        taskList.forEach(task => {
            if (newColumns[task.status]) {
                newColumns[task.status].push(task);
            }
        });
        setColumns(newColumns);
    };

    const onDragEnd = async (result) => {
        if (!result.destination) return;

        const { source, destination, draggableId } = result;

        if (source.droppableId !== destination.droppableId) {
            const sourceColumn = columns[source.droppableId];
            const destColumn = columns[destination.droppableId];
            const sourceItems = [...sourceColumn];
            const destItems = [...destColumn];
            const [removed] = sourceItems.splice(source.index, 1);

            // Optimistic update
            const updatedTask = { ...removed, status: destination.droppableId };
            destItems.splice(destination.index, 0, updatedTask);

            setColumns({
                ...columns,
                [source.droppableId]: sourceItems,
                [destination.droppableId]: destItems
            });

            try {
                await axios.put(`http://localhost:5000/api/tasks/${draggableId}`, {
                    status: destination.droppableId
                }, { withCredentials: true });
            } catch (error) {
                console.error("Error updating task status", error);
                // Revert on error (could be improved)
                fetchTasks();
            }
        } else {
            // Reordering within same column (not persisted to backend in this simple version)
            const column = columns[source.droppableId];
            const copiedItems = [...column];
            const [removed] = copiedItems.splice(source.index, 1);
            copiedItems.splice(destination.index, 0, removed);
            setColumns({
                ...columns,
                [source.droppableId]: copiedItems
            });
        }
    };

    return (
        <DragDropContext onDragEnd={onDragEnd}>
            <div className="flex space-x-4 overflow-x-auto pb-4">
                {Object.entries(columns).map(([columnId, columnTasks]) => (
                    <div key={columnId} className="bg-gray-100 p-4 rounded min-w-[300px] w-80">
                        <h3 className="font-bold mb-4 text-gray-700 flex justify-between">
                            {columnId}
                            <span className="bg-gray-200 px-2 rounded text-sm">{columnTasks.length}</span>
                        </h3>
                        <Droppable droppableId={columnId}>
                            {(provided) => (
                                <div
                                    {...provided.droppableProps}
                                    ref={provided.innerRef}
                                    className="min-h-[200px]"
                                >
                                    {columnTasks.map((task, index) => (
                                        <Draggable key={task._id} draggableId={task._id} index={index}>
                                            {(provided) => (
                                                <div
                                                    ref={provided.innerRef}
                                                    {...provided.draggableProps}
                                                    {...provided.dragHandleProps}
                                                    className="bg-white p-4 mb-3 rounded shadow hover:shadow-md transition border-l-4 border-blue-500"
                                                >
                                                    <h4 className="font-semibold mb-2">{task.title}</h4>
                                                    <div className="flex justify-between items-center text-xs text-gray-500">
                                                        <span className={`px-2 py-0.5 rounded ${task.priority === 'High' ? 'bg-red-100 text-red-700' :
                                                                task.priority === 'Medium' ? 'bg-yellow-100 text-yellow-700' :
                                                                    'bg-green-100 text-green-700'
                                                            }`}>{task.priority}</span>
                                                        {task.assignedTo && (
                                                            <div className="w-6 h-6 bg-blue-500 rounded-full text-white flex items-center justify-center" title={task.assignedTo.name}>
                                                                {task.assignedTo.name.charAt(0)}
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            )}
                                        </Draggable>
                                    ))}
                                    {provided.placeholder}
                                </div>
                            )}
                        </Droppable>
                    </div>
                ))}
            </div>
        </DragDropContext>
    );
};

export default TaskBoard;
