import Router from "@bitx/application/Router";

Router.get('/', (req, res) => {
    res.json({ test: req.url.href });
});