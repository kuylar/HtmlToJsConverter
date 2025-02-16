# HTML to JS converter

Convert your components to JS classes & reuse them wherever you need

## Example

**Input:**
```html
<div>
    <h1 kjs-parsername="title">{{ model.title }}</h1>
    <p>{{ model.body }}</p>
    <p kjs-insertType=html>{{ model.body }}</p>
    <code kjs-insertType=text>{{ btoa("Top Secret Text") }}</code>
    <ul kjs-list="items">
        <li>{{ item.amount }}x {{ item.name }}</li>
    </ul>
</div>
```

**Calling the JS output:**
```js
const instance = new Component({
    title: "Shopping List",
    body: "Important shopping list. <b>Don't forget to buy these!!</b>",
    items: [
        {amount: 5, name: "Eggs"}, 
        {amount: 2, name: "Bags of milk"}
    ]
});
document.querySelector("body").append(instance.root);
```

**Output:**
```html
<div>
    <h1>Shopping List</h1>
    <p>Important shopping list. &lt;b&gt;Don't forget to buy these!!&lt;/b&gt;</p>
    <p>Important shopping list. <b>Don't forget to buy these!!</b></p>
    <code>VG9wIFNlY3JldCBUZXh0</code>
    <ul>
        <li>5x Eggs</li>
        <li>2x Bags of milk</li>
    </ul>
</div>
```