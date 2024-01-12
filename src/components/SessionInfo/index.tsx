import React from 'react';
import {Col, Row} from "react-bootstrap";
import { observer } from 'mobx-react-lite';
import config from "../../config";

const SessionInfo = (props:any) => {
  const { currentSession } = props;

  return (
    <Row className="mb-3">
      <Col lg={6} md={6} className="mb-md-3 mb-sm-3">
        <h6 className="text-muted">Session</h6>
        <div>{ currentSession.id } | { `${config.socketRoomPrefix}:${currentSession.id}` }</div>
      </Col>
      <Col lg={6} md={6} className="mb-md-3 mb-sm-3">
        <h6 className="text-muted">Name</h6>
        <div>{ currentSession.name }</div>
      </Col>
      <Col lg={6} md={6} className="mb-sm-3">
        <h6 className="text-muted">Settings</h6>
        <div>
          <div>slots: { currentSession.settings.slots }</div>
          <div>randomPick: { JSON.stringify(currentSession.settings.randomPick) }</div>
          <div>slotPick: { JSON.stringify(currentSession.settings.slotPick) }</div>
          <div>sequentialPick: { JSON.stringify(currentSession.settings.sequentialPick) }</div>
        </div>
      </Col>
      <Col lg={6} md={6}>
        <h6 className="text-muted">Controls</h6>
        <div>
          { Object.entries(currentSession.settings.controls).map(([key, val]) =>
            <div key={ key }>
              <div>{ key }: {JSON.stringify(val)}</div>
            </div>
          )}
        </div>
      </Col>
    </Row>
  )
};

export default observer(SessionInfo);