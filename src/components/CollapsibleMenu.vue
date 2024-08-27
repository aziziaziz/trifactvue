<template>
  <div v-for="(menu, menuInd) in menuItems" :key="menuInd" class="collapse-menu-main">
    <div class="menu-item" @click="showHideChildren(menuInd)">
      <img :style="{ transform: `scale(${showChildren[menuInd] ? '-1' : '1'})` }" src="../assets/collapsible/dropdown.png" alt="">
      <div>{{ menu.menu }}</div>
    </div>
    <div class="menu-children" ref="menuChildren">
      <div v-for="(submenu, submenuInd) in menu.children" :key="submenuInd" class="menu-item menu-child" @click="menuClicked(submenu)">
        <img :src="require(`../assets/menu/${submenu.icon}`)" alt="">
        <div>{{ submenu.menu }}</div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { defineProps, ref, onMounted, defineEmits } from 'vue';
import { useRouter } from 'vue-router';
import { popup, wait } from '../js/helper';

const router = useRouter();

const props = defineProps({
  // Used to show the list of the menu, you can add additional info if needed, this is minimum.
  menuItems: { type: Array, default: () => [
    {
      menu: 'Menu 1',
      opened: false,
      children: [
        {
          icon: 'logo',
          menu: 'SubMenu 1'
        },
        {
          icon: 'logo',
          menu: 'SubMenu 2 long text for testing'
        },
        {
          icon: 'logo',
          menu: 'SubMenu 3'
        },
        {
          icon: 'logo',
          menu: 'SubMenu 4'
        }
      ]
    },
    {
      menu: 'Menu 2',
      opened: true,
      children: [
        {
          icon: 'logo',
          menu: 'SubMenu 1'
        },
        {
          icon: 'logo',
          menu: 'SubMenu 2'
        }
      ]
    },
    {
      menu: 'Menu 1',
      opened: false,
      children: [
        {
          icon: 'logo',
          menu: 'SubMenu 1'
        },
        {
          icon: 'logo',
          menu: 'SubMenu 2 long text for testing'
        },
        {
          icon: 'logo',
          menu: 'SubMenu 3'
        },
        {
          icon: 'logo',
          menu: 'SubMenu 4'
        },
        {
          icon: 'logo',
          menu: 'SubMenu 5'
        },
        {
          icon: 'logo',
          menu: 'SubMenu 5'
        },
        {
          icon: 'logo',
          menu: 'SubMenu 7'
        }
      ]
    }
  ] }
});
const emit = defineEmits([
  'menuClicked' // This event is fired when the menu is clicked
])

//#region Data
const showChildren = ref([]); // The array of true and false of the menu that will be show or hide (expand or collapse)
const menuChildren = ref(null); // The element of the children of each of the menu, this is an array and used to calculate the height of the children section in order to get a nicer transition
const childrenStartHeight = ref([]); // Used to set the initial height of each of the menu children
//#endregion Data

//#region Methods
const showHideChildren = (ind) => {
  // Switch between expand or collapse
  showChildren.value[ind] = !showChildren.value[ind];

  // Set the max-height to the child initial height or 0 when collapse
  if (showChildren.value[ind]) {
    menuChildren.value[ind].style.maxHeight = `${childrenStartHeight.value[ind]}px`;
  } else {
    menuChildren.value[ind].style.maxHeight = 0;
  }
}
const menuClicked = (menu) => {
  // Fire menuClicked event
  emit('menuClicked');

  // Push to the path declared in the menu item (the children that is clicked) or alert when the path is not set
  if (menu.path) {
    router.push(`/Home/${menu.path}`);
  } else {
    // Use the global popup instead of the normal alert
    popup('Page Unavailable', `Sorry, but ${menu.menu} is not available yet.`);
  }
}
//#endregion Methods

//#region Lifecycle
onMounted(async () => {
  // Only set the the showChildren if the menuItems has item
  if (props.menuItems.length > 0) {
    showChildren.value = props.menuItems.map(m => m.opened);
  }

  // Get the exact height of each of the children element
  childrenStartHeight.value = menuChildren.value.map(m => m.getBoundingClientRect().height);
  // Small waiting to make sure that the height is correct
  await wait(100);
  // Set the max-height first, then set the transition to 0.3s so that the first time when loading the page, it will not have transition
  menuChildren.value.forEach((m, mInd) => {
    m.style.maxHeight = showChildren.value[mInd] ? `${childrenStartHeight.value[mInd]}px` : 0;
    m.style.transition = '0.3s';
  });

});
//#endregion Lifecycle
</script>

<style scoped>
.collapse-menu-main {
  display: flex;
  flex-direction: column;
  width: 100%;
}
.menu-item {
  display: flex;
  align-items: center;
  padding: 5px;
  column-gap: 5px;
  cursor: pointer;
  user-select: none;
}
.menu-child {
  margin-left: 20px;
}
.menu-item:hover {
  background-color: gray;
}
.menu-item > img {
  height: 20px;
  transition: 0.3s;
}
.menu-children {
  overflow: hidden;
  height: fit-content;
}
</style>