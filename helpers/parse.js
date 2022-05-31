export default async function parse(url) {
	try {
		const text = await (await fetch(url)).text();
		const ret = {};

		if (
			text.indexOf(
				`<title data-rh="true">This video is unavailable. Visit TikTok to discover more trending videos.</title>`
			) !== -1
		) {
			console.log("unavailable");
			return false;
		}

		const ttvStart = text.indexOf('","playAddr":"');
		const ttvEnd = text.indexOf(`","downloadAddr":"https`);
		ret.ttv = text.substring(ttvStart + 14, ttvEnd).replace(/\\u002F/g, "/");

		if (!ret.ttv.startsWith("https")) {
			console.log("no ttv found");
			return false;
		}

		const ogUrlStart = text.indexOf(`property="og:url" content="`) + 27;
		const ogUrlMaybe = text.substring(ogUrlStart, ogUrlStart + 100);
		ret.ogUrl = ogUrlMaybe.substring(0, ogUrlMaybe.indexOf("?"));

		const lcstart = text.indexOf(`","description":"`) + 17;
		const lc = text.substring(lcstart, lcstart + 25).split(" ");
		ret.likes = lc[0] == "TikTok" ? "?" : lc[0];
		ret.comments = lc[0] == "TikTok" ? "?" : lc[2];

		const keywordsStart = text.indexOf(`name="keywords" content="`) + 25;
		const keywords = text.substring(keywordsStart, keywordsStart + 100).split(",");
		ret.authorName = keywords[0];
		ret.authorAt = keywords[1];

		const descriptionStart = text.indexOf(`property="twitter:description" content="`) + 40;
		const descriptionEnd = text.indexOf(`"/><meta data-rh="true" property="og:image"`);
		ret.description = text.substring(descriptionStart, descriptionEnd);

		return ret;
	} catch (e) {
		console.log(e);
		return false;
	}
};
