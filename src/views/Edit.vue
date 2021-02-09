<template>
  <ion-page>
    <ion-content :fullscreen="true">
      <ion-header>
        <ion-toolbar>
          <ion-buttons slot="secondary">
            <ion-button @click="cancelOperation">Cancel</ion-button>
          </ion-buttons>
          <ion-buttons slot="primary">
            <ion-button :disabled="!isSaveActive" @click="saveContact">Save</ion-button>
          </ion-buttons>
          <ion-title>Edit Contact</ion-title>
        </ion-toolbar>
      </ion-header>

      <div id="container">
        <ion-list>
          <ion-item class="ion-text-center">
            <div class="contact-image">
              <div class="icon-container" @click="changeImage">
                <img v-if="contact.image" class="image" :src="contact.image" alt="icon"/>
                <ion-icon v-else class="icon" :src="addOutline" color="light"/>
              </div>
            </div>
          </ion-item>
          <ion-item>
            <ion-input clear-input placeholder="First Name" v-model="contact.firstName"></ion-input>
          </ion-item>
          <ion-item>
            <ion-input clear-input placeholder="Last Name" v-model="contact.lastName"></ion-input>
          </ion-item>
          <ion-item>
            <ion-input clear-input placeholder="Company" v-model="contact.company"></ion-input>
          </ion-item>
          <ion-item>
            <ion-input clear-input placeholder="Title" v-model="contact.title"></ion-input>
          </ion-item>

          <ion-item-divider/>

          <ion-item v-for="number in contact.numbers" :key="number._id">
            <ContactItemEditButton :icon="removeCircleOutline" color="danger" @click="removeField('number', number.id)" />
            &nbsp;&nbsp;
            <ion-select v-model="number.type" interface="action-sheet">
              <ion-select-option v-for="type in numberTypes" :key="type" :value="type">{{ type }}</ion-select-option>
            </ion-select>
            <ion-input type="text" side="left" placeholder="Number" v-model="number.value"></ion-input>
          </ion-item>
          <ion-item button :detail="false" @click="addField('number')">
            <ion-icon :src="addCircleOutline" color="primary"></ion-icon>&nbsp; Add Number
          </ion-item>

          <ion-item-divider/>

          <ion-item v-for="email in contact.emails" :key="email._id">
            <ContactItemEditButton :icon="removeCircleOutline" color="danger" @click="removeField('email', email.id)" />
            &nbsp;&nbsp;
            <ion-select v-model="email.type" interface="action-sheet">
              <ion-select-option v-for="type in emailTypes" :key="type" :value="type">{{ type }}</ion-select-option>
            </ion-select>
            <ion-input type="text" side="left" placeholder="Email" v-model="email.value"></ion-input>
          </ion-item>
          <ion-item button :detail="false" @click="addField('email')">
            <ion-icon :src="addCircleOutline" color="primary"></ion-icon>&nbsp; Add Email
          </ion-item>

          <ion-item-divider/>

          <ion-item v-for="website in contact.websites" :key="website._id">
            <ContactItemEditButton :icon="removeCircleOutline" color="danger" @click="removeField('website', website.id)" />
            &nbsp;&nbsp;
            <ion-select v-model="website.type" interface="action-sheet">
              <ion-select-option v-for="type in websiteTypes" :key="type" :value="type">{{ type }}</ion-select-option>
            </ion-select>
            <ion-input type="text" side="left" placeholder="Url" v-model="website.value"></ion-input>
          </ion-item>
          <ion-item button :detail="false" @click="addField('website')">
            <ion-icon :src="addCircleOutline" color="primary"></ion-icon>&nbsp; Add Website
          </ion-item>

          <ion-item-divider/>

          <ion-item v-for="address in contact.addresses" :key="address._id">
            <ContactItemEditButton :icon="removeCircleOutline" color="danger" @click="removeField('address', address.id)" />
            &nbsp;&nbsp;
            <ion-select v-model="address.type" interface="action-sheet">
              <ion-select-option v-for="type in addressTypes" :key="type" :value="type">{{ type }}</ion-select-option>
            </ion-select>
            <ion-textarea side="left" placeholder="Address" auto-grow v-model="address.value" rows="1"></ion-textarea>
          </ion-item>
          <ion-item button :detail="false" @click="addField('address')">
            <ion-icon :src="addCircleOutline" color="primary"></ion-icon>&nbsp; Add Address
          </ion-item>

          <ion-item-divider/>

          <ion-item>
            <ion-textarea placeholder="Notes" auto-grow v-model="contact.notes"></ion-textarea>
          </ion-item>

          <ion-item-divider v-if="contactId"/>

          <ion-item button :detail="false" @click="deleteContact" v-if="contactId">
            <span class="delete-contact-button">Delete Contact</span>
          </ion-item>
        </ion-list>
      </div>
    </ion-content>
  </ion-page>
