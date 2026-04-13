import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { GripVertical, Trash2, Plus } from 'lucide-react';

interface TaskEditorProps {
    tasks: string[];
    onTasksChange: (tasks: string[]) => void;
}

export default function TaskEditor({ tasks, onTasksChange }: TaskEditorProps) {
    const [editingTasks, setEditingTasks] = useState<string[]>(tasks);
    const [draggedIndex, setDraggedIndex] = useState<number | null>(null);

    const handleTaskChange = (index: number, value: string) => {
        const newTasks = [...editingTasks];
        newTasks[index] = value;
        setEditingTasks(newTasks);
    };

    const handleDeleteTask = (index: number) => {
        const newTasks = editingTasks.filter((_, i) => i !== index);
        setEditingTasks(newTasks);
    };

    const handleAddTask = () => {
        setEditingTasks([...editingTasks, 'New Task']);
    };

    const handleDragStart = (index: number) => {
        setDraggedIndex(index);
    };

    const handleDragOver = (e: React.DragEvent, index: number) => {
        e.preventDefault();
        if (draggedIndex === null || draggedIndex === index) return;

        const newTasks = [...editingTasks];
        const draggedTask = newTasks[draggedIndex];
        newTasks.splice(draggedIndex, 1);
        newTasks.splice(index, 0, draggedTask);
        setDraggedIndex(index);
        setEditingTasks(newTasks);
    };

    const handleDragEnd = () => {
        setDraggedIndex(null);
    };

    const handleSave = () => {
        onTasksChange(editingTasks);
    };

    const handleReset = () => {
        setEditingTasks(tasks);
    };

    return (
        <div className="space-y-4">
            <div className="space-y-3 max-h-96 overflow-y-auto">
                {editingTasks.map((task, index) => (
                    <div
                        key={index}
                        draggable
                        onDragStart={() => handleDragStart(index)}
                        onDragOver={(e) => handleDragOver(e, index)}
                        onDragEnd={handleDragEnd}
                        className={`flex items-center gap-2 p-3 rounded-lg border border-border bg-card transition-all ${draggedIndex === index ? 'opacity-50' : ''
                            }`}
                    >
                        <GripVertical className="w-4 h-4 text-muted-foreground cursor-grab active:cursor-grabbing flex-shrink-0" />
                        <Input
                            value={task}
                            onChange={(e) => handleTaskChange(index, e.target.value)}
                            className="flex-1 text-sm"
                            placeholder="Task name"
                        />
                        <span className="text-xs text-muted-foreground w-6 text-center flex-shrink-0">
                            {index + 1}
                        </span>
                        <button
                            onClick={() => handleDeleteTask(index)}
                            className="p-1 hover:bg-destructive/10 rounded transition-colors flex-shrink-0"
                            title="Delete task"
                        >
                            <Trash2 className="w-4 h-4 text-destructive" />
                        </button>
                    </div>
                ))}
            </div>

            <Button
                variant="outline"
                onClick={handleAddTask}
                className="w-full"
                size="sm"
            >
                <Plus className="w-4 h-4 mr-2" />
                Add Task
            </Button>

            <div className="flex gap-2">
                <Button
                    variant="outline"
                    onClick={handleReset}
                    className="flex-1"
                    size="sm"
                >
                    Cancel
                </Button>
                <Button
                    onClick={handleSave}
                    className="flex-1"
                    size="sm"
                >
                    Save Tasks
                </Button>
            </div>
        </div>
    );
}
