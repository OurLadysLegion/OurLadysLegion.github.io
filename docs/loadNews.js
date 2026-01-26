// Constant Definitions
const newsOutput = document.getElementById("newsOutput");

// Function Executions
getNews();

// Function Definitions
function parseArticle(txt) {
    // magic
    txt = txt.replace(/^([*-_])\1{2,}$/gm, "<hr/>")
    .replace(/^# (.*$)/gm, "<h1>$1</h1>")
    .replace(/^## (.*$)/gm, "<h2>$1</h2>")
    .replace(/^### (.*$)/gm, "<h3>$1</h3>")
    .replace(/^#### (.*$)/gm, "<h4>$1</h4>")
    .replace(/^##### (.*$)/gm, "<h5>$1</h5>")
    .replace(/^###### (.*$)/gm, "<h6>$1</h6>")
    .replace(/\*(.*?)\*/g, "<strong>$1</strong>")
    .replace(/%(.*?)%/g, "<em>$1</em>")
    .replace(/_(.*?)_/g, "<u>$1</em>");
    return txt.split("\n").join("<br>");
}

async function getNews(outputElement=newsOutput) {
    var output = "";
    const newsIndex = await fetch("/NewsArticles/index", {
        cache: "no-store"
    }).then((res) => {
            if (res.ok) {
                return res.text();
            }
        }).then((txt) => {
            return txt.split("\n");
        });
	for (let i in newsIndex.reverse()) {
        if (newsIndex[i].length <= 0) {
            continue;
        }
         output += await fetch("/NewsArticles/" + newsIndex[i], {
             cache: "no-store"
        }).then((res) => {
                if (res.ok) {
                    return res.text();
                }
            }).then((txt) => {
                if (txt && txt.length > 0) {
                    return parseArticle(txt);
                } else {
                    return "";
                }
            });
    }
    outputElement.innerHTML = output;
    return output;
}
