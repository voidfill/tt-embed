import { setTtv } from "../routes/video.js";
import { setJson } from "../routes/json.js";
import parse from "./parse.js";
import { makeMetaSite } from "./makeSite.js";

export default async function makeEntry (id, metaSite = false) {
    try {
        const url = Buffer.from(id, "base64").toString("ascii");
        if(!url.startsWith("https://")) {
            console.log("tried to make entry for invalid url", url);
            return false;
        }

        const parsed = await parse(url);
        if (!parsed) {
            return false;
        }

        setTtv(id, parsed.ttv);
        setJson(id, {
            provider_name: "TikTok Reembedder, ❤ " + parsed.likes + " 💬 " + parsed.comments,
            provider_url: "https://tt-embed.herokuapp.com/",
            author_name: parsed.description,
            author_url: parsed.ogUrl,
        });

        if(metaSite) {
            return makeMetaSite(parsed, id);
        }
        return true;

    } catch (e) {
        console.log(e);
        return ret;
    }
}
