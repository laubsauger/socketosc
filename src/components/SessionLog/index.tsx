import React, {useCallback, useEffect, useRef, useState} from 'react';
import { observer } from 'mobx-react-lite';

const SessionLog = () => {
  const bottomRef = useRef(null);
  const [ logItems, setLogItems ] = useState<any[]>([]);

  // @todo: throttle/batch this to not crash the webview when bursting lots (and avoid rerunning useEffect all the time)
  const onReceivePushLog = useCallback((data:any) => {
    const item = { message: data };
    setLogItems([ ...logItems.slice(-200), item]);
  }, [ logItems ]);

  useEffect(() => {
    //@ts-ignore
    window.electronAPI.receive('pushLog', onReceivePushLog);

    return () => {
      //@ts-ignore
      window.electronAPI.stopReceive('pushLog');
    }
  }, [ onReceivePushLog ]);

  useEffect(() => {
    //@ts-ignore
    bottomRef.current?.scrollIntoView();
  }, [ logItems ]);

  return (
    <div>
      <div className="text-muted">Session Log</div>
      <div className="mt-3 font-monospace small opacity-50 modal-dialog-scrollable bg-black p-1" style={{ height: '350px', overflow: 'scroll' }}>
        { logItems.map((item, index) =>
          <div ref={bottomRef} key={index} className='text-nowrap'><span className="small text-muted ">{'>'}</span> {JSON.stringify(item.message)}</div>
        )}
      </div>
    </div>
  )
};

export default observer(SessionLog);