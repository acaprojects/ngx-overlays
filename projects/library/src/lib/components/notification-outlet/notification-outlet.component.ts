
import { animate, keyframes, state, style, transition, trigger } from '@angular/animations';
import { Component, OnInit, OnDestroy, TemplateRef, Renderer2 } from '@angular/core';
import { Subject, Subscription } from 'rxjs';

import { OverlayItem, IOverlayEvent } from '../../classes/overlay-item.class';
import { OverlayContent } from '../../interfaces/overlay.interfaces';

export interface INotification {
    /** Unique identifier */
    id: string;
    /** Content to render in notification block */
    content: OverlayContent;
    /** Action name to display */
    action?: string;
    /** Callback for action */
    on_action?: NotifyCallback;
    /** CSS class to add to notification block */
    type?: string;
    /** Content type */
    method?: 'component' | 'template' | 'text';
    /** Auto close delay. Setting to 0 disables auto-close */
    delay?: number;
    /** Contextual data to pass into any rendered component or template */
    context?: any;
    /** Callback for closing the notification */
    close?: () => void;
}

export interface INotificationContext {
    /** Service listener for adding new notification */
    add: Subject<INotification>;
    /** Service listender for removing existing notification */
    remove: Subject<string>;
    /** Service listener for changing the default auto-close delay */
    delay: Subject<number>;
    /** Notification settings */
    settings?: {
        /** Default auto-close delay */
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
    /** Initialisation Context */
    public context: INotificationContext;
    /** Notification block to render in the outlet */
    public events: INotification[] = [];
    /** Notification block to render in the outlet */
    public displayed_events: INotification[] = [];
    /** Overlay service listeners */
    public subs: { [name: string]: Subscription } = {};

    /** Auto close notification delay */
    private delay = 5000;
    /** Swipe initialisation offset */
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

    /**
     * Add notification to outlet
     * @param item New notification item
     */
    public add(item: INotification): void {
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
            this.events = this.events && this.events.length > 0 ? [...this.events, item] : [item];
            this.displayed_events = this.events.slice(-8);
            item.close = () => this.remove(item.id);
            if (item.delay !== 0) {
                setTimeout(() => this.remove(item.id), item.delay || this.delay || 5000);
            }
        }
    }

    /**
     * Removes the notification with the given ID
     * @param id ID of the notification
     */
    public remove(id: string): void {
        this.events = this.events.filter(i => i.id !== id);
        this.displayed_events = this.events.slice(-8);
    }

    /**
     * Performs the action callback for the given notication. Calls close if no set actions
     * @param item Notification item
     */
    public action(item: INotification): void {
        if (item.action && item.on_action && item.on_action instanceof Function) {
            item.on_action({ type: 'other', data: item });
        } else {
            this.remove(item.id);
        }
    }

    /**
     * Initialises swipe to close for the given notification
     * @param item Notification item
     * @param event Mouse/Touch initiator
     */
    public grab(item, event: MouseEvent | TouchEvent): void {
        const offset = event instanceof MouseEvent ? event.clientX : event.touches[0].clientX;
        this.offset = offset;
        item.offset = 0;
        item.listeners = {
            mousemove: this.renderer.listen('window', 'mousemove', (e) => this.pull(item, e)),
            touchmove: this.renderer.listen('window', 'touchmove', (e) => this.pull(item, e)),
            mouseup: this.renderer.listen('window', 'mouseup', (e) => this.release(item)),
            touchend: this.renderer.listen('window', 'touchend', (e) => this.release(item)),
        };
    }

    /**
     * Update the swipe position on mouse/touch move
     * @param item Notification item
     * @param event Mouse/Touch event
     */
    public pull(item, event: MouseEvent | TouchEvent): void {
        const offset = event instanceof MouseEvent ? event.clientX : event.touches[0].clientX;
        item.offset = Math.max(0, offset - this.offset);
    }

    /**
     * Finish swipe handling for the given notification. Removes notification if swipe distance is enough.
     * @param item Notification item
     */
    public release(item): void {
        if (item.offset > 128) {
            this.remove(item.id);
        }
        for (const k in item.listeners) {
            if (item.listeners[k]) { item.listeners[k](); }
        }
        item.offset = 0;
    }

    /**
     * TrackBy method for notification ngFor
     * @param item Item to track
     * @param index Array index of the item
     */
    public trackByFn(item: INotification, index: number) {
        return (item ? item.id : null) || index;
    }
}


