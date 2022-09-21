import { action, observable, makeAutoObservable } from 'mobx';
import { RootStore } from './rootStore';

export type ConnectionState = {
  connecting?: boolean;
  connected?: boolean;
  failed?: boolean;
  failReason?: string;
  joining?: boolean;
  joined?: boolean;
  rejected?: boolean;
  rejectReason?: string;
}

export type RoomState = {
  numCurrentUsers?: number;
  numMaxUsers?: number;
  currentSlot?: number;
}

export type Instance = {
  id: number,
  name: string,
  description: string,
  settings: {
    slots: number,
    randomPick: boolean,
    controls: {
      xy: boolean,
      buttons: number,
      fader: number,
    }
  }
}

export interface ISocketStore {
  connectionState: ConnectionState,
  roomState: RoomState,
}

const connectionStateStub = {
  connecting: false,
  connected: false,
  failed: false,
  failReason: '',
  joining: false,
  joined: false,
  rejected: false,
  rejectReason: '',
};

const roomStateStub = {
  numCurrentUsers: 0,
  numMaxUsers: 0,
  currentSlot: 0,
};

export class SocketStore implements ISocketStore {
  private rootStore: RootStore;

  @observable connectionState = Object.assign({}, connectionStateStub);
  @observable roomState = Object.assign({}, roomStateStub);
  @observable availableInstances:Instance[] = [];
  @observable currentInstance:Instance|undefined = undefined;

  constructor(rootStore: RootStore) {
    makeAutoObservable(this);

    this.rootStore = rootStore;
  }

  @action updateConnectionState(state:ConnectionState) {
    this.connectionState = {
      ...this.connectionState,
      ...state,
    }
  }

  @action resetConnectionState() {
    this.connectionState = Object.assign({}, connectionStateStub);
  }

  @action updateRoomState(state:RoomState) {
    this.roomState = {
      ...this.roomState,
      ...state,
    };
  }

  @action resetRoomState() {
    this.roomState = Object.assign({}, roomStateStub);
  }

  @action setAvailableInstances(instances:Instance[]) {
    console.log(instances);
    this.availableInstances = instances;
  }

  @action setCurrentInstance(instance:Instance|undefined) {
    this.currentInstance = instance;
  }
}