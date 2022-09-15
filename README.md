<div style="text-align: center">
  <h1>Thatsnu!</h1>
  <p>Announce your customers about features you just launched!</p>
</div>

[![npm version](https://badgen.net/npm/v/@thatsnu/browser-sdk)](https://www.npmjs.com/package/@thatsnu/browser-sdk)

## 📦 Install

```bash
npm install --save-dev @thatsnu/browser-sdk
```

## 🪄 Usage

```html

<span 
    data-tnu-id="myNewFeature" 
    data-tnu-tooltip="Here is a new feature!"></span>

```

```ts
import thatsnu from '@thatsnu/browser-sdk';

thatsnu.init()
    .catch(e => console.error(e));

```

## 👍 Output

<img src="./assets/example1.png" style="width:1024px;" alt="Example1"/>

## ⚙️ Options

### HTML Attributes

All the available attributes you can put on any HTML element that the library will respect and manipulate the indicator based on them.

```html
<span 
    data-tnu-id="myNewFeature" 
    data-tnu-tooltip="Here is a new feature!"
    data-tnu-expiration="2022-09-15T19:19:01.962Z"
    data-tnu-style="{'top': '5px', 'left': '10px', 'color': 'blue' }"
    data-tnu-parent-style="{ 'position': 'relative' }">
</span>
```

<table>
    <thead>
        <tr>
            <th>Name</th>
            <th>Description</th>
            <th>Mandatory</th>
            <th>Default value</th>
        </tr>
    </thead>
    <tbody>
        <tr>
            <td style="font-weight: bold">data-tnu-id</td>
            <td>a unique identifier for an element, the library search and watch on these attributes and generates an indicator next to it</td>
            <td>Yes</td>
            <td>&nbsp</td>
        </tr>
        <tr>
            <td style="font-weight: bold">data-tnu-tooltip-text</td>
            <td>a tooltip text for the indicator</td>
            <td>No</td>
            <td>"New!"</td>
        </tr>
        <tr>
            <td style="font-weight: bold">data-tnu-expiration</td>
            <td>the date (any valid date's string that <a href="https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Date/Date">Date</a> constructor knows to parse) that this identifier is not valid anymore, in such a case the library won't generate an indicator next to it. 
                <br>
                p.s. this is useful when u know the due date of the feature promotion in advanced, and you don't want the user to see it after automatically. 
            </td>
            <td>No</td>
            <td>&nbsp</td>
        </tr>
        <tr>
            <td style="font-weight: bold">data-tnu-style</td>
            <td>a JSON string of css rules to override the indicator's styles, all CSS rules are valid here</td>
            <td>No</td>
            <td>&nbsp</td>
        </tr>
        <tr>
            <td style="font-weight: bold">data-tnu-parent-style</td>
            <td>a JSON string of css rules to override the indicator's parent (the element you put Thatsnu attributes on) styles, all CSS rules are valid here</td>
            <td>No</td>
            <td>&nbsp</td>
        </tr>
    </tbody>
</table>

### Library

This is the full usage example of the library:

```typescript
await thatsnu.init({
    state: ['someFeature'],
    simulate: false,
    onClick(id: string): { markAsRead: boolean } {
        console.debug(`Element ${id} clicked!`);

        const userState = thatsnu.getState();
        console.debug(`So far, user clicked on the following elements: ${userState}`);

        return { markAsRead: true };
    }
});
```

#### Methods

`init({ state, simulate, onClick }: {state: Array<string>, simulate: boolean, onClick: Function })`

A method to initialize the library with new options that describe below.

It gets the following options:

* `state` - an array of identifiers the user already clicked, and you want to prevent the library to generate. 
* `simulate` - a boolean that indicate whether to prevent persist the user clicked indicators on localStorage or not, useful during development to save time of storage deletion from devtools.
* `onClick: (id: string, element: HTMLElement) => { markAsRead: boolean }` - a callback function to get user's clicks on indicators, it receives the identifier of the clicked element as well as the [HTMLElement](https://developer.mozilla.org/en-US/docs/Web/API/HTMLElement) itself
  * When returning `markAsRead` as `false`, It'll cause the library to not persist the user's click on the localStorage, which cause the user to see this indicator on the next page's refresh 

`getState(): Array<string>`

A method that return all indicators the user clicked so far, helpful to persist it on your backend etc.

## 🏆 Example

Worth to invest 5 minutes to read!

The library has two parts, HTML declaration of the elements you want to indicate and a javascript object that initiated and generates indicators next to those HTML elements.

Each element has an identifier (defines via `data-tnu-id` attribute), that should unique across all of your system.

For example, assume you added a new reports system for your customer, probably you have a new menu item, that you want the user to be aware of, and stop shows it after a while.

You can mark the menu item as a new feature like that:

```html
<div 
    data-tnu-id="reports" 
    data-tnu-tooltip="You have new customers!" 
    data-tnu-expiration='2022-11-15T23:59:59.728Z'>
  Reports
</div>
```

This will show the indicator next to the menu item, until 2022-11-15, end of day. 

Later, you added few new reports to the list, and you want to make sure the user is aware of them, you can add the following to each:

<div style="font-size: 0.7em">Example in <a href="https://reactjs.org/">React.js</a></div>

```jsx
const ReportsComponent = () => {
    const reports = [{ id: 1, name: 'All customers'}, { id: 2, name: 'Youth customers' }];
    
    return (
        <div>
            { reports.map(report => {
                if (report.isNew) {
                    <div
                        data-tnu-id={`reports.${report.id}`}
                        data-tnu-tooltip={`New report added: ${report.name}`}>
                        {report.name}
                    </div>
                } else {
                    <div>{report.name}</div>
                }
            })}
        </div>
    );
}
```

This code will generate an indicator next to each new report. 

Later, you added a new feature to let user share a report with others, inside a report page there will be a Share button, and you can use this code to make the users aware of it:

```html
<button 
    data-tnu-id="reports.share" 
    data-tnu-tooltip="New! share this report..">
  Share
</button>
```