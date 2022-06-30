import { Router } from "express";
import parseSlides from "../helpers/parseSlides.js";
import { makeBasicImage, makeBasicText } from "../helpers/makeSite.js";

const router = Router();

const slideStore = {};

router.get("/", async (req, res) => {
	try {
		if (!req.query?.q || !req.query.q.startsWith("https://")) {
			res.writeHead(200, {
				"Content-Type": "text/html",
			});
			res.end(makeBasicText("No query, q for the url, slide for the number"));
			return;
		}

		if (req.query.q.indexOf("?") !== -1) {
			req.query.q = req.query.q.split("?")[0];
		}
		if (!req.query.slide) {
			req.query.slide = 0;
		}

		const bUrl = Buffer.from(req.query.q).toString("base64");

		const updateSlide = async () => {
			const slides = await parseSlides(req.query.q);
			if (!slides) {
				res.writeHead(200, {
					"Content-Type": "text/html",
				});
				res.end(
					makeBasicText("failed, are you sure the slides are public and not deleted?")
				);
				return;
			}
			slideStore[bUrl] = slides;
		};

		if (!slideStore[bUrl]) {
			console.log(bUrl + " slide not in store, trying to create");
			await updateSlide();
		} else {
			const controller = new AbortController();
			const ok = await fetch(slideStore[bUrl][req.query.slide], {
				method: "GET",
				signal: controller.signal,
			});
			controller.abort();

			if (ok.status !== 200) {
				console.log("slide image not ok, recreating..");
				const entry = await updateSlide();
				if (!entry) {
					res.writeHead(200, {
						"Content-Type": "text/html",
					});
					res.end(makeBasicText("Failed to generate slide update :/"));
					return;
				}
			}
		}

		if (req.query.slide > slideStore[bUrl].length - 1) {
			res.writeHead(200, {
				"Content-Type": "text/html",
			});
			res.end(makeBasicText("Slide not found, only " + slideStore[bUrl].length + " slides"));
			return;
		}

		res.writeHead(200, {
			"Content-Type": "text/html",
		});
		res.end(
			makeBasicImage(
				slideStore[bUrl][req.query.slide],
				`${req.query.slide}/${slideStore[bUrl].length}`,
				`Cycle through the slides by incrementing the slide number`
			)
		);
	} catch (e) {
		console.log(e);
		res.writeHead(503, "failed");
	}
});

export { router };
