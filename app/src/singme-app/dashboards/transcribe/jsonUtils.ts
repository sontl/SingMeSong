export function repairIncompleteJson(incompleteJson: string, originalSubtitle: any[]): string {
  if (!incompleteJson.trim()) {
    return '[]';
  }

  let repairedJson = incompleteJson.trim();

  // Ensure the JSON starts with an opening bracket
  if (!repairedJson.startsWith('[')) {
    repairedJson = '[' + repairedJson;
  }

  // Find the last complete object
  const lastCompleteObjectIndex = repairedJson.lastIndexOf('}');

  if (lastCompleteObjectIndex !== -1) {
    // Keep everything up to and including the last complete object
    repairedJson = repairedJson.substring(0, lastCompleteObjectIndex + 1);

    // Check if there's an incomplete object after the last complete one
    const remainingPart = incompleteJson.substring(lastCompleteObjectIndex + 1);
    if (remainingPart.includes('{')) {
      // Determine if we're in a "words" array or in the parent object
      if (repairedJson.lastIndexOf('"words":[') > repairedJson.lastIndexOf('}]')) {
        // We're in a "words" array, add a complete word object
        repairedJson += ',{"end":"","start":"","text":""}]}';
      } else {
        // We're in the parent object, close the previous object if needed and add a complete parent object
        if (!repairedJson.endsWith('}')) {
          repairedJson += ']}';
        }
        repairedJson += ',{"start":"","end":"","sentence":"","words":[]}';
      }
    }

    // Close the outer array if it's not closed
    if (!repairedJson.endsWith(']')) {
      repairedJson += ']';
    }
  } else {
    // If no complete object found, return an empty array
    repairedJson = '[]';
  }

  // Replace any incomplete word object with a complete one
  repairedJson = repairedJson.replace(/\{(?:(?:"end"|"start"|"text")(?::"[^"]*")?,?)*\}/g, '{"end":"","start":"","text":""}');

  // Replace any incomplete parent object with a complete one
  repairedJson = repairedJson.replace(/\{(?:(?:"start"|"end"|"sentence"|"words")(?::(?:"[^"]*"|\[[^\]]*\])?)?,?)*\}/g, '{"start":"","end":"","sentence":"","words":[]}');

  // Remove any trailing commas inside arrays
  repairedJson = repairedJson.replace(/,\s*]/g, ']');

  // Ensure the JSON is valid
  try {
    JSON.parse(repairedJson);
  } catch (e) {
    // If parsing fails, return an empty array
    return '[]';
  }

  return repairedJson;
}

export function isValidJSON(str: string): boolean {
  if (typeof str !== 'string') return false;
  try {
    JSON.parse(str);
    return true;
  } catch (e) {
    return false;
  }
}
