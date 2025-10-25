import React, { useState } from 'react';
import { Modal, Button, Form, Alert } from 'react-bootstrap';
import { CreateTaskRequest, TaskPriority } from '../types';

interface CreateTaskModalProps {
  show: boolean;
  onHide: () => void;
  onCreate: (data: CreateTaskRequest) => Promise<void>;
}

const CreateTaskModal: React.FC<CreateTaskModalProps> = ({ show, onHide, onCreate }) => {
  const [title, setTitle] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [priority, setPriority] = useState<TaskPriority>(TaskPriority.Medium);
  const [estimatedHours, setEstimatedHours] = useState(1);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (title.trim().length === 0) {
      setError('Title is required');
      return;
    }

    if (estimatedHours < 1 || estimatedHours > 24) {
      setError('Estimated hours must be between 1 and 24');
      return;
    }

    setLoading(true);
    try {
      await onCreate({
        title: title.trim(),
        dueDate: dueDate || undefined,
        priority,
        estimatedHours,
      });
      setTitle('');
      setDueDate('');
      setPriority(TaskPriority.Medium);
      setEstimatedHours(1);
      onHide();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to create task');
    } finally {
      setLoading(false);
    }
  };

  const getPriorityBadgeColor = (p: TaskPriority) => {
    switch (p) {
      case TaskPriority.High: return 'danger';
      case TaskPriority.Medium: return 'warning';
      case TaskPriority.Low: return 'secondary';
    }
  };

  return (
    <Modal show={show} onHide={onHide} centered>
      <Modal.Header closeButton>
        <Modal.Title>Create New Task</Modal.Title>
      </Modal.Header>
      <Form onSubmit={handleSubmit}>
        <Modal.Body>
          {error && <Alert variant="danger">{error}</Alert>}
          
          <Form.Group className="mb-3">
            <Form.Label>Task Title *</Form.Label>
            <Form.Control
              type="text"
              placeholder="Enter task title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
            />
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>Priority *</Form.Label>
            <Form.Select
              value={priority}
              onChange={(e) => setPriority(Number(e.target.value) as TaskPriority)}
            >
              <option value={TaskPriority.High}>🔴 High Priority</option>
              <option value={TaskPriority.Medium}>🟡 Medium Priority</option>
              <option value={TaskPriority.Low}>🟢 Low Priority</option>
            </Form.Select>
            <Form.Text className="text-muted">
              High priority tasks are scheduled first in morning hours
            </Form.Text>
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>Estimated Hours *</Form.Label>
            <Form.Control
              type="number"
              min="1"
              max="24"
              value={estimatedHours}
              onChange={(e) => setEstimatedHours(Number(e.target.value))}
              required
            />
            <Form.Text className="text-muted">
              How long will this task take? (1-24 hours)
            </Form.Text>
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>Due Date (Optional)</Form.Label>
            <Form.Control
              type="date"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
              min={new Date().toISOString().split('T')[0]}
            />
          </Form.Group>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={onHide}>
            Cancel
          </Button>
          <Button variant="primary" type="submit" disabled={loading}>
            {loading ? 'Creating...' : 'Create Task'}
          </Button>
        </Modal.Footer>
      </Form>
    </Modal>
  );
};

export default CreateTaskModal;