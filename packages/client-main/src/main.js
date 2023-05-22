import { createApp } from "vue";
import App from "./App.vue";
import vuetify from "./plugins/vuetify";
import { loadFonts } from "./plugins/webfontloader";


loadFonts();
import { createWebHistory, createRouter } from "vue-router";

const guardLogin = function(to, from, next) {
  axios.get("/auth/user").then(res => {
    console.log("user already logged" + res);
    window.location.href = "/profile";
  }).catch(() => {
    next();
  });
};

const routes = [
  {
    path: "/",
    name: "login",
    component: LoginView,
    beforeEnter: (to, from, next) => {
      guardLogin(to, from, next);
    }
  },
  {
    path: "/profile",
    name: "profile",
    component: ProfileView
  },
  {
    path: "/request/create",
    name: "create-request",
    component: CreateRequestView
  },
  {
    path: "/request/:id",
    name: "request",
    component: OpenRequestView
  },
  {
    path: "/request/:id/edit",
    name: "request-edit",
    component: EditRequestView
  },
  {
    path: "/request/all",
    name: "all-requests",
    component: AllRequestsView
  },
  {
    path: "/request/all/department",
    name: "all-requests-department",
    component: AllRequestsViewDepartment
  },

  {
    path: "/grades",
    name: "grades",
    component: GradesView
  },
  {
      path: "/:catchAll(.*)",
      component: NotFoundView,
  },
];

const router = createRouter({
  history: createWebHistory(),
  routes
});

import { createPinia } from "pinia";
import LoginView from "./views/LoginView";
import axios from "axios";
import ProfileView from "./views/ProfileView";
import GradesView from "./views/GradesView";
import CreateRequestView from "./views/CreateRequestView";
import OpenRequestView from "./views/OpenRequestView";
import AllRequestsView from "./views/AllRequestsView";
import EditRequestView from "./views/EditRequestView";
import NotFoundView from "./views/NotFoundView";
import AllRequestsViewDepartment from "./views/AllRequestsDepartmentView";
import dayjs from "dayjs";

const pinia = createPinia();


createApp(App)
  .use(pinia)
  .use(router)
  .use(vuetify)
  .provide("dayJS", dayjs)
  .mount("#app");
