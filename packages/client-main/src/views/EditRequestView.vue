<script setup>
import { useAuthStore } from "../stores/AuthStore";

const authStore = useAuthStore();
authStore.fetchUser();

</script>
<template>
  <MainLayout>
    <v-snackbar v-model="alertSucc" auto-height color="success"
                multi-line
                timeout="1500"
                :top="true">
      <v-layout align-center pr-4>
        <v-icon class="pr-3" dark large>check_circle</v-icon>
        <v-layout column>
          <div>
            <strong> Замовлення {{ this.requestNumber }} збережено! </strong>
          </div>
        </v-layout>
      </v-layout>
    </v-snackbar>

    <v-snackbar v-model="alertError" auto-height color="red"
                multi-line
                timeout="1500"
                top="true"
    >
      <v-layout class="align-center pr-4">
        <v-icon class="pr-3" dark large>error</v-icon>
        <v-layout column>
          <div>
            <strong>Помилка при збереженні замовлення</strong>
          </div>
        </v-layout>
      </v-layout>
    </v-snackbar>

    <v-card-title class="text-h6 text-md-h5 text-lg-h4">Документ {{ item.officialCode }}</v-card-title>

    <div v-if="(item.status==='Створено' && !authStore.isSpecialist)">
      <p class="font-weight-medium">Тип документа</p>
      <p class="font-weight-regular" v-text="item.docType" />
      <br>

      <p class="font-weight-medium">Тип отримання</p>
      <p class="font-weight-regular" v-text="item.receiveType" />
      <br>

      <p class="font-weight-medium">Статус</p>
      <p class="font-weight-regular" v-text="item.status" />
      <br>

      <div v-if="item.specialistFio">
        <p class="font-weight-medium">Виконавець </p>
        <p class="font-weight-regular" v-text="item.specialistFio" />
        <br>
      </div>
    </div>

    <v-card-text text-align="center" v-if="item.status==='Створено'">
      <div>
        <p class="font-weight-normal">Ви можете переглянути інформацію про можливі документи знизу: </p>
        <div v-for="item in docOptions"
             :key="item.id"
        >
          <v-card class="mx-auto">
            <v-card-actions @click="showsInfo[item.id-1] = !showsInfo[item.id-1]">
              <v-btn
                color="blue"
                variant="text">
                {{ item.name }}
              </v-btn>
              <v-spacer></v-spacer>
              <v-btn
                :icon="showsInfo[item.id-1] ? 'mdi-chevron-up' : 'mdi-chevron-down'"
              ></v-btn>
            </v-card-actions>

            <v-expand-transition>
              <div v-show="showsInfo[item.id-1]">
                <v-divider></v-divider>

                <v-card-text align="left">
                  {{ item.description }}
                  <br><br>
                  <b>Термін виконання:</b> {{ item.term_of_execution }} робочих днів.
                </v-card-text>
              </div>
            </v-expand-transition>
          </v-card>
          <br>
        </div>
      </div>

      <br>
      <br>
      <v-divider :thickness="2"></v-divider>
      <br>

      <v-form ref="form" @submit.prevent="submitData">

        <v-select
          v-model="type"
          :rules="requiredCheck"
          :items="docOptions"
          item-title="name"
          item-value="id"
          label="Оберіть документ"
          variant="solo"
          required
        >
        </v-select>

        <v-radio-group
          v-model="receiveType" :rules="requiredCheck"
        >
          <p class="font-weight-normal" align="left">У якому форматі Ви хотіли б отримати довідку/документ?</p>
          <v-radio value="e-copy">
            <template v-slot:label>
              <div>Е-копія (сканкопія)</div>
            </template>
          </v-radio>
          <v-radio value="original">
            <template v-slot:label>
              <div>Оригінал (фізичний примірник)</div>
            </template>
          </v-radio>
        </v-radio-group>

        <v-text-field
          v-model="comment"
          variant="solo"
          label="Коментар"
        ></v-text-field>

        <v-btn type="submit" size="large" class="mx-2" color="blue">Зберегти</v-btn>

      </v-form>

    </v-card-text>

  </MainLayout>
</template>

<script>
import MainLayout from "../components/MainLayout";
import axios from "axios";
import { useDocumentStore } from "../stores/DocumentStore";

export default {
  name: "EditRequestView",
  components: {
    MainLayout
  },
  data: () => ({
    requestNumber: "",
    showsInfo: [],
    alertError: false,
    alertSucc: false,
    docOptions: [],
    item: {},

    receiveType: "",
    type: null,
    comment: "",
    requiredCheck: [
      v => !!v || "Заповніть поле"
    ]
  }),
  async mounted() {

    const store = useDocumentStore();
    await store.fetchDocuments();
    this.docOptions = store.documents;
    for (let i = 0; i <= this.docOptions.length; i++) {
      this.showsInfo.push(false);
    }
    await axios.get("http://localhost:8080/doc-request/" + this.$route.params.id)
      .then(response => {
        this.item = response.data.info;
        console.log("data: ", response.data.info);
        this.type = this.docOptions.find((item) => item.name === this.item.docType);
        this.comment = this.item.comment;
        switch (this.item.receiveType) {
          case "Електрона копія":
            this.receiveType = "e_copy";
            break;
          case "Оригінал" :
            this.receiveType = "original";
            break;
          default:
            return null;
        }
      })
      .catch(() => {
        this.alertError = true;
        console.log("Something went wrong");
      });
  },
  methods: {
    submitData() {
      axios.post("http://localhost:8080/doc-request/edit", {
        id: this.item.id,
        receiveType: this.receiveType,
        docType: this.type.id,
        comment: this.comment
      })
        .then((response) => {
          this.requestNumber = response.data.officialCode;
          this.alertSucc = true;
          this.$router.go();
        })
        .catch(() => {
          this.alertError = true;
          console.log("Something went wrong");
        });
    }
  }
};
</script>

<style scoped>

</style>
