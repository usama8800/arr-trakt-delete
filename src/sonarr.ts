import axios from 'axios';

export class Sonarr {

    private url(path: string, params: { [key: string]: any } = {}): string {
        let paramsUrl = '';
        for (const key in params) {
            if (Object.prototype.hasOwnProperty.call(params, key)) {
                const val = params[key];
                paramsUrl += `&${encodeURIComponent(key)}=${encodeURIComponent(val)}`;
            }
        }
        return `${process.env.sonarr_url}${path}?apikey=${process.env.sonarr_key}${paramsUrl}`;
    }

    async getAllSeries() {
        return axios.get(this.url('series'));
    }

    async getEpisodes(seriesId: number) {
        return axios.get(this.url('episode', { seriesId }));
    }

    async getEpisode(episodeId: number) {
        return axios.get(this.url(`episode/${episodeId}`));
    }

    async deleteFile(episodeFileId: number) {
        return axios.delete(this.url(`episodefile/${episodeFileId}`));
    }
}
