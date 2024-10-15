import { repairIncompleteJson } from '../src/singme-app/dashboards/transcribe/jsonUtils';

describe('repairIncompleteJson', () => {
  it('should repair incomplete JSON', () => {
    const incompleteJson = '[{"start":0,"end":1,"sentence":"Hello"},{"start":1,"end":2,"sentence":"World"';
    const originalSubtitle = [
      {"start":0,"end":1,"sentence":"Hello"},
      {"start":1,"end":2,"sentence":"World"},
      {"start":2,"end":3,"sentence":"Test"}
    ];

    const repairedJson = repairIncompleteJson(incompleteJson, originalSubtitle);
    const expectedJson = '[{"start":0,"end":1,"sentence":"Hello"},{"start":1,"end":2,"sentence":"World"}]';

    expect(repairedJson).toBe(expectedJson);
  });

  it('should handle already complete JSON', () => {
    const completeJson = '[{"start":0,"end":1,"sentence":"Hello"},{"start":1,"end":2,"sentence":"World"}]';
    const originalSubtitle = [
      {"start":0,"end":1,"sentence":"Hello"},
      {"start":1,"end":2,"sentence":"World"}
    ];

    const repairedJson = repairIncompleteJson(completeJson, originalSubtitle);

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
    const incompleteJson = '[{"start":0,"end":1,"sentence":"Hello"';
    const originalSubtitle = [
      {"start":0,"end":1,"sentence":"Hello"},
      {"start":1,"end":2,"sentence":"World"}
    ];

    const repairedJson = repairIncompleteJson(incompleteJson, originalSubtitle);
    const expectedJson = '[{"start":0,"end":1,"sentence":"Hello"}]';

    expect(repairedJson).toBe(expectedJson);
  });
});
