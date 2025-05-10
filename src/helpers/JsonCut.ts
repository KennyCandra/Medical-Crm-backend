function extractJsonFromString(inputString) {
    const jsonPattern = /\{[\s\S]*\}/;

    const match = inputString.match(jsonPattern);

    return match ? match[0] : null;
}

export default extractJsonFromString