import { repairIncompleteJson, isValidJSON } from '../src/singme-app/dashboards/transcribe/jsonUtils';

describe('repairIncompleteJson', () => {
  it('should repair incomplete JSON', () => {
    const incompleteJson = '[{"start":0,"end":1,"sentence":"Hello"},{"start":1,"end":2,"sentence":"World"';
    const originalSubtitle = [
      {"start":0,"end":1,"sentence":"Hello"},
      {"start":1,"end":2,"sentence":"World"},
      {"start":2,"end":3,"sentence":"Test"}
    ];

    const repairedJson = repairIncompleteJson(incompleteJson, originalSubtitle);
    const expectedJson = '[{"start":0,"end":1,"sentence":"Hello"},{"start":"","end":"","sentence":"","words":[]}]';
    expect(isValidJSON(repairedJson)).toBe(true);
    expect(repairedJson).toBe(expectedJson);
  });

  it('should handle already complete JSON', () => {
    const completeJson = '[{"start":0,"end":1,"sentence":"Hello"},{"start":"","end":"","sentence":"","words":[]}]';
    const originalSubtitle = [
      {"start":0,"end":1,"sentence":"Hello"},
      {"start":1,"end":2,"sentence":"World"}
    ];

    const repairedJson = repairIncompleteJson(completeJson, originalSubtitle);
    expect(isValidJSON(repairedJson)).toBe(true);
   expect(repairedJson).toBe(completeJson);
  });

  it('should handle empty JSON', () => {
    const emptyJson = '';
    const originalSubtitle: any[] = [];

    const repairedJson = repairIncompleteJson(emptyJson, originalSubtitle);

    expect(repairedJson).toBe('[]');
  });

  it('should handle JSON with only opening bracket', () => {
    const incompleteJson = '[';
    const originalSubtitle: any[] = [];

    const repairedJson = repairIncompleteJson(incompleteJson, originalSubtitle);

    expect(repairedJson).toBe('[]');
  });

  it('should handle JSON with partial object', () => {
    const incompleteJson = '[{"start":0,"end":1,"sentence":"Hello"},{"start":1,"end":2,"sentence"';
    const originalSubtitle = [
      {"start":0,"end":1,"sentence":"Hello"},
      {"start":1,"end":2,"sentence":"World"},
      {"start":2,"end":3,"sentence":"Test"}
    ];

    const repairedJson = repairIncompleteJson(incompleteJson, originalSubtitle);
    const expectedJson = '[{"start":0,"end":1,"sentence":"Hello"},{"start":"","end":"","sentence":"","words":[]}]';
    expect(isValidJSON(repairedJson)).toBe(true);
    expect(repairedJson).toBe(expectedJson);
  });

  it('should repair JSON with incomplete words array', () => {
    const incompleteJson = '[{"end":159.98,"start":157.04,"sentence":"Baby I\'m waiting on the phone apple","words":[{"end":157.56,"text":"Baby","start":157.04},{"end":158.02,"text":"I\'m","start":157.56},{"end":158.32,"text":"waiting","start":158.02},{"end":158.72,"text":"on","start":158.32},{"end":158.98,"text":"the","start":158.72},{"end":159.46,"text":"phone","start":158.98},{"end"';
    const originalSubtitle = [
      {"end":159.98,"start":157.04, "sentence" : "Baby I\'m waiting on the phone apple","words":[{"end":157.56,"text":"Baby","start":157.04},{"end":158.02,"text":"I\'m","start":157.56},{"end":158.32,"text":"waiting","start":158.02},{"end":158.72,"text":"on","start":158.32},{"end":158.98,"text":"the","start":158.72},{"end":159.46,"text":"phone","start":158.98},{"end":159.98,"text":"apple","start":159.46}]}
    ];

    const repairedJson = repairIncompleteJson(incompleteJson, originalSubtitle);
    const expectedJson = '[{"end":159.98,"start":157.04,"sentence":"Baby I\'m waiting on the phone apple","words":[{"end":157.56,"text":"Baby","start":157.04},{"end":158.02,"text":"I\'m","start":157.56},{"end":158.32,"text":"waiting","start":158.02},{"end":158.72,"text":"on","start":158.32},{"end":158.98,"text":"the","start":158.72},{"end":159.46,"text":"phone","start":158.98},{"end":"","start":"","text":""}]}]';
    console.log('repairedJson', repairedJson);
    expect(isValidJSON(repairedJson)).toBe(true);
    expect(repairedJson).toBe(expectedJson);
  });

  it('should repair JSON with incomplete words array - end property', () => {
    const incompleteJson = '[{"end":159.98,"start":157.04,"sentence":"Baby I\'m waiting on the phone apple","words":[{"end":157.56,"text":"Baby","start":157.04},{"end":158.02,"text":"I\'m","start":157.56},{"end":158.32,"text":"waiting","start":158.02},{"end":158.72,"text":"on","start":158.32},{"end":158.98,"text":"the","start":158.72},{"end":159.46,"text":"phone","start":158.98},{"end":';
    const repairedJson = repairIncompleteJson(incompleteJson, []);
    const expectedJson = '[{"end":159.98,"start":157.04,"sentence":"Baby I\'m waiting on the phone apple","words":[{"end":157.56,"text":"Baby","start":157.04},{"end":158.02,"text":"I\'m","start":157.56},{"end":158.32,"text":"waiting","start":158.02},{"end":158.72,"text":"on","start":158.32},{"end":158.98,"text":"the","start":158.72},{"end":159.46,"text":"phone","start":158.98},{"end":"","start":"","text":""}]}]';
    
    expect(isValidJSON(repairedJson)).toBe(true);
    expect(repairedJson).toBe(expectedJson);
  });

  it('should repair JSON with incomplete words array - start property', () => {
    const incompleteJson = '[{"end":159.98,"start":157.04,"sentence":"Baby I\'m waiting on the phone apple","words":[{"end":157.56,"text":"Baby","start":157.04},{"end":158.02,"text":"I\'m","start":157.56},{"end":158.32,"text":"waiting","start":158.02},{"end":158.72,"text":"on","start":158.32},{"end":158.98,"text":"the","start":158.72},{"end":159.46,"text":"phone","start":158.98},{"start"';
    const repairedJson = repairIncompleteJson(incompleteJson, []);
    const expectedJson = '[{"end":159.98,"start":157.04,"sentence":"Baby I\'m waiting on the phone apple","words":[{"end":157.56,"text":"Baby","start":157.04},{"end":158.02,"text":"I\'m","start":157.56},{"end":158.32,"text":"waiting","start":158.02},{"end":158.72,"text":"on","start":158.32},{"end":158.98,"text":"the","start":158.72},{"end":159.46,"text":"phone","start":158.98},{"end":"","start":"","text":""}]}]';
    
    expect(isValidJSON(repairedJson)).toBe(true);
    expect(repairedJson).toBe(expectedJson);
  });

  it('should repair JSON with incomplete words array - text property', () => {
    const incompleteJson = '[{"end":159.98,"start":157.04,"words":[{"end":157.56,"text":"Baby","start":157.04},{"end":158.02,"text":"I\'m","start":157.56},{"end":158.32,"text":"waiting","start":158.02},{"end":158.72,"text":"on","start":158.32},{"end":158.98,"text":"the","start":158.72},{"end":159.46,"text":"phone","start":158.98},{"text"';
    const repairedJson = repairIncompleteJson(incompleteJson, []);
    const expectedJson = '[{"end":159.98,"start":157.04,"words":[{"end":157.56,"text":"Baby","start":157.04},{"end":158.02,"text":"I\'m","start":157.56},{"end":158.32,"text":"waiting","start":158.02},{"end":158.72,"text":"on","start":158.32},{"end":158.98,"text":"the","start":158.72},{"end":159.46,"text":"phone","start":158.98},{"end":"","start":"","text":""}]}]';
    
    expect(isValidJSON(repairedJson)).toBe(true);
    expect(repairedJson).toBe(expectedJson);
  });

  it('should repair JSON with multiple incomplete properties in words array', () => {
    const incompleteJson = '[{"end":159.98,"start":157.04,"words":[{"end":157.56,"text":"Baby","start":157.04},{"end":158.02,"text":"I\'m","start":157.56},{"end":158.32,"text":"waiting","start":158.02},{"end":158.72,"text":"on","start":158.32},{"end":158.98,"text":"the","start":158.72},{"end":159.46,"text":"phone","start":158.98},{"end": "","start":"","text":';
    const repairedJson = repairIncompleteJson(incompleteJson, []);
    const expectedJson = '[{"end":159.98,"start":157.04,"words":[{"end":157.56,"text":"Baby","start":157.04},{"end":158.02,"text":"I\'m","start":157.56},{"end":158.32,"text":"waiting","start":158.02},{"end":158.72,"text":"on","start":158.32},{"end":158.98,"text":"the","start":158.72},{"end":159.46,"text":"phone","start":158.98},{"end":"","start":"","text":""}]}]';
    
    expect(isValidJSON(repairedJson)).toBe(true);
   expect(repairedJson).toBe(expectedJson);
  });

  it('should handle JSON with multiple parent objects and partial object', () => {
    const incompleteJson = '[{"start":0,"end":1,"sentence":"Hello"},{"start":1,"end":2,"sentence":"World"},{"start":3,"end":4,"sentence":"Test"';
    const originalSubtitle = [
      {"start":0,"end":1,"sentence":"Hello"},
      {"start":1,"end":2,"sentence":"World"},
      {"start":3,"end":4,"sentence":"Test"}
    ];

    const repairedJson = repairIncompleteJson(incompleteJson, originalSubtitle);
    const expectedJson = '[{"start":0,"end":1,"sentence":"Hello"},{"start":1,"end":2,"sentence":"World"},{"start":"","end":"","sentence":"","words":[]}]';

    expect(repairedJson).toBe(expectedJson);
  });
});

describe('isValidJSON', () => {
  it('should return true for valid JSON', () => {
    expect(isValidJSON('{"key": "value"}')).toBe(true);
    expect(isValidJSON('[1, 2, 3]')).toBe(true);
    expect(isValidJSON('{"nested": {"array": [1, 2, 3]}}')).toBe(true);
  });

  it('should return false for invalid JSON', () => {
    expect(isValidJSON('{"key": "value"')).toBe(false);
    expect(isValidJSON('[1, 2, 3')).toBe(false);
    expect(isValidJSON('not json')).toBe(false);
  });

  it('should return false for empty string', () => {
    expect(isValidJSON('')).toBe(false);
  });

  it('should return false for non-string input', () => {
    expect(isValidJSON(null as any)).toBe(false);
    expect(isValidJSON(undefined as any)).toBe(false);
    expect(isValidJSON(123 as any)).toBe(false);
  });

  it('should return true for valid JSON with whitespace', () => {
    expect(isValidJSON('  {"key": "value"}  ')).toBe(true);
    expect(isValidJSON('\n[1, 2, 3]\n')).toBe(true);
  });

  it('should return false for almost-valid JSON', () => {
    expect(isValidJSON('{key: "value"}')).toBe(false);
    expect(isValidJSON('[1, 2, 3,]')).toBe(false);
  });
});
