import { action, observable, makeAutoObservable } from 'mobx';
import { RootStore } from './rootStore';

export interface IUserStore {
  id: string;
  name?: string;
  pic?: string;
}

export class UserStore implements IUserStore {
  private rootStore: RootStore;

  @observable id = '';
  @observable name = '';
  @observable pic = '';

  constructor(rootStore: RootStore) {
    makeAutoObservable(this);

    this.rootStore = rootStore;
  }

  @action getName = (name: string): void => {
    // if (rootStore.authStore.id) {
      this.name = name;
    // }
  }
}