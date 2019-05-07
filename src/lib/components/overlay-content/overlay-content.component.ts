import { Component, OnInit, OnDestroy } from '@angular/core';
import { Subscription } from 'rxjs';
import { OverlayItem } from '../../services/overlay-item.class';

@Component({
    selector: 'a-overlay-content',
    template: ``,
    styles: [``]
})
export class OverlayContentComponent implements OnDestroy {

    protected timers: { [name: string]: number } = {};
    protected intervals: { [name: string]: number } = {};
    protected subscriptions: { [name: string]: Subscription | (() => void) } = {};

    constructor(private item: OverlayItem) { }

    public ngOnDestroy() {
            // Cleanup timers
        for (const k in this.timers) {
            if (this.timers.hasOwnProperty(k)) {
                this.clearTimer(k);
            }
        }
            // Cleanup intervals
        for (const k in this.intervals) {
            if (this.intervals.hasOwnProperty(k)) {
                this.clearInterval(k);
            }
        }
            // Cleanup observables
        for (const k in this.subscriptions) {
            if (this.subscriptions.hasOwnProperty(k) && this.subscriptions[k]) {
                if (this.subscriptions[k] instanceof Subscription) {
                    (this.subscriptions[k] as Subscription).unsubscribe();
                } else {
                    (this.subscriptions[k] as (() => void))();
                }
                this.subscriptions[k] = null;
            }
        }
    }

    /**
     * Create a named timer. Multiple with the same name will clear exisitng timers
     * @param name Name of the timer
     * @param fn Callback function for the timer
     * @param delay Callback delay
     */
    public timeout(name: string, fn: () => void, delay: number = 300) {
        this.clearTimer(name);
        if (!(fn instanceof Function)) { return; }
        if (!this.timers) { this.timers = {}; }
        this.timers[name] = <any>setTimeout(() => fn(), delay);
    }

    /**
     * Clear timer with the given name
     * @param name Name of the timer
     */
    public clearTimer(name: string) {
        if (this.timers && this.timers[name]) {
            clearTimeout(this.timers[name]);
            this.timers[name] = null;
        }
    }

    /**
     * Create a named interval. Multiple with the same name will clear exisitng interval
     * @param name Name of the interval
     * @param fn Callback function for the interval
     * @param delay Callback delay
     */
    public interval(name: string, fn: () => void, delay: number = 300) {
        this.clearInterval(name);
        if (!(fn instanceof Function)) { return; }
        this.intervals[name] = <any>setInterval(() => fn(), delay);
    }

    /**
     * Clear timer with the given name
     * @param name Name of the timer
     */
    public clearInterval(name: string) {
        if (this.intervals && this.intervals[name]) {
            clearInterval(this.intervals[name]);
            this.intervals[name] = null;
        }
    }

    public sub(name: string, unsub_fn: () => void) {
        this.clearSubscription(name);
        this.subscriptions[name] = unsub_fn;
    }

    public clearSubscription(name: string) {
        if (this.subscriptions[name]) {
            if (this.subscriptions[name] instanceof Subscription) {
                (this.subscriptions[name] as Subscription).unsubscribe();
            } else {
                (this.subscriptions[name] as (() => void))();
            }
            this.subscriptions[name] = null;
        }
    }
}
