export default function displayTextAfterNumbers(inputString) {
    const regex = /\d+-\s*([^]*?)(?=\s*\d+-|$)/g;

    let match;
    const results = [];

    while ((match = regex.exec(inputString)) !== null) {
        results.push(match[1].trim());
    }

    return results;
}
