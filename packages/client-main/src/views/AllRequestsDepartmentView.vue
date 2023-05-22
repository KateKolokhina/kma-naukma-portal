<script setup>
import { inject } from "vue";

const dayJS = inject("dayJS");

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
    <v-card-title class="text-h6 text-md-h5 text-lg-h4">Усі замовлення відділення</v-card-title>

    <v-card-text text-align="center">
      <v-row
        align="start"
        no-gutters
        style="margin-top: 2%"
      >
        <v-col cols="3">
          <v-select
            v-model="sortBy"
            :items="sortOption"
            item-title="name"
            item-value="value"
            label="Сортувати за"
            variant="outlined"
            style="margin-right: 3%" />
        </v-col>
        <v-col>
          <v-switch
            v-model="orderBy"
            inset
            color="primary"
            :label="(orderBy=='ASC')? 'У порядку зростання': 'У порядку спадання'"
            true-value="ASC"
            false-value="DESC"
            hide-details
          ></v-switch>
        </v-col>

      </v-row>
      <v-table ref="table">
        <thead>
        <tr>
          <th class="text-left">
            Номер замовлення (документа)
          </th>
          <th class="text-left" v-if="authStore.isSpecialist">
            Студент
          </th>
          <th class="text-left">
            Статус
          </th>
          <th class="text-left">
            Тип отримання
          </th>
          <th class="text-left">
            Дата створення
          </th>
          <th class="text-left">
            Дата завершення
          </th>
          <th class="text-left">
            Тип документа
          </th>
          <th class="text-left" v-if="!authStore.isSpecialist">
            Спеціаліст
          </th>
          <th class="text-left">
          </th>
          <th class="text-left">
          </th>
          <th class="text-left">
          </th>
        </tr>
        </thead>
        <tbody>
        <tr
          v-for="item in items"
          :key="item.officialCode"
          class="text-left">
          <td>{{ item.officialCode }}</td>
          <td v-if="authStore.isSpecialist">{{ (item.studentFio == null) ? "" : item.studentFio }}</td>
          <td>{{ item.status }}</td>
          <td>{{ item.receiveType }}</td>
          <td>{{ dayJS.unix(item.creationDate).format("DD/MM/YYYY HH:mm:ss") }}</td>
          <td>{{ (item.finishedDate == null) ? "" : dayJS.unix(item.finishedDate).format("DD/MM/YYYY HH:mm:ss") }}</td>
          <td>{{ item.document.name }}</td>

          <td v-if="!authStore.isSpecialist">{{ (item.specialist == null) ? "" : item.specialist.fio }}</td>
          <td>
            <v-btn class="mx-2"
                   fab dark small color="pink" @click="openDocument(item)">
              {{ (item.specialist == null || item.status === "Виконано" || item.status === "Відмінено") ? "Переглянути" : "Переглянути / Редагувати"
              }}
            </v-btn>
          </td>

          <td v-if="authStore.isSpecialist">
            <v-btn class="mx-2" fab dark small color="#1e71e9" @click="detachSpecialist(item)"
                   v-if="item.specialist != null && item.specialist.email ==authStore.user.email"
                   :disabled="(item.status === 'Виконано' || item.status === 'Відмінено')">
              Відмовитись
            </v-btn>
            <v-btn class="mx-2" fab dark small color="#1e71e9" @click="setSpecialist(item)"
                   v-if="item.specialist == null"
                   :disabled="(item.status === 'Виконано' || item.status === 'Відмінено')">
              Прийняти в роботу
            </v-btn>
          </td>
        </tr>
        </tbody>
      </v-table>

      <v-pagination
        v-model="page"
        class="my-4"
        :length="totalPages"
        v-if="totalPages>1"
      ></v-pagination>

    </v-card-text>
  </MainLayout>
</template>

<script>
import MainLayout from "../components/MainLayout";
import axios from "axios";

