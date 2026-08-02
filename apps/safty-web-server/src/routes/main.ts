import Route from "@algobitx/application/Routing/Route";
import HomeController from "../controller/HomeController";

Route.get('/', [HomeController, 'index']);