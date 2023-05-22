import { defineStore } from "pinia";
import axios from "axios";
import { User } from "api-main/dist/model/entity/User";
import { transormRoles, UserRole } from "api-main/dist/model/entity/types";


export const useAuthStore = defineStore("AuthStore", {
  state: () => {
    return {
      user: User,
      roles: [],
      isSpecialist: false,
      isUser: false,
    };
  },
  actions: {
    async fetchUser() {
      try {
        const data = await axios.get('http://localhost:8080/auth/user');
        this.user = data.data
        console.log(this.user);
        this.roles = transormRoles(this.user.roles);
        this.isSpecialist = this.user.roles.includes(UserRole.SPECIALIST);
        this.isUser = this.user.roles.includes(UserRole.USER);
        console.log(data.data)
      }
      catch (error) {
        alert(error)
        console.log(error)
      }
    }
  },
  getters: {
    getRolesStr(state) {
      return state.roles.join(", ");
    },
    getIfSpecialist(state) {
      return state.user.roles.includes('specialist');
    }
  }
});
