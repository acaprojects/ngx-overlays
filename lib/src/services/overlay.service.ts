
import { ApplicationRef, Injectable, ViewContainerRef, Injector, Type, TemplateRef } from '@angular/core';
import { Overlay, OverlayConfig, GlobalPositionStrategy } from '@angular/cdk/overlay';

import { OverlayItem } from './overlay-item.class';
import { OverlayContent } from '../components/overlay-outlet/overlay-outlet.component';

export interface IOverlayConfig<T> {
    klass?: string;
    content: OverlayContent;
    data: T;
    ref?: HTMLElement;
    backdrop?: boolean;
    config?: OverlayConfig | string;
}

@Injectable({
    providedIn: 'root'
})
export class OverlayService {
    private default_vc: ViewContainerRef = null;
    private _view: ViewContainerRef = null;
    private _refs: { [name: string]: OverlayItem<any> } = {};
    private _presets: { [name: string]: OverlayConfig } = {};

    constructor(private overlay: Overlay, private injector: Injector) {
        this.loadView();
        this.registerPreset('default', new OverlayConfig({
            minWidth: 2,
            minHeight: 2,
            hasBackdrop: false,
            backdropClass: 'overlay-backdrop',
            positionStrategy: this.overlay.position().global().centerHorizontally().centerVertically(),
            scrollStrategy: this.overlay.scrollStrategies.noop()
        }));
        this.registerPreset('modal', new OverlayConfig({
            minWidth: 2,
            minHeight: 2,
            hasBackdrop: true,
            backdropClass: 'overlay-backdrop',
            positionStrategy: this.overlay.position().global().centerHorizontally().centerVertically(),
            scrollStrategy: this.overlay.scrollStrategies.block()
        }));
    }

    /**
     * Sets the view to attach the notification display, usually the root component
     * @param view View Container to attach the notifications display
     */
    set view(view: ViewContainerRef) {
        if (view) { this._view = view; }
    }

    /**
     * Attempts to load the root view container
     */
    public loadView(tries: number = 0) {
        const app_ref = this.injector.get(ApplicationRef) as any;
        if (app_ref && app_ref._rootComponents && app_ref._rootComponents[0]
            && app_ref._rootComponents[0]._hostElement) {

            this.default_vc = app_ref._rootComponents[0]._hostElement.vcRef;
            if (this.default_vc) {
                this._view = this.default_vc;
            }
        } else if (tries < 10) {
            tries++;
            setTimeout(() => this.loadView(tries), 500);
        }
    }

    public register<T = any>(name: string, config: IOverlayConfig<T>): OverlayItem<T> {
        if (this._refs[name]) { this._refs[name].close(); }
        this._refs[name] = new OverlayItem<T>(name, this, this.injector, this.overlay, config);
        return this._refs[name];
    }

    public open<T = any>(name: string, details: IOverlayConfig<T>, next?: (e) => void, on_close?: (e) => void, ) {
        if (!details.config) {
            details.config = this.preset();
        } else if (!(details.config instanceof OverlayConfig)) {
            details.config = this.preset(details.config);
        }
        if (!this._refs[name]) { this.register(name, details); }
        this._refs[name].open(details.data, details.config || this.preset());
        if (this._refs[name]) {
            if (next) { this._refs[name].listen(next); }
            if (on_close) { this._refs[name].onClose.subscribe(on_close); }
        }
    }

    public update(name: string, preset?: OverlayConfig) {
        if (this._refs[name]) {
            this._refs[name].update(preset || this.preset(name));
        }
    }

    public close(name: string) {
        if (this._refs[name]) { this._refs[name].close(null); }
    }

    public remove(name: string) {
        if (this._refs[name]) { this._refs[name] = null; }
    }

    public registerPreset(name: string, preset: OverlayConfig) {
        this._presets[name] = preset;
    }

    public preset(name: string = 'default'): OverlayConfig {
        return this._presets[name] || this._presets['default'];
    }
}
