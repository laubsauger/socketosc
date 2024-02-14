import React, {useCallback} from 'react';
import { observer } from 'mobx-react-lite';
import {Card, Col, Form, InputGroup, Row} from "react-bootstrap";
import SessionList from "../../SessionList";
import {useStores} from "../../../hooks/useStores";
import { Link } from 'react-router-dom';

const Home: React.FC = (props) => {
  const { socketStore } = useStores();

  const handleLocalPortNumberChange = useCallback((ev) => {
    const portNumber = Number(ev.target.value);

    if (portNumber) {
      socketStore.setOscLocalPort(portNumber);
    }
  }, [socketStore]);

  const handleRemotePortNumberChange = useCallback((ev) => {
    const portNumber = Number(ev.target.value);

    if (portNumber) {
      socketStore.setOscRemotePort(portNumber);
    }
  }, [socketStore]);

  return (
    <Col className="mt-4">
      <Card>
        <Card.Body className="text-center">
          <Card.Title>Select session to join</Card.Title>
          <div>
            <div>Requires proper local setup to connect to your devices via OSC-over-UDP</div>
            <a href={'https://github.com/laubsauger/socketosc/blob/main/README.md'} target="_blank" rel={'nofollow noopener noreferrer'} className="text-muted">
              Learn more
            </a>
          </div>

          <Row className="bg-black rounded-3 p-2 d-flex justify-content-between mt-2">
            <Col xs={12} lg={6} className="mb-2">
              <Form.Group className="d-flex align-items-center justify-content-between gap-2" controlId="remote-port-input">
                <Form.Label className="flex-shrink-0 mb-0">Remote OSC Port (UDP)</Form.Label>
                <InputGroup className="ms-2 w-50">
                  <Form.Control name="remote-port-input"
                                type="number"
                                min="1"
                                max="65535"
                                required={true}
                                onChange={handleRemotePortNumberChange}
                                defaultValue={socketStore.oscRemotePort}
                  />
                </InputGroup>
              </Form.Group>
            </Col>
            <Col xs={12} lg={6}>
              <Form.Group className="d-flex align-items-center justify-content-between gap-2" controlId="local-port-input">
                <Form.Label className="flex-shrink-0 mb-0">Local OSC Port (UDP)</Form.Label>
                <InputGroup className="ms-2 w-50">
                  <Form.Control name="local-port-input"
                                type="number"
                                min="1"
                                max="65535"
                                required={true}
                                onChange={handleLocalPortNumberChange}
                                defaultValue={socketStore.oscLocalPort}
                  />
                </InputGroup>
              </Form.Group>
            </Col>
          </Row>

          <SessionList />

        </Card.Body>
      </Card>
    </Col>
  )
};

export default observer(Home);