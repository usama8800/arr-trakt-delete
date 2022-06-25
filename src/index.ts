import { AxiosError } from 'axios';
import dotenv from 'dotenv';
import { Sonarr } from './sonarr';
import { Trakt } from './trakt';
import { sendDiscordMessage } from './utils';
import * as fs from 'fs';

dotenv.config();

function getExludes() {
    let ret: string[] = [];
    if (fs.existsSync('./exclude.txt'))
        ret = fs.readFileSync('./exclude.txt').toString().split(/\r?\n/g);
    if (ret[ret.length - 1] === '') ret = ret.slice(0, -1);
    return ret;
}

function isSeriesExcluded(series, excludes) {
    const slug = series.titleSlug.replace(/[^a-zA-Z]/g, '');
    for (let exclude of excludes) {
        exclude = exclude.replace(/[^a-zA-Z]/g, '');
        if (slug.match(new RegExp(exclude, 'gi')) !== null) return true;
    }
    return false;
}

async function main() {
    try {
        const excludes = getExludes();

        const trakt = new Trakt();
        await trakt.authorize();
        const new_watched = await trakt.newWatched();
        if (!new_watched.length) return;

        const sonarr = new Sonarr();
        const allSeries = await sonarr.getAllSeries();

        for (const watched of new_watched) {
            const series = allSeries.data.find(s => s.tvdbId === watched.show.ids.tvdb);
            const episodes = await sonarr.getEpisodes(series.id);
            const episode = episodes.data.find(e => e.tvdbId === watched.episode.ids.tvdb);
            const episodeFileId: number = episode.episodeFileId;
            if (episodeFileId === 0) continue;
            if (isSeriesExcluded(series, excludes)) continue;

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
