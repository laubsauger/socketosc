import React, {useEffect, useState} from 'react';
// import './styles.scss';
import {Accordion, Button, Col, Row} from "react-bootstrap";
import {observer} from "mobx-react-lite";
import {useStores} from "../../hooks/useStores";
import LoadingSpinner from "../LoadingSpinner";
import config from "../../config";
import LinkButton from "../LinkButton";

const SessionList = () => {
  const { socketStore } = useStores();
  const [ isLoadingInstances, setIsLoadingInstances ] = useState(true);

  useEffect(() => {
    setIsLoadingInstances(true);

    fetch(`${config.webSocketHost}/api/instances.json`)
      .then(response => response.json())
      .then(data => {
        socketStore.setAvailableInstances(data);
        setIsLoadingInstances(false);
      }).catch(() => {
        socketStore.setAvailableInstances([]);
        setIsLoadingInstances(false);
      });
  },[ socketStore ]);

  return (
    <Col className="mt-3">
      <div>
        <h5 className="mb-3">Available Sessions</h5>
        { isLoadingInstances && <LoadingSpinner size='small'/> }
        { !isLoadingInstances && socketStore.availableInstances.length ?
          <Accordion >
            { socketStore.availableInstances.map(instance =>
              <Accordion.Item key={instance.id} eventKey={String(instance.id)}>
                <Accordion.Header>{ instance.name }</Accordion.Header>
                {/*<Accordion.Header>{ instance.name } :: { instance.id } :::: { instance.id } :: </Accordion.Header>*/}
                <Accordion.Body>
                  <Row>
                    <Col lg={6} md={12} className="mb-3">
                      <h6 className="text-muted">Description</h6>
                      <div>{ instance.description }</div>
                    </Col>
                    <Col lg={3} md={6} className="mb-3">
                      <h6 className="text-muted">Settings</h6>
                      <div>
                        <div>slots: {instance.settings.slots}</div>
                        <div>randomPick: {JSON.stringify(instance.settings.randomPick)}</div>
                        <div>slotPick: {JSON.stringify(instance.settings.slotPick)}</div>
                        <div>sequentialPick: {JSON.stringify(instance.settings.sequentialPick)}</div>
                      </div>
                    </Col>
                    <Col lg={3} md={6}>
                      <h6 className="text-muted">Controls</h6>
                      <div>
                        {Object.entries(instance.settings.controls).map(([key, val]) =>
                          <div key={ key }>
                            <div>{ key }: {JSON.stringify(val)}</div>
                          </div>
                        )}
                      </div>
                    </Col>

                    <div>
                      <hr/>
                      <LinkButton path={`/session/${instance.id}`} label={'Connect'} variant={'outline-info'}/>
                    </div>
                  </Row>
                </Accordion.Body>
              </Accordion.Item>
            )}
          </Accordion>
          :
          <div>No sessions found.</div>
        }
      </div>
    </Col>
  )
};

export default observer(SessionList);