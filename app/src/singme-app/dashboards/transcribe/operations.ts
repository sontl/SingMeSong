import type { Song } from 'wasp/entities';
import { HttpError } from 'wasp/server';
import fetch from 'node-fetch';

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

export const transcribeSong = async (songId: string, context: any): Promise<{ success: boolean, subtitle?: string }> => {
  if (!context.user) {
    throw new HttpError(401, 'Unauthorized');
  }

  const song = await context.entities.Song.findUnique({
    where: { id: songId },
  });

  if (!song || !song.audioUrl) {
    throw new HttpError(404, 'Song not found or audio URL is missing');
  }

  const GLADIA_API_KEY = process.env.GLADIA_API_KEY;
  if (!GLADIA_API_KEY) {
    throw new HttpError(500, 'Gladia API key is not set');
  }

  try {
    // Step 1: Request transcription
    const transcriptionResponse = await fetch('https://api.gladia.io/v2/transcription', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-gladia-key': GLADIA_API_KEY,
      },
      body: JSON.stringify({
        audio_url: song.audioUrl,
      }),
    });

    if (!transcriptionResponse.ok) {
      throw new Error(`Transcription request failed: ${transcriptionResponse.statusText}`);
    }

    const transcriptionData = await transcriptionResponse.json() as TranscriptionResponse;

    // Step 2: Fetch transcription result
    const resultResponse = await fetch(transcriptionData.result_url, {
      headers: {
        'x-gladia-key': GLADIA_API_KEY,
      },
    });

    if (!resultResponse.ok) {
      throw new Error(`Fetching transcription result failed: ${resultResponse.statusText}`);
    }

    const resultData = await resultResponse.json() as TranscriptionResult;

    if (resultData.status === 'done' && resultData.result) {
      // Update the song with the transcription
      await context.entities.Song.update({
        where: { id: songId },
        data: {
          subtitle: resultData.result.transcription.full_transcript,
        },
      });

      return { success: true, subtitle: resultData.result.transcription.full_transcript };
    } else {
      return { success: false };
    }
  } catch (error) {
    console.error('Error transcribing song:', error);
    throw new HttpError(500, 'Failed to transcribe song');
  }
};

// You can add other transcribe-related functions here if needed