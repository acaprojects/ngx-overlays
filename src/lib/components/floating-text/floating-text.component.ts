import { Component, OnInit } from '@angular/core';

import { OverlayItem } from '../../services/overlay-item.class';
import { OverlayService } from '../../services/overlay.service';

@Component({
    selector: 'a-floating-text',
    templateUrl: './floating-text.component.html',
    styleUrls: ['./floating-text.component.scss']
})
export class FloatingTextComponent implements OnInit {
    /** Text value to display */
    public text: string;
    /** Last pointer position */
    public center: { x: number; y: number };

    constructor(private item: OverlayItem, private service: OverlayService) {}

    public ngOnInit(): void {
        this.text = this.item.details.data.text;
        this.center = this.item.details.data.center;
        setTimeout(() => this.service.close(this.item.ID), 1000);
    }
}
