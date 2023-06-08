import { Injectable, inject } from '@angular/core';
import { select, Store } from '@ngrx/store';

import * as UsersActions from './users.actions';
import * as UsersSelectors from './users.selectors';
import { CreateUserDTO } from '../users-dto.model';
import { Observable, of, switchMap } from 'rxjs';
import { UsersEntity } from './users.entity';

@Injectable()
export class UsersFacade {
  private readonly store = inject(Store);

  /**
   * Combine pieces of state using createSelector,
   * and expose them as observables through the facade.
   */
  status$ = this.store.pipe(select(UsersSelectors.selectUsersStatus));
  allUsers$ = this.store.pipe(select(UsersSelectors.selectAllUsers));
  selectedUsers$ = this.store.pipe(select(UsersSelectors.selectEntity));

  /**
   * Use the initialization action to perform one
   * or more tasks in your Effects.
   */
  init() {
    this.store.dispatch(UsersActions.initUsers());
  }

  deleteUser(id: number) {
    this.store.dispatch(UsersActions.deleteUser({ id }))
  }

  addUser(userData: CreateUserDTO) {
    this.store.dispatch(UsersActions.addUser({ userData }))
  }

  editUser(userData: CreateUserDTO, id: number) {
    this.store.dispatch(UsersActions.editUser({ userData, id }));
  }

  getUserFromStore(id: number) {
    return this.store.select(UsersSelectors.selectUserById(id))
      .pipe(
        switchMap((user: UsersEntity | undefined): Observable<UsersEntity> => {
          if (user) {
            return of(user);
          } else {
            this.loadUser(id);
            this.init();
           return this.getUserFromStore(id)
          }
        })
      )
  }

  loadUser(id: number) {
    this.store.dispatch(UsersActions.loadUser({ id }))
  }


}