</template>

<script>
import {
  IonContent,
  IonHeader,
  IonPage,
  IonTitle,
  IonToolbar,
  IonList,
  IonItem,
  IonInput,
  IonSelect,
  IonSelectOption,
  IonTextarea,
  IonIcon,
  IonButtons,
  IonItemDivider,
  IonButton
} from '@ionic/vue';
import { alertController, toastController, actionSheetController } from '@ionic/vue';
import { defineComponent, ref, computed } from 'vue';
import {addCircleOutline, removeCircleOutline, addOutline, cameraOutline, imageOutline, close, trashOutline} from 'ionicons/icons';
import ContactItemEditButton from "@/components/ContactItemEditButton";
import ContactService from "@/service/ContactService";
import { useRouter, useRoute } from 'vue-router'
import { cloneDeep } from 'lodash'
import { Crop } from '@ionic-native/crop';
import {Camera} from "@ionic-native/camera";
import { v4 as uuid } from 'uuid';
import {FileChooser} from "@ionic-native/file-chooser";
import store from "@/store";

export default defineComponent({
  name: 'Edit',
  components: {
    ContactItemEditButton,
    IonContent,
    IonHeader,
    IonPage,
    IonTitle,
    IonToolbar, IonList, IonItem, IonInput, IonSelect, IonSelectOption, IonTextarea, IonIcon, IonButton, IonButtons, IonItemDivider
  },

  setup() {

    const getEmptyContact = () => {
      return {
        _id: null,
        image: null,
        firstName: null,
        lastName: null,
        company: null,
        title: null,
        numbers: [],
        emails: [],
        websites: [],
        addresses: [],
        country: null,
        notes: null
      }
    }

    const route = useRoute();
    const router = useRouter();

    const contact = ref(getEmptyContact());
    let contactInDb = getEmptyContact();
    const contactId = ref(null);

    const contactService = new ContactService();

    if (route.params.id === 'add') {
      const cnt = store.get('contact');
      if (!cnt) {
        router.back();
      }

      contact.value = cnt;
    }
    else if (route.params.id !== 'new') {
      contactService.get(route.params.id)
          .then((data) => {
            contact.value = cloneDeep(data);
            contactInDb = data;
            contactId.value = route.params.id;
          });
    }

    const isSaveActive = computed(() =>  JSON.stringify(contact.value) !== JSON.stringify(contactInDb));

    const numberTypes = ['Mobile', 'Work', 'Home', 'Main', 'Work Fax', 'Home Fax', 'Fax', 'Pager', 'Other'];
    const emailTypes = ['Work', 'Home', 'Other'];
    const addressTypes = emailTypes;
    const websiteTypes = ['Website', 'Facebook', 'Twitter', 'LinkedIn', 'Other'];

    const fieldMapping = {
      number: { key: 'numbers', types: numberTypes },
      email: { key: 'emails', types: emailTypes },
      website: { key: 'websites', types: websiteTypes },
      address: { key: 'addresses', types: addressTypes },
    }

    const getFieldType = (array, types, def) => {
      return array.reduce((acc, cv) => acc.filter(v => cv.type !== v), types)[0] ?? def
    }

    const addField = (field) => {
      if (!fieldMapping[field]) {
        return;
      }

      const {key, types} = fieldMapping[field];

      contact.value[key].push({
        _id: uuid(),
        type: getFieldType(contact.value[key], types, 'Other'),
        value: null
      })
    }

    const removeField = (field, _id) => {
      if (!fieldMapping[field]) {
        return;
      }
      const {key} = fieldMapping[field];
      contact.value[key] = contact.value[key].filter(v => v._id !== _id)
    }

    const processSelectError = async (error) => {
      const ignore = ["User canceled.", "No Image Selected"];
      if (ignore.includes(error)) {
        return;
      }

      const toast = await toastController
          .create({ message: error, duration: 3000, color: "dark" })
      return toast.present();
    }

    const toDataUrl = async (src) => {
      return new Promise((resolve) => {
        const img = new Image();
        img.crossOrigin = 'Anonymous';
        img.onload = function() {
          const canvas = document.createElement('CANVAS');
          const ctx = canvas.getContext('2d');
          canvas.height = this.height;
          canvas.width = this.width;
          ctx.drawImage(this, 0, 0);
          const dataURL = canvas.toDataURL('image/jpeg');
          resolve(dataURL);
        };
        img.src = window.Ionic.WebView.convertFileSrc(src);
      })
    }

    const cropImage = (uri) => {
      Crop.crop(uri, { quality: 75 })
          .then((uri) => {
            toDataUrl(uri).then((data) => {
              contact.value.image = data;
            });
          })
          .catch(e => processSelectError(e));
    }

    const selectFromCamera = () => {
      const options = {
        quality: 100,
        destinationType: Camera.DestinationType.FILE_URI,
        encodingType: Camera.EncodingType.JPEG,
        mediaType: Camera.MediaType.PICTURE
      }

      Camera.getPicture(options)
          .then((fileUri) => cropImage(fileUri))
          .catch((e) => processSelectError(e));
    }

    const selectFromGallery = () => {
      FileChooser.open({ mime: "image/jpeg" })
          .then((uri) => cropImage(uri))
          .catch((e) => processSelectError(e));
    }

    const changeImage = async () => {
      const buttons = [
        {
          text: 'From Camera',
          icon: cameraOutline,
          handler: () => selectFromCamera(),
        },
        {
          text: 'From Gallery',
          icon: imageOutline,
          handler: () => selectFromGallery(),
        },
      ];

      if (contact.value.image) {
        buttons.push({
          text: 'Delete Photo',
          role: 'destructive',
          icon: trashOutline,
          handler: () => {
            contact.value.image = null;
          }
        })
      }

      buttons.push({
        text: 'Cancel',
        icon: close,
        role: 'cancel',
      })

      const actionSheet = await actionSheetController
          .create({
            header: 'Select Business Card',
            buttons: buttons
          });
      return actionSheet.present();
    }

    const deleteContact = async () => {
      const alert = await alertController
          .create({
            header: 'Delete Contact?',
            message: 'Do you want to delete the contact?',
            buttons: [
              {
                text: 'No'
              },
              {
                text: 'Yes',
                handler: async () => {
                  try {
                    await contactService.delete(contactId.value);

                    const toast = await toastController.create({ message: "Contact Deleted", duration: 3000, color: "dark" })
                    toast.present();

                    router.back();
                    return router.back();
                  } catch (e) {
                    const toast = await toastController
                        .create({ message: e, duration: 4000, color: "dark" })
                    return toast.present();
                  }
                },
              },
            ],
          });
      return alert.present();
    }

    const saveContact = async () => {
      try {
        if (contactId.value) {
          await contactService.update(contactId.value, contact.value);
        } else {
          await contactService.insert(contact.value);
        }

        const toast = await toastController.create({ message: "Contact Saved", duration: 3000, color: "dark" })
        toast.present();

        return router.back();
      } catch (e) {
        const toast = await toastController
            .create({ message: e, duration: 4000, color: "dark" })
        return toast.present();
      }
    }

    return {
      addCircleOutline,
      removeCircleOutline,
      addOutline,

      addField,
      removeField,

      saveContact,
      deleteContact,

      changeImage,

      contact,
      isSaveActive,
      contactId,

      numberTypes,
      emailTypes,
      addressTypes,
      websiteTypes
    }
  },

  methods: {
    async cancelOperation() {
      if (this.isSaveActive) {
        const alert = await alertController
            .create({
              header: 'Save Contact?',
              message: 'Do you want to save the contact?',
              buttons: [
                {
                  text: 'No',
                  handler: () => this.$router.back(),
                },
                {
                  text: 'Yes',
                  handler: () => {
                    this.saveContact();
                    this.$router.back();
                  },
                },
              ],
            });
        return alert.present();
      }
      else {
        this.$router.back();
      }
    },

    onBackPressed(e) {
      e.detail.register(10, (next) => {
        if (this.isSaveActive) {
          this.cancelOperation();
        }
        else {
          next();
        }
      });
    }
  },

  mounted() {
    document.addEventListener('ionBackButton', this.onBackPressed);
  },

  unmounted() {
    document.removeEventListener('ionBackButton', this.onBackPressed);
  }
});
</script>

<style lang="scss" scoped>
.delete-contact-button {
  text-align: center; color: var(--ion-color-danger); width: 100%
}

.contact-image {
  text-align: center;
  width: 100%;
  height: 120px;
  display: flex;
  justify-content: center;

  .icon-container {
    width: 80px;
    height: 80px;
    background-color: var(--ion-color-primary);
    border-radius: 50%;
    //opacity: 0.9;
    margin: 20px;
    display: flex;
    justify-content: center;
    align-items: center;
    cursor: pointer;

    &:hover, &:active {
      opacity: 0.8;
    }

    &:active {
      opacity: 0.7;
    }

    .icon {
      font-size: 35px;
    }

    .image {
      border-radius: 50%;
    }
  }
}

.btn-val {
  --padding-end: 0;
  --padding-start: 0;
}
</style>
