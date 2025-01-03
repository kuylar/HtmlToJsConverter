const inputElement = document.getElementById("html")
	const outputElement = document.getElementById("js")
	const parser = new DOMParser()
	const outputTemplate = "(model) => {\n\t{{CODE}}\n};"
	const modelRegex = /{{ (.+?) }}/g
	const emptyStringRegex = /"" \+ (.+?) \+ ""/g
	let elementIndex = 0;

	inputElement.oninput = () => {
		parse()
	}

	function parse() {
		try {
			const inputHtml = inputElement.value
			const doc = parser.parseFromString(inputHtml, "text/html")
			const rootElement = doc.body.children[0];
			outputElement.value = outputTemplate.replace("{{CODE}}",
				parseRootElement(rootElement)
					.split("\n")
					.join("\n\t")
					.replace(modelRegex, `" + model.$1 + "`)
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
		output += `\nreturn ${elementName};`;
		return output;
	}


	function parseElement(element, parentElementName) {
		let output = "";
		let elementName = getElementName(element);
		output += `const ${elementName} = document.createElement("${element.tagName}");\n`
		output += getElementAttributes(element, elementName);
		for (const childElement of element.children) {
			output += "\n" + parseElement(childElement, elementName) + "\n"
		}
		output += `${parentElementName}.appendChild(${elementName});`;
		return output;
	}

	function getElementAttributes(element, elementName) {
		let output = "";
		for (let i = 0; i < element.attributes.length; i++) {
			const attribute = element.attributes[i];
			if (attribute.name === "data-parser-name") continue
			output += `${elementName}.setAttribute("${attribute.name}", "${attribute.value}");\n`;
		}
		if (element.childElementCount === 0) {
			let innerHtml = element.innerHTML.trim();
			if (innerHtml.length > 0)
				output += `${elementName}.innerHTML = "${innerHtml}";\n`;
		}
		return output;
	}

	function getElementName(element, defaultElementName) {
		if (element.getAttribute("data-parser-name")) {
			return element.getAttribute("data-parser-name")
		} else if (defaultElementName) {
			return defaultElementName;
		} else {
			elementIndex++;
			return `element${elementIndex}`;
		}
	}