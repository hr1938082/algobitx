import Router from "@algobitx/application/Router";

Router.get('/', (req, res) => {
    res.json({ test: req.url.href });
});