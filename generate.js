const fs = require("fs");

class UserDefinedSnippetGenerator {
    constructor() {
        this.directoryPath = "src";
    }

    getTextBetweenTemplateAndEnd(data) {
        const regex = /\/\/\#TEMPLATE([\s\S]+?)\/\/\#END/;
        const match = data.match(regex);

        if (match) {
            const snippetText = match[1].trim();
            return snippetText;
        }

        return null;
    }

    generateSnippets() {
        let snippetPath = `${process.cwd()}/${this.directoryPath}`;
        snippetPath = "D:\\NEXT_JS\\mailsender\\src";
        let snippets = [];

        console.log(snippetPath);
        let files = fs.readdirSync(snippetPath, {
            recursive: true,
        });
        for (let n = 0; n < files.length; n++) {
            let file = files[n];
            if (file.endsWith(".tsx") == false) continue;

            console.log(file);

            let data = fs.readFileSync(`${snippetPath}/${file}`, "utf-8");
            let lines = data.split("\n");
            let prefix = "";
            let bodyArr = [];
            let record = false;

            for (let i = 0; i < lines.length; i++) {
                let line = lines[i].trim();
                if (line.indexOf("#TEMPLATE") > -1) {
                    prefix = line.split(" ")[1];
                    record = true;
                } else if (line.indexOf("#END") > -1) {
                    snippets.push({
                        prefix: prefix,
                        body: bodyArr.join("\n"),
                    });

                    bodyArr = [];
                    prefix = "";
                    record = false;
                } else {
                    if (record) {
                        bodyArr.push(line);
                    }
                }
            }
        }

        console.log("----");
        console.log(`${snippets.length}`);
        console.log(snippets);
        console.log(snippets);
        console.log("----");

        let snippetContent = {};
        for (let i = 0; i < snippets.length; i++) {
            let snippet = snippets[i];
            console.log(`Prefix: ${snippet.prefix}`);
            console.log(`Code: ${snippet.body}`);
            snippetContent[snippet.prefix] = {
                prefix: snippet.prefix,
                body: snippet.body,
            };
        }

        this.saveSnippetsToFile(snippetContent);
    }

    saveSnippetsToFile(snippets) {
        const snippetFilePath = `${process.cwd()}/.vscode/udf.code-snippets`;
        const snippetContent = JSON.stringify(snippets, null, 2);

        fs.writeFileSync(snippetFilePath, snippetContent);
        console.log("Snippet file generated successfully.");
    }
}

// Gunakan class UserDefinedSnippetGenerator
const snippetGenerator = new UserDefinedSnippetGenerator();
snippetGenerator.generateSnippets();
