import { defineStore } from "pinia";
import axios from "axios";
import { Student } from "api-main/dist/model/entity/Student";
import { Specialist } from "api-main/dist/model/entity/Specialist";

export const useProfileStore = defineStore("ProfileStore", {
  state: () => {
    return {
      profile: Student | Specialist,
      grades: []
    };
  },
  actions: {
    async fetchProfile() {
      try {
        const data = await axios.get("http://localhost:8080/user/profile");
        this.profile = data.data.info;
        console.log(data.data.info);
      } catch (error) {
        alert(error);
        console.log(error);
      }
    },
    async fetchGrades() {
      try {
        const data = await axios.get("http://localhost:8080/grade/");
        data.data.result.forEach(function(obj) {
          obj.gradeTextEnglish = transformGradeName(obj.gradeText);
        });
        this.grades = data.data.result;

        console.log(data.data.result);
      } catch (error) {
        alert(error);
        console.log(error);
      }
    }
  }
});


// Зараховано/ Passed
// Незараховано / Fail
// Відмінно/ Excellent
// Добре / Good
// Задовільно / Satisfactory
// незадовільно / Unsatisfactory
// не зʼявився /  Did not appear
export const transformGradeName = function(name){
  switch (name.toLowerCase()) {
    case 'зараховано':
      return "Passed";
    case "незараховано":
      return "Fail";
    case "відмінно":
      return "Excellent";
    case "добре":
      return "Good";
    case "задовільно":
      return "Satisfactory";
    case "незадовільно":
      return "Unsatisfactory";
    case "не зʼявився":
      return "Did not appear";
    default:
      console.log(`Sorry, we are out of ${name}.`);
  }
}
