import express from 'express';
import { createServer as createHttpsServer } from 'https';
import { createServer as createHttpServer } from 'http';
import { readFileSync } from 'fs';

import { router as videoRouter, getTtv } from './routes/video.js';
import { router as jsonRouter, getJson } from './routes/json.js';
import makeEntry from './helpers/makeEntry.js';
import { makeBasicText } from './helpers/makeSite.js';

let https = true;
if (process.argv.includes('--http')) {
    https = false;
}

let baseDir;
const httpsOptions = {};

if (https) {
    baseDir = '../../../etc/letsencrypt/live/tt-embed.com/';
    httpsOptions = {
        cert: readFileSync(baseDir + 'cert.pem', 'utf8'),
        key: readFileSync(baseDir + 'privkey.pem', 'utf8'),
        ca: readFileSync(baseDir + 'chain.pem', 'utf8'),
    };
}

const httpPort = 80;
const httpsPort = 443;
const app = express();

const store = {};

if (https) {
    app.use((req, res, next) => {
        if (req.protocol === 'http') {
            res.redirect(`https://${req.headers.host}${req.url}`);
            return;
        }
        next();
    });
}
app.use('/video', videoRouter);
app.use('/json', jsonRouter);

app.get('/', async (req, res) => {
    if (!req.query.q || !req.query.q?.startsWith('https://')) {
        res.writeHead(200, {
            'Content-Type': 'text/html',
        });
        res.end(
            makeBasicText(
                'no (proper) query! Add one like this: https://tt-embed.com/?q={link to tiktok}',
            ),
        );
        return;
    }

    try {
        if (req.query.q.indexOf('?') !== -1) {
            req.query.q = req.query.q.split('?')[0];
        }
        const bUrl = Buffer.from(req.query.q).toString('base64');

        if (!getTtv(bUrl) || !getJson(bUrl) || !store[bUrl]) {
            console.log(bUrl + ' not in store, trying to create');
            const site = await makeEntry(bUrl, true);
            if (!site) {
                res.writeHead(200, {
                    'Content-Type': 'text/html',
                });
                res.end(
                    makeBasicText(
                        'failed, are you sure the video is public and not deleted?',
                    ),
                );
                return;
            }
            store[bUrl] = site;
        }

        console.log('in store ' + bUrl);
        res.writeHead(200, {
            'Content-Type': 'text/html',
        });
        res.end(store[bUrl]);
    } catch (e) {
        console.log(e);
        res.writeHead(500, 'error');
        return;
    }
});

createHttpServer(app).listen(httpPort, () => {
    console.log(`http server listening on port ${httpPort}`);
});

if (https) {
    createHttpsServer(httpsOptions, app).listen(httpsPort, () => {
        console.log('https server listening on port ' + httpsPort);
    });
}
