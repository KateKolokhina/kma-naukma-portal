import {defineStore} from 'pinia'


export const userVariableStore = defineStore('VariableStore', {
    state: () => {
        return {
            showSideMenu: false,
        }
    }
})
