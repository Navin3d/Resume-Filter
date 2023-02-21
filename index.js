const PDFExtract = require('pdf.js-extract').PDFExtract;
const pdfExtract = new PDFExtract();
const fs = require("fs");
const path = require("path");
const { allPDFURL, outputPDFURL, outputTXTFile } = require("./config");


const all = path.join(__dirname, allPDFURL);
const shortlisted = path.join(__dirname, outputPDFURL);
const outFile = path.join(__dirname, outputTXTFile);

const extractTextFromPdf = async (filePath) => {
    const data = await pdfExtract.extract(filePath);
    return data;
}

const hasGithubText = (text) => {
    let matches = text.match("github.com/(.*)/?");
    if (matches) {
        let profileURL = "https://github.com/BOOMER".replace("BOOMER", matches[1]);
        console.log(profileURL);
        return profileURL;
    }
}

const shortListResume = (fileName) => {
    fs.rename(all + fileName, shortlisted + fileName, function (err) {
        if (err) throw err
    });
}

const writeDataToFile = (data) => {
    fs.appendFile(outFile, data, (err) => {
        if(err)
            console.log(err)
    });
}

// const regex = "/^(http(s?):\/\/)?(www\.)?github\.([a-z])+\/([A-Za-z0-9]{1,})+\/?$/i";

var fileContent = "";

fs.readdir(all, async (error, files) => {
    if (error) console.log(error)
    for (let file of files) {
        const all = path.join(__dirname, allPDFURL + file);
        const data = await extractTextFromPdf(all);
        console.log("======>", file);
        for (let page of data.pages) {
            for (let content of page.content) {
                const profile = hasGithubText(content.str);
                if (profile) {
                    fileContent += file + " ~ " + profile + "\t\n";
                    shortListResume(file);
                }
            }
        }
    };
    console.log(fileContent);
    writeDataToFile(fileContent);
});
