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
      updates.imageUrl = updatedSong.image_url;
    }
    if (updatedSong.audio_url) {
      updates.audioUrl = updatedSong.audio_url;
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
      model: 'gpt-4o-mini', // you can use any model here, e.g. 'gpt-3.5-turbo', 'gpt-4', etc.
      messages,
      temperature: 0.8, // adjust this value to control the randomness of the output
    });
    console.log('completion: ', completion);
    const response = completion.choices[0].message?.content;

    if (response) {
      try {
        console.log('response: ', response);
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
          audioUrl: song.audio_url,
          lyric: song.lyric,
          imageUrl: song.image_url,
          videoUrl: song.video_url,
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


export const getSongById: GetSongById<{ songId: string }, Song | null> = async ({ songId }, context) => {
  return context.entities.Song.findUnique({
    where: {
      id: songId,
    },
  });
};


function extractLyrics(markdown: string): string {
  // Find the start of the metadata
  const moreActionsIndex = markdown.indexOf("More Actions]");
  if (moreActionsIndex === -1) {
    return ""; // Couldn't find the [More Actions] text, return empty string
  }

  // Find the start of the datetime line (after the first double newline)
  const datetimeStartIndex = markdown.indexOf("\n\n", moreActionsIndex) + 4;
  if (datetimeStartIndex === 1) {
    return ""; // Couldn't find the datetime line, return empty string
  }

  // Find the start of the lyrics (after the second double newline)
  const lyricsAlmostStartIndex = markdown.indexOf("\n\n", datetimeStartIndex) + 4;
  if (lyricsAlmostStartIndex === 1) {
    return ""; // Couldn't find the start of lyrics, return empty string
  }

  // Find the start of the lyrics (after the second double newline)
  const lyricsStartIndex = markdown.indexOf("\n\n", lyricsAlmostStartIndex) ;
  if (lyricsStartIndex === 1) {
    return ""; // Couldn't find the start of lyrics, return empty string
  }


  // Find the end of the lyrics (before the repeated section or image)
  let lyricsEndIndex = markdown.indexOf("![Cover image for", lyricsStartIndex);
  if (lyricsEndIndex === -1) {
    lyricsEndIndex = markdown.indexOf("\n\n@", lyricsStartIndex);
  }
  if (lyricsEndIndex === -1) {
    lyricsEndIndex = markdown.length;
  }

  // Extract the lyrics
  let lyrics = markdown.substring(lyricsStartIndex, lyricsEndIndex).trim();

  return lyrics;
}

export const importSongFromSuno = async (sunoUrl: string, context: any): Promise<Song> => {
  if (!context.user) {
    throw new HttpError(401);
  }

  try {
    const response = await fetch('https://scrape.singmesong.com/v1/scrape', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        url: sunoUrl,
        formats: ["markdown"],
        waitFor: 1000,
        onlyMainContent: false
      }),
    });

    if (!response.ok) {
      throw new HttpError(response.status, 'Failed to fetch song details from Suno');
    }

    const responseData = await response.json();

    if (!responseData.success || !responseData.data || !responseData.data.metadata) {
      throw new HttpError(400, 'Invalid response from scraping service');
    }

    const { metadata, markdown } = responseData.data;
    console.log('markdown: ', markdown);
    // Extract lyrics from markdown
    const lyrics = extractLyrics(markdown);

    let songDuration = 0;

    // Extract duration from markdown
    const durationMatch = markdown.match(/\d{2}:\d{2} \/ (\d{2}:\d{2})/);
    if (durationMatch && durationMatch[1]) {
      const durationString = durationMatch[1];
      const [minutes, seconds] = durationString.split(':').map(Number);
      //minutes is string format, so we need to convert it to number
      songDuration = parseInt(minutes) * 60 + parseInt(seconds);
    }

    // Extract the song ID from the URL
    const songId = sunoUrl.split('/').pop();

    const newSong = await context.entities.Song.create({
      data: {
        user: { connect: { id: context.user.id } },
        sId: songId,
        title: metadata.title || 'Untitled',
        tags: (metadata.description || '').replace('Listen and make your own with Suno.', '').trim(),
        prompt: '', // You might want to add this if available in the metadata
        audioUrl: metadata.ogAudio || '',
        lyric: lyrics,
        imageUrl: metadata.ogImage || '',
        videoUrl: '', // You might want to add this if available in the metadata
        modelName: '', // You might want to add this if available in the metadata
        type: '', // You might want to add this if available in the metadata
        gptDescriptionPrompt: '', // You might want to add this if available in the metadata
        status: 'IMPORTED',
        duration: songDuration,
      },
    });

    return newSong;
  } catch (error: any) {
    console.error(error);
    const statusCode = error.statusCode || 500;
    const errorMessage = error.message || 'Internal server error';
    throw new HttpError(statusCode, errorMessage);
  }
};
