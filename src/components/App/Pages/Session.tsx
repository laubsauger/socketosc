import React, {useCallback, useEffect, useState} from 'react';
import { observer } from 'mobx-react-lite';
import SessionInfo from "../../SessionInfo";
import {useStores} from "../../../hooks/useStores";
import {useParams} from "react-router-dom";

const Session: React.FC = (props) => {
  const { socketStore } = useStores();
  const { instanceId } = useParams();

  useEffect(() => {
    if (instanceId) {
      console.log('starting server', instanceId);
      //@ts-ignore
      window.electronAPI.serverStart(instanceId);
    }

    return () => {
      // @todo: clean up, leave room, shutdown server
      //@ts-ignore
      window.electronAPI.serverStop();
    }
  }, [ instanceId ])

  return (
    <div className="Session">
      <SessionInfo currentSession={socketStore.availableInstances.filter(item => item.id === Number(instanceId))[0]}/>

      {/*<Button onClick={updatePageTitle}>Change Title</Button>*/}

      {/*<LinkButton path={`/session/${socketStore.currentInstance?.id}`} label={'Reconnect'} variant={'outline-warning'}/>*/}
    </div>
  )
};

export default observer(Session);