import { Router } from "express";
import makeEntry from "../helpers/makeEntry.js";

const router = Router();

const ttvStore = {};

const setTtv = (id, link) => {
	ttvStore[id] = link;
};

const getTtv = (id) => {
	return ttvStore[id] ?? false;
};

router.get("/:id", async (req, res) => {
	try {
		if (!(req.params?.id in ttvStore)) {
			console.log(`no video link for ${req.params.id}. trying to create`);
			const entry = await makeEntry(req.params.id, false);
			if (!entry) {
				res.writeHead(503, "could not create entry");
				return;
			}
		}

		const controller = new AbortController();
		const ok = await fetch(ttvStore[req.params.id], {
			method: "GET",
			signal: controller.signal,
		});
		if (ok.status !== 200) {
			console.log("ttv not ok, creating..", req.params.id);
			const entry = await makeEntry(req.params.id, false);
			if (!entry) {
				res.writeHead(503, "could not create entry");
				return;
			}
		}
		res.redirect(ttvStore[req.params.id]);
		controller.abort();
	} catch (e) {
		console.log(e);
		res.writeHead(503, "failed");
	}
});

export { router, setTtv, getTtv };
