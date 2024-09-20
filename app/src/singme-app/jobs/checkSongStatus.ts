import { Song } from 'wasp/entities';
import { HttpError } from 'wasp/server';
import { type CheckSongStatusJob } from 'wasp/server/jobs';

type JobArgs = {
  sId: string;
};

export const checkAndUpdateSongStatus: CheckSongStatusJob<JobArgs, void> = async (args, context) => {
  const { sId } = args;


  try {
    const song = await context.entities.Song.findFirst({
      where: {
        sId: sId,
        status: { not: 'COMPLETED' },
      },
    });

    if (song) {
      await processSong(song, context);
    } else {
      console.log(`No incomplete song found for sId: ${sId}`);
    }
  } catch (error) {
    console.error('Error in checkAndUpdateSongStatus:');
    throw error; // Re-throw the error to trigger a retry
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
    let allUrlsAvailable = true;
    let isMp3Available = false;

    if (updatedSong.image_url && updatedSong.image_url !== song.imageUrl) {
      updates.imageUrl = updatedSong.image_url;
    } else if (!updatedSong.image_url) {
      allUrlsAvailable = false;
    }

    if (updatedSong.audio_url && updatedSong.audio_url !== song.audioUrl) {
      updates.audioUrl = updatedSong.audio_url;
      isMp3Available = updatedSong.audio_url.toLowerCase().includes('.mp3');
    } else if (!updatedSong.audio_url) {
      allUrlsAvailable = false;
    }

    if (updatedSong.duration && updatedSong.duration !== song.duration) {
      updates.duration = updatedSong.duration;
    }

    console.log(`Updates to be applied for sId ${song.sId}:`, updates);
    console.log(`All URLs available for sId ${song.sId}:`, allUrlsAvailable);
    console.log(`MP3 available for sId ${song.sId}:`, isMp3Available);

    if (Object.keys(updates).length > 0) {
      console.log(`Updating song with new data for sId ${song.sId}`);
      await context.entities.Song.update({
        where: { id: song.id },
        data: updates,
      });
    }

    if (allUrlsAvailable && song.status !== 'COMPLETED') {
      console.log(`Marking song as COMPLETED for sId ${song.sId}`);
      await context.entities.Song.update({
        where: { id: song.id },
        data: { status: 'COMPLETED' },
      });
    }

    if (!isMp3Available) {
      console.log(`MP3 is not ready for sId ${song.sId}, throwing error to trigger retry`);
      throw new Error('MP3 is not ready yet');
    }
  } catch (error) {
    console.error(`Error processing song with sId ${song.sId}:`, error);
    throw error; // Rethrow the error to trigger a retry
  }
}