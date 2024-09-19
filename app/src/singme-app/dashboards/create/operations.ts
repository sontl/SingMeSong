import type { Task, GptResponse, Song } from 'wasp/entities';
import { SunoPayload, GptPayload } from './types';
import { ChatCompletionMessageParam } from 'openai/resources/chat/completions';
import type {
  GenerateGptResponse,
  CreateTask,
  DeleteTask,
  UpdateTask,
  GetGptResponses,
  GetAllTasksByUser,
  GetAllSongsByUser,
  GenerateRandomLyrics,
  CreateSong,
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
1. Write lyrics per the instructions provided by the user. (Length of 3000 characters for the whole song text!)
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
3. Music Styles:
   * male vocals
   * phonk
   * mini-phonk
   * ulytra-bass
   * agressive
   * happy
   * horror
   * Any others, comma-separated in English. (Max of 120 characters!)
4. Be sure to include [END] at the conclusion of the lyrics so Suno AI knows when to wrap up the singing.
5. The music style have maximum of 120 characters. Choose the best style suited for the content of the song.
6. The title have maximum of 80 characters.
7. return in JSON format: { "lyrics": "...", "title": "...", "musicStyle": "..." } .`,
      },
    ];

    if (chat) {
      messages.push({
        role: 'user',
        content: `Based on the following chat: "${chat}", generate random lyrics, a music style, and a title for a new song in the following JSON format: { "lyrics": "...", "title": "...", "musicStyle": "..." }`,
      });
    } else {
      messages.push({
        role: 'user',
        content:
          'Generate random lyrics, a music style, and a title for a new song in the following JSON format: { "lyrics": "...", "title": "...", "musicStyle": "..." }',
      });
    }

    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini', // you can use any model here, e.g. 'gpt-3.5-turbo', 'gpt-4', etc.
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
      checkSongStatusJob.delay(3).submit({ sId: song.id });
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
//#endregion

export const generateGptResponse: GenerateGptResponse<GptPayload, GeneratedSchedule> = async ({ hours }, context) => {
  if (!context.user) {
    throw new HttpError(401);
  }

  const tasks = await context.entities.Task.findMany({
    where: {
      user: {
        id: context.user.id,
      },
    },
  });

  const parsedTasks = tasks.map(({ description, time }) => ({
    description,
    time,
  }));

  try {
    // check if openai is initialized correctly with the API key
    if (openai instanceof Error) {
      throw openai;
    }

    if (
      !context.user.credits &&
      (!context.user.subscriptionStatus ||
        context.user.subscriptionStatus === 'deleted' ||
        context.user.subscriptionStatus === 'past_due')
    ) {
      throw new HttpError(402, 'User has not paid or is out of credits');
    } else if (context.user.credits && !context.user.subscriptionStatus) {
      console.log('decrementing credits');
      await context.entities.User.update({
        where: { id: context.user.id },
        data: {
          credits: {
            decrement: 1,
          },
        },
      });
    }

    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini', // you can use any model here, e.g. 'gpt-3.5-turbo', 'gpt-4', etc.
      messages: [
        {
          role: 'system',
          content:
            'you are an expert daily planner. you will be given a list of main tasks and an estimated time to complete each task. You will also receive the total amount of hours to be worked that day. Your job is to return a detailed plan of how to achieve those tasks by breaking each task down into at least 3 subtasks each. MAKE SURE TO ALWAYS CREATE AT LEAST 3 SUBTASKS FOR EACH MAIN TASK PROVIDED BY THE USER! YOU WILL BE REWARDED IF YOU DO.',
        },
        {
          role: 'user',
          content: `I will work ${hours} hours today. Here are the tasks I have to complete: ${JSON.stringify(
            parsedTasks
          )}. Please help me plan my day by breaking the tasks down into actionable subtasks with time and priority status.`,
        },
      ],
      tools: [
        {
          type: 'function',
          function: {
            name: 'parseTodaysSchedule',
            description: 'parses the days tasks and returns a schedule',
            parameters: {
              type: 'object',
              properties: {
                mainTasks: {
                  type: 'array',
                  description: 'Name of main tasks provided by user, ordered by priority',
                  items: {
                    type: 'object',
                    properties: {
                      name: {
                        type: 'string',
                        description: 'Name of main task provided by user',
                      },
                      priority: {
                        type: 'string',
                        enum: ['low', 'medium', 'high'],
                        description: 'task priority',
                      },
                    },
                  },
                },
                subtasks: {
                  type: 'array',
                  items: {
                    type: 'object',
                    properties: {
                      description: {
                        type: 'string',
                        description:
                          'detailed breakdown and description of sub-task related to main task. e.g., "Prepare your learning session by first reading through the documentation"',
                      },
                      time: {
                        type: 'number',
                        description: 'time allocated for a given subtask in hours, e.g. 0.5',
                      },
                      mainTaskName: {
                        type: 'string',
                        description: 'name of main task related to subtask',
                      },
                    },
                  },
                },
              },
              required: ['mainTasks', 'subtasks', 'time', 'priority'],
            },
          },
        },
      ],
      tool_choice: {
        type: 'function',
        function: {
          name: 'parseTodaysSchedule',
        },
      },
      temperature: 1,
    });

    const gptArgs = completion?.choices[0]?.message?.tool_calls?.[0]?.function.arguments;

    if (!gptArgs) {
      throw new HttpError(500, 'Bad response from OpenAI');
    }

    console.log('gpt function call arguments: ', gptArgs);

    await context.entities.GptResponse.create({
      data: {
        user: { connect: { id: context.user.id } },
        content: JSON.stringify(gptArgs),
      },
    });

    return JSON.parse(gptArgs);
  } catch (error: any) {
    if (!context.user.subscriptionStatus && error?.statusCode != 402) {
      await context.entities.User.update({
        where: { id: context.user.id },
        data: {
          credits: {
            increment: 1,
          },
        },
      });
    }
    console.error(error);
    const statusCode = error.statusCode || 500;
    const errorMessage = error.message || 'Internal server error';
    throw new HttpError(statusCode, errorMessage);
  }
};

export const createTask: CreateTask<Pick<Task, 'description'>, Task> = async ({ description }, context) => {
  if (!context.user) {
    throw new HttpError(401);
  }

  const task = await context.entities.Task.create({
    data: {
      description,
      user: { connect: { id: context.user.id } },
    },
  });

  return task;
};

export const updateTask: UpdateTask<Partial<Task>, Task> = async ({ id, isDone, time }, context) => {
  if (!context.user) {
    throw new HttpError(401);
  }

  const task = await context.entities.Task.update({
    where: {
      id,
    },
    data: {
      isDone,
      time,
    },
  });

  return task;
};

export const deleteTask: DeleteTask<Pick<Task, 'id'>, Task> = async ({ id }, context) => {
  if (!context.user) {
    throw new HttpError(401);
  }

  const task = await context.entities.Task.delete({
    where: {
      id,
    },
  });

  return task;
};
//#endregion

//#region Queries
export const getGptResponses: GetGptResponses<void, GptResponse[]> = async (_args, context) => {
  if (!context.user) {
    throw new HttpError(401);
  }
  return context.entities.GptResponse.findMany({
    where: {
      user: {
        id: context.user.id,
      },
    },
  });
};

export const getAllTasksByUser: GetAllTasksByUser<void, Task[]> = async (_args, context) => {
  if (!context.user) {
    throw new HttpError(401);
  }
  return context.entities.Task.findMany({
    where: {
      user: {
        id: context.user.id,
      },
    },
    orderBy: {
      createdAt: 'desc',
    },
  });
};
//#endregion
