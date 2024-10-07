import type {  Song } from 'wasp/entities';
import { SunoPayload } from './types';
import { ChatCompletionMessageParam } from 'openai/resources/chat/completions';
import type {
  GetAllSongsByUser,
  GenerateRandomLyrics,
  CreateSong,
  GetSongById
} from 'wasp/server/operations';
import { HttpError } from 'wasp/server';
import { GeneratedSchedule } from './schedule';
import OpenAI from 'openai';
import { checkSongStatusJob } from 'wasp/server/jobs';

const openai = setupOpenAI();
function setupOpenAI() {
  if (!process.env.OPENAI_API_KEY) {
    return new HttpError(500, 'OpenAI API key is not set');
  }
  return new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
}

export async function fetchAndUpdateSongDetails(songId: string, context: any) {
  try {
    const response = await fetch(`https://suno-api-bay-ten.vercel.app/api/get?ids=${songId}`);
    if (!response.ok) {
      throw new HttpError(response.status, 'Failed to fetch song details');
    }
    const data = await response.json();
    const updatedSong = data[0];

    const updates: Partial<Song> = {};
    if (updatedSong.image_url) {
      updates.imageUrl = updatedSong.image_url.replace('cdn2.suno.ai', 'sms2.b-cdn.net');
    }
    if (updatedSong.audio_url) {
      updates.audioUrl = updatedSong.audio_url.replace('cdn2.suno.ai', 'sms2.b-cdn.net');
    }
    if (updatedSong.duration) {
      updates.duration = updatedSong.duration;
    }

    return await context.entities.Song.update({
      where: { sId: songId },
      data: updates,
    });

  } catch (error) {
    console.error(`Error fetching and updating song details for songId ${songId}:`, error);
    throw error;
  }
}

//#region Random Lyrics Generation
type RandomLyricsPayload = {
  chat?: string;
};
export const generateRandomLyrics: GenerateRandomLyrics<
  RandomLyricsPayload,
  { lyrics: string; musicStyle: string; title: string }
> = async ({ chat }, context) => {
  if (!context.user) {
    throw new HttpError(401);
  }

  try {
    // check if openai is initialized correctly with the API key
    if (openai instanceof Error) {
      throw openai;
    }

    const messages: ChatCompletionMessageParam[] = [
      {
        role: 'system',
        content: `You are the Assistant Songwriter for Suno AI.
Your job is to help the user create song lyrics to be used for singing by Suno AI.
Please follow these rules:
1. Write lyrics per the instructions provided by the user. Keep the lyrics in the same language that the user provides. (Length of 3000 characters for the whole song text!)
2. Use the markup that Suno AI understands:
   * Song Sections:
      * [Intro]
      * [Verse 1]
      * [Chorus]
      * [Rap Verse]
      * [(Style) Verse/Chorus/...] (Indicate the style in parentheses)
      * [Bridge]
      * [Outro]
      * [Instrumental intro/outro]
      * More may be added, but they should be in brackets and English
   * Sound Effects:
      * [Laughter]
      * [Cry]
      * [Scream]
      * [Whisper: "TEXT, **in the same language that the rest of the lyrics are in!!!** "]
      * [Censored beep]
      * [Sound of typing]
      * [Gunshot]
      * [Slowed and Reverbed Sample: "TEXT, **in the same language that the rest of the lyrics are in!!!** "]
      * Almost anything the user can imagine (but keep it simple) can be written in brackets and used!
3. Music Styles: Choose the best style suited for the lyric content of the song (for example, male vocals, phonk, mini-phonk, ulytra-bass, agressive, happy, horror, etc.) Give 3 to 10 values, can include the Instrumental, just think the list of most suitable styles, comma-separated in English. (Max of 120 characters!)
4. Be sure to include [END] at the conclusion of the lyrics so Suno AI knows when to wrap up the singing.
5. The music style have maximum of 120 characters. Music style should be in the same language that the rest of the lyrics are in.
6. The title have maximum of 80 characters. Keep the title in the same language that the rest of the lyrics are in.
7. return in JSON format: { "lyrics": "...", "title": "...", "musicStyle": "..." } .`,
      },
      {
        role: 'user',
        content: chat
          ? `Based on the following chat: "${chat}", generate lyrics that suitable for a song, a music style, and a title for a new song in the following JSON format: { "lyrics": "...", "title": "...", "musicStyle": "..." }`
          : 'Generate random lyrics with random subject, a music style, and a title for a new song in the following JSON format: { "lyrics": "...", "title": "...", "musicStyle": "..." }',
      },
    ];

    const completion = await openai.chat.completions.create({
      model: 'gpt-4o', // you can use any model here, e.g. 'gpt-3.5-turbo', 'gpt-4', etc.
      messages,
      temperature: 0.8, // adjust this value to control the randomness of the output
    });
    console.log('completion: ', completion);
    const response = completion.choices[0].message?.content;

    if (response) {
      try {
        const { lyrics, musicStyle, title } = JSON.parse(response);

        await context.entities.GptResponse.create({
          data: {
            user: { connect: { id: context.user.id } },
            content: JSON.stringify({ lyrics, musicStyle, title }),
          },
        });

        return { lyrics, musicStyle, title };
      } catch (error) {
        console.error('Error parsing JSON response:', error);
        throw new HttpError(500, 'Bad response format from OpenAI');
      }
    } else {
      throw new HttpError(500, 'Bad response from OpenAI');
    }
  } catch (error: any) {
    console.error(error);
    const statusCode = error.statusCode || 500;
    const errorMessage = error.message || 'Internal server error';
    throw new HttpError(statusCode, errorMessage);
  }
};


export const createSong: CreateSong<
  SunoPayload,
  Song[]
> = async ({ prompt, tags, title }, context) => {
  if (!context.user) {
    throw new HttpError(401);
  }

  try {
    // Simulate API call to create song
    const body = JSON.stringify({
      prompt,
      tags,
      title,
      make_instrumental: false,
      model: 'chirp-v3-5',
      wait_audio: false,
    });
    console.log('body: ', body);
    const response = await fetch('https://suno-api-bay-ten.vercel.app/api/custom_generate', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: body,
    });

    if (!response.ok) {
      throw new HttpError(500, 'Failed to create song');
    }

    const data = await response.json();
    console.log('data: ', data);
    // data is array of songs. Loop through each song and create a new song entity in the database.
    const songs = [];
    let delay = 5;
    for (const song of data) {
      const newSong = await context.entities.Song.create({
        data: {
          user: { connect: { id: context.user.id } },
          sId: song.id,
          title: song.title,
          tags: song.tags,
          prompt: song.prompt,
          audioUrl: song.audio_url?.replace('cdn2.suno.ai', 'sms2.b-cdn.net'),
          lyric: song.lyric,
          imageUrl: song.image_url?.replace('cdn2.suno.ai', 'sms2.b-cdn.net'),
          videoUrl: song.video_url?.replace('cdn2.suno.ai', 'sms2.b-cdn.net'),
          modelName: song.model_name,
          type: song.type,
          gptDescriptionPrompt: song.gpt_description_prompt,
          status: 'PENDING',
          duration: song.duration,
        },
      });
      songs.push(newSong);

      // Start the job to check and update song status for this specific song
      checkSongStatusJob.delay(delay).submit({ sId: song.id });
      delay += 6; // Increase delay by 6 seconds after each loop
    }
    return songs;
  } catch (error: any) {
    console.error(error);
    const statusCode = error.statusCode || 500;
    const errorMessage = error.message || 'Internal server error';
    throw new HttpError(statusCode, errorMessage);
  }
};

export const getAllSongsByUser: GetAllSongsByUser<void, Song[]> = async (_args, context) => {
  if (!context.user) {
    throw new HttpError(401);
  }
  return context.entities.Song.findMany({
    where: {
      user: { id: context.user.id },
    },
  });
};

export const getSongById: GetSongById<{ songId: string }, Song | null> = async ({ songId }, context) => {
  return context.entities.Song.findUnique({
    where: {
      id: songId,
    },
  });
};

//#endregion
