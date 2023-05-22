<script setup>
import { userVariableStore } from "@/stores/VariableStore";
import { storeToRefs } from "pinia";
import { useProfileStore } from "../stores/ProfileStore";
import { useAuthStore } from "../stores/AuthStore";

const { showSideMenu } = storeToRefs(userVariableStore());

const authStore = useAuthStore();
authStore.fetchUser();

const profileStore = useProfileStore();
profileStore.fetchProfile();

</script>

<template>
  <v-app-bar
    color="#6bcbea"
    prominent>
    <v-app-bar-nav-icon variant="text"
                        @click.stop="showSideMenu = !showSideMenu">
    </v-app-bar-nav-icon>

    <v-toolbar-title>NaukmaPortal</v-toolbar-title>
    <v-spacer></v-spacer>
    <v-spacer></v-spacer>
    <v-spacer></v-spacer>

    <v-list-item
      :title=" profileStore.profile.fio + ' | ' + authStore.getRolesStr || '' "
      nav>
    </v-list-item>

    <v-btn variant="text" href="/auth/logout" icon="mdi-logout"></v-btn>
  </v-app-bar>
</template>