export default {
  name: "AllRequestsView",
  components: {
    MainLayout
  },
  data: () => ({
    sortOption: [
      {
        value: "officialCode",
        name: "Номер замовлення"
      },
      {
        value: "docType",
        name: "Тип документа"
      },
      {
        value: "receiveType",
        name: "Тип отримання"
      },
      {
        value: "status",
        name: "Статус"
      },
      {
        value: "studentFio",
        name: "Студент"
      },
      {
        value: "specialistFio",
        name: "Спеціаліст"
      },
      {
        value: "creationDate",
        name: "Дата створення"
      },
      {
        value: "finishedDate",
        name: "Дата завершення"
      }
    ],
    orderBy: "DESC",
    sortBy: "officialCode",
    page: 1,
    totalPages: 1,
    items: [],
    totalItems: 0,
    alertError: false
  }),
  async mounted() {
    await axios.post("http://localhost:8080/doc-request/all/department", {
      page: this.page,
      forDepartment: true,
      sortBy: this.sortBy,
      orderBy: this.orderBy
    })
      .then(res => {
        this.totalPages = res.data.totalItems < res.data.pageSize ? 1 : Math.ceil(res.data.totalItems / res.data.pageSize);
        this.totalItems = res.data.totalItems;
        this.items = res.data.items;
        console.log(this.items);
      })
      .catch(() => {
        this.alertError = true;
        console.log("Something went wrong");
      });
  },
  watch: {
    page: async function() {
      await axios.post("http://localhost:8080/doc-request/all/department", {
        page: this.page,
        forDepartment: true,
        sortBy: this.sortBy,
        orderBy: this.orderBy
      })
        .then(res => {
          this.totalPages = res.data.totalItems < res.data.pageSize ? 1 : Math.ceil(res.data.totalItems / res.data.pageSize);
          this.items = res.data.items;
          console.log(this.items);
        })
        .catch(() => {
          this.alertError = true;
          console.log("Something went wrong");
        });
    },
    orderBy: async function() {
      await axios.post("http://localhost:8080/doc-request/all/department", {
        page: this.page,
        forDepartment: true,
        sortBy: this.sortBy,
        orderBy: this.orderBy
      })
        .then(res => {
          this.totalPages = res.data.totalItems < res.data.pageSize ? 1 : Math.ceil(res.data.totalItems / res.data.pageSize);
          this.items = res.data.items;
          console.log(this.items);
        })
        .catch(() => {
          this.alertError = true;
          console.log("Something went wrong");
        });
    },
    sortBy: async function() {
      await axios.post("http://localhost:8080/doc-request/all/department", {
        page: this.page,
        forDepartment: true,
        sortBy: this.sortBy,
        orderBy: this.orderBy
      })
        .then(res => {
          this.totalPages = res.data.totalItems < res.data.pageSize ? 1 : Math.ceil(res.data.totalItems / res.data.pageSize);
          this.items = res.data.items;
          console.log(this.items);
        })
        .catch(() => {
          this.alertError = true;
          console.log("Something went wrong");
        });
    }
  },
  methods: {
    openDocument(item) {
      console.log("open document- " + item.id);
      this.$router.replace({ name: "request", params: { id: item.id } });
    },
    async setSpecialist(item) {
      await axios.post("http://localhost:8080/doc-request/setSpecialist", {
        id: item.id
      })
        .then(() => {
          this.$router.go();
        })
        .catch(() => {
          this.alertError = true;
          console.log("Something went wrong");
        });
      console.log("set specialist to - " + item.id);
    },
    async detachSpecialist(item) {
      await axios.post("http://localhost:8080/doc-request/detachSpecialist", {
        id: item.id
      })
        .then(() => {
          this.$router.go();
        })
        .catch(() => {
          this.alertError = true;
          console.log("Something went wrong");
        });
      console.log("set specialist to - " + item.id);
    }
  }


};
</script>

<style scoped>

</style>
