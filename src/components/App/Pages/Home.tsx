import React from 'react';
import { observer } from 'mobx-react-lite';
import {Button, Card, Col} from "react-bootstrap";
import { Link } from "react-router-dom";

const Home: React.FC = (props) => {
  return (
    <Col className="mt-5 offset-lg-2 col-lg-8 col-md-12">
      <Card>
        <Card.Body className="text-center">
          <Card.Title>OSC control at your fingertips</Card.Title>
          <Card.Text>Participate in live projection mapping</Card.Text>
          <Link to={'/join'}>
            <Button variant="outline-info">Join session</Button>
          </Link>
        </Card.Body>
      </Card>
    </Col>
  )
};

export default observer(Home);