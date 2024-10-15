import type { Song } from 'wasp/entities';
import { HttpError } from 'wasp/server';
import fetch from 'node-fetch';
import { GoogleGenerativeAI } from "@google/generative-ai";

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
    // Prepare form data
    const formData = new FormData();
    formData.append('url', song.audioUrl);
    formData.append('lng', outputLang); // Use the outputLang parameter
    formData.append('lng_input', inputLang); // Use the inputLang parameter

    // Send request to Hallu API
    const transcriptionResponse = await fetch(API_URL, {
      method: 'POST',
      body: formData,
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

    console.log('prompt', prompt);

    const result = await model.generateContent(prompt);

    
    const correctedSubtitle = result.response.text();
    console.log('correctedSubtitle', correctedSubtitle);
    // convert to json
    const correctedSubtitleJson = JSON.parse(correctedSubtitle);
    console.log('correctedSubtitleJson', correctedSubtitleJson);

    // Update the song with the corrected subtitle
    await context.entities.Song.update({
      where: { id: args.songId },
      data: {
        subtitle: correctedSubtitleJson,
        subtitleFixedByAI: true,
      },
    });

    return { success: true, correctedSubtitle };
  } catch (error) {
    console.error('Error correcting transcription:', error);
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
        subtitleData[args.index].sentence = args.newValue;
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

// You can add other transcribe-related functions here if needed
