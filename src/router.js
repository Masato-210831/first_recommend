import Vue from "vue"
import Router from "vue-router"
import Home from "./components/Home"
import Recommend from "./components/Recommend"

Vue.use(Router)

export default new Router({
  mode: "history",
  routes: [
    {path:"/", name:"home", component: Home, meta:{title:"home"}},
    {path:"/recommend", name:"recommend", component: Recommend, meta:{title:"recommend"}},
  ]
})