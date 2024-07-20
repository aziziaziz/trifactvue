<template>
  <div class="home-main">
    <div :class="['home-menu', { 'home-menu-hide': !showMenu }]">
      <img :class="['menu-big-logo', { 'menu-big-logo-hide': !showMenu }]" src="https://img.icons8.com/?size=100&id=10403&format=png&color=000000" alt="">
      <div v-if="showMenu" class="menu-comp-name">Tri-Factor</div>

      <CollapsibleMenu :menuItems="menu" />
    </div>

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

      <div class="home-body">
        <router-view />
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onBeforeMount } from 'vue'
import { useRouter } from 'vue-router';

const router = useRouter();

//#region Data
const showMenu = ref(true);
const showUserSection = ref(false);
const menu = ref([
  {
    menu: 'Phase 1',
    opened: true,
    children: [
      { menu: 'Phase 1-1', icon: 'ICO' },
      { menu: 'Phase 1-2', icon: 'ICO' },
      { menu: 'Phase 1-3', icon: 'ICO' },
      { menu: 'Phase 1-4', icon: 'ICO' },
      { menu: 'Phase 1-5', icon: 'ICO' }
    ]
  }
])
//#endregion Data

//#region Methods
const showHideMenu = () => {
  showMenu.value = !showMenu.value;
}
const logoutClicked = () => {
  // To clear all the user details upon logout from the local storage
  localStorage.removeItem('user');
  localStorage.removeItem('loginTime');

  router.push('/');
}
//#endregion Methods

//#region Lifecycle
onBeforeMount(() => {
  let currentUser = localStorage.getItem('user');
  if (!currentUser) { // This is when the user is null, which means that no user has login
    // Push to login page to make sure that user needs to be logged in to view the home page
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
.home-menu-hide {
  min-width: 50px;
  max-width: 50px;
}
.menu-big-logo {
  height: 100px;
  width: 100px;
  transition: 0.3s;
  margin-top: 1em;
}
.menu-big-logo-hide {
  height: 40px;
  width: 40px;
  margin-bottom: 1.5em;
}
.menu-comp-name {
  margin-bottom: 1.5em;
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
  height: 30px;
  width: 30px;
  position: relative;
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
.user-section-trans-enter-active, .user-section-trans-leave-active {
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
</style>