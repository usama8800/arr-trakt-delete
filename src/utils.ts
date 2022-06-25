import axios, { AxiosError } from 'axios';

export async function promisify(obj: { _this?: any, func: any }, ...args: any[]) {
    return new Promise<any>((resolve, reject) => {
        args.push((err, result) => {
            if (err) return reject(err);
            return resolve(result);
        });
        if (obj._this) obj.func = obj.func.bind(obj._this);
        obj.func(...args);
    });
}

export async function sendDiscordMessage(content: any) {
    if (!process.env.discordHook) return;
    let sent = false;
    while (!sent) {
        try {
            await axios.post(process.env.discordHook, { content });
            sent = true;
        } catch (error) {
            if ((error as any).isAxiosError) {
                const err = error as AxiosError;
                console.log(err.message);

                if (err.response) {
                    console.log(err.response.data);
                    switch (err.response.status) {
                        case 429:
                            await new Promise((resolve) => setTimeout(resolve, err.response.data.retry_after));
                            break;
                        default:
                            console.log(err.message);
                            console.log(err.response.data);
                            break;
                    }
                } else {
                    console.log(err.code);
                    console.log(content);
                }
            } else console.log(error);
            console.log('Retrying...');
        }
    }
}
