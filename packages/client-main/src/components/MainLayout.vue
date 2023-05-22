<template>
  <v-card>
    <v-layout>
      <NavBar></NavBar>
      <SideBar></SideBar>
      <v-main style="min-height: 500px;" class="slot-wrapper">

        <slot></slot>

      </v-main>
    </v-layout>
  </v-card>
</template>


<script>
import NavBar from "@/components/NavBar";
import SideBar from "@/components/SideBar";

export default {
  name: "MainLayout",
  components: { NavBar, SideBar }
};
</script>

<style scoped>
.slot-wrapper {
  padding: 9% 2% 2% 2%;
}
</style>
