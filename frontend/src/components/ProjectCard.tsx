import React from 'react';
import { Card, Button, Badge } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { Project } from '../types';

interface ProjectCardProps {
  project: Project;
  onDelete: (id: number) => void;
}

const ProjectCard: React.FC<ProjectCardProps> = ({ project, onDelete }) => {
  const navigate = useNavigate();

  const completedTasks = project.tasks.filter(t => t.isCompleted).length;
  const totalTasks = project.tasks.length;

  return (
    <Card className="h-100 shadow-sm">
      <Card.Body>
        <Card.Title className="d-flex justify-content-between align-items-start">
          <span>{project.title}</span>
          <Badge bg="secondary">{totalTasks} tasks</Badge>
        </Card.Title>
        
        {project.description && (
          <Card.Text className="text-muted">
            {project.description}
          </Card.Text>
        )}

        <div className="mb-3">
          <small className="text-muted">
            Created: {new Date(project.createdAt).toLocaleDateString()}
          </small>
        </div>

        {totalTasks > 0 && (
          <div className="mb-3">
            <div className="d-flex justify-content-between mb-1">
              <small>Progress</small>
              <small>{completedTasks}/{totalTasks} completed</small>
            </div>
            <div className="progress">
              <div
                className="progress-bar bg-success"
                role="progressbar"
                style={{ width: `${(completedTasks / totalTasks) * 100}%` }}
              />
            </div>
          </div>
        )}

        <div className="d-flex gap-2">
          <Button
            variant="primary"
            size="sm"
            className="flex-grow-1"
            onClick={() => navigate(`/projects/${project.id}`)}
          >
            View Details
          </Button>
          <Button
            variant="outline-danger"
            size="sm"
            onClick={() => onDelete(project.id)}
          >
            Delete
          </Button>
        </div>
      </Card.Body>
    </Card>
  );
};

export default ProjectCard;