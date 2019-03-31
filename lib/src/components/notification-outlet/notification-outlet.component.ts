
import { animate, keyframes, state, style, transition, trigger } from '@angular/animations';
import { Component, OnInit, OnDestroy, TemplateRef, Renderer2 } from '@angular/core';
import { Subject, Subscription } from 'rxjs';

import { OverlayItem, IOverlayEvent } from '../../services/overlay-item.class';
import { OverlayContent } from '../overlay-outlet/overlay-outlet.component';

export interface INotification {
    id: string;
    content: OverlayContent;
    action?: string;
    on_action?: NotifyCallback;
    type?: string;
    method?: 'component' | 'template' | 'text';
    delay?: number;
    context?: any;
    close?: () => void;
}

export interface INotificationContext {
    add: Subject<INotification>;
    remove: Subject<string>;
    delay: Subject<number>;
    settings?: {
        delay: number;
    };
}

export type NotifyCallback = (e?: IOverlayEvent<INotification>) => void;

@Component({
    selector: 'notification-outlet',
    templateUrl: './notification-outlet.component.html',
    styleUrls: ['./notification-outlet.component.scss'],
    animations: [
        trigger('show', [
            transition(':enter', [
                style({ opacity: 0, height: 0, transform: 'translateY(-100%)' }),
                animate(100, style({ opacity: 1, transform: 'translateY(0%)', height: '*' }))
            ]),
            transition(':leave', [
                style({ opacity: 1, height: '*', transform: 'translate(0%, 0%)' }),
                animate(100, style({ opacity: 0, transform: 'translate(100%, -100%)', height: 0 }))
            ]),
        ]),
    ]
})
export class NotificationOutletComponent implements OnInit, OnDestroy {
    public context: INotificationContext;
    public events: INotification[] = [];
    public subs: { [name: string]: Subscription } = {};

    private delay = 5000;
    private offset = 0;

    constructor(private overlay: OverlayItem<INotificationContext>, private renderer: Renderer2) { }

    public ngOnInit(): void {
        this.context = this.overlay.details.data;
        this.subs.add = this.context.add.subscribe((item) => this.add(item));
        this.subs.remove = this.context.remove.subscribe((id) => this.remove(id));
        this.subs.delay = this.context.delay.subscribe((delay) => this.delay = delay);
    }

    public ngOnDestroy(): void {
        for (const key in this.subs) {
            if (this.subs[key] && this.subs[key] instanceof Subscription) {
                this.subs[key].unsubscribe();
            }
        }
    }

    public add(item: INotification) {
        const found = this.events.findIndex(i => i.id === item.id);
        if (found < 0) {
            item.method = 'component';

            if (typeof item.content === 'string') {
                item.method = 'text';
            } else if (item.content instanceof TemplateRef) {
                item.method = 'template';
                item.context = {
                    close: () => this.remove(item.id)
                };
            }
            this.events.push(item);
            item.close = () => this.remove(item.id);
            if (item.delay !== 0) {
                setTimeout(() => this.remove(item.id), item.delay || this.delay || 5000);
            }
        }
    }

    public remove(id: string) {
        const found = this.events.findIndex(i => i.id === id);
        if (found >= 0) {
            this.events.splice(found, 1);
        }
    }

    public action(item: INotification) {
        if (item.action && item.on_action && item.on_action instanceof Function) {
            item.on_action({ type: 'other', data: item });
        } else {
            this.remove(item.id);
        }
    }

    public grab(item, event: MouseEvent | TouchEvent) {
        const offset = event instanceof MouseEvent ? event.clientX : event.touches[0].clientX;
        this.offset = offset;
        item.offset = 0;
        item.listeners = {
            mousemove: this.renderer.listen('window', 'mousemove', (e) => this.pull(item, e)),
            touchmove: this.renderer.listen('window', 'touchmove', (e) => this.pull(item, e)),
            mouseup: this.renderer.listen('window', 'mouseup', (e) => this.release(item, e)),
            touchend: this.renderer.listen('window', 'touchend', (e) => this.release(item, e)),
        };
    }

    public pull(item, event) {
        const offset = event instanceof MouseEvent ? event.clientX : event.touches[0].clientX;
        item.offset = Math.max(0, offset - this.offset);
    }

    public release(item, event) {
        if (item.offset > 128) {
            this.remove(item.id);
        }
        for (const k in item.listeners) {
            if (item.listeners[k]) { item.listeners[k](); }
        }
        item.offset = 0;
    }
}


