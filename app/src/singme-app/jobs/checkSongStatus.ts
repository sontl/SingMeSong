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
      status: { not: 'COMPLETED' },
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
    let audioAndImageAvailable = true;
    let allUrlsAvailable = true;

    if (updatedSong.image_url && updatedSong.image_url !== song.imageUrl) {
      updates.imageUrl = updatedSong.image_url;
    } else if (!updatedSong.image_url) {
      audioAndImageAvailable = false;
      allUrlsAvailable = false;
    }

    if (updatedSong.audio_url && updatedSong.audio_url !== song.audioUrl) {
      updates.audioUrl = updatedSong.audio_url;
    } else if (!updatedSong.audio_url) {
      audioAndImageAvailable = false;
      allUrlsAvailable = false;
    }

    if (updatedSong.video_url && updatedSong.video_url !== song.videoUrl) {
      updates.videoUrl = updatedSong.video_url;
    } else if (!updatedSong.video_url) {
      allUrlsAvailable = false;
    }

    // Check and update duration
    if (updatedSong.duration && updatedSong.duration !== song.duration) {
      updates.duration = updatedSong.duration;
    }

    if (Object.keys(updates).length > 0) {
      await context.entities.Song.update({
        where: { id: song.id },
        data: updates,
      });
    }

    if (audioAndImageAvailable && song.status !== 'COMPLETED') {
      await context.entities.Song.update({
        where: { id: song.id },
        data: { status: 'COMPLETED' },
      });
    }

    if (!allUrlsAvailable) {
      // If not all URLs are available, throw an error to trigger a retry
      throw new Error('Not all URLs are available yet');
    }
  } catch (error) {
    console.error('Error processing song:', error);
    throw error; // Rethrow the error to trigger a retry
  }
}