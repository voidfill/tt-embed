const makeMetaSite = ({ authorName, authorAt }, bUrl) => {
	//prettier-ignore
	return `<head>
		<meta content="${authorName + " (@" + authorAt + ")"}" property="og:title">
		<meta content="https://tt-embed.com/video/${bUrl}" property="og:video:url">
		<link type="application/json+oembed" href="https://tt-embed.com/json/${bUrl}" />
		
		<meta content="video/mp4" property="og:video:type">
		<meta content="video" property="og:type">
		<meta name="theme-color" content="#01d3a9">
		</head>`;
};

const makeBasicImage = (image, title, description) => {
	//prettier-ignore
	return `<head>
		<meta content="${title}" property="og:title">
		<meta content="${description}" property="og:description">
		<meta content="${image}" property="og:image">

		<meta content="image/jpeg" property="og:image:type">
		<meta name="twitter:card" content="summary_large_image">
		<meta name="theme-color" content="#01d3a9">
		</head>`;
}

const makeBasicText = (text, error = true) => {
	return `<head>
			<meta content="${error ? "failed" : ""}" property="og:title">
			<meta content="${text}" property="og:description">
			<meta name="theme-color" content="#${error ? "ff0000" : "01d3a9"}">
			</head>`;
};

export {
	makeMetaSite,
	makeBasicImage,
	makeBasicText,
};
