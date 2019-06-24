
import { TemplateRef, Type } from "@angular/core";
import { OverlayConfig } from "@angular/cdk/overlay";

/** Valid content types Template, Component or HTML string */
export type OverlayContent = TemplateRef<any> | Type<any> | string;

/** Configuration parameters for overlay components */
export interface IOverlayConfig<T = any> {
    /** CSS class to add to the root element on the overlay */
    klass?: string;
    /** Component, template or HTML to render within the overlay */
    content?: OverlayContent;
    /** Model passed to the overlay content component/template */
    data?: T;
    /** Reference to an element for the overlay to position relative to */
    ref?: HTMLElement;
    /** Whether the overlay has a backdrop */
    backdrop?: boolean;
    /** Angular Overlay Config or a string identifier of a preset Overlay Config */
    config?: OverlayConfig | string;
    /** Offset x and y for the rendered overlay */
    offset?: IPoint;
}

export interface IPoint {
    x: number;
    y: number;
}
