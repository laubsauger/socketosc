import React, {useCallback, useEffect, useState} from 'react';
import { observer } from 'mobx-react-lite';
import SessionInfo from "../../SessionInfo";
import {useStores} from "../../../hooks/useStores";
import {useNavigate, useParams} from "react-router-dom";
import {Button} from "react-bootstrap";

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
    <div className="Session">
      <Button className="mt-3" onClick={onBtnStopServerClick}>Disconnect from Session</Button>

      {  instanceId && socketStore.availableInstances.length &&
        <SessionInfo currentSession={socketStore.availableInstances.filter(item => item.id === Number(instanceId))[0]}/>
      }

      {/*<LinkButton path={`/session/${socketStore.currentInstance?.id}`} label={'Reconnect'} variant={'outline-warning'}/>*/}
    </div>
  )
};

export default observer(Session);