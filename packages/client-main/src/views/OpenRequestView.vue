<script setup>
import { useAuthStore } from "../stores/AuthStore";

const authStore = useAuthStore();
authStore.fetchUser();

</script>
<template>
  <MainLayout>
    <v-alert
      v-model="alertError"
      type="error"
      closable
      close-label="Close Alert"
      title=""
    ></v-alert>
    <v-card-title class="text-h6 text-md-h5 text-lg-h4">Документ {{ item.officialCode }}</v-card-title>

    <div justify="center" style="margin: 2%  0 2% 0">

      <v-btn v-if="!authStore.isSpecialist && item.status!=='Виконано' && item.status!=='Відмінено'" class="mx-2" fab
             dark small color="red"
             @click="cancelRequest(item.id)">
        Відмінити
      </v-btn>

      <v-btn
        v-if="(!authStore.isSpecialist && (item.status==='Створено')) || (authStore.isSpecialist && (item.status==='В роботі'))"
        class="mx-2" fab dark small color="orange" @click="editRequest(item.id)">
        Редагувати
      </v-btn>

      <v-btn
        v-if="(authStore.isSpecialist && item.specialistEmail != null && authStore.user.email === item.specialistEmail && (item.status==='Відмінено'))"
        class="mx-2" fab dark small color="grey"
        @click="deleteRequest(item.id)">
        Видалити
      </v-btn>

      <v-btn
        v-if="(authStore.isSpecialist && item.specialistEmail != null && authStore.user.email === item.specialistEmail &&  (item.status==='В роботі'))"
        class="mx-2" fab dark small color="green"
        @click="finishRequest(item.id)">
        Завершити
      </v-btn>

    </div>

    <p class="font-weight-medium">Тип документа </p>
    <p class="font-weight-regular" v-text="item.docType" />
    <br>

    <p class="font-weight-medium">Дата запиту </p>
    <p class="font-weight-regular" v-text="item.creationDate" />
    <br>

    <div v-if="item.finishedDate">
      <p class="font-weight-medium">Дата виконання </p>
      <p class="font-weight-regular" v-text="item.finishedDate" />
      <br>
    </div>

    <div v-if="item.specialistFio">
      <p class="font-weight-medium">Виконавець </p>
      <p class="font-weight-regular" v-text="item.specialistFio" />
      <br>
    </div>

    <div v-if="item.comment">
      <p class="font-weight-medium">Коментарій до замовлення </p>
      <p class="font-weight-regular" v-text="item.comment" />
      <br>
    </div>


    <p class="font-weight-medium">Статус</p>
    <p class="font-weight-regular" v-text="item.status" />
    <br>

    <p class="font-weight-medium">Тип отримання</p>
    <p class="font-weight-regular" v-text="item.receiveType" />
    <br>

    <div v-if="item.docType==='Академічна довідка'">
      <p class="font-weight-medium">Основний зміст</p>
      <p class="font-weight-regular" v-text="mainText" />
      <p class="font-weight-regular" v-text="detailsFaculty" />
      <p class="font-weight-regular" v-text="detailsSpeciality" />
      <p class="font-weight-regular" v-text="detailsDates" />
    </div>

    <div v-if="item.docType==='Академічна довідка (розширена)'">
      <p class="font-weight-medium">Основний зміст</p>
      <p class="font-weight-regular" v-text="mainText" />
      <p class="font-weight-regular" v-text="detailsFaculty" />
      <p class="font-weight-regular" v-text="detailsSpeciality" />
      <p class="font-weight-regular" v-text="detailsDates" />
      <p class="font-weight-regular align-center" v-text="/ Інформація про навчальні досягнення студента /" />
    </div>

    <br>
    <v-btn
      v-if="(authStore.isSpecialist && item.specialistEmail != null && authStore.user.email === item.specialistEmail) ||
      (authStore.isUser && item.studentEmail ==authStore.user.email && item.status==='Виконано')"
      class="generate-btn"
      @click="generateDocument">Переглянути/Завантажити
    </v-btn>

  </MainLayout>
</template>

<script>
import MainLayout from "../components/MainLayout";
import axios from "axios";

export default {
  name: "OpenRequestView",
  components: {
    MainLayout
  },
  data: () => ({
    item: {},
    alertError: false,
    mainText: "",
    detailsFaculty: "",
    detailsSpeciality: "",
    detailsDates: ""
  }),
  async mounted() {
    await axios.get("http://localhost:8080/doc-request/" + this.$route.params.id)
      .then(response => {
        this.item = response.data.info;
        this.mainText =
          " Цією довідкою засвідчуємо, що " + this.item.studentFio + " дійсно є студентом(студенткою) " +
          this.item.yearOfStudy + " року навчання Національного університету \"Києво - Могилянська академія\"" +
          this.item.modeOfStudy + " форма навчання, " + this.item.yearOfStudy + " рівень акредитації, " + this.item.formOfStudy + ".";
        this.detailsFaculty = this.item.faculty + ", освітній рівень: " + this.item.degreeLevel + ".";
        this.detailsSpeciality = "Спеціальність: " + this.item.speciality + ".";
        this.detailsDates = "      Термін навчання з " + this.item.startTerm + " до " + this.item.endTerm + ".";
        this.detailsDates = "      Термін навчання з " + this.item.startTerm + " до " + this.item.endTerm + ".";
      })
      .catch(() => {
        this.alertError = true;
        console.log("Something went wrong");
      });
  },
  methods: {
    editRequest(id) {
      console.log("open document- " + id);
      this.$router.replace({ name: "request-edit", params: { id: id } });
    },
    async deleteRequest(id) {
      await axios.post("http://localhost:8080/doc-request/delete", {
        id: id
      })
        .then(() => {
          this.$router.replace({ name: "all-requests" });
        })
        .catch(() => {
          this.alertError = true;
          console.log("Something went wrong");
        });
      console.log("delete request with id - " + id);
    },
    async cancelRequest(id) {
      await axios.post("http://localhost:8080/doc-request/cancel", {
        id: id
      })
        .then(() => {
          this.$router.go();
        })
        .catch(() => {
          this.alertError = true;
          console.log("Something went wrong");
        });
    },
    async finishRequest(id) {
      await axios.post("http://localhost:8080/doc-request/finish", {
        id: id
      })
        .then(() => {
          this.$router.go();
        })
        .catch(() => {
          this.alertError = true;
          console.log("Something went wrong");
        });
      console.log("delete request with id - " + id);
    },
    async generateDocument() {
      window.open("http://localhost:8080/doc-request/" + this.$route.params.id + "/download", "_blank");
    }
  }
};
</script>

<style scoped>

</style>
