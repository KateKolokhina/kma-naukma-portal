import { defineStore } from "pinia";
import axios from "axios";

export const useDocumentStore = defineStore("DocumentStore", {
  state: () => {
    return {
      documents: [],
    };
  },
  actions: {
    async fetchDocuments() {
      try {
        const data = await axios.get("http://localhost:8080/document/");
        this.documents = data.data.result;
        console.log(data.data.result);
      } catch (error) {
        alert(error);
        console.log(error);
      }
    }
  }
});
