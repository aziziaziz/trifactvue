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
          
          <a @click="testingClearPasswordFor2">Forgot Password?</a>
        </div>
        <div v-else class="login-container">
          <div>Hi {{ username }}!</div>
          <div>This is your first time logging in.</div>
          <div>Please set a new password.</div>
          <Input placeholder="New Password" inputType="password" v-model:value="newPassword" disableClear
            @enter="changePasswordClicked" ref="newPasswordInput" />
          <Input placeholder="Re-enter Password" inputType="password" v-model:value="reenterPassword" disableClear
            @enter="changePasswordClicked" ref="reenteredPasswordInput" />
          <Button @click="changePasswordClicked" :loading="changePasswordLoading">Change Password</Button>
        </div>
      </Transition>
    </div>

    <div class="copyright">COPYRIGHT 2024</div>
  </div>
</template>

<script setup>
import { ref, onBeforeMount, nextTick } from 'vue';
import { useRouter } from 'vue-router';
import { post, put } from '../js/apiCall';
import { showNoti } from '../js/helper';

const router = useRouter();

//#region Data
const username = ref(''); // The username value
const password = ref(''); // The password value
const usernameInput = ref(null); // The input of the username
const passwordInput = ref(null); // The input of the password
const loggingIn = ref(false); // The loading used when calling the api for login
const showChangePassword = ref(false); // To show the change password page
const newPassword = ref(''); // The new password that the user entered
const reenterPassword = ref(''); // The new password that the user re-entered for confirmation
const newPasswordInput = ref(null); // The new password input element
const reenteredPasswordInput = ref(null); // The reentered password input element
const changePasswordLoading = ref(false); // The loading for the change password button
const userId = ref(''); // The user uid from the DB
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
    localStorage.setItem('token', login.access_Token);
    localStorage.setItem('refresh', login.refresh_Token);
    localStorage.setItem('userid', login.user_uid);
    localStorage.setItem('role', login.user_role);

    // Pushing to home page
    router.push('/Home');
  } else {
    // Checking if the message for first time login users
    if (login.message == 'First time login') {
      // Clear the previous password and the new passwords
      password.value = '';
      newPassword.value = '';
      reenterPassword.value = '';

      // Setting the user id from DB
      userId.value = login.user_uid;

      // Showing the change password section
      showChangePassword.value = true;

      // Focus to the new password input
      await nextTick();
      newPasswordInput.value.setFocus(true);
    } else {
      // Show a notification saying that the username or password is invalid
      showNoti('Username or password is invalid', 'error');

      // Focus on the password element
      await nextTick();
      passwordInput.value.setFocus(true);
    }
  }
}
const changePasswordClicked = async () => {
  // Checking if the new password is not entered
  if (!newPassword.value) {
    // Show error noti and focus
    showNoti('Please enter your new password', 'error');
    newPasswordInput.value.setFocus(true);
    return;
  }

  // Checking if the reentered password is not entered
  if (!reenterPassword.value) {
    // Show error noti and focus
    showNoti('Please enter your new password', 'error');
    reenteredPasswordInput.value.setFocus(true);
    return;
  }

  // Check when the new and re-entered password is the same value
  if (newPassword.value == reenterPassword.value) {
    // Calling the api to update the user password
    changePasswordLoading.value = true;
    let updateResult = await put('User/UpdatePassword', {
      user_id: userId.value,
      password: newPassword.value
    });
    changePasswordLoading.value = false;

    // Check if the updating of the user password success
    if (updateResult) {
      // Show success noti
      showNoti('Password changed successfully. Please login with new password', 'success', 5000);

      // Clear the new password values
      newPassword.value = '';
      reenterPassword.value = '';

      // Change back to login page
      showChangePassword.value = false;
    } else {
      // Show error notification
      showNoti('There was an error while changing your password. Plese try again.', 'error', 5000);
    }
  } else {
    // Show error that the passwords does not match and focus to the reenter password input
    showNoti('New password entered does not match.', 'error');
    reenteredPasswordInput.value.setFocus(true);
  }
}
const testingClearPasswordFor2 = async () => { // TO DELETE!!!!!!!
  await put('User/ResetPassword?id=2');
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