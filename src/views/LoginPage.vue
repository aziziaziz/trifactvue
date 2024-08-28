<template>
  <div class="login-main">
    <div class="left-container">
      <img class="left-side-logo" src="../assets/logowithtext.png" alt="">
      <div class="company-caption">TIME <span>⚫️</span> COST <span>⚫️</span> QUALITY</div>
      <img class="company-logo" src="../assets/logo.png" alt="">
    </div>

    <div class="right-container">
      <Transition name="loginContainer">
        <div v-if="!showChangePassword" class="login-container">
          <div>WELCOME</div>
          <Input icon="login/user.png" v-model:value="username" placeholder="Username"
            ref="usernameInput" @enter="performLogin" :disabled="loggingIn" />
          <Input icon="login/lock.png" disableClear inputType="password" v-model:value="password" placeholder="Password"
            ref="passwordInput" @enter="performLogin" :disabled="loggingIn" />
          <Button @click="performLogin" :loading="loggingIn">Login</Button>
          
          <a>Forgot Password?</a>
        </div>
        <div v-else class="login-container">
          <div>Hi {{ username }}!</div>
          <div>This is your first time logging in.</div>
          <div>Please set a new password.</div>
          <Input placeholder="New Password" />
          <Input placeholder="Re-enter Password" />
          <Button @click="showChangePassword = false">Change Password</Button>
        </div>
      </Transition>
    </div>

    <div class="copyright">COPYRIGHT 2024</div>
  </div>
</template>

<script setup>
import { ref, onBeforeMount } from 'vue';
import { useRouter } from 'vue-router';
import { post } from '../js/apiCall';
import { showNoti } from '../js/helper';

const router = useRouter();

//#region Data
const username = ref(''); // The username value
const password = ref(''); // The password value
const usernameInput = ref(null); // The input of the username
const passwordInput = ref(null); // The input of the password
const loggingIn = ref(false); // The loading used when calling the api for login
const showChangePassword = ref(false); // To show the change password page
//#endregion Data

//#region Methods
const performLogin = async () => {
  // Check if username is empty
  if (!username.value) {
    usernameInput.value.setFocus(true);
    showNoti('Please enter your username', 'error');
    return;
  }

  // Check if password is empty
  if (!password.value) {
    showNoti('Please enter your password', 'error');
    passwordInput.value.setFocus(true);
    return;
  }

  usernameInput.value.setFocus();
  passwordInput.value.setFocus();

  // Perform login API call
  loggingIn.value = true;
  let login = await post('Auth/Login', {
    username: username.value,
    password: password.value
  });
  loggingIn.value = false;

  // Checking the login result
  if (login.success) {
    // When the login success
    localStorage.setItem('user', username.value);
    localStorage.setItem('loginTime', new Date());
    localStorage.setItem('token', login.token);

    // Pushing to home page
    router.push('/Home');
  } else {
    // Checking if the message for first time login users
    if (login.message == 'First time login') {
      // Showing the change password section
      showChangePassword.value = true;
    } else {
      // Show a notification saying that the username or password is invalid
      showNoti('Username or password is invalid', 'error');
    }
  }
}
//#endregion Methods

//#region Lifecycle
onBeforeMount(() => {
  let currentUser = localStorage.getItem('user');
  if (currentUser) {
    router.push('/Home');
  }
})
//#endregion Lifecycle
</script>

<style scoped>
.login-main {
  display: flex;
  width: 100%;
  height: 100%;
  min-height: 100dvh;
  min-width: 100vw;
}
.left-container {
  width: 40%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  /* padding-bottom: 10%; */
}
.left-side-logo {
  width: 80%;
}
.company-caption {
  font-family: Arial, Helvetica, sans-serif;
  font-weight: bold;
  font-size: 1.25em;
  display: flex;
  align-items: center;
  column-gap: 0.5em;
  margin-top: 1em;
}
.company-caption > span {
  font-size: 0.5em;
}
.company-logo {
  width: 20%;
  margin-top: 3em;
}
.right-container {
  width: 60%;
  display: flex;
  align-items: center;
  justify-content: center;
  /* background-color: rgb(68,188,98); */
  background: linear-gradient(to right, transparent, rgb(69,188,98));
  position: relative;
}
.login-container {
  width: 50%;
  padding: 1.5em 10px;
  border-radius: 10px;
  box-shadow: 0 0 10px 2px gray;
  background-color: white;
  display: flex;
  flex-direction: column;
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
.loginContainer-enter-active, .loginContainer-leave-active {
  transition: 0.3s;
  position: absolute;
}
.loginContainer-enter-from {
  transform: translateX(20%);
  opacity: 0;
}
.loginContainer-leave-to {
  transform: translateX(-20%);
  opacity: 0;
}

@media screen and (max-width: 900px) {
  .login-main {
    flex-direction: column;
    height: 100dvh;
    background: linear-gradient(to bottom, transparent, rgb(68,188,98));
  }
  .left-container, .right-container {
    width: 100%;
  }
  .left-container {
    height: 30%;
  }
  .right-container {
    height: 70%;
    align-items: flex-start;
    background: transparent;
  }
  .left-side-logo {
    max-width: 300px;
  }
  .company-caption {
    font-size: 1em;
  }
  .company-logo {
    max-width: 50px;
    margin-top: 1.2em;
  }
  .login-container {
    max-width: 400px;
    width: 90%;
    margin-top: 3em;
  }
}
</style>