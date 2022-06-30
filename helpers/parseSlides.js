const headers = new Headers({
	Accept: "text/html",
	"User-Agent":
		"Mozilla/5.0 (iPhone; CPU iPhone OS 13_2_3 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/13.0.3 Mobile/15E148 Safari/604.1",
});

export default async function parseSlides(url) {
	try {
		const text = await (
			await fetch(url, {
				method: "GET",
				headers: headers,
			})
		).text();
		const ret = [];

		let temp = text.split("data-swiper-slide-index");
		temp = temp.slice(2, -1);
		for (let i = 0; i < temp.length; i++) {
			const start = temp[i].indexOf('src="') + 5;
			const end = temp[i].indexOf(`" class="tiktok`);
			ret[i] = temp[i].substring(start, end);
		}

		return ret;
	} catch (e) {
		console.log(e);
		return false;
	}
}
