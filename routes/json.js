import { Router } from "express";

const router = Router();

const jsonStore = {};

const setJson = (id, json) => {
	jsonStore[id] = json;
};

const getJson = (id) => {
	return jsonStore[id] ?? false;
};

router.get("/:id", async (req, res) => {
	if (!(req.params?.id in jsonStore)) {
		console.log(`no json for ${req.params.id}`);
		res.writeHead(404, "no json found");
		return;
	}

	res.writeHead(200, {
		"Content-Type": "application/json",
	});
	res.end(JSON.stringify(jsonStore[req.params.id]));
});

router.get("/", async (req, res) => {
	if (Object.keys(req.query).length === 0) {
		res.writeHead(400, "no query");
		return;
	}

	const ret = {};
	for (const key in req.query) {
		ret[key] = req.query[key];
	}
	res.writeHead(200, {
		"Content-Type": "application/json",
	});
	ret.end(JSON.stringify(ret));
});

export { router, setJson, getJson };
