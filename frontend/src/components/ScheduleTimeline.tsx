import React from 'react';
import { Card, ListGroup, Badge, Alert } from 'react-bootstrap';
import { ScheduledTask, TaskPriority } from '../types';

interface ScheduleTimelineProps {
  scheduledTasks: ScheduledTask[];
}

const ScheduleTimeline: React.FC<ScheduleTimelineProps> = ({ scheduledTasks }) => {
  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    if (date.toDateString() === today.toDateString()) {
      return 'Today';
    } else if (date.toDateString() === tomorrow.toDateString()) {
      return 'Tomorrow';
    } else {
      return date.toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' });
    }
  };

  const getPriorityIcon = (priority: TaskPriority) => {
    switch (priority) {
      case TaskPriority.High: return '🔴';
      case TaskPriority.Medium: return '🟡';
      case TaskPriority.Low: return '🟢';
    }
  };

  const getPriorityColor = (priority: TaskPriority) => {
    switch (priority) {
      case TaskPriority.High: return 'danger';
      case TaskPriority.Medium: return 'warning';
      case TaskPriority.Low: return 'secondary';
    }
  };

  // Group tasks by date
  const tasksByDate = scheduledTasks.reduce((acc, task) => {
    const dateKey = formatDate(task.scheduledStartTime);
    if (!acc[dateKey]) {
      acc[dateKey] = [];
    }
    acc[dateKey].push(task);
    return acc;
  }, {} as Record<string, ScheduledTask[]>);

  if (scheduledTasks.length === 0) {
    return (
      <Alert variant="info">
        No tasks scheduled yet. Click "Auto-Schedule Tasks" to organize your tasks!
      </Alert>
    );
  }

  return (
    <div>
      {Object.entries(tasksByDate).map(([date, tasks]) => (
        <Card key={date} className="mb-3 shadow-sm">
          <Card.Header className="bg-primary text-white">
            <h5 className="mb-0">📅 {date}</h5>
          </Card.Header>
          <ListGroup variant="flush">
            {tasks.map((task) => (
              <ListGroup.Item 
                key={task.taskId}
                className={task.hasConflict ? 'border-start border-danger border-4' : ''}
              >
                <div className="d-flex justify-content-between align-items-start">
                  <div className="flex-grow-1">
                    <div className="d-flex align-items-center gap-2 mb-1">
                      <span className="fw-semibold">{task.title}</span>
                      <Badge bg={getPriorityColor(task.priority)}>
                        {getPriorityIcon(task.priority)} {TaskPriority[task.priority]}
                      </Badge>
                      {task.hasConflict && (
                        <Badge bg="danger">⚠️ Conflict</Badge>
                      )}
                    </div>
                    <div className="text-muted small">
                      <span className="me-3">
                        🕐 {formatTime(task.scheduledStartTime)} - {formatTime(task.scheduledEndTime)}
                      </span>
                      <span>📁 {task.projectTitle}</span>
                    </div>
                  </div>
                </div>
              </ListGroup.Item>
            ))}
          </ListGroup>
        </Card>
      ))}
    </div>
  );
};

export default ScheduleTimeline;