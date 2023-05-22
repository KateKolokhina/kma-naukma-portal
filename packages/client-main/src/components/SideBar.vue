<template>
  <v-navigation-drawer
    v-if="showSideMenu"
    :rail="rail"
    permanent
    @click="rail = false" width="auto">

    <v-list>
      <div v-if="authStore.isUser">
        <v-list-item
          v-for="(item, i) in user"
          :key="i"
          :value="item"
          active-color="gray"
          :href="item.href">
          <template v-slot:prepend>
            <v-icon :icon="item.icon" color="#26434c"></v-icon>
          </template>
          <v-list-item-title class="text-left" v-text="item.text"></v-list-item-title>
        </v-list-item>
      </div>

      <div v-if="authStore.isSpecialist">
        <v-list-item
          v-for="(item, i) in specialist"
          :key="i"
          :value="item"
          active-color="gray"
          :href="item.href">
          <template v-slot:prepend>
            <v-icon :icon="item.icon" color="#26434c"></v-icon>
          </template>
          <v-list-item-title class="text-left" v-text="item.text"></v-list-item-title>
        </v-list-item>
      </div>

      <v-list-item
        v-for="(item, i) in common"
        :key="i"
        :value="item"
        active-color="gray"
        :href="item.href">
        <template v-slot:prepend>
          <v-icon :icon="item.icon" color="#26434c"></v-icon>
        </template>
        <v-list-item-title class="text-left" v-text="item.text"></v-list-item-title>
      </v-list-item>
    </v-list>
  </v-navigation-drawer>
</template>

<script setup>
import { userVariableStore } from "@/stores/VariableStore";
import { storeToRefs } from "pinia";

import { useAuthStore } from "../stores/AuthStore";

const authStore = useAuthStore();
authStore.fetchUser();
const { showSideMenu } = storeToRefs(userVariableStore());
</script>

<script>
export default {
  data: () => ({
    rail: false,
    group: null,
    specialist: [
      {
        text: "Замовлення відділу",
        icon: "mdi-store-outline",
        href: "/request/all/department"
      }
    ],
    common: [
      {
        text: "Мої замовлення",
        icon: "mdi-cart-outline",
        href: "/request/all"
      },
      {
        text: "Профіль",
        icon: "mdi-account",
        href: "/profile"
      }
    ],
    user: [
      {
        text: "Замовити документ",
        icon: "mdi-text-box-plus",
        href: "/request/create"
      },
      {
        text: "Мої оцінки",
        icon: "mdi-school",
        href: "/grades"
      }
    ]
  })
};
</script>
