// Constant Definitions
const templates = document.querySelectorAll("[data-template]");

// Function Executions
multiTemplates(templates);

// Function Definitions
async function multiTemplates(elements) {
	for (let i = 0; i < elements.length; i++) {
		await loadTemplate(elements[i]);
	}
	return elements;
}

async function loadTemplate(element) {
	if (!element.dataset) {
		console.log("Element Does Not Have Template Information:", element);
		return false;
	}
	return await fetch(element.dataset.template)
		.then((res) => res.text())
		.then(async (txt) => {
			let parser = new DOMParser();
			let html = parser.parseFromString(txt, "text/html").body;
			let temp = html.querySelectorAll("[data-template]");
			await multiTemplates(temp);
			if (element.dataset.templateReplace === "true") {
				element.outerHTML = html.innerHTML;
			} else {
				element.innerHTML = html.innerHTML;
			}
			if (element.dataset.templateScript) {
				loadScript(element.dataset.templateScript)
			}
			return element;
		});
}

async function loadScript(scriptUrl) {
	return await fetch(scriptUrl).then((res) => res.text()).then((txt) => {
		eval(txt);
	});
}