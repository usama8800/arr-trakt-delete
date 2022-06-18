import { AxiosError } from 'axios';
import dotenv from 'dotenv';
import { Sonarr } from './sonarr';
import { Trakt } from './trakt';
import { sendDiscordMessage } from './utils';

dotenv.config();

async function main() {
    try {
        const trakt = new Trakt();
        await trakt.authorize();
        const new_watched = await trakt.newWatched();

        const sonarr = new Sonarr();
        const allSeries = await sonarr.getAllSeries();

        for (const watched of new_watched) {
            const series = allSeries.data.find(s => s.tvdbId === watched.show.ids.tvdb);
            const episodes = await sonarr.getEpisodes(series.id);
            const episode = episodes.data.find(e => e.tvdbId === watched.episode.ids.tvdb);
            const episodeFileId: number = episode.episodeFileId;
            if (episodeFileId === 0) continue;

            try {
                await sonarr.deleteFile(episode.episodeFileId);
                await sendDiscordMessage(`Deleted file of ${series.title} S${watched.episode.season.toFixed(0).padStart(2, '0')}E${watched.episode.number.toFixed(0).padStart(2, '0')}`);
            } catch (error) {
                console.log(error);
            }
        }
    } catch (uErr) {
        const err = uErr as any;
        if (err.isAxiosError) {
            const aErr = err as AxiosError;
            console.log(aErr.response?.data);
            console.log(aErr.response?.status, aErr.response?.statusText);
        } else {
            console.log(err);
        }
    }
}

main();
