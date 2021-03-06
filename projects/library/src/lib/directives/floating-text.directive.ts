import { Directive, Input, SimpleChanges, Renderer2 } from '@angular/core';

import { AOverlayService } from '../services/overlay.service';
import { FloatingTextComponent } from '../components/floating-text/floating-text.component';

declare global {
    interface Window {
        TouchEvent: any;
    }
}

@Directive({
    selector: '[a-floating-text]'
})
export class FloatingTextDirective {
    /** Add floating text */
    @Input() public emit: any;
    /** Floating text to display */
    @Input() public text: string;

    /** Listener for mouse move events */
    private listener_move: () => void;
    /** Listener for touch start events */
    private listener_touch: () => void;
    /** Listener for touch move events */
    private listener_tmove: () => void;
    /** Last recorded pointer position */
    private center: { x: number; y: number };

    constructor(private service: AOverlayService, private renderer: Renderer2) {}

    public ngOnInit(): void {
        this.listener_move = this.renderer.listen('window', 'mousemove', e => this.updatePosition(e));
        this.listener_touch = this.renderer.listen('window', 'touchstart', e => this.updatePosition(e));
        this.listener_tmove = this.renderer.listen('window', 'touchmove', e => this.updatePosition(e));
    }

    public ngOnDestroy(): void {
        if (this.listener_move) {
            this.listener_move();
            this.listener_move = null;
        }
        if (this.listener_touch) {
            this.listener_touch();
            this.listener_touch = null;
        }
        if (this.listener_tmove) {
            this.listener_tmove();
            this.listener_tmove = null;
        }
    }

    public ngOnChanges(changes: SimpleChanges): void {
        if (changes.emit) {
            const id = `floating-text-${Math.floor(Math.random() * 999999)}`;
            this.service.open(id, { content: FloatingTextComponent, data: { text: this.text, center: this.center } });
        }
    }

    /**
     * Update the record pointer position
     * @param event Last pointer event
     */
    private updatePosition(event: MouseEvent | TouchEvent) {
        this.center = {
            x: window.TouchEvent && event instanceof TouchEvent ? event.touches[0].clientX : (event as MouseEvent).clientX,
            y: window.TouchEvent && event instanceof TouchEvent ? event.touches[0].clientY : (event as MouseEvent).clientY
        };
    }
}
