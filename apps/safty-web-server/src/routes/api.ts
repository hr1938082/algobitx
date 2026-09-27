import Route from "@algobitx/application/Route";

Route.get('/', (req, res) => {
    res.json({ test: req.url.href });
});