import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Container, Card, Button, ListGroup, Alert, Spinner, Badge } from 'react-bootstrap';
import Navbar from '../components/Navbar';
import TaskItem from '../components/TaskItem';
import CreateTaskModal from '../components/CreateTaskModal';
import { projectsAPI, tasksAPI } from '../services/api';
import { Project, CreateTaskRequest } from '../types';

const ProjectDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [project, setProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showModal, setShowModal] = useState(false);

  const fetchProject = async () => {
    try {
      setLoading(true);
      const data = await projectsAPI.getById(Number(id));
      setProject(data);
      setError('');
    } catch (err: any) {
      setError('Failed to load project details');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProject();
  }, [id]);

  const handleCreateTask = async (data: CreateTaskRequest) => {
    await projectsAPI.createTask(Number(id), data);
    await fetchProject();
  };

  const handleToggleTask = async (taskId: number, isCompleted: boolean) => {
    try {
      await tasksAPI.update(taskId, { isCompleted });
      await fetchProject();
    } catch (err: any) {
      setError('Failed to update task');
    }
  };

  const handleDeleteTask = async (taskId: number) => {
    try {
      await tasksAPI.delete(taskId);
      await fetchProject();
    } catch (err: any) {
      setError('Failed to delete task');
    }
  };

  const handleDeleteProject = async () => {
    if (window.confirm('Are you sure you want to delete this project? All tasks will be deleted.')) {
      try {
        await projectsAPI.delete(Number(id));
        navigate('/dashboard');
      } catch (err: any) {
        setError('Failed to delete project');
      }
    }
  };

  if (loading) {
    return (
      <>
        <Navbar />
        <Container>
          <div className="text-center py-5">
            <Spinner animation="border" variant="primary" />
            <p className="mt-3 text-muted">Loading project...</p>
          </div>
        </Container>
      </>
    );
  }

  if (!project) {
    return (
      <>
        <Navbar />
        <Container>
          <Alert variant="danger">Project not found</Alert>
          <Button variant="secondary" onClick={() => navigate('/dashboard')}>
            Back to Dashboard
          </Button>
        </Container>
      </>
    );
  }

  const completedTasks = project.
  tasks.filter(t => t.isCompleted).length;
const totalTasks = project.tasks.length;
return (
<>
<Navbar />
<Container>
<Button variant="secondary" className="mb-3" onClick={() => navigate('/dashboard')}>
← Back to Dashboard
</Button>
    {error && <Alert variant="danger" dismissible onClose={() => setError('')}>{error}</Alert>}

    <Card className="shadow mb-4">
      <Card.Body>
        <div className="d-flex justify-content-between align-items-start mb-3">
          <div>
            <h2>{project.title}</h2>
            {project.description && (
              <p className="text-muted mb-2">{project.description}</p>
            )}
            <small className="text-muted">
              Created: {new Date(project.createdAt).toLocaleDateString()}
            </small>
          </div>
          <Button variant="outline-danger" onClick={handleDeleteProject}>
            Delete Project
          </Button>
        </div>

        {totalTasks > 0 && (
          <div>
            <div className="d-flex justify-content-between mb-2">
              <span>Progress:</span>
              <Badge bg="primary">{completedTasks}/{totalTasks} completed</Badge>
            </div>
            <div className="progress mb-3">
              <div
                className="progress-bar bg-success"
                role="progressbar"
                style={{ width: `${(completedTasks / totalTasks) * 100}%` }}
              >
                {Math.round((completedTasks / totalTasks) * 100)}%
              </div>
            </div>
          </div>
        )}
      </Card.Body>
    </Card>

    <Card className="shadow">
      <Card.Header className="d-flex justify-content-between align-items-center">
        <h5 className="mb-0">Tasks ({totalTasks})</h5>
        <Button variant="primary" size="sm" onClick={() => setShowModal(true)}>
          + Add Task
        </Button>
      </Card.Header>
      <Card.Body className="p-0">
        {project.tasks.length === 0 ? (
          <div className="text-center py-5">
            <p className="text-muted mb-3">No tasks yet</p>
            <Button variant="primary" size="sm" onClick={() => setShowModal(true)}>
              Create First Task
            </Button>
          </div>
        ) : (
          <ListGroup variant="flush">
            {project.tasks.map((task) => (
              <TaskItem
                key={task.id}
                task={task}
                onToggle={handleToggleTask}
                onDelete={handleDeleteTask}
              />
            ))}
          </ListGroup>
        )}
      </Card.Body>
    </Card>

    <CreateTaskModal
      show={showModal}
      onHide={() => setShowModal(false)}
      onCreate={handleCreateTask}
    />
  </Container>
</>
);
};
export default ProjectDetails;