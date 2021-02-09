<template>
<!--/*  <ion-button fill="clear" expand="block" style="&#45;&#45;padding-end: 0; &#45;&#45;padding-start: 0;" class="btn-val">*/-->
    <ion-icon class="icon" :src="icon" :color="color"></ion-icon>
<!--  </ion-button>-->
</template>

<script>
import { /*IonButton,*/ IonIcon } from '@ionic/vue';
export default {
  name: "ContactItemEditButton",
  components: {
    IonIcon,
    // IonButton
  },
  props: {
    icon: String,
    color: String
  }
}
</script>

<style lang="scss" scoped>
.icon {
  margin: auto 0;
  cursor: pointer;

  &:hover {
    opacity: 0.8;
  }
}
</style>
