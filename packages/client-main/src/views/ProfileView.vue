<script setup>
import { useProfileStore } from "../stores/ProfileStore";
import { useAuthStore } from "../stores/AuthStore";

const profileStore = useProfileStore();
profileStore.fetchProfile();

const authStore = useAuthStore();
authStore.fetchUser();

</script>

<template>
  <MainLayout>
    <v-card-title class="text-h6 text-md-h5 text-lg-h4">Профіль</v-card-title>
    <v-card-text text-align="center">

      <br>
      <br>
      <p class="font-weight-medium">Користувач</p>
      <p class="font-weight-regular" v-text="profileStore.profile.fio"/>
      <br>

      <p class="font-weight-medium">Ролі</p>
      <p class="font-weight-regular" v-text="authStore.getRolesStr"/>
      <br>

      <div v-if="!authStore.isSpecialist">
        <p class="font-weight-medium">Тип навчання</p>
        <p class="font-weight-regular" v-text="profileStore.profile.degreeType"/>
        <br>

        <p class="font-weight-medium">Факультет</p>
        <p class="font-weight-regular" v-text="profileStore.profile.faculty"/>
        <br>

        <p class="font-weight-medium">Спеціальність</p>
        <p class="font-weight-regular" v-text="profileStore.profile.speciality"/>
        <br>

        <p class="font-weight-medium">Номер залікової книжки</p>
        <p class="font-weight-regular" v-text="profileStore.profile.gradebookId"/>
        <br>
      </div>

      <div v-if="authStore.isSpecialist">
        <p class="font-weight-medium">Відділення</p>
        <p class="font-weight-regular" v-text="profileStore.profile.department.name"/>
        <br>
      </div>
    </v-card-text>
  </MainLayout>
</template>

<script>
import MainLayout from "../components/MainLayout";

export default {
  name: "ProfileView",

  username: "TEST",
  components: {
    MainLayout
  }
};
</script>

<style scoped>

</style>
