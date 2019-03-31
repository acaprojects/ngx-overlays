
import { Directive, Input, SimpleChanges, OnChanges, Output, EventEmitter } from '@angular/core';
import { OverlayConfig } from '@angular/cdk/overlay';

import { OverlayService } from '../services/overlay.service';
import { OverlayContent } from '../components/overlay-outlet/overlay-outlet.component';
import { IOverlayEvent } from '../services/overlay-item.class';

@Directive({
    selector: '[modal]',
})
export class ModalDirective<T = any> implements OnChanges {
    @Input() public id = `modal-${Math.floor(Math.random() * 9999999)}`;
    @Input() public klass = 'default';
    @Input() public show: boolean;
    @Input() public content: OverlayContent;
    @Input() public data: T;
    @Output() public showChange = new EventEmitter<boolean>();
    @Output() public event = new EventEmitter<IOverlayEvent<T>>();
    @Output() public close = new EventEmitter<IOverlayEvent<T>>();

    constructor(private service: OverlayService) {}

    public ngOnChanges(changes: SimpleChanges): void {
        if (changes.show) {
            if (this.show && this.content) {
                setTimeout(() => this.open(), 50);
            } else {
                this.service.close(this.id);
            }
        }
    }

    /**
     * Open modal with the given parameters
     */
    public open() {
        this.service.open(this.id, {
            klass: this.klass,
            content: this.content,
            data: this.data,
            config: 'modal'
        }, (e) => this.event.emit(e), (e) => {
            this.show = false;
            this.showChange.emit(false);
            this.close.emit(e);
        });
    }
}
