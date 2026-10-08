import Router from "@bitx/application/Router";
import HomeController from "../controller/HomeController";

Router.get('/', [HomeController, 'index']).name('index');
Router.get('/{test}', [HomeController, 'index']).name('index.test');