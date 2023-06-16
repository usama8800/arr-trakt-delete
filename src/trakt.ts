import fs from 'fs';
import readline from 'readline';
import TraktAPI from 'trakt.tv';
import { sendDiscordMessage } from './utils';

export class Trakt {
    trakt: any;

    constructor() {
        this.trakt = new TraktAPI({
            client_id: process.env.trakt_id,
            client_secret: process.env.trakt_secret,
            redirect_uri: null,   // defaults to 'urn:ietf:wg:oauth:2.0:oob'
            //   pagination: true      // defaults to false, global pagination (see below)
            debug: true,
        });
    }

    async authorize() {
        if (fs.existsSync('token.json')) {
            try {
                const token = JSON.parse(fs.readFileSync('token.json').toString());
                const newToken = await this.trakt.import_token(token);
                fs.writeFileSync('token.json', JSON.stringify(newToken));
                return true;
                // eslint-disable-next-line no-empty
            } catch (error) { }
        }

        if (process.env.auto === 'auto') {
            await sendDiscordMessage('Trakt authorization required for arr-trakt-delete');
            return false;
        } else {
            const traktAuthUrl = this.trakt.get_url();
            console.log('Authorize this app by visiting this url:', traktAuthUrl);

            const code = await new Promise<string>(resolve => {
                const rl = readline.createInterface({
                    input: process.stdin,
                    output: process.stdout,
                });
                rl.question('Enter the code from that page here: ', (codeIn) => {
                    rl.close();
                    resolve(codeIn);
                });
            });
            await this.trakt.exchange_code(code);
            const token = this.trakt.export_token();
            fs.writeFileSync('token.json', JSON.stringify(token));
        }
        return true;
    }

    async newWatched() {
        let last_activities: any;
        if (fs.existsSync('last_activities.json')) {
            last_activities = JSON.parse(fs.readFileSync('last_activities.json').toString());
        }

        const new_watched = await this.trakt.sync.history.get({
            start_at: last_activities?.episodes?.watched_at ?? undefined,
        });
        if (new_watched.length > 0) {
            last_activities = await this.trakt.sync.last_activities();
            fs.writeFileSync('last_activities.json', JSON.stringify(last_activities));
        }
        return new_watched;
    }
}
