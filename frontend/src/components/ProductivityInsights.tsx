import React from 'react';
import { Card, Row, Col, ProgressBar } from 'react-bootstrap';
import { ProductivityInsights as InsightsType } from '../types';

interface ProductivityInsightsProps {
  insights: InsightsType;
}

const ProductivityInsights: React.FC<ProductivityInsightsProps> = ({ insights }) => {
  return (
    <Card className="shadow-sm mb-4">
      <Card.Header className="bg-info text-white">
        <h5 className="mb-0">📊 Your Productivity Insights</h5>
      </Card.Header>
      <Card.Body>
        <Row className="g-3">
          <Col md={4}>
            <div className="text-center p-3 bg-light rounded">
              <h3 className="text-primary mb-1">{insights.completedTasksThisWeek}</h3>
              <small className="text-muted">Tasks Completed This Week</small>
            </div>
          </Col>
          <Col md={4}>
            <div className="text-center p-3 bg-light rounded">
              <h3 className="text-success mb-1">{insights.onTimeDeliveryRate}%</h3>
              <small className="text-muted">On-Time Delivery Rate</small>
              <ProgressBar 
                now={insights.onTimeDeliveryRate} 
                variant="success" 
                className="mt-2"
                style={{ height: '8px' }}
              />
            </div>
          </Col>
          <Col md={4}>
            <div className="text-center p-3 bg-light rounded">
              <h3 className="text-warning mb-1">{insights.overdueTasks}</h3>
              <small className="text-muted">Overdue Tasks</small>
            </div>
          </Col>
        </Row>

        <hr />

        <Row className="mt-3">
          <Col md={6}>
            <div className="d-flex align-items-center mb-2">
              <span className="me-2">⏱️</span>
              <div>
                <strong>Average Completion Time</strong>
                <div className="text-muted">{insights.averageCompletionTime} hours per task</div>
              </div>
            </div>
          </Col>
          <Col md={6}>
            <div className="d-flex align-items-center mb-2">
              <span className="me-2">🌟</span>
              <div>
                <strong>Most Productive Hour</strong>
                <div className="text-muted">{insights.mostProductiveHour}</div>
              </div>
            </div>
          </Col>
          <Col md={6}>
            <div className="d-flex align-items-center">
              <span className="me-2">📅</span>
              <div>
                <strong>Most Productive Day</strong>
                <div className="text-muted">{insights.mostProductiveDay}</div>
              </div>
            </div>
          </Col>
        </Row>
      </Card.Body>
    </Card>
  );
};

export default ProductivityInsights;