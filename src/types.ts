type onUserClickedFunction = (id: string, element: HTMLElement) => { markAsRead: boolean };

export type AppParams = {
    state?: Array<string>,
    simulate?: boolean,
    onClick?: onUserClickedFunction
};

export interface IDisposable {
    dispose(): void;
}

export type ClickedItems = { [key: string]: boolean };

export interface ThatsnuSdk {
    init(props?: AppParams): Promise<void>,
    getState(): Array<string>,
    dispose(): void
}