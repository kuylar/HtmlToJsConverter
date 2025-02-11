class Component {
	/**
	 * @type {HTMLElement}
	 */
	root;

	/**
	 * @type {Object.<string, HTMLElement>}
	 */
	elements;

	/**
	 * @type {Object.<string, List>}
	 */
	lists;

	/**
	 * @type {Object}
	 */
	model;

	constructor(model) {
		this.model = model;
		this.elements = {};
		this.lists = {};
	}
}

class List {
	/**
	 * @type {HTMLElement}
	 */
	root;

	/**
	 * @type {Object}
	 */
	parentModel;

	/**
	 * @type {Object[]}
	 */
	items;

	/**
	 * @type {function(Object, Object):HTMLElement}
	 */
	_addItem;

	/**
	 * Creates a new instance of List
	 * @param root {HTMLElement}
	 * @param model {Object}
	 * @param items {Object[]}
	 * @param addItemFunction {function(Object, Object):HTMLElement}
	 */
	constructor(root, model, items, addItemFunction) {
		this.root = root;
		this.model = model;
		this.items = items;
		this._addItem = addItemFunction.bind(this);
	}

	/**
	 * Adds a new item using the given item
	 * @type item Object
	 * @returns HTMLElement
	 */
	addItem(item) {
		this.items.push(item);
		const el = this._addItem(this.parentModel, item);
		this.root.appendChild(el);
		return el;
	}

	/**
	 * Removes all items from the list
	 */
	clearItems() {
	}

	/**
	 * Clears the list and adds all items again using the items array
	 */
	refresh() {
		this.clearItems();
		for (const item of this.items) {
			this.addItem(item);
		}
	}
}