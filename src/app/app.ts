import 'reflect-metadata';
import {Component} from "@angular/core";
import {nativeScriptBootstrap} from "nativescript-angular/application";

import {RouterConfig} from "@angular/router";
import {nsProvideRouter,NS_ROUTER_DIRECTIVES} from "nativescript-angular/router"
import {firstPage} from "./pages/first/first.component";
import {playerPage} from "./pages/player/player.component";

export const routes: RouterConfig = [
  { path: "", component: firstPage},
  { path: "player", component: playerPage }
];

export const APP_ROUTER_PROVIDERS = [
  nsProvideRouter(routes, {})
];

@Component({
    selector: "my-app",
    template: "<page-router-outlet></page-router-outlet>",
    directives: [NS_ROUTER_DIRECTIVES],
})

export class AppComponent {
}

nativeScriptBootstrap(AppComponent,[APP_ROUTER_PROVIDERS]);
