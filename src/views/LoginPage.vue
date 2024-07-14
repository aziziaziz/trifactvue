<template>
  <div class="login-main">
    <div class="left-container">
      Left
    </div>
    <div class="right-container">
      <div class="login-container">
        <div>WELCOME</div>
        <Input icon="login/user.png" v-model:value="username" placeholder="Username"
          ref="usernameInput" @enter="performLogin" :disabled="loggingIn" />
        <Input icon="login/lock.png" disableClear inputType="password" v-model:value="password" placeholder="Password"
          ref="passwordInput" @enter="performLogin" :disabled="loggingIn" />
        <Button @click="performLogin" :loading="loggingIn"></Button>
        
        <a>Forgot Password?</a>
      </div>
    </div>

    <div class="copyright">COPYRIGHT 2024</div>
  </div>
</template>

<script setup>
import { ref } from 'vue';

//#region Data
const username = ref('');
const password = ref('');

const usernameInput = ref(null);
const passwordInput = ref(null);

const loggingIn = ref(false);
//#endregion Data

//#region Methods
const performLogin = () => {
  if (!username.value) {
    usernameInput.value.setFocus(true);
    return;
  }

  if (!password.value) {
    passwordInput.value.setFocus(true);
    return;
  }

  usernameInput.value.setFocus();
  passwordInput.value.setFocus();

  // Perform login API call
  loggingIn.value = true;

  setTimeout(() => {
    loggingIn.value = false;
  }, 5000);
}
//#endregion Methods
</script>

<style scoped>
.login-main {
  display: flex;
  width: 100%;
  height: 100%;
  min-height: 100vh;
  min-width: 100vw;
}
.left-container {
  width: 40%;
}
.right-container {
  width: 60%;
  display: flex;
  align-items: center;
  justify-content: center;
  /* background-color: rgb(68,188,98); */
  background: linear-gradient(to right, transparent, rgb(69,188,98));
}
.login-container {
  width: 50%;
  height: 50%;
  border-radius: 10px;
  box-shadow: 0 0 10px 2px gray;
  background-color: white;
  display: flex;
  flex-direction: column;
  padding: 10px;
  align-items: center;
  justify-content: center;
}
.login-container > :not(:first-child) {
  margin-top: 10px;
}
.copyright {
  position: fixed;
  bottom: 10px;
  width: 100%;
  text-align: center;
  pointer-events: none;
  left: 0;
}
</style>