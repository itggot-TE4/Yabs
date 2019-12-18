import Vue from 'vue';
import {
  VuexModule,
  Module,
  getModule,
  Action,
  Mutation,
} from 'vuex-module-decorators';
import store from '..';
import UsersAPI from '../../api/users';
import convertList from '@/helpers/convertArrayToNested';
import convertNested from '@/helpers/convertNestedToArray';

export interface User {
  created_at: string; //eslint-disable-line camelcase
  email: string;
  google_token: string; //eslint-disable-line camelcase
  klass: string;
  name: string;
  photo_path: string; //eslint-disable-line camelcase
  role: number;
  uid: number;
  updated_at: string; //eslint-disable-line camelcase
}

export interface UserCollection { [uid: number]: User; }

@Module({dynamic: true, namespaced: true, name: 'UsersModule', store})
class UsersModule extends VuexModule {
  private _failure: object = {};
  public _users: UserCollection = {};
  private _currentUser: number = 0;

  get currentUserID(): number {
    return this._currentUser;
  }

  get all(): UserCollection {
    return this._users;
  }

  get allAsArray(): User[] {
    return convertNested(this._users);
  }

  get currentUser(): User {
    return this._users[this._currentUser];
  }

  @Action({rawError: true})
  public fetchAll(): Promise<object> {
    return new Promise((resolve, reject) => {
      UsersAPI.all()
        .then((response: User[]) => {
          this.convertUserList(response);
          resolve(this._users);
        })
        .catch((error: object) => {
          this.setFailure(error);
          reject(error);
        });
    });
  }

  @Action({rawError: true})
  public update(request: object): Promise<object> {
    return new Promise((resolve, reject) => {
      UsersAPI.update(request)
        .then((response: User) => {
          this.setUser(response);
          this.setCurrentUser(response);
          resolve(response);
        })
        .catch((error: object) => {
          reject(error);
        });
    });
  }

  @Action({rawError: true})
  public signIn(request: string): Promise<object> {
    return new Promise((resolve, reject) => {
      UsersAPI.signIn(request)
        .then((response: User) => {
          this.setCurrentUser(response);
          this.fetchAll();
          resolve(response);
        })
        .catch((error: object) => {
          this.setFailure(error);
          reject(error);
        });
    });
  }

  @Action({rawError: true})
  public signOut(): Promise<object> {
    return new Promise((resolve, reject) => {
      UsersAPI.signOut()
        .then((response: User) => {
          this.setCurrentUser(response);
          resolve(response);
        })
        .catch((error: object) => {
          reject(error);
        });
    });
  }

  @Mutation
  public setUser(payload: User): void {
    Vue.set(this._users, payload.uid, payload);
  }

  @Mutation
  public setCurrentUser(payload: User): void {
    this._currentUser = payload.uid;
  }

  @Mutation
  public setFailure(payload: object): void {
    console.log(payload);
    // This should fix end to end tests(yarn build)
  }

  @Mutation
  public convertUserList(payload: User[]): void {
    const list = convertList(payload, 'uid');
    this._users = list;
  }
}

export default getModule(UsersModule);
