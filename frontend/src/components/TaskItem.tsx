import React, { useState } from 'react';
import { ListGroup, Form, Button, Badge } from 'react-bootstrap';
import { Task, TaskPriority } from '../types';

interface TaskItemProps {
  task: Task;
  onToggle: (taskId: number, isCompleted: boolean) => void;
  onDelete: (taskId: number) => void;
}

const TaskItem: React.FC<TaskItemProps> = ({ task, onToggle, onDelete }) => {
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    setIsDeleting(true);
    await onDelete(task.id);
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return null;
    return new Date(dateString).toLocaleDateString();
  };

  const formatTime = (dateString?: string) => {
    if (!dateString) return null;
    return new Date(dateString).toLocaleTimeString('en-US', { 
      hour: 'numeric', 
      minute: '2-digit',
      hour12: true 
    });
  };

  const isDueSoon = () => {
    if (!task.dueDate || task.isCompleted) return false;
    const dueDate = new Date(task.dueDate);
    const today = new Date();
    const diffDays = Math.ceil((dueDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    return diffDays <= 3 && diffDays >= 0;
  };

  const isOverdue = () => {
    if (!task.dueDate || task.isCompleted) return false;
    return new Date(task.dueDate) < new Date();
  };

  const getPriorityBadge = () => {
    switch (task.priority) {
      case TaskPriority.High:
        return <Badge bg="danger">High Priority</Badge>;
      case TaskPriority.Medium:
        return <Badge bg="warning" text="dark">Medium Priority</Badge>;
      case TaskPriority.Low:
        return <Badge bg="secondary">Low Priority</Badge>;
    }
  };

  return (
    <ListGroup.Item className="d-flex align-items-start gap-3">
      <Form.Check
        type="checkbox"
        checked={task.isCompleted}
        onChange={(e) => onToggle(task.id, e.target.checked)}
        className="mt-1"
      />
      
      <div className="flex-grow-1">
        <div className="d-flex align-items-center gap-2 mb-1">
          <span className={task.isCompleted ? 'text-decoration-line-through text-muted' : 'fw-semibold'}>
            {task.title}
          </span>
          {getPriorityBadge()}
        </div>
        
        <div className="d-flex flex-wrap gap-2 align-items-center">
          {task.dueDate && (
            <Badge bg={isOverdue() ? 'danger' : isDueSoon() ? 'warning' : 'secondary'}>
              📅 Due: {formatDate(task.dueDate)}
            </Badge>
          )}
          
          <Badge bg="info">
            ⏱️ {task.estimatedHours}h estimated
          </Badge>

          {task.scheduledStartTime && task.scheduledEndTime && (
            <Badge bg="success">
              🕐 Scheduled: {formatTime(task.scheduledStartTime)} - {formatTime(task.scheduledEndTime)}
            </Badge>
          )}
        </div>
      </div>

      <Button
        variant="outline-danger"
        size="sm"
        onClick={handleDelete}
        disabled={isDeleting}
      >
        {isDeleting ? 'Deleting...' : 'Delete'}
      </Button>
    </ListGroup.Item>
  );
};

export default TaskItem;