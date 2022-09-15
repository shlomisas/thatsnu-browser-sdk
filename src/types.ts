type onUserClickedFunction = (id: string, element: HTMLElement) => { markAsRead: boolean };

export type AppParams = {
    userId: string,
    userState?: Array<string>,
    options?: {
        simulate: boolean,
        onUserClicked: onUserClickedFunction
    }
};

export interface IDisposable {
    dispose(): void;
}

export type ClickedItems = { [key: string]: boolean };