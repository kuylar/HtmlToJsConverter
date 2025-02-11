const inputElement = document.getElementById("html")
const outputElement = document.getElementById("js")
const parser = new DOMParser()
const outputStart = "class NewComponent extends Component {\n\tconstructor(model) {\n\t\tsuper(model);";
const outputPadding = "\n\t\t";
const outputEnd = "\n\t}\n}";
const modelRegex = /{{ ?(.+?) ?}}/g
const emptyStringRegex = /`\${(.+?)}`/g
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
		elementIndex = 0;
		const inputHtml = inputElement.value
		const doc = parser.parseFromString(inputHtml, "text/html")
		const rootElement = doc.body.children[0];
		outputElement.value = outputStart +
			outputPadding +
			outputPadding +
			parseRootElement(rootElement)
				.split("\n")
				.join(outputPadding) +
			outputEnd;
	} catch (e) {
		outputElement.value = "Failed to parse HTML.\n" + e.toString()
	}
}

function parseRootElement(element) {
	const elementName = getElementName(element, "c")
	let output = `const ${elementName} = document.createElement("${element.tagName}");\n`;
	output += getElementAttributes(element, elementName);
	for (const childElement of element.children) {
		output += "\n" + parseElement(childElement, elementName) + "\n"
	}
	output += "\n";
	output += `this.root = ${elementName};\n`
	specialElements.forEach((elem) => {
		output += `this.elements["${elem}"] = ${elem};\n`
	});
	return output.trim();
}


function parseElement(element, parentElementName, inList) {
	inList = inList || false;
	let output = "";
	let elementName = getElementName(element);
	output += `const ${elementName} = document.createElement("${element.tagName}");\n`;
	output += getElementAttributes(element, elementName, inList);
	const listItem = element.getAttribute("kjs-list");
	if (listItem) {
		output += parseList(element, elementName, listItem);
	} else {
		for (const childElement of element.children) {
			output += "\n" + parseElement(childElement, elementName) + "\n"
		}
	}
	output += `${parentElementName}.appendChild(${elementName});`;

	if (inList) {
		output += `\nreturn ${elementName};`
	}
	return output;
}

function parseList(element, elementName, listItem) {
	let output = `this.lists["${elementName}"] = new List(\n`
	output += `\t${elementName},\n`;
	output += "\tmodel,\n"
	output += `\tmodel.${listItem},\n`
	output += `\tfunction (model, item) {`;
	for (const childElement of element.children) {
		output += "\n\t\t" + parseElement(childElement, "this.root", true).split("\n").join("\n\t\t") + "\n"
	}
	output += `\t}\n`;
	output += ");\n";
	output += `this.lists["${elementName}"].refresh();\n`;
	return output;
}

function getElementAttributes(element, elementName) {
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
		if (innerHtml.length > 0) {
			const inner = innerHtml
				.replaceAll("`", "\\`")
				.replace(modelRegex, "${$1}")
				.replace(emptyStringRegex, "$1");
			output += `${elementName}.inner${type} = \`${inner}\`;\n`;
		}
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
		return `e${elementIndex.toString(16)}`;
	}
}

document.getElementById("html").innerHTML = `<div>\n\t<h1 kjs-parsername="title">Hello {{ model.name }}</h1>\n\t<p kjs-inserttype="html">HTML inserted element</p>\n\t<p kjs-inserttype="html">5 < 10 > 9</p>\n\t<p kjs-inserttype="text">TEXT inserted element</p>\n\t<p kjs-inserttype="text">5 < 10 > 9</p>\n\t<p>There are \`{{ model.items.length }}\` items in the list</p>\n\t<ul kjs-list="items">\n\t\t<li>{{ item }}</li>\n\t</ul>\n</div>`;
parse();