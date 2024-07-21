<template>
  <div class="home-main">
    <!-- For wide screen left menu -->
    <div class="home-menu">
      <img class="menu-big-logo" src="../../assets/logo.png" alt=""
        @click="companyLogoClicked">
      <div v-if="showMenu" class="menu-comp-name">Tri-Factor</div>

      <CollapsibleMenu :menuItems="menu" />
    </div>
    <!-- For wide screen left menu -->

    <div class="home-content">
      <div class="home-top-bar">
        <div class="burger-menu-container">
          <Transition name="menu-burger">
            <img v-if="!showMenu" src="https://img.icons8.com/?size=100&id=8113&format=png&color=000000" @click="showHideMenu" alt="">
            <img v-else src="https://img.icons8.com/?size=100&id=9433&format=png&color=000000" @click="showHideMenu" alt="">
          </Transition>
        </div>
        <div class="horizontal-spacer"></div>
        <div>Username</div>
        <div class="top-right-user-section" @click="showUserSection = !showUserSection">
          <img class="user-logo" src="../../assets/home/user.png" alt="">
          <transition name="user-section-trans">
            <div v-if="showUserSection" class="user-section-open">
              <Button theme="danger" @click="logoutClicked">Log Out</Button>
            </div>
          </transition>
        </div>
      </div>

      <!-- For Narrow screen menu -->
      <Transition name="narrow-menu">
        <div v-if="showMenu" class="home-menu-narrow">
          <CollapsibleMenu :menuItems="menu" @menuClicked="showMenu = false" />
        </div>
      </Transition>
      <!-- For Narrow screen menu -->

      <div class="home-body">
        <router-view />
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onBeforeMount, onMounted } from 'vue'
import { useRouter } from 'vue-router';

const router = useRouter();

//#region Data
const showMenu = ref(false); // To show or hide the menu for narrow screen
const showUserSection = ref(false); // Show the section under the user icon on the top right
const menu = ref([ // The list of menu to be shown
  {
    menu: 'Phase 1',
    opened: true,
    children: [
      { menu: 'Space Requirements', icon: 'ICO', path: 'SpaceReq' },
      { menu: 'Office Customization', icon: 'ICO' },
      { menu: 'Retail Customization', icon: 'ICO' },
      { menu: 'Budget', icon: 'ICO' },
      { menu: 'Cost Breakdown', icon: 'ICO' }
    ]
  }
])
//#endregion Data

//#region Methods
const showHideMenu = () => {
  // Switch the show menu to true or false (Only for narrow screen)
  showMenu.value = !showMenu.value;
}
const logoutClicked = () => {
  // To clear all the user details upon logout from the local storage
  localStorage.removeItem('user');
  localStorage.removeItem('loginTime');

  // Push back to home
  router.push('/');
}
const companyLogoClicked = () => {
  // Show the initial page when clicking the logo of the company on the top left
  router.push('/Home');
}
//#endregion Methods

//#region Lifecycle
onBeforeMount(() => {
  // Get the current user from the local storage and push back to login page if the user does not exist
  let currentUser = localStorage.getItem('user');
  if (!currentUser) {
    router.push('/');
  }
})
//#endregion Lifecycle
</script>

<style scoped>
.home-main {
  display: flex;
  height: 100vh;
  width: 100vw;
}
.home-top-bar {
  /* background-color: blue; */
  background-color: rgb(68,188,98);
  width: 100%;
  height: 50px;
  display: flex;
  align-items: center;
  padding: 10px;
  column-gap: 10px;
  white-space: nowrap;
  box-shadow: 0 0 5px 2px gray;
  position: relative;
  z-index: 11;
}
.top-right-user-section {
  position: relative;
  height: 35px;
  width: 35px;
  cursor: pointer;
}
.user-logo {
  height: 100%;
}
.user-section-open {
  background-color: white;
  box-shadow: 0 0 5px 2px gray;
  padding: 5px;
  border-radius: 10px;
  position: absolute;
  min-width: 200px;
  top: 100%;
  right: 0;
}
.home-content {
  display: flex;
  flex-direction: column;
  width: calc(100% - 200px);
  height: 100%;
}
.home-menu {
  background-color: rgb(30,80,40);
  width: 200px;
  min-width: 200px;
  max-width: 200px;
  box-shadow: 0 0 5px 2px gray;
  color: white;
  position: relative;
  z-index: 2;
  display: flex;
  flex-direction: column;
  align-items: center;
  transition: 0.3s;
}
.home-menu-narrow {
  position: absolute;
  left: 0;
  top: 50px;
  width: 100%;
  padding: 10px;
  z-index: 10;
  background-color: white;
  box-shadow: 0 0 10px 2px black;
}
.menu-big-logo {
  height: 100px;
  width: 100px;
  transition: 0.3s;
  margin-top: 1em;
  cursor: pointer;
}
.menu-comp-name {
  margin-bottom: 1.5em;
  font-size: 1.2em;
}
.menu-item {
  display: flex;
  align-items: center;
  column-gap: 10px;
  width: 100%;
  height: fit-content;
  padding: 5px;
}
.menu-item-hide {
  overflow: hidden;
}
.menu-item-hide > :nth-child(2) {
  display: none;
  max-height: 0;
  white-space: nowrap;
}
.menu-item:hover {
  background-color: rgb(68,188,98);
  cursor: pointer;
  color: black;
}
.burger-menu-container {
  height: 20px;
  width: 20px;
  max-height: 20px;
  min-height: 20px;
  max-width: 20px;
  min-width: 20px;
  position: relative;
  display: none;
}
.burger-menu-container > img {
  height: 100%;
  width: 100%;
  position: absolute;
}
.home-body {
  width: 100%;
  height: 100%;
  padding: 10px;
  overflow: auto;
}

.menu-burger-enter-active, .menu-burger-leave-active,
.user-section-trans-enter-active, .user-section-trans-leave-active,
.narrow-menu-enter-active, .narrow-menu-leave-active {
  transition: 0.3s;
}
.menu-burger-enter-from, .menu-burger-leave-to {
  opacity: 0;
  transform: rotate(90deg);
}
.user-section-trans-enter-from, .user-section-trans-leave-to {
  opacity: 0;
  transform: translateX(100%);
}
.narrow-menu-enter-from, .narrow-menu-leave-to {
  opacity: 0;
  transform: translateY(-100%);
}

@media screen and (max-width: 1000px) {
  .burger-menu-container {
    display: block;
  }
  .home-menu {
    display: none;
  }
  .home-content {
    width: 100%;
  }
}
</style>