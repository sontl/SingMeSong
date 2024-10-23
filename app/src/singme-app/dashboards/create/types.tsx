//#region Actions
type GptPayload = {
    hours: string;
};
  
type SunoPayload = {
    prompt: string;
    tags: string;
    title: string;
};

//#endregion
export type { GptPayload, SunoPayload };
