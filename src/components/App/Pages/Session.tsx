import React, {useCallback, useEffect, useState} from 'react';
import { observer } from 'mobx-react-lite';
import SessionInfo from "../../SessionInfo";
import {useStores} from "../../../hooks/useStores";
import {useNavigate, useParams} from "react-router-dom";
import {Button, Col, Container, Row} from "react-bootstrap";
import SessionLog from "../../SessionLog";
import SessionState from "../../SessionState";
import LinkButton from '../../LinkButton';

const Session: React.FC = (props) => {
  const navigate = useNavigate();
  const { socketStore } = useStores();
  const { instanceId } = useParams();

  useEffect(() => {
    if (!socketStore.availableInstances.length) {
      return;
    }

    if (instanceId) {
      console.log('starting server', 'instance: ', instanceId, 'localPort:', socketStore.oscLocalPort, 'remotePort:', socketStore.oscRemotePort);
      //@ts-ignore
      window.electronAPI.serverStart(instanceId, socketStore.oscLocalPort, socketStore.oscRemotePort);
    } else {
      // navigate('/');
    }

    return () => {
      //@ts-ignore
      window.electronAPI.serverStop();
    }
  }, [ socketStore.availableInstances, instanceId, socketStore.oscLocalPort, socketStore.oscRemotePort])

  const onBtnStopServerClick = () => {
    navigate('/');
  }

  return (
    <div className="Session mt-4">
      <Row>
        { instanceId && socketStore.availableInstances.length &&
          <Col xs={12} md={6}>
            <SessionInfo currentSession={socketStore.availableInstances.filter(item => item.id === Number(instanceId))[0]}/>
          </Col>
        }

        <Col xs={12} md={6} className="text-center">
          <Button className="mb-3" onClick={onBtnStopServerClick}>Disconnect from Session</Button>

          <SessionState />
        </Col>

        <hr/>

        <Col lg={12}>
          <SessionLog />
        </Col>
      </Row>

      {/*<LinkButton path={`/session/${socketStore.currentInstance?.id}`} label={'Reconnect'} variant={'outline-warning'}/>*/}
    </div>
  )
};

export default observer(Session);