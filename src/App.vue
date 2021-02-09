<template>
  <ion-app>
    <ion-router-outlet />
  </ion-app>
</template>

<script lang="ts">
import { IonApp, IonRouterOutlet } from '@ionic/vue';
import { defineComponent } from 'vue';
import { useRouter, useRoute } from 'vue-router'

import { useBackButton } from '@ionic/vue';
import { Plugins } from '@capacitor/core';
const { App } = Plugins;

import {
  toastController
} from '@ionic/vue';

export default defineComponent({
  name: 'App',
  components: {
    IonApp,
    IonRouterOutlet
  },

  setup() {
    const router = useRouter();
    const route = useRoute();

    let timer: number | undefined = undefined;

    useBackButton(-1, async () => {
      if (route.name === 'Home') {
        if (!timer) {
          timer = setTimeout(() => {
            timer = undefined;
          }, 3000);

          const toast = await toastController
              .create({ message: "Press back again to exit", duration: 3000, color: "dark" })
          return toast.present();
        } else {
          App.exitApp();
        }
        return;
      }
      router.back();
    });
  }
});
</script>
