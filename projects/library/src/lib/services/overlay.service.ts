import { Injectable, Injector } from '@angular/core';
import { Overlay, OverlayConfig } from '@angular/cdk/overlay';
import { Subject } from 'rxjs';

import { OverlayItem } from '../classes/overlay-item.class';
import {
    NotificationOutletComponent,
    INotification,
    NotifyCallback
} from '../components/notification-outlet/notification-outlet.component';
import { IOverlayConfig, OverlayContent } from '../interfaces/overlay.interfaces';

@Injectable({
    providedIn: 'root'
})
export class OverlayService {
    /** Store for Overlays */
    private _refs: { [name: string]: OverlayItem<any> } = {};
    /** Store for Overlay Config presets */
    private _presets: { [name: string]: OverlayConfig } = {};
    /** Event handler for notifications */
    private _notify: { [name: string]: Subject<any> } = {};
    /** Store for timers */
    private timers: { [name: string]: number } = {};

    constructor(private overlay: Overlay, private injector: Injector) {
        this._notify.add = new Subject<INotification>();
        this._notify.remove = new Subject<string>();
        this._notify.delay = new Subject<number>();
        // Register default overlay config
        this.registerPreset(
            'default',
            new OverlayConfig({
                minWidth: 2,
                minHeight: 2,
                hasBackdrop: false,
                backdropClass: 'overlay-backdrop',
                positionStrategy: this.overlay
                    .position()
                    .global()
                    .centerHorizontally()
                    .centerVertically(),
                scrollStrategy: this.overlay.scrollStrategies.noop(),
                disposeOnNavigation: true
            })
        );
        // Register default modal overlay config
        this.registerPreset(
            'modal',
            new OverlayConfig({
                minWidth: 2,
                minHeight: 2,
                hasBackdrop: true,
                backdropClass: 'overlay-backdrop',
                positionStrategy: this.overlay
                    .position()
                    .global()
                    .centerHorizontally()
                    .centerVertically(),
                scrollStrategy: this.overlay.scrollStrategies.block(),
                disposeOnNavigation: true
            })
        );
        this.loadNotificationsOutlet();
    }

    /**
     * Register an overlay item
     * @param name Name/ID of the overlay item
     * @param config Overlay configuration
     */
    public register<T = any>(name: string, config: IOverlayConfig<T>): OverlayItem<T> {
        if (this._refs[name]) {
            this._refs[name].close();
        }
        this._refs[name] = new OverlayItem<T>(name, this, this.injector, this.overlay, config);
        return this._refs[name];
    }

    /**
     * Open overlay with given name/ID
     * @param name Overlay identifier
     * @param details Overlay details/config
     * @param next Overlay event callback
     * @param on_close Overlay on close callback
     */
    public open<T = any>(name: string, details: IOverlayConfig<T>, next?: (e) => void, on_close?: (e) => void) {
        if (!details.config) {
            details.config = this.preset();
        } else if (!(details.config instanceof OverlayConfig)) {
            details.config = this.preset(details.config);
        }
        if (!this._refs[name]) {
            this.register(name, details);
        }
        if (!this._refs[name].content) {
            throw new Error(`No content set for the overlay ${name}`);
        }
        const item = this._refs[name];
        const config =
            item.details.config instanceof OverlayConfig ? item.details.config : this.preset(item.details.config);
        item.open(details.data, details.config || config || this.preset());
        if (this._refs[name]) {
            if (next) {
                this._refs[name].listen(next);
            }
            if (on_close) {
                this._refs[name].onClose.subscribe(on_close);
            }
        }
    }

    /**
     * Update the position and data of the overlay
     */
    public update<T = any>(name: string, data: T) {
        if (this._refs[name]) {
            this._refs[name].set(data);
        }
    }

    /**
     * Call close on the overlay with the given name/ID
     * @param name Overlay identifier
     */
    public close(name: string) {
        if (this._refs[name]) {
            this._refs[name].close(null);
        }
    }

    /**
     * Remove overlay with given name/ID
     * @param name Overlay identifier
     */
    public remove(name: string) {
        if (this._refs[name]) {
            this._refs[name] = null;
        }
    }

    /**
     * Register overlay config preset with given name
     * @param name
     * @param preset Angular Overlay Config
     */
    public registerPreset(name: string, preset: OverlayConfig) {
        this._presets[name] = preset;
    }

    /**
     * Get preset with given name
     * @param name
     */
    public preset(name: string = 'default'): OverlayConfig {
        return this._presets[name] || this._presets['default'];
    }

    /**
     * Inject notifications outlet onto the root view
     */
    private loadNotificationsOutlet() {
        if (this.timers.notify) {
            clearTimeout(this.timers.notify);
            this.timers.notify = null;
        }
        this.timers.notify = <any>setTimeout(() => {
            this.registerPreset(
                'ACA_NOTIFICATIONS_OUTLET',
                new OverlayConfig({
                    width: '0',
                    height: '0',
                    hasBackdrop: false,
                    positionStrategy: this.overlay
                        .position()
                        .global()
                        .bottom('0')
                        .right('0'),
                    scrollStrategy: this.overlay.scrollStrategies.noop()
                })
            );
            this.open('ACA_NOTIFICATIONS_OUTLET', {
                content: NotificationOutletComponent,
                data: this._notify,
                config: 'ACA_NOTIFICATIONS_OUTLET'
            });
        }, 2000);
    }

    /**
     * Add notification to outlet
     * @param content Content to render in notification block
     * @param action action displayed on notification block
     * @param on_action Callback for action
     * @param type CSS class to add to notification block
     * @param delay Auto-close delay in milliseconds
     */
    public notify(content: OverlayContent, action?: string, on_action?: NotifyCallback, type?: string, delay?: number) {
        let id = null;
        if (this._notify.add) {
            id = `notification-${Math.floor(Math.random() * 999999)}`;
            this._notify.add.next({
                id,
                content,
                action,
                on_action,
                type,
                delay,
                event: e => (on_action ? on_action(e) : null)
            });
        }
        return id;
    }
}
