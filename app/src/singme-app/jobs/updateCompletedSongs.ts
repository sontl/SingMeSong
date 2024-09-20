import { Song } from 'wasp/entities';
import { HttpError } from 'wasp/server';
import { type UpdateCompletedSongsJob } from 'wasp/server/jobs';

export const updateCompletedSongs: UpdateCompletedSongsJob<never, void> = async (_args, context) => {
  const tenMinutesAgo = new Date(Date.now() - 10 * 60 * 1000);

  try {
    const songs = await context.entities.Song.findMany({
      where: {
        audioUrl: {
          contains: 'audiopipe',
        },
        status: 'COMPLETED',
        createdAt: {
          lt: tenMinutesAgo,
        },
      },
    });

    for (const song of songs) {
      await processSong(song, context);
    }

    console.log(`Updated ${songs.length} completed songs.`);
  } catch (error) {
    console.error('Error in updateCompletedSongs job:', error);
  }
};

async function processSong(song: Song, context: any) {
  try {
    console.log(`Fetching updated song data for sId: ${song.sId}`);
    const response = await fetch(`https://suno-api-bay-ten.vercel.app/api/get?ids=${song.sId}`);
    if (!response.ok) {
      throw new HttpError(response.status, 'Failed to fetch song status');
    }
    const data = await response.json();
    const updatedSong = data[0];

    console.log(`Updated song data for sId ${song.sId}:`, updatedSong);

    const updates: Partial<Song> = {};

    if (updatedSong.audio_url && updatedSong.audio_url !== song.audioUrl) {
      updates.audioUrl = updatedSong.audio_url;
    }

    if (updatedSong.duration && updatedSong.duration !== song.duration) {
      updates.duration = updatedSong.duration;
    }

    if (Object.keys(updates).length > 0) {
      console.log(`Updating song with new data for sId ${song.sId}`);
      await context.entities.Song.update({
        where: { id: song.id },
        data: updates,
      });
    } else {
      console.log(`No updates needed for song with sId ${song.sId}`);
    }
  } catch (error) {
    console.error(`Error processing song with sId ${song.sId}:`, error);
  }
}