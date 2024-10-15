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
      // If there's an incomplete object, add it to the repaired JSON
      repairedJson += ',{';
      const lastPropertyIndex = remainingPart.lastIndexOf('"');
      if (lastPropertyIndex !== -1) {
        repairedJson += remainingPart.substring(remainingPart.indexOf('{') + 1, lastPropertyIndex + 1);
      }
      repairedJson += '}';
    }

    // Close the array if it's not closed
    if (!repairedJson.endsWith(']')) {
      repairedJson += ']';
    }
  } else {
    // If no complete object found, check if there's at least one opening brace
    const firstOpeningBrace = repairedJson.indexOf('{');
    if (firstOpeningBrace !== -1) {
      // Try to find the last property in the partial object
      const lastPropertyIndex = repairedJson.lastIndexOf('"');
      if (lastPropertyIndex > firstOpeningBrace) {
        // Keep everything up to the last property and close the object and array
        repairedJson = repairedJson.substring(0, lastPropertyIndex + 1) + '}]';
      } else {
        // If no property found, just close the object and array
        repairedJson = repairedJson.substring(0, firstOpeningBrace + 1) + '}]';
      }
    } else {
      // If no opening brace found, return an empty array
      repairedJson = '[]';
    }
  }

  return repairedJson;
}
