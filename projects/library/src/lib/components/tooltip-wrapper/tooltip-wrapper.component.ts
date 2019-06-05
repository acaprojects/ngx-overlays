import { Component, OnInit, Input } from '@angular/core';

@Component({
    selector: 'a-tooltip-wrapper',
    templateUrl: './tooltip-wrapper.component.html',
    styleUrls: ['./tooltip-wrapper.component.scss']
})
export class TooltipWrapperComponent implements OnInit {
    /** CSS class to add to the root element of the tooltip */
    @Input() public klass = 'default';
    /** Show pointer to the attached item */
    @Input() public has_triangle = true;
    /** Position of the wrapper */
    @Input() public offsetX: 'left' | 'right' | 'center' = 'center';
    /** Offset position of the wrapper */
    @Input() public offsetY: 'bottom' | 'top' | 'center' = 'bottom';


    constructor() { }

    ngOnInit(): void { }
}
