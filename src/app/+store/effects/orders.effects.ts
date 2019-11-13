import { Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { of } from 'rxjs';
import { map, mergeMap, catchError, tap, switchMap } from 'rxjs/operators';
import * as actions from '../actions/orders.actions';
import { Router } from '@angular/router';
import { OrdersService } from '../../core/services/orders.service';
import { clearCart } from '../actions/cart.actions';

@Injectable()
export class OrdersEffects {
  loadOrders$ = createEffect(() => this.actions$.pipe(
    ofType(actions.loadOrders),
    mergeMap(() => this.ordersService.getOrders()
      .pipe(
        map(orders => actions.ordersLoaded({orders})),
        catchError((error) => of(actions.ordersLoadFailed({error})))
      ))
    ));

  createOrder$ = createEffect(() => this.actions$.pipe(
    ofType(actions.addOrder),
    mergeMap(arg => this.ordersService.createOrder(arg.order)
      .pipe(
        map(order => actions.orderAdded({order})),
        catchError((error) => of(actions.orderAddFailed({error})))
      ))
    ));

  updateOrder$ = createEffect(() => this.actions$.pipe(
    ofType(actions.updateOrder),
    mergeMap(arg => this.ordersService.updateOrder(arg.order)
      .pipe(
        switchMap(order => [
          actions.orderUpdated({order}),
          clearCart
        ]),
        catchError((error) => of(actions.orderUpdateFailed({error})))
      ))
    ));

  orderCreated$ = createEffect(() => this.actions$.pipe(
      ofType(actions.orderAdded),
      tap(() => {
        alert('Order created!');
        this.router.navigate(['products-list']);
      })),
      { dispatch: false }
    );

  orderUpdated$ = createEffect(() => this.actions$.pipe(
    ofType(actions.orderUpdated),
    tap(() => this.router.navigate(['admin']))),
    { dispatch: false }
  );

  deleteOrder$ = createEffect(() => this.actions$.pipe(
    ofType(actions.deleteOrder),
    mergeMap(arg => this.ordersService.deleteOrder(arg.order)
      .pipe(
        map(() => actions.orderDeleted({order: arg.order})),
        catchError((error) => of(actions.orderDeleteFailed({error})))
      ))
    ));

  constructor(
    private actions$: Actions,
    private ordersService: OrdersService,
    private router: Router
  ) {}
}
