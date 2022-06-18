# arr-trakt-delete

Delete files from Sonarr after episodes are marked as watched

## Usage
- Copy `template.env` to `.env` and fill in the values
- `npm install`
- `npm run build`
- setup a cronjob to run `out/index.js`

To get trakt id and secret go to [trakt api settings](https://trakt.tv/oauth/applications) and create a new application. You only need to fill the `Name`, `Description`,
and `Redirect Uri` which should be set to `urn:ietf:wg:oauth:2.0:oob`

If you access Sonarr via http://localhost:8989, `sonarr_url` would be http://localhost:8989/api/v3/
