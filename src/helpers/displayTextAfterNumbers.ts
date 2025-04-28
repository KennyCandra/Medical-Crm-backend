export default function displayTextAfterNumbers(inputString) {
    const regex = /\d+-\s*([^]*?)(?=\s*\d+-|$)/g;

    let match;
    const results = [];

    while ((match = regex.exec(inputString)) !== null) {
        results.push(match[1].trim());
    }

    if (results.length > 0) {
        results.forEach((text) => {
            console.log(text);
        });
    } else {
        console.log("No matching text found in the specified format.");
    }

    return results;
}
