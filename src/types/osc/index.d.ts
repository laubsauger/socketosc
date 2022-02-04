import EventEmitter from "osc/bower_components/eventEmitter/EventEmitter";

type UDPPortOptions = {
  localAddress: string,
  localPort: number,
  remoteAddress?: string,
  remotePort?: number,
}

type MessageArg = {
  type: string,
  value: string,
}

type Message = {
  address: string
  args: {
    type: string,
    value: any,
  }[],
}

declare module osc {
  class UDPPort {
    constructor(options:UDPPortOptions)

    on(eventName: string, listenerFn: Function): EventEmitter
    open(): any
    send(msg: Message): any
    options: UDPPortOptions
  }
}

export = osc;
