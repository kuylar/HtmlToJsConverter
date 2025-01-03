const inputElement = document.getElementById("html")
const outputElement = document.getElementById("js")
const parser = new DOMParser()
const outputTemplate = "(model) => {\n\t{{CODE}}\n};"
const listModelRegex = /{{INLIST ?(.+?) ?}}/g
const modelRegex = /{{ ?(.+?) ?}}/g
const jsRegex = /{! ?(.+?) ?!}/g
const emptyStringRegex = /"" \+ (.+?) \+ ""/g
let elementIndex = 0;
let specialElements = [];
let listElements = [];

inputElement.oninput = () => {
	parse()
}

function parse() {
	try {
		specialElements = [];
		listElements = [];
		const inputHtml = inputElement.value
		const doc = parser.parseFromString(inputHtml, "text/html")
		const rootElement = doc.body.children[0];
		outputElement.value = outputTemplate.replace("{{CODE}}",
			parseRootElement(rootElement)
				.split("\n")
				.join("\n\t")
				.replace(listModelRegex, `" + $1 + "`)
				.replace(modelRegex, `" + model.$1 + "`)
				.replace(jsRegex, `" + ($1) + "`)
				.replace(emptyStringRegex, "$1"));
	} catch (e) {
		outputElement.value = "Failed to parse HTML.\n" + e.toString()
	}
}

function parseRootElement(element) {
	let output = "";
	const elementName = getElementName(element, "container")
	elementIndex = 0;
	output += `const ${elementName} = document.createElement("${element.tagName}");\n`;
	output += getElementAttributes(element, elementName);
	for (const childElement of element.children) {
		output += "\n" + parseElement(childElement, elementName) + "\n"
	}
	output += `\nreturn { ${elementName}, elements: { ${specialElements.join(", ")} }, lists: { ${listElements.map(e => e.listName + ": { append: " + e.funName)} } } };`;
	return output;
}


function parseElement(element, parentElementName, padding, inList) {
	padding = padding || "";
	inList = inList || false;
	let output = "";
	let elementName = getElementName(element);
	output += padding + `const ${elementName} = document.createElement("${element.tagName}");\n` + padding;
	output += getElementAttributes(element, elementName, inList);
	const listItem = element.getAttribute("kjs-list");
	if (listItem) {
		const listItemFunName = `${elementName}ListItem`;
		output += `const ${listItemFunName} = (item) => {`;
		for (const childElement of element.children) {
			output += "\n" + parseElement(childElement, elementName, padding + "\t", true) + "\n" + padding
		}
		output += `${padding}};\n\n`;
		output += `for (const item of model.${listItem}) {\n` + padding
		output += `\t${listItemFunName}(item);`;
		output += `\n${padding}}\n\n`;
		listElements.push({
			funName: listItemFunName,
			listName: listItem
		});
	} else {
		for (const childElement of element.children) {
			output += "\n" + padding + parseElement(childElement, elementName) + "\n"
		}
	}
	output += padding + `${parentElementName}.appendChild(${elementName});`;
	return output;
}

function getElementAttributes(element, elementName, inList) {
	let output = "";
	let type = "Text";
	for (let i = 0; i < element.attributes.length; i++) {
		const attribute = element.attributes[i];
		if (attribute.name === "kjs-parsername") continue
		if (attribute.name === "kjs-list") continue
		if (attribute.name === "kjs-inserttype") {
			switch (attribute.value) {
				case "html":
					type = "HTML";
					break;
				case "text":
				default:
					type = "Text";
					break;
			}
			continue;
		}
		output += `${elementName}.setAttribute("${attribute.name}", "${attribute.value}");\n`;
	}
	if (element.childElementCount === 0) {
		let innerHtml = element.innerHTML.trim();
		if (innerHtml.length > 0)
			output += `${elementName}.inner${type} = "${(inList ? innerHtml.replace("{{", "{{INLIST") : innerHtml)}";\n`;
	}
	return output;
}

function getElementName(element, defaultElementName) {
	if (element.getAttribute("kjs-parsername")) {
		let name = element.getAttribute("kjs-parsername");
		specialElements.push(name);
		return name;
	} else if (defaultElementName) {
		return defaultElementName;
	} else {
		elementIndex++;
		return `element${elementIndex}`;
	}
}