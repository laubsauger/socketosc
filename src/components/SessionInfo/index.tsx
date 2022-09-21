import React, {useCallback, useEffect, useState} from 'react';
import {Col, Container, Row} from "react-bootstrap";
import { observer } from 'mobx-react-lite';
import { useStores } from "../../hooks/useStores";
import './styles.scss';
import config from "../../config";

const SessionInfo = (props:any) => {
  const { currentSession } = props;
  const { socketStore } = useStores();

  const [ logItems, setLogItems ] = useState<any[]>([]);

  // @todo: throttle/batch this to not crash the webview when bursting lots (and avoid rerunning useEffect all the time)
  const onReceiveFromMain = useCallback((data:any) => {
    // console.log(`Received from main process`, data);

    // console.log('useCallback ran')
    const item = { id: logItems.length + 1, message: data };
    setLogItems([ ...logItems, item ]);
  }, [ logItems ]);

  useEffect(() => {
    // console.log('useEffect ran')
    //@ts-ignore
    window.electronAPI.receive('fromMain', onReceiveFromMain);

    return () => {
      //@ts-ignore
      window.electronAPI.stopReceive('fromMain');
    }
  }, [onReceiveFromMain]);

  return (
    <Container className="SessionInfo pointer-events-none mt-5">
      <Row>
        <Col lg={5}>
          <Col lg={6} md={12} className="mb-md-3 mb-sm-3">
            <h6 className="text-muted">Session</h6>
            <div>{ currentSession.id } | { `${config.socketRoomPrefix}:${currentSession.id}` }</div>
          </Col>
          <Col lg={6} md={12} className="mb-md-3 mb-sm-3">
            <h6 className="text-muted">Name</h6>
            <div>{ currentSession.name }</div>
          </Col>
          <Col lg={3} md={6} className="mb-sm-3">
            <h6 className="text-muted">Settings</h6>
            <div>
              <div>slots: { currentSession.settings.slots }</div>
              <div>random pick: { JSON.stringify(currentSession.settings.randomPick) }</div>
            </div>
          </Col>
          <Col lg={3} md={6}>
            <h6 className="text-muted">Controls</h6>
            <div>
              { Object.entries(currentSession.settings.controls).map(([key, val]) =>
                <div key={ key }>
                  <div>{ key }: {JSON.stringify(val)}</div>
                </div>
              )}
            </div>
          </Col>
        </Col>
        <Col lg={7}>
          <div>Session Log</div>
          <div className="mt-3 font-monospace small opacity-50 modal-dialog-scrollable">
            { logItems.map(item =>
              <div key={item.id}><span className="small text-muted ">#{item.id}</span> {JSON.stringify(item.message)}</div>
            )}
          </div>
        </Col>
      </Row>
    </Container>
  )
};

export default observer(SessionInfo);