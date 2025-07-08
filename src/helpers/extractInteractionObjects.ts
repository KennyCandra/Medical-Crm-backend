export default function extractInteractionObjects(json) {
  if (!json?.hasInteractions || !Array.isArray(json.interactions)) {
    return [];
  }

  return json.interactions.map(({ drug1, drug2, description, severity }) => ({
    pair: `${drug1} + ${drug2}`,
    description,
    severity,
  }));
}
