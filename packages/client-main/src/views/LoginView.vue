<template>
  <div class="d-flex align-center justify-center backgrd">

    <v-sheet width="600" class="mx-auto loginBlock">

      <h1>NaukmaPortal</h1>
      <p>Портал електронних послуг студента</p>

      <br>

      <v-btn href="/auth/naukma" class="loginButton" color="#26b2e3" variant="elevated">
        Вхід через Office 365
      </v-btn>

      <br>

      <div class="help">
        <p><b>Служба підтримки:</b><a href="#">my@ukma.edu.ua</a></p>
      </div>

    </v-sheet>
  </div>
</template>


<script>
export default {

  name: "LoginView",
  data() {
    return {
    };
  },
};
</script>

<style>

.backgrd {
  height: 100vh;
  background-color: #6bcbea;
}

.loginButton {
  color: white;
}


.help {
  margin-top: 10%;
}

.loginBlock {
  padding: 5%;
  border-radius: 5%;
}
</style>
