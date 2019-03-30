
import { Directive, Input, SimpleChanges, OnChanges, Output, EventEmitter, ElementRef, Renderer2, OnInit, OnDestroy } from '@angular/core';
import { OverlayConfig, Overlay, PositionStrategy, ConnectionPositionPair, ScrollStrategy } from '@angular/cdk/overlay';

import { OverlayService } from '../services/overlay.service';
import { OverlayContent } from '../components/overlay-outlet/overlay-outlet.component';
import { IOverlayEvent } from '../services/overlay-item.class';
import { LIBRARY_SETTINGS } from '../settings';

@Directive({
    selector: '[tooltip]',
})
export class TooltipDirective<T = any> implements OnInit, OnChanges, OnDestroy {
    @Input() public id = `tooltip-${Math.floor(Math.random() * 9999999)}`;
    @Input() public klass = 'default';
    @Input() public show: boolean;
    @Input() public content: OverlayContent;
    @Input() public data: T;
    @Input() public position: 'top' | 'bottom' | 'left' | 'right' = 'bottom';
    @Input() public reposition = true;
    @Output() public showChange = new EventEmitter<boolean>();
    @Output() public event = new EventEmitter<IOverlayEvent<T>>();
    @Output() public close = new EventEmitter<IOverlayEvent<T>>();

    private listeners: (() => void)[] = [];
    private positions: { [name: string]: ConnectionPositionPair } = {
        bottom: {
            originX: 'center',
            originY: 'bottom',
            overlayX: 'center',
            overlayY: 'top',
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
            overlayY: 'center',
        },
        top: {
            originX: 'center',
            originY: 'top',
            overlayX: 'center',
            overlayY: 'bottom'
        },
    };
    private strategy: ScrollStrategy;

    constructor(private el: ElementRef, private service: OverlayService, private overlay: Overlay, private renderer: Renderer2) {}

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
                    LIBRARY_SETTINGS.log('Tooltip', 'No content for tooltip attached to element', this.el.nativeElement, 'warn');
                } else if (!this.show && changes.show.previousValue) {
                    this.service.close(this.id);
                }
            }
        }
    }

    public open() {
        this.listenForScroll();
        this.service.open(this.id, {
            klass: this.klass,
            content: this.content,
            data: this.data,
            config: this.id
        }, (e) => this.event.emit(e), (e) => {
            this.show = false;
            this.showChange.emit(false);
            this.close.emit(e);
            this.clearListeners();
        });
    }

    private getOverlayPosition(origin: HTMLElement): PositionStrategy {
        const positionStrategy = this.overlay.position()
            .flexibleConnectedTo(origin)
            .withPositions(this.getPositions())
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

    private updateConfig(): void {
        this.service.registerPreset(this.id, new OverlayConfig({
            minWidth: 2,
            minHeight: 2,
            positionStrategy: this.getOverlayPosition(this.el.nativeElement),
            scrollStrategy: this.strategy
        }));
    }

    private listenForScroll() {
        if (this.show) {
            let el = this.el.nativeElement.parentElement;
            for (; !!el; el = el.parentElement) {
                this.listeners.push(this.renderer.listen(el, 'scroll', () => this.update()));
            }
        }
    }

    private clearListeners() {
        for (const l of this.listeners) { l(); }
        this.listeners = [];
    }

    private update() {
        this.updateConfig();
        this.service.update(this.id, this.service.preset(this.id));
    }

}
