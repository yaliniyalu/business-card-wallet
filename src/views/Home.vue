<template>
  <ion-page>
    <ion-header :translucent="true">
      <ion-toolbar>
        <ion-buttons slot="primary">
          <ion-button color="primary" @click="openScanBusinessCard">
            <ion-icon slot="icon-only" :md="add"></ion-icon>
          </ion-button>
        </ion-buttons>
        <ion-title>Business Card Wallet</ion-title>
      </ion-toolbar>
    </ion-header>

    <ion-content :fullscreen="true">
      <ion-list v-if="isLoading">
        <ion-item>
          <ion-avatar slot="start">
            <ion-skeleton-text animated></ion-skeleton-text>
          </ion-avatar>
          <ion-label>
            <h2><ion-skeleton-text animated style="width: 50%"></ion-skeleton-text></h2>
            <h3><ion-skeleton-text animated style="width: 80%"></ion-skeleton-text></h3>
            <p><ion-skeleton-text animated style="width: 60%"></ion-skeleton-text></p>
          </ion-label>
        </ion-item>
      </ion-list>

      <ion-list v-else>
        <ion-item class="contact" v-for="contact in contacts" :key="contact._id" :router-link="'/view/' + contact._id" :detail="false" router-direction="forward">
          <ion-avatar slot="start">
            <img :src="contact.image || getInitials(contact.firstName)" alt="avatar">
          </ion-avatar>
          <ion-label>
            <h2>{{ contact.firstName }} {{ contact.lastName }}</h2>
            <h3 v-if="contact.company">{{ contact.company }}</h3>
            <p v-if="contact.title">{{ contact.title }}</p>
          </ion-label>
        </ion-item>
      </ion-list>

      <div id="container" v-if="!isLoading && !contacts.length">
        <strong>No business card in your wallet</strong>
        <p><a href="#" @click.prevent="openScanBusinessCard">Scan here</a> or <router-link to="/edit/new">Add here</router-link></p>
      </div>
    </ion-content>
  </ion-page>
</template>

<script lang="ts">
import {
  actionSheetController,
  alertController,
  IonButton,
  IonButtons,
  IonContent,
  IonHeader,
  IonIcon,
  IonPage,
  IonTitle,
  IonToolbar,
    IonList,
    IonLabel,
    IonAvatar,
    IonItem,
    IonSkeletonText,
  loadingController,
  toastController
} from '@ionic/vue';
import {defineComponent, ref} from 'vue';

import {add, cameraOutline, close, imageOutline} from 'ionicons/icons';
import {Camera, CameraOptions} from "@ionic-native/camera";
import {FileChooser} from "@ionic-native/file-chooser";
import {FirebaseVision} from "@ionic-native/firebase-vision";
import axios from "axios";
import config from "@/config";
import store from "@/store";
import ContactService from "@/service/ContactService";
import { Plugins } from '@capacitor/core';
const { SplashScreen } = Plugins;

export default defineComponent({
  name: 'Home',
  components: {
    IonContent,
    IonHeader,
    IonPage,
    IonTitle,
    IonToolbar,
    IonIcon,
    IonButtons,
    IonButton,
    IonList,
    IonLabel,
    IonAvatar,
    IonItem,
    IonSkeletonText
  },

  setup() {
    const contacts = ref<Array<Record<string, any>>>([]);
    const isLoading = ref(true);
    const deviceReady = ref(false);

    const initialize = async () => {
      const service = new ContactService();
      try {
        contacts.value = await service.list();
      } catch (e) {
        // console.log(e)
      }

      isLoading.value = false;
    }

    const getInitials = (name: string) => {
      const canvas = document.createElement('canvas');
      canvas.style.display = 'none';
      canvas.width = 64;
      canvas.height = 64;

      const context = canvas.getContext('2d');
      if (!context) {
        return false;
      }

      context.fillStyle = "#26a69a";
      context.fillRect(0, 0, canvas.width, canvas.height);
      context.font = "32px Arial";
      context.fillStyle = "#ffffff";

      if (name && name.charAt(0) && name.charAt(0) !== '') {
        const initials = name.charAt(0);
        context.fillText(initials.toUpperCase(), 21, 43);
        return  canvas.toDataURL();
      } else {
        return false;
      }
    }

    return {
      add,
      cameraOutline,
      imageOutline,
      close,

      contacts,
      isLoading,
      deviceReady,

      initialize,
      getInitials
    }
  },

  methods: {
    async openScanBusinessCard() {
      const actionSheet = await actionSheetController
          .create({
            header: 'Select Business Card',
            buttons: [
              {
                text: 'From Camera',
                icon: cameraOutline,
                handler: () => this.selectFromCamera(),
              },
              {
                text: 'From Gallery',
                icon: imageOutline,
                handler: () => this.selectFromGallery(),
              },
              {
                text: 'Cancel',
                icon: close,
                role: 'cancel',
              },
            ],
          });
      return actionSheet.present();
    },

    selectFromCamera() {
      const options: CameraOptions = {
        quality: 100,
        destinationType: Camera.DestinationType.FILE_URI,
        encodingType: Camera.EncodingType.JPEG,
        mediaType: Camera.MediaType.PICTURE
      }

      Camera.getPicture(options)
          .then((fileUri) => this.processImage(fileUri))
          .catch((e) => this.processSelectError(e));
    },

    selectFromGallery() {
      FileChooser.open({ mime: "image/jpeg" })
          .then((uri) => this.processImage(uri))
          .catch((e) => this.processSelectError(e));
    },

    async processImage(uri: string) {
      const loading = await loadingController.create({ message: 'Processing. Please wait...' });
      loading.present();

      try {
        const ocr = await this.performOCR(uri);
        const nlp = await this.performNLP(ocr);

        store.set('contact', nlp);
      }
      catch (e) {
        await loading.dismiss();
        return this.processSelectError(e);
      }

      await loading.dismiss();
      await this.$router.push({ path: '/edit/add' })
    },

    async performOCR(uri: string) {
      return await FirebaseVision.onDeviceTextRecognizer(uri)
          .then((res) => {
            return res.text;
          });
    },

    async performNLP(text: string) {
      const res = await axios.post(config.apiUrl + "/index.php", {
        text: text
      });

      if (res.status !== 200 || !res.data || typeof res.data !== "object") {
        throw new Error("Server Error");
      }

      return res.data;
    },

    async processSelectError(error: string) {
      const ignore: Array<string> = ["User canceled.", "No Image Selected"];
      if (ignore.includes(error)) {
        return;
      }

      const toast = await toastController
          .create({ message: error, duration: 3000 })
      return toast.present();
    },
  },

  watch:{
    $route (to, from){
      if (to.name === 'Home' && this.deviceReady) {
        this.initialize();
      }
    }
  },

  mounted() {
    document.addEventListener("deviceready", () => {
      this.deviceReady = true;
      this.initialize();
    }, false);

    SplashScreen.hide();
  }
});
</script>

<style lang="scss" scoped>



#container {
  text-align: center;

  position: absolute;
  left: 0;
  right: 0;
  top: 50%;
  transform: translateY(-50%);
}

#container strong {
  font-size: 20px;
  line-height: 26px;
}

#container p {
  font-size: 16px;
  line-height: 22px;

  color: #8c8c8c;

  margin: 0;
}

#container a {
  text-decoration: none;
}
</style>
