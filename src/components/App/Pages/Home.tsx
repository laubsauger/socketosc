import React from 'react';
import { observer } from 'mobx-react-lite';
import {Card, Col} from "react-bootstrap";
import SessionList from "../../SessionList";

const Home: React.FC = (props) => {
  return (
    <Col className="mt-4">
      <Card>
        <Card.Body className="text-center">
          <Card.Title>Select session to join</Card.Title>
          <Card.Text>
            Requires proper local setup to connect to your devices via OSC-over-UDP
            <div className="text-muted">
              Learn more
            </div>
          </Card.Text>

          <SessionList />

        </Card.Body>
      </Card>
    </Col>
  )
};

export default observer(Home);