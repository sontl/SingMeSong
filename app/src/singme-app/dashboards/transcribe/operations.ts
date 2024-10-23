import type { Song } from 'wasp/entities';
import { HttpError } from 'wasp/server';
import fetch from 'node-fetch';
import { GoogleGenerativeAI } from "@google/generative-ai";
import { repairIncompleteJson } from './jsonUtils';

// Define types for API responses
interface TranscriptionResponse {
  result_url: string;
}

interface TranscriptionResult {
  status: string;
  result?: {
    transcription: {
      full_transcript: string;
      // Add other fields as needed based on the API response
    };
  };
}


export const transcribeSong = async ({songId, inputLang, outputLang}: {songId: string, inputLang: string, outputLang: string}, context: any): Promise<{ success: boolean, updatedSong: Song }> => {
  if (!context.user) {
    throw new HttpError(401, 'Unauthorized');
  }

  const song = await context.entities.Song.findUnique({
    where: { id: songId },
  });

  if (!song || !song.audioUrl) {
    throw new HttpError(404, 'Song not found or audio URL is missing');
  }

  const API_URL = process.env.HALLU_API_URL; 
  if (!API_URL) {
    throw new HttpError(500, 'Hallu API URL is not set');
  }

  try {
    // Prepare request body as JSON
    const requestBody = JSON.stringify({
      url: song.audioUrl,
      lng: outputLang,
      lng_input: inputLang
    });

    // Send request to Hallu API
    const transcriptionResponse = await fetch(API_URL, {
      method: 'POST',
      body: requestBody,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!transcriptionResponse.ok) {
      throw new Error(`Transcription request failed: ${transcriptionResponse.statusText}`);
    }

    const transcriptionData = await transcriptionResponse.json();

    // Update the song with the transcription
    const updatedSong = await context.entities.Song.update({
      where: { id: songId },
      data: {
        subtitle: (transcriptionData as { srt: string, json: string }).json,
        transcription: (transcriptionData as { srt: string, json: string }).srt,
        lyric: song.lyric ? song.lyric : (transcriptionData as { text: string }).text,
      },
    });

    return { 
      success: true, 
      updatedSong
    };
  } catch (error) {
    console.error('Error transcribing song:', error);
    throw new HttpError(500, 'Failed to transcribe song');
  }
};

export const aiCorrectTranscription = async (args: { songId: string }, context: any): Promise<{ success: boolean, correctedSubtitle?: string }> => {
  if (!context.user) {
    throw new HttpError(401, 'Unauthorized');
  }

  const song = await context.entities.Song.findUnique({
    where: { id: args.songId },
  });

  if (!song || !song.subtitle || !song.lyric) {
    throw new HttpError(404, 'Song not found or missing subtitle/lyric');
  }

  const API_KEY = process.env.GOOGLE_GEMINI_API_KEY;
  if (!API_KEY) {
    throw new HttpError(500, 'Google Gemini API key is not set');
  }

  try {
    const genAI = new GoogleGenerativeAI(API_KEY);
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash-exp-0827" });

    const prompt = `
You are an excellent translator specializing in transcript correction. The user will provide you with a JSON file containing transcribed text and corresponding timestamps. Some portions of the transcription may contain errors. Along with the transcribed text, the user will also provide the original corrected version of the text for reference. Your task is to:

Compare the transcribed text with the original corrected text.
Identify and correct any incorrectly transcribed words.
Replace only the incorrect words in the transcription, leaving the rest of the text and timestamps unchanged.
Ensure that punctuation, formatting, and spacing remain consistent with the original transcribed text.
Do not alter the timestamps or any other metadata within the JSON file.
Return the whole corrected JSON in the same structure and format. JSON content must be in the same line.
Just give me the corrected JSON, do not include any other text, other messages, or explanations or questions. 

Transcribed JSON:
${JSON.stringify(song.subtitle)}

Original corrected version, ignore the word in the brackets:
${song.lyric}
    `;

    console.log('Sending prompt to Gemini API');
    const result = await model.generateContent(prompt);
    const correctedSubtitle = result.response.text();
    console.log('Received response from Gemini API');

    let correctedSubtitleJson;
    try {
      correctedSubtitleJson = JSON.parse(correctedSubtitle);
      console.log('Successfully parsed correctedSubtitle JSON');
    } catch (parseError) {
      console.error('Error parsing JSON:', parseError);
      console.log('Attempting to repair JSON');
      
      // Attempt to repair the JSON
      const repairedJson = repairIncompleteJson(correctedSubtitle, song.subtitle);
      console.log('Repaired JSON:', repairedJson);
      try {
        correctedSubtitleJson = JSON.parse(repairedJson);
        console.log('Successfully parsed repaired JSON');
      } catch (repairError) {
        console.error('Error parsing repaired JSON:', repairError);
        throw new HttpError(500, 'Failed to parse corrected subtitle');
      }
    }

    // Merge the corrected subtitle with the existing subtitle
    const mergedSubtitle = mergeSubtitles(song.subtitle, correctedSubtitleJson);

    // Update the song with the merged subtitle
    await context.entities.Song.update({
      where: { id: args.songId },
      data: {
        subtitle: mergedSubtitle,
        subtitleFixedByAI: true,
      },
    });

    return { success: true, correctedSubtitle: JSON.stringify(mergedSubtitle) };
  } catch (error) {
    console.error('Error correcting transcription:', error);
    if (error instanceof HttpError) {
      throw error;
    }
    throw new HttpError(500, 'Failed to correct transcription');
  }
};

export const updateSubtitleSentence = async (args: { songId: string, index: number, field: 'start' | 'end' | 'sentence', newValue: string }, context: any): Promise<{ success: boolean }> => {
  if (!context.user) {
    throw new HttpError(401, 'Unauthorized');
  }

  const song = await context.entities.Song.findUnique({
    where: { id: args.songId },
  });

  if (!song || !song.subtitle) {
    throw new HttpError(404, 'Song not found or missing subtitle');
  }

  try {
    const subtitleData = song.subtitle;
    if (args.index >= 0 && args.index < subtitleData.length) {
      if (args.field === 'sentence') {
        const oldSentence = subtitleData[args.index].sentence;
        const newSentence = args.newValue;
        const oldWords = subtitleData[args.index].words;
        const newWords = newSentence.split(' ');

        if (oldWords.length === newWords.length) {
          // Update words without changing timing
          subtitleData[args.index].words = oldWords.map((word: any, i: any) => ({
            ...word,
            text: newWords[i],
          }));
        } else {
          // Recalculate word timings
          const sentenceStart = subtitleData[args.index].start;
          const sentenceEnd = subtitleData[args.index].end;
          const duration = sentenceEnd - sentenceStart;
          const wordDuration = duration / newWords.length;

          subtitleData[args.index].words = newWords.map((word: any, i: any) => ({
            text: word,
            start: sentenceStart + i * wordDuration,
            end: sentenceStart + (i + 1) * wordDuration,
          }));
        }

        subtitleData[args.index].sentence = newSentence;
      } else if (args.field === 'start' || args.field === 'end') {
        subtitleData[args.index][args.field] = parseFloat(args.newValue);
      }

      await context.entities.Song.update({
        where: { id: args.songId },
        data: {
          subtitle: subtitleData,
        },
      });

      return { success: true };
    } else {
      throw new HttpError(400, 'Invalid index');
    }
  } catch (error) {
    console.error('Error updating subtitle:', error);
    throw new HttpError(500, 'Failed to update subtitle');
  }
};

// Helper function to merge subtitles
function mergeSubtitles(originalSubtitle: any[], correctedSubtitle: any[]): any[] {
  return originalSubtitle.map((original, index) => {
    if (index < correctedSubtitle.length) {
      return {
        ...original,
        sentence: correctedSubtitle[index].sentence,
        words: correctedSubtitle[index].words || original.words,
      };
    }
    return original;
  });
}
