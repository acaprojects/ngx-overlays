import { Directive, Input, Renderer2, ElementRef, AfterViewInit, Output, EventEmitter, OnDestroy } from '@angular/core';

import { AOverlayService } from '../services/overlay.service';
import { IOverlayEvent } from '../classes/overlay-item.class';
import { OverlayContent, IPoint } from '../interfaces/overlay.interfaces';

declare global {
    interface Window {
        TouchEvent: any;
    }
}

@Directive({
    selector: '[a-context-item]'
})
export class ContextItemDirective implements AfterViewInit, OnDestroy {
    /** Unique identifier for the context item instance */
    @Input() public id = `context-item-${Math.floor(Math.random() * 9999999)}`;
    /** CSS class to add to the parent element of the rendered item */
    @Input() public klass = 'default';
    /** Data to send to the context item */
    @Input() public data = {};
    /** Contents of the rendered item. Can be a TemplateRef, Type or a HTML string */
    @Input() public content: OverlayContent;
    /** Name of an event to list to on the parent element to listen for */
    @Input('eventName') public event_name = 'contextmenu';
    /** Emiiter for events thrown by the context item content */
    @Output() public event = new EventEmitter<IOverlayEvent<any>>();

    /** Whether the context item is open */
    private opened: boolean;
    /** Callback for unsubscribing to DOM events for closing the context item */
    private listener: () => void;
    /** Timer ID for opening the context item */
    private create_timer: number;

    constructor(private service: AOverlayService, private element: ElementRef, private renderer: Renderer2) { }

    public ngOnDestroy(): void {
        if (this.listener) {
            this.listener();
            delete this.listener;
        }
    }

    public ngAfterViewInit(): void {
        if (this.event_name && this.element) {
            this.listener = this.renderer.listen(this.element.nativeElement, this.event_name, e => this.handleContextEvent(e));
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
            x: window.TouchEvent && event instanceof TouchEvent ? event.touches[0].clientX : (event as MouseEvent).clientX,
            y: window.TouchEvent && event instanceof TouchEvent ? event.touches[0].clientY : (event as MouseEvent).clientY
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
        if (this.create_timer) {
            clearTimeout(this.create_timer)
        }
        this.create_timer = <any>setTimeout(() => {
            this.opened = true;
            this.service.register(this.id, {
                content: this.content,
                klass: this.klass,
                offset: point,
                config: 'no-scroll',
                data: this.data
            });
            this.create_timer = null;
            this.service.open(this.id, {}, (e: IOverlayEvent<any>) => {
                this.event.emit(e);
            }, () => this.opened = false);
        }, 5);
    }
}
