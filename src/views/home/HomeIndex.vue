<template>
  <div class="home-main">
    <!-- For wide screen left menu -->
    <div class="home-menu">
      <img class="menu-big-logo" src="../../assets/logo.png" alt="" @click="companyLogoClicked">
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
        <img class="menu-small-logo" src="../../assets/logo.png" alt="" @click="companyLogoClicked">
        <div v-if="store.state.currentClient">{{ displayLabel }}: {{ store.state.currentClient.client_name }}</div>
        <div class="horizontal-spacer"></div>
        <div class="wide-username">{{ username }}</div>
        <div class="top-right-user-section" @click="showUserSection = !showUserSection">
          <img class="user-logo" src="../../assets/home/user.png" alt="">
          <transition name="user-section-trans">
            <div v-if="showUserSection" class="user-section-open">
              <div class="narrow-username">{{ username }}</div>
              <div>{{ loggedInTime }}</div>
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
import { useRouter, useRoute } from 'vue-router';
import { dateFormat } from '../../js/helper';
import { useStore } from 'vuex';
import { get } from '../../js/apiCall';

const router = useRouter();
const store = useStore();
const route = useRoute();

//#region Data
const showMenu = ref(false); // To show or hide the menu for narrow screen
const showUserSection = ref(false); // Show the section under the user icon on the top right
const menu = ref([ // The list of menu to be shown
  {
    menu: 'Phase 1',
    opened: true,
    children: [
      { menu: '✓ Space Requirements', icon: 'spacereq.png', path: 'SpaceReq' },
      { menu: 'Office Customization', icon: 'officecustom.png', path: 'OfficeCustom' },
      { menu: 'Retail Customization', icon: 'retailcustom.png' },
      { menu: 'Budget', icon: 'budget.png' },
      { menu: 'Cost Breakdown', icon: 'cost.png' },
      { menu: 'Cash Flow', icon: 'cashFlow.png' },
      { menu: '✓ Project Milestone', icon: 'projectmilestone.png', path: 'ProjectMilestone' },
      { menu: '✓ Building Selection', icon: 'buildingSelection.png', path: 'BuildingSelection' },
      { menu: 'Site TDD Findings', icon: 'siteTDD.png' },
    ]
  }
])
const username = ref(''); // The user that is logged in
const loggedInTime = ref(''); // The user last logged in time
const displayLabel = ref('Current Location'); // Use to show the label on the top left of the top bar
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
  localStorage.removeItem('client');
  localStorage.removeItem('token');
  localStorage.removeItem('userid');

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
onMounted(() => {
  // Getting the user name that is logged in to and the time that the user has logged in
  username.value = localStorage.getItem('user');
  loggedInTime.value = dateFormat(new Date(localStorage.getItem('loginTime')), 'dd/MM/yyyy HH:mm:ss');

  // Check when the screen size changes from narrow to wide, to hide the menu
  window.addEventListener('resize', () => {
    if (window.innerWidth > 1000) {
      showMenu.value = false;
    }
  });

  // When the router changes, then get the display name
  router.afterEach((to) => {
    displayLabel.value = to.meta.displayName || 'Current Location';
  });
  // When first load, it will check from the route to show the correct display name
  displayLabel.value = route.meta.displayName;

  // Getting all the space from DB and set to the store for global usage
  get('Space/AllSpace').then(d => store.state.spaceListing = d);
});
onBeforeMount(() => {
  // Getting the client if there is any before the page is mounted
  if (localStorage.getItem('client')) {
    store.state.currentClient = JSON.parse(localStorage.getItem('client'));
  }

})
//#endregion Lifecycle
</script>

<style scoped>
.home-main {
  display: flex;
  height: 100dvh;
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
.menu-small-logo {
  height: 90%;
  margin-left: 5px;
  display: none;
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
.narrow-username {
  display: none;
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
  .menu-small-logo {
    display: block;
  }
  .wide-username {
    display: none;
  }
  .narrow-username {
    display: block;
  }
}
</style>