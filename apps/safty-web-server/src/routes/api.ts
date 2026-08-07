import Route from "@algobitx/application/Routing/Route";

Route.get('/', (req, res) => {
    res.json({ test: req.url.href });
});