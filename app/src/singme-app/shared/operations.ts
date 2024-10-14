import type { Song } from 'wasp/entities';
import { HttpError } from 'wasp/server';
import { randomUUID } from 'crypto';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

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


export const getAllSongsByUser = async ({ searchTerm }: { searchTerm?: string }, context: any) => {
    if (!context.user) {
      throw new HttpError(401, 'Unauthorized');
    }
  
    console.log('Received searchTerm:', searchTerm); // Add this log for debugging
  
    const whereClause: any = {
      userId: context.user.id,
    };
  
    if (searchTerm && searchTerm.trim() !== '') {
      whereClause.title = {
        contains: searchTerm.trim(),
        mode: 'insensitive'
      };
    }
  
    console.log('Where clause:', whereClause); // Add this log for debugging
  
    const songs = await context.entities.Song.findMany({
      where: whereClause,
      orderBy: { createdAt: 'desc' },
    });
  
    console.log('Found songs:', songs.length); // Add this log for debugging
  
    return songs;
  };
  