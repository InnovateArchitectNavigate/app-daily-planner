import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { GripVertical, Trash2, Plus } from 'lucide-react';
import { TaskItem } from '@/hooks/useDailyPlanner';

interface TaskEditorProps {
    tasks: TaskItem[];
    onTasksChange: (tasks: TaskItem[]) => void;
}

export default function TaskEditor({ tasks, onTasksChange }: TaskEditorProps) {
    const [draggedIndex, setDraggedIndex] = useState<number | null>(null);

    const handleTaskChange = (index: number, value: string) => {
        const newTasks = [...tasks];
        newTasks[index] = {
            ...newTasks[index],
            label: value,
        };
        onTasksChange(newTasks);
    };

    const handleDeleteTask = (index: number) => {
        onTasksChange(tasks.filter((_, i) => i !== index));
    };

    const handleAddTask = () => {
        onTasksChange([
            ...tasks,
            {
                id: `task-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`,
                label: 'New Task',
            },
        ]);
    };

    const handleDragStart = (index: number) => {
        setDraggedIndex(index);
    };

    const handleDragOver = (e: React.DragEvent, index: number) => {
        e.preventDefault();
        if (draggedIndex === null || draggedIndex === index) return;

        const newTasks = [...tasks];
        const draggedTask = newTasks[draggedIndex];
        newTasks.splice(draggedIndex, 1);
        newTasks.splice(index, 0, draggedTask);
        setDraggedIndex(index);
        onTasksChange(newTasks);
    };

    const handleDragEnd = () => {
        setDraggedIndex(null);
    };

    return (
        <div className="space-y-4">
            <div className="space-y-3 max-h-96 overflow-y-auto">
                {tasks.map((task, index) => (
                    <div
                        key={task.id}
                        draggable
                        onDragStart={() => handleDragStart(index)}
                        onDragOver={(e) => handleDragOver(e, index)}
                        onDragEnd={handleDragEnd}
                        className={`flex items-center gap-2 p-3 rounded-lg border border-border bg-card transition-all ${draggedIndex === index ? 'opacity-50' : ''
                            }`}
                    >
                        <GripVertical className="w-4 h-4 text-muted-foreground cursor-grab active:cursor-grabbing flex-shrink-0" />
                        <Input
                            value={task.label}
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
        </div>
    );
}
