import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Button, Alert, Spinner, Modal, Tab, Tabs } from 'react-bootstrap';
import Navbar from '../components/Navbar';
import ProjectCard from '../components/ProjectCard';
import CreateProjectModal from '../components/CreateProjectModal';
import ScheduleTimeline from '../components/ScheduleTimeline';
import ProductivityInsights from '../components/ProductivityInsights';
import { projectsAPI, schedulerAPI } from '../services/api';
import { Project, CreateProjectRequest, ScheduleResponse, ProductivityInsights as InsightsType, TaskConflict } from '../types';

const Dashboard: React.FC = () => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [scheduling, setScheduling] = useState(false);
  const [scheduleResponse, setScheduleResponse] = useState<ScheduleResponse | null>(null);
  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const [insights, setInsights] = useState<InsightsType | null>(null);
  const [activeTab, setActiveTab] = useState('projects');

  const fetchProjects = async () => {
    try {
      setLoading(true);
      const data = await projectsAPI.getAll();
      setProjects(data);
      setError('');
    } catch (err: any) {
      setError('Failed to load projects');
    } finally {
      setLoading(false);
    }
  };

  const fetchInsights = async () => {
    try {
      const data = await schedulerAPI.getInsights();
      setInsights(data);
    } catch (err: any) {
      console.error('Failed to load insights');
    }
  };

  useEffect(() => {
    fetchProjects();
    fetchInsights();
  }, []);

  const handleCreateProject = async (data: CreateProjectRequest) => {
    await projectsAPI.create(data);
    await fetchProjects();
  };

  const handleDeleteProject = async (id: number) => {
    if (window.confirm('Are you sure you want to delete this project? All tasks will be deleted.')) {
      try {
        await projectsAPI.delete(id);
        await fetchProjects();
      } catch (err: any) {
        setError('Failed to delete project');
      }
    }
  };

  const handleAutoSchedule = async () => {
    try {
      setScheduling(true);
      const response = await schedulerAPI.autoSchedule();
      setScheduleResponse(response);
      setShowScheduleModal(true);
      await fetchProjects(); // Refresh to show scheduled times
      await fetchInsights(); // Refresh insights
    } catch (err: any) {
      setError('Failed to schedule tasks: ' + (err.response?.data?.message || err.message));
    } finally {
      setScheduling(false);
    }
  };

  const getTotalTasks = () => {
    return projects.reduce((sum, project) => sum + project.tasks.length, 0);
  };

  const getIncompleteTasks = () => {
    return projects.reduce((sum, project) => 
      sum + project.tasks.filter(t => !t.isCompleted).length, 0
    );
  };

  return (
    <>
      <Navbar />
      <Container>
        <div className="d-flex justify-content-between align-items-center mb-4">
          <div>
            <h2>My Projects</h2>
            <p className="text-muted mb-0">
              {projects.length} projects • {getTotalTasks()} total tasks • {getIncompleteTasks()} pending
            </p>
          </div>
          <div className="d-flex gap-2">
            <Button 
              variant="success" 
              onClick={handleAutoSchedule}
              disabled={scheduling || getIncompleteTasks() === 0}
            >
              {scheduling ? (
                <>
                  <Spinner animation="border" size="sm" className="me-2" />
                  Scheduling...
                </>
              ) : (
                <>🤖 Auto-Schedule Tasks</>
              )}
            </Button>
            <Button variant="primary" onClick={() => setShowModal(true)}>
              + New Project
            </Button>
          </div>
        </div>

        {error && <Alert variant="danger" dismissible onClose={() => setError('')}>{error}</Alert>}

        {insights && <ProductivityInsights insights={insights} />}

        <Tabs
          activeKey={activeTab}
          onSelect={(k) => setActiveTab(k || 'projects')}
          className="mb-4"
        >
          <Tab eventKey="projects" title={`📁 Projects (${projects.length})`}>
            {loading ? (
              <div className="text-center py-5">
                <Spinner animation="border" variant="primary" />
                <p className="mt-3 text-muted">Loading projects...</p>
              </div>
            ) : projects.length === 0 ? (
              <div className="text-center py-5">
                <h4 className="text-muted">No projects yet</h4>
                <p className="text-muted">Create your first project to get started!</p>
                <Button variant="primary" onClick={() => setShowModal(true)}>
                  Create Project
                </Button>
              </div>
            ) : (
              <Row xs={1} md={2} lg={3} className="g-4">
                {projects.map((project) => (
                  <Col key={project.id}>
                    <ProjectCard project={project} onDelete={handleDeleteProject} />
                  </Col>
                ))}
              </Row>
            )}
          </Tab>

          <Tab eventKey="schedule" title="📅 Schedule">
            {scheduleResponse ? (
              <ScheduleTimeline scheduledTasks={scheduleResponse.scheduledTasks} />
            ) : (
              <Alert variant="info">
                Click "Auto-Schedule Tasks" to see your optimized schedule!
              </Alert>
            )}
          </Tab>
        </Tabs>

        <CreateProjectModal
          show={showModal}
          onHide={() => setShowModal(false)}
          onCreate={handleCreateProject}
        />

        {/* Schedule Result Modal */}
        <Modal show={showScheduleModal} onHide={() => setShowScheduleModal(false)} size="lg" centered>
          <Modal.Header closeButton>
            <Modal.Title>✅ Auto-Schedule Complete</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            {scheduleResponse && (
              <>
                <Alert variant={scheduleResponse.conflicts.length > 0 ? 'warning' : 'success'}>
                  {scheduleResponse.message}
                </Alert>

                {scheduleResponse.conflicts.length > 0 && (
                  <div className="mt-3">
                    <h6>⚠️ Detected Conflicts:</h6>
                    <ul>
                      {scheduleResponse.conflicts.map((conflict, idx) => (
                        <li key={idx}>
                          <strong>{conflict.task1Title}</strong> conflicts with{' '}
                          <strong>{conflict.task2Title}</strong>
                        </li>
                      ))}
                    </ul>
                    <small className="text-muted">
                      Consider adjusting task durations or due dates to resolve conflicts.
                    </small>
                  </div>
                )}

                <div className="mt-3">
                  <p className="mb-1">
                    <strong>Scheduled:</strong> {scheduleResponse.scheduledCount} / {scheduleResponse.totalTasks} tasks
                  </p>
                </div>
              </>
            )}
          </Modal.Body>
          <Modal.Footer>
            <Button variant="primary" onClick={() => {
              setShowScheduleModal(false);
              setActiveTab('schedule');
            }}>
              View Schedule
            </Button>
          </Modal.Footer>
        </Modal>
      </Container>
    </>
  );
};

export default Dashboard;