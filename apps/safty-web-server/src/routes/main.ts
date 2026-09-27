import Route from "@algobitx/application/Route";
import HomeController from "../controller/HomeController";

Route.get('/', [HomeController, 'index']);