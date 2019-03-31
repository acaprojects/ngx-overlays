
import { Injector } from '@angular/core';
import { Overlay, OverlayRef, OverlayConfig } from '@angular/cdk/overlay';
import { ComponentPortal } from '@angular/cdk/portal';
import { Subject, Subscription } from 'rxjs';

import { OverlayService, IOverlayConfig } from './overlay.service';
import { PortalInjector } from './portal-injector.class';
import { OverlayOutletComponent } from '../components/overlay-outlet/overlay-outlet.component';

/** Various types of overlay events */
type IOverlayEventType = 'close' | 'backdrop_click' | 'event' | 'finish' | 'other' | 'reopen';

export interface IOverlayEvent<T> {
    /** Type of overlay event */
    type: IOverlayEventType;
    /** Overlay context */
    data: T;
}

export class OverlayItem<T = any> {
    /** Event handler for close events */
    public onClose = new Subject<IOverlayEvent<T>>();
    /** Event handler for general events */
    public event = new Subject<IOverlayEvent<T>>();
    /** Reference to Angular overlay */
    private _overlay: OverlayRef;

    /** Subscription handlers for Overlay events */
    public subs: Subscription[] = [];

    constructor(
        private id: string,
        private service: OverlayService,
        private injector: Injector,
        private overlay: Overlay,
        readonly details: IOverlayConfig<T>
        ) {
            this._overlay = this.overlay.create(this.details.config as OverlayConfig);
            this._overlay.backdropClick().subscribe(() => this._close('backdrop_click', null));
    }

    public open(data: T, config?: OverlayConfig) {
        if (this._overlay) { this._close('reopen', null); }
        if (config) {
            delete this._overlay;
            this._overlay = this.overlay.create(config);
            this._overlay.backdropClick().subscribe(() => this._close('backdrop_click', null));
        }
        const injector = this._createInjector(this, this.injector);
        this.onClose = new Subject<IOverlayEvent<T>>();
        this.event = new Subject<IOverlayEvent<T>>();
        this._overlay.attach(new ComponentPortal(OverlayOutletComponent, null, injector));
        this.set(data);
    }

    public set(data: T) {

    }

    public get content() {
        return this.details.content;
    }

    public update(config?: OverlayConfig) {
        this.open(this.details.data, config || this.details.config as OverlayConfig);
    }

    public listen(next: (data: IOverlayEvent<T>) => void) {
        const sub = this.event.subscribe(next);
        this.subs.push(sub);
        return sub;
    }

    public post(type: IOverlayEventType, data?: T) {
        this.event.next({ type, data });
    }

    public close(data?: T) {
        this._close('close', data);
    }

    private _close(type: IOverlayEventType, data: T) {
        if (this._overlay) { this._overlay.dispose(); }
        if (type !== 'reopen') {
            this.onClose.next({ type, data });
        }
        this.onClose.complete();
        this.event.complete();
        this.subs = [];
    }

    private _createInjector(ref: OverlayItem, injector: Injector) {
        const tokens = new WeakMap([[OverlayItem, ref]]);
        return new PortalInjector(injector, tokens);
      }
}
