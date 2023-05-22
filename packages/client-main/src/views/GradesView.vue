<script setup>
import { useProfileStore } from "../stores/ProfileStore";

const profileStore = useProfileStore();
profileStore.fetchGrades();

</script>

<template>
  <MainLayout>
    <v-card-title class="text-h6 text-md-h5 text-lg-h4">Результати навчання</v-card-title>

    <v-card-text text-align="center">
      <br>
      <v-table
        fixed-header
        height="700px"
      >
        <thead>
        <tr>
          <th class="text-left">
            Код освітнього компоненту або результатів навчання (за наявності)
            / Component code or learning outcomes code (if available)
          </th>
          <th class="text-left">
            Назва освітнього компоненту або результатів навчання
            / Component title or learning outcomes title
          </th>
          <th>
            Відмітка про успішне завершення освітнього компоненту студентом або досягнення результатів навчання
            / Component successfully completed by a student or learning
          </th>
          <th>
            Кількість кредитів Європейської кредитної трансферно- накопичувальної системи
            / Number of ECTS credits
          </th>
          <th>Оцінка за шкалою закладу вищої освіти
            / Institutional Grade
          </th>
        </tr>
        </thead>
        <tbody>
        <tr
          v-for="item in profileStore.grades"
          :key="item.courseId"
        >
          <td>{{ item.courseId }}</td>
          <td>{{ item.courseName + " / " + (item.courseNameEnglish || " ") }}</td>
          <td>{{ item.gradeText + " / " + item.gradeTextEnglish }}</td>
          <td>{{ item.courseCredits }}</td>
          <td>{{ item.grade }}</td>
        </tr>
        </tbody>
      </v-table>

    </v-card-text>

  </MainLayout>
</template>

<script>
import MainLayout from "../components/MainLayout";

export default {
  name: "GradesView",
  components: {
    MainLayout
  }
};
</script>
