import { Injector } from '@angular/core';
import {
    Overlay,
    OverlayRef,
    OverlayConfig,
    FlexibleConnectedPositionStrategy
} from '@angular/cdk/overlay';
import { ComponentPortal } from '@angular/cdk/portal';
import { Subject, Subscription, BehaviorSubject } from 'rxjs';

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
    /** Subject to store the active position of the tooltip */
    private position_subject = new BehaviorSubject<{ x: string; y: string }>(null);

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

    /**
     * Inject overlay contents onto view
     * @param data Context data
     * @param config Overlay configuration
     */
    public open(data: T, config?: OverlayConfig) {
        if (this._overlay) {
            this._close('reopen', null);
        }
        if (config) {
            delete this._overlay;
            this._overlay = this.overlay.create(config);
            this._overlay.backdropClick().subscribe(() => this._close('backdrop_click', null));
        }
        const injector = this._createInjector(this, this.injector);
        this.onClose = new Subject<IOverlayEvent<T>>();
        this.event = new Subject<IOverlayEvent<T>>();
        this._overlay.attach(new ComponentPortal(OverlayOutletComponent, null, injector));
        if (config.positionStrategy && (config.positionStrategy as FlexibleConnectedPositionStrategy).positionChanges) {
            const pos = config.positionStrategy as FlexibleConnectedPositionStrategy;
            pos.positionChanges.subscribe(p =>
                this.position_subject.next({ x: p.connectionPair.originX, y: p.connectionPair.originY })
            );
            setTimeout(() => {
                if ((pos as any)._lastPosition) {
                    this.position_subject.next({
                        x: (pos as any)._lastPosition.originX,
                        y: (pos as any)._lastPosition.originY
                    });
                }
            }, 10);
        }
        this.set(data);
    }

    public set(data: T) {}

    public get content() {
        return this.details.content;
    }

    public get ID() {
        return this.id;
    }

    /**
     * Update overlay configuration
     * @param config New overlay config
     */
    public update(config?: OverlayConfig) {
        this.open(this.details.data, config || (this.details.config as OverlayConfig));
    }

    /**
     * Listen for events on the content
     * @param next Event callback
     */
    public listen(next: (data: IOverlayEvent<T>) => void) {
        const sub = this.event.subscribe(next);
        this.subs.push(sub);
        return sub;
    }

    /**
     * Post new evewnt
     * @param type Event type
     * @param data Event context
     */
    public post(type: IOverlayEventType, data?: T) {
        this.event.next({ type, data });
    }

    /**
     * Get the position value of the overlay
     */
    public get position(): { x: string; y: string } {
        return this.position_subject ? this.position_subject.getValue() : null;
    }

    /**
     * Close overlay
     * @param data Context data
     */
    public close(data?: T) {
        this._close('close', data);
    }

    /**
     * Remove overlay from view
     * @param type Event type
     * @param data Context data
     */
    private _close(type: IOverlayEventType, data: T) {
        if (this._overlay) {
            this._overlay.dispose();
        }
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
