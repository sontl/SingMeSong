import { Song } from 'wasp/entities';
import { HttpError } from 'wasp/server';
import { type CheckSongStatusJob } from 'wasp/server/jobs';

type JobArgs = {
  sId: string;
};

export const checkAndUpdateSongStatus: CheckSongStatusJob<JobArgs, void> = async (args, context) => {
  const { sId } = args;

  const song = await context.entities.Song.findFirst({
    where: {
      sId: sId,
      status: 'PENDING',
    },
  });

  if (song) {
    await processSong(song, context);
  }
};

async function processSong(song: Song, context: any) {
  try {
    const response = await fetch(`https://suno-api-bay-ten.vercel.app/api/get?ids=${song.sId}`);
    if (!response.ok) {
      throw new HttpError(response.status, 'Failed to fetch song status');
    }
    const data = await response.json();
    const updatedSong = data[0];

    const updates: Partial<Song> = {};
    let allUrlsAvailable = true;

    if (updatedSong.image_url && updatedSong.image_url !== song.imageUrl) {
      updates.imageUrl = updatedSong.image_url;
    } else {
      allUrlsAvailable = false;
    }

    if (updatedSong.audio_url && updatedSong.audio_url !== song.audioUrl) {
      updates.audioUrl = updatedSong.audio_url;
    } else {
      allUrlsAvailable = false;
    }

    if (updatedSong.video_url && updatedSong.video_url !== song.videoUrl) {
      updates.videoUrl = updatedSong.video_url;
    } else {
      allUrlsAvailable = false;
    }

    if (Object.keys(updates).length > 0) {
      await context.entities.Song.update({
        where: { id: song.id },
        data: updates,
      });
    }

    if (allUrlsAvailable) {
      await context.entities.Song.update({
        where: { id: song.id },
        data: { status: 'COMPLETED' },
      });
    } else {
      // If not all URLs are available, the job will be retried automatically by PgBoss
      throw new Error('Not all URLs are available yet');
    }
  } catch (error) {
    console.error('Error processing song:', error);
    throw error; // Rethrow the error to trigger a retry
  }
}