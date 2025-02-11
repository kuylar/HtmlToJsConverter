class Component {
	/**
	 * Root element of the component
	 * @type {HTMLElement}
	 */
	root;

	/**
	 * All elements that had the kjs-parserName attribute before compiling
	 * @type {Object.<string, HTMLElement>}
	 */
	elements;

	/**
	 * All managed lists inside the component
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
		this.parentModel = model;
		this.items = items;
		this._addItem = addItemFunction.bind(this);
	}

	/**
	 * Adds a new item using the given item
	 * @param item Object
	 * @param [appendToInnerList=true] Boolean
	 * @returns HTMLElement
	 */
	addItem(item, appendToInnerList) {
		appendToInnerList = appendToInnerList !== undefined ? appendToInnerList : true;
		if (appendToInnerList)
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
			this.addItem(item, false);
		}
	}
}