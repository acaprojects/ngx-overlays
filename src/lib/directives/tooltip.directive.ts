import {
    Directive,
    Input,
    SimpleChanges,
    OnChanges,
    Output,
    EventEmitter,
    ElementRef,
    Renderer2,
    OnInit,
    OnDestroy
} from '@angular/core';
import { OverlayConfig, Overlay, PositionStrategy, ConnectionPositionPair, ScrollStrategy } from '@angular/cdk/overlay';

import { OverlayService } from '../services/overlay.service';
import { OverlayContent } from '../components/overlay-outlet/overlay-outlet.component';
import { IOverlayEvent } from '../services/overlay-item.class';
import { LIBRARY_SETTINGS } from '../settings';
import { BehaviorSubject } from 'rxjs';

@Directive({
    selector: '[tooltip]'
})
export class TooltipDirective<T = any> implements OnInit, OnChanges, OnDestroy {
    /** ID of the tooltip */
    @Input() public id = `tooltip-${Math.floor(Math.random() * 9999999)}`;
    /** CSS class to add to the root element of the tooltip */
    @Input() public klass = 'default';
    /** Whether the tooltip is shown */
    @Input() public show: boolean;
    /** Contents of the tooltip */
    @Input() public content: OverlayContent;
    /** Context data to bind to the tooltip's contents */
    @Input() public data: T;
    /** Prefered position of the tooltip */
    @Input() public position: 'top' | 'bottom' | 'left' | 'right' = 'bottom';
    /** Whether tooltip repositions on scroll */
    @Input() public reposition = true;
    /** Change emitter for show */
    @Output() public showChange = new EventEmitter<boolean>();
    /** Event emitter for overlay component */
    @Output() public event = new EventEmitter<IOverlayEvent<T>>();
    /** Close event emitter for overlay component */
    @Output() public close = new EventEmitter<IOverlayEvent<T>>();

    /** Scroll listeners */
    private listeners: (() => void)[] = [];
    /** Pre-defined tooltip positions */
    private positions: { [name: string]: ConnectionPositionPair } = {
        bottom: {
            originX: 'center',
            originY: 'bottom',
            overlayX: 'center',
            overlayY: 'top'
        },
        left: {
            originX: 'start',
            originY: 'center',
            overlayX: 'end',
            overlayY: 'center'
        },
        right: {
            originX: 'end',
            originY: 'center',
            overlayX: 'start',
            overlayY: 'center'
        },
        top: {
            originX: 'center',
            originY: 'top',
            overlayX: 'center',
            overlayY: 'bottom'
        }
    };
    private strategy: ScrollStrategy;

    constructor(
        private el: ElementRef,
        private service: OverlayService,
        private overlay: Overlay,
        private renderer: Renderer2
    ) {}

    public ngOnInit(): void {
        this.updateConfig();
        if (this.el) {
            this.listenForScroll();
        }
    }

    public ngOnDestroy(): void {
        this.service.close(this.id);
        this.service.remove(this.id);
        this.clearListeners();
    }

    public ngOnChanges(changes: SimpleChanges): void {
        if (changes.config) {
            this.updateConfig();
        }
        if (changes.reposition) {
            const ss = this.overlay.scrollStrategies;
            this.strategy = this.reposition ? ss.reposition() : ss.noop();
            this.updateConfig();
        }
        if (changes.show) {
            if (this.show && this.content) {
                setTimeout(() => this.open(), 50);
            } else {
                if (!this.content && this.el) {
                    LIBRARY_SETTINGS.log(
                        'Tooltip',
                        'No content for tooltip attached to element',
                        this.el.nativeElement,
                        'warn'
                    );
                } else if (!this.show && changes.show.previousValue) {
                    this.service.close(this.id);
                }
            }
        }
    }

    /**
     * Open tooltip with the given parameters
     */
    public open() {
        this.listenForScroll();
        this.service.open(
            this.id,
            {
                klass: this.klass,
                content: this.content,
                data: this.data,
                config: this.id
            },
            e => this.event.emit(e),
            e => {
                this.show = false;
                this.showChange.emit(false);
                this.close.emit(e);
                this.clearListeners();
            }
        );
    }

    /**
     * Get tooltip position relative to the given HTML element
     * @param origin HTML elment to calculate position
     */
    private getOverlayPosition(origin: HTMLElement): PositionStrategy {
        const positions = this.getPositions();
        const positionStrategy = this.overlay
            .position()
            .flexibleConnectedTo(origin)
            .withPositions(positions)
            .withPush(false);
        return positionStrategy;
    }

    private getPositions(): ConnectionPositionPair[] {
        const pos = this.positions;
        switch (this.position) {
            case 'top':
                return [pos.top, pos.bottom, pos.left, pos.right];
            case 'left':
                return [pos.left, pos.right, pos.bottom, pos.top];
            case 'left':
                return [pos.left, pos.right, pos.bottom, pos.top];
            default:
                return [pos.bottom, pos.top, pos.left, pos.right];
        }
    }

    /**
     * Update tooltip's overlay config
     */
    private updateConfig(): void {
        this.service.registerPreset(
            this.id,
            new OverlayConfig({
                minWidth: 2,
                minHeight: 2,
                positionStrategy: this.getOverlayPosition(this.el.nativeElement),
                scrollStrategy: this.strategy
            })
        );
    }

    /** Listen for scroll events when shown to  */
    private listenForScroll() {
        if (this.show) {
            let el = this.el.nativeElement.parentElement;
            for (; !!el; el = el.parentElement) {
                this.listeners.push(this.renderer.listen(el, 'scroll', () => this.update()));
            }
        }
    }

    /**
     * Clear any listeners for scrolling
     */
    private clearListeners() {
        for (const l of this.listeners) {
            l();
        }
        this.listeners = [];
    }

    /**
     * Update position of tooltip
     */
    private update() {
        this.updateConfig();
        this.service.update(this.id, this.service.preset(this.id));
    }
}