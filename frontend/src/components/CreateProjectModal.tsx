import React, { useState } from 'react';
import { Modal, Button, Form, Alert } from 'react-bootstrap';
import { CreateProjectRequest } from '../types';

interface CreateProjectModalProps {
  show: boolean;
  onHide: () => void;
  onCreate: (data: CreateProjectRequest) => Promise<void>;
}

const CreateProjectModal: React.FC<CreateProjectModalProps> = ({ show, onHide, onCreate }) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (title.trim().length < 3) {
      setError('Title must be at least 3 characters long');
      return;
    }

    if (title.trim().length > 100) {
      setError('Title must be less than 100 characters');
      return;
    }

    if (description.trim().length > 500) {
      setError('Description must be less than 500 characters');
      return;
    }

    setLoading(true);
    try {
      await onCreate({
        title: title.trim(),
        description: description.trim() || undefined,
      });
      setTitle('');
      setDescription('');
      onHide();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to create project');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal show={show} onHide={onHide} centered>
      <Modal.Header closeButton>
        <Modal.Title>Create New Project</Modal.Title>
      </Modal.Header>
      <Form onSubmit={handleSubmit}>
        <Modal.Body>
          {error && <Alert variant="danger">{error}</Alert>}
          
          <Form.Group className="mb-3">
            <Form.Label>Title *</Form.Label>
            <Form.Control
              type="text"
              placeholder="Enter project title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              minLength={3}
              maxLength={100}
            />
            <Form.Text className="text-muted">
              {title.length}/100 characters
            </Form.Text>
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>Description (Optional)</Form.Label>
            <Form.Control
              as="textarea"
              rows={3}
              placeholder="Enter project description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              maxLength={500}
            />
            <Form.Text className="text-muted">
              {description.length}/500 characters
            </Form.Text>
          </Form.Group>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={onHide}>
            Cancel
          </Button>
          <Button variant="primary" type="submit" disabled={loading}>
            {loading ? 'Creating...' : 'Create Project'}
          </Button>
        </Modal.Footer>
      </Form>
    </Modal>
  );
};

export default CreateProjectModal;