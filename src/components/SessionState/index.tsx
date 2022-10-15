import React, {useCallback, useEffect, useState} from 'react';
import {Col, Row} from "react-bootstrap";
import { observer } from 'mobx-react-lite';
import config from "../../config";

const SessionState = () => {
  const [ infoData, setInfoData ] = useState<any>({});
  // const [ activityData, setActivityData ] = useState<any>({});

  const onReceivePushInfo = useCallback((data:any) => {
    console.log('info', data);
    setInfoData(data);
  }, [  ]);

  // const onReceivePushActivity = useCallback((data:any) => {
  //   setActivityData(data);
  // }, [  ]);


  useEffect(() => {
    //@ts-ignore
    window.electronAPI.receive('pushInfo', onReceivePushInfo);
    // //@ts-ignore
    // window.electronAPI.receive('pushActivity', onReceivePushActivity);

    return () => {
      //@ts-ignore
      window.electronAPI.stopReceive('pushInfo');
      // //@ts-ignore
      // window.electronAPI.stopReceive('pushActivity');
    }
  }, [ onReceivePushInfo ]);
  return (
    <Row className="mb-3">
      <Col>
        <div>Users: { infoData.usedSlots }</div>
      </Col>
    </Row>
  )
};

export default observer(SessionState);