import type { Song } from 'wasp/entities';
import { HttpError } from 'wasp/server';
import fetch from 'node-fetch';
import { randomUUID } from 'crypto';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

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

type UploadFileArgs = {
  fileName: string;
  mimeType: string;
};

const s3Client = new S3Client({
  region: 'auto',
  endpoint: process.env.CLOUDFLARE_R2_ENDPOINT,
  credentials: {
    accessKeyId: process.env.CLOUDFLARE_R2_ACCESS_KEY!,
    secretAccessKey: process.env.CLOUDFLARE_R2_SECRET_KEY!,
  },
});

export const uploadFile = async ({ fileName, mimeType }: UploadFileArgs, context: any): Promise<{ uploadUrl: string; audioUrl: string }> => {
  if (!context.user) {
    throw new HttpError(401, 'Unauthorized');
  }

  const fileExtension = fileName.split('.').pop();
  const uniqueKey = `${randomUUID()}.${fileExtension}`;

  const s3Params = {
    Bucket: process.env.CLOUDFLARE_R2_BUCKET_NAME,
    Key: uniqueKey,
    ContentType: mimeType,
  };

  const command = new PutObjectCommand(s3Params);
  const uploadUrl = await getSignedUrl(s3Client, command, { expiresIn: 3600 });
  const audioUrl = `${process.env.CLOUDFLARE_R2_PUBLIC_URL}/${uniqueKey}`;

  return { uploadUrl, audioUrl };
};

export const createUploadedSong = async (args: { 
  title: string, 
  audioUrl: string, 
  musicStyle?: string, 
  lyrics?: string 
}, context: any): Promise<{song: Song }> => {
  if (!context.user) {
    throw new HttpError(401, 'Unauthorized');
  }


  // Step 1: Create song record 
  let song = await context.entities.Song.create({
    data: {
      title: args.title,
      audioUrl: args.audioUrl,
      tags: args.musicStyle || '',
      lyric: args.lyrics || '',
      status: 'UPLOADED',
      user: {
        connect: { id: context.user.id }
      },
      duration: 0,
    },
  });

  // Step 2: Generate image
  try {
    song = await generateImageForSong(song.id, context);
  } catch (error) {
    console.error('Error generating image for song:', error);
    // Continue even if image generation fails
  }
  console.log('song', song);
  return song ;
};

// Modified function to generate image using Cloudflare Worker AI
async function generateImageForSong(songId: string, context: any): Promise<Song>  {
  const song = await context.entities.Song.findUnique({
    where: { id: songId },
  });

  if (!song) {
    throw new Error(`Song with id ${songId} not found`);
  }

  const CLOUDFLARE_WORKER_URL = process.env.CLOUDFLARE_WORKER_URL;
  const CLOUDFLARE_WORKER_API_TOKEN = process.env.CLOUDFLARE_WORKER_API_TOKEN;
  const CLOUDFLARE_WORKER_TXT2IMG_MODEL_ID = process.env.CLOUDFLARE_WORKER_TXT2IMG_MODEL_ID;
  if (!CLOUDFLARE_WORKER_URL || !CLOUDFLARE_WORKER_API_TOKEN || !CLOUDFLARE_WORKER_TXT2IMG_MODEL_ID) {
    throw new HttpError(500, 'Cloudflare Worker configuration is missing');
  }

  try {

    const response = await fetch(`${CLOUDFLARE_WORKER_URL}/run/${CLOUDFLARE_WORKER_TXT2IMG_MODEL_ID}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${CLOUDFLARE_WORKER_API_TOKEN}`,
      },
      body: JSON.stringify({
        prompt: `Generate an album cover image for a song that suits the style of "${song.title}"`,
      }),
    });


    if (!response.ok) {
      throw new Error(`Image generation failed: ${response.statusText}`);
    }

    const imageData = await response.json() as { success: boolean, result: { image: string } };

    if (!imageData.success || !imageData.result || !imageData.result.image) {
      throw new Error('Invalid response from image generation');
    }


    // Convert base64 to buffer
    const imageBuffer = Buffer.from(imageData.result.image, 'base64');

    // Extract the file name without extension from the audioUrl
    const audioFileName = song.audioUrl.split('/').pop()?.split('.')[0];
    if (!audioFileName) {
      throw new Error('Unable to extract file name from audioUrl');
    }

    // Use the same file name for the image, but with .png extension
    const uniqueKey = `${audioFileName}.png`;


    // Upload image to R2
    const s3Params = {
      Bucket: process.env.CLOUDFLARE_R2_BUCKET_NAME,
      Key: uniqueKey,
      Body: imageBuffer,
      ContentType: 'image/png',
    };

    const command = new PutObjectCommand(s3Params);
    await s3Client.send(command);


    const imageUrl = `${process.env.CLOUDFLARE_R2_PUBLIC_URL}/${uniqueKey}`;

    // Update the song with the generated image URL
    const updatedSong = await context.entities.Song.update({
      where: { id: songId },
      data: {
        imageUrl: imageUrl,
        status: 'READY' 
      },
    });

    if (!updatedSong) {
      throw new Error(`Song with id ${songId} not found`);
    }

    console.log('updatedSong', updatedSong);
    return updatedSong;

  } catch (error) {
    console.error('Error generating image for song:', error);
    // Don't throw an error here, as we don't want to interrupt the song creation process
    // Instead, log the error and continue
    return song;
  }
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