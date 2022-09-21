type onUserClickedFunction = (id: string) => boolean;

export enum IndicatorOptionsList {
    // Indicator
    id = 'id',
    text = 'text',
    className = 'className',
    styles = 'styles',
    color = 'color',
    expiration = 'expiration',
    // Tooltip
    tooltipText = 'tooltipText',
    tooltipClassName = 'tooltipClassName',
    tooltipStyles = 'tooltipStyles'
}

export type IndicatorOptions = {
    id?: string,
    text?: string,
    className?: string,
    styles?: ElementStyles,
    color?: string,
    expiration?: Date,
    tooltipText?: string,
    tooltipClassName?: string,
    tooltipStyles?: ElementStyles
};

export type IndicatorAttributes = Omit<IndicatorOptions, 'styles' | 'expiration' | 'tooltipStyles'> & {
    styles?: string,
    expiration?: string,
    tooltipStyles?: string
};

export type AppParams = {
    initialState?: Array<string>,
    debugTooltip?: boolean,
    defaultColor?: string,
    onClick?: onUserClickedFunction,
    indicators?: Array<IndicatorOptions>
};

export interface IDisposable {
    dispose(): void;
}

export type ClickedItems = { [key: string]: boolean };

export interface ThatsnuSdk {
    init(props?: AppParams): Promise<void>,
    getState(): Array<string>,
    resetState(): void,
    dispose(): void
}

export type ClassNames = Array<string>;
export type ElementStyles = { [key: string]: string | number };

export type IndicatorElementSettings = {
    id: string,
    text: string,
    styles: ElementStyles,
    color: string,
    classNames: ClassNames,
    expiration: Date
}

export type TooltipElementSettings = {
    text: string,
    styles: ElementStyles,
    classNames: ClassNames
}

export type IndicatorSettings = {
    indicator: IndicatorElementSettings,
    tooltip: TooltipElementSettings
}