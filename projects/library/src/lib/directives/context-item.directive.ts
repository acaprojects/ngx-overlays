import { Directive, Input, Renderer2, ElementRef, AfterViewInit, Output, EventEmitter } from '@angular/core';

import { OverlayService } from '../services/overlay.service';
import { IOverlayEvent } from '../classes/overlay-item.class';
import { OverlayContent, IPoint } from '../interfaces/overlay.interfaces';

@Directive({
    selector: '[a-context-item]'
})
export class ContextItemDirective implements AfterViewInit {
    /** Unique identifier for the context item instance */
    @Input() public id = `context-item-${Math.floor(Math.random() * 9999999)}`;
    /** CSS class to add to the parent element of the rendered item */
    @Input() public klass = 'default';
    /** Contents of the rendered item. Can be a TemplateRef, Type or a HTML string */
    @Input() public content: OverlayContent;
    /** Name of an event to list to on the parent element to listen for */
    @Input('eventName') public event_name = 'contextmenu';
    /** Emiiter for events thrown by the context item content */
    @Output() public event = new EventEmitter<IOverlayEvent<any>>();

    /** Whether the context item is open */
    private opened: boolean;
    /** ID of the timer for closing the context item */
    private close_timer: number;
    /** Callback for unsubscribing to DOM events for closing the context item */
    private close_listeners: { mouse: () => void, touch: () => void };

    constructor(private service: OverlayService, private element: ElementRef, private renderer: Renderer2) {}

    public ngAfterViewInit(): void {
        if (this.event_name && this.element) {
            this.renderer.listen(this.element.nativeElement, this.event_name, e => this.handleContextEvent(e));
        } else {
            setTimeout(() => this.ngAfterViewInit(), 300);
        }
    }

    /**
     * Handle listened event on the parent element
     * @param event Context event
     */
    public handleContextEvent(event: MouseEvent | TouchEvent) {
        event.preventDefault();
        const position: IPoint = {
            x: event instanceof TouchEvent ? event.touches[0].clientX : event.clientX,
            y: event instanceof TouchEvent ? event.touches[0].clientY : event.clientY
        };
        this.createContextItem(position);
    }

    /**
     * Create context item at the given point
     * @param point Point for the context item to be created
     */
    private createContextItem(point: IPoint) {
        if (this.opened) {
            this.service.close(this.id);
        }
        this.opened = true;
        this.service.register(this.id, {
            content: this.content,
            klass: this.klass,
            offset: point,
            data: {}
        });
        this.service.open(this.id, {}, (e: IOverlayEvent<any>) => {
            console.log('Event:', e);
            if (e.type === 'reopen' && this.close_timer) {
                clearTimeout(this.close_timer);
            } else {
                this.event.emit(e);
            }
        }, () => this.handleClose());
        setTimeout(() => {
            this.close_listeners = {
                mouse: this.renderer.listen('window', 'mouseup', () => this.close()),
                touch: this.renderer.listen('window', 'touchend', () => this.close()),
            };
        }, 300);
    }

    /**
     * Close context item
     */
    private close() {
        this.close_timer = <any>setTimeout(() => {
            this.service.close(this.id);
        }, 200);
    }

    /**
     * Cleanup after context item has closed
     */
    private handleClose() {
        this.opened = false;
        if (this.close_listeners) {
            this.close_listeners.mouse();
            this.close_listeners.touch();
            delete this.close_listeners;
        }
    }
}
