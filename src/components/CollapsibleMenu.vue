<template>
  <div v-for="(menu, menuInd) in menuItems" :key="menuInd" class="collapse-menu-main">
    <div class="menu-item" @click="showHideChildren(menuInd)">
      <img :style="{ transform: `scale(${showChildren[menuInd] ? '-1' : '1'})` }" src="../assets/collapsible/dropdown.png" alt="">
      <div>{{ menu.menu }}</div>
    </div>
    <div class="menu-children" ref="menuChildren">
      <div v-for="(submenu, submenuInd) in menu.children" :key="submenuInd" class="menu-item menu-child">
        <div>{{ submenu.icon }}</div>
        <div>{{ submenu.menu }}</div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { defineProps, ref, onMounted } from 'vue'

const props = defineProps({
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

//#region Data
const showChildren = ref([]);
const menuChildren = ref(null);
const childrenStartHeight = ref([]);
//#endregion Data

//#region Methods
const showHideChildren = (ind) => {
  showChildren.value[ind] = !showChildren.value[ind];

  if (showChildren.value[ind]) {
    menuChildren.value[ind].style.maxHeight = `${childrenStartHeight.value[ind]}px`;
  } else {
    menuChildren.value[ind].style.maxHeight = 0;
  }
}
//#endregion Methods

//#region Lifecycle
onMounted(() => {
  if (props.menuItems.length > 0) {
    showChildren.value = props.menuItems.map(m => m.opened);
  }

  childrenStartHeight.value = menuChildren.value.map(m => m.getBoundingClientRect().height);
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