import Router from "@algobitx/application/Router";
import HomeController from "../controller/HomeController";

Router.get('/', [HomeController, 'index']);