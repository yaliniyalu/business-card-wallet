<template>
  <ion-page>
    <ion-content :fullscreen="true">
      <ion-header>
        <ion-toolbar>
          <ion-buttons slot="secondary">
            <ion-button @click="goBack">Back</ion-button>
          </ion-buttons>
          <ion-buttons slot="primary">
            <ion-button :router-link="'/edit/' + contactId">Edit</ion-button>
          </ion-buttons>
          <ion-title>Contact</ion-title>
        </ion-toolbar>
      </ion-header>

      <div id="container" v-if="contact">
        <ion-list>
          <ion-item class="ion-text-center">
            <ion-label>
              <div class="contact-image">
                <div class="icon-container">
                  <img class="image" :src="contact.image || getInitials(contact.firstName)" alt="icon"/>
                </div>
              </div>
              <div class="contact-info">
                <h2 class="text-bold">{{ contact.firstName }} {{ contact.lastName }}</h2>
                <p v-if="contact.title">{{ contact.title }}</p>
              </div>
            </ion-label>
          </ion-item>

          <ion-item v-if="contact.company">
            <ion-avatar slot="start">
              <ion-icon :src="businessOutline" color="primary" size="large"></ion-icon>
            </ion-avatar>
            <ion-label><h2><ion-text color="primary" class="text-bold">{{ contact.company }}</ion-text></h2></ion-label>
          </ion-item>

          <ion-item-group v-if="contact.numbers.length">
            <ion-item-divider>
              <ion-label>Numbers</ion-label>
            </ion-item-divider>

            <ion-item v-for="number in contact.numbers" :key="number._id" :href="'tel:' + number.value">
              <ion-avatar slot="start">
                <ion-icon :src="callOutline" color="primary" size="large"></ion-icon>
              </ion-avatar>
              <ion-label>
                <h2><ion-text color="primary" class="text-bold">{{ number.value }}</ion-text></h2>
                <p>{{ number.type }}</p>
              </ion-label>
            </ion-item>
          </ion-item-group>

          <ion-item-group v-if="contact.emails.length">
            <ion-item-divider>
              <ion-label>Email</ion-label>
            </ion-item-divider>

            <ion-item v-for="email in contact.emails" :key="email._id" :href="'mailto:' + email.value">
              <ion-avatar slot="start">
                <ion-icon :src="mailOutline" color="primary" size="large"></ion-icon>
              </ion-avatar>
              <ion-label>
                <h2><ion-text color="primary" class="text-bold">{{ email.value }}</ion-text></h2>
                <p>{{ email.type }}</p>
              </ion-label>
            </ion-item>
          </ion-item-group>

          <ion-item-group v-if="contact.websites.length">
            <ion-item-divider>
              <ion-label>Website</ion-label>
            </ion-item-divider>

            <ion-item v-for="website in contact.websites" :key="website._id" href="#" @click.prevent="openExternalLink(website.value, $event)">
              <ion-avatar slot="start">
                <ion-icon :src="linkOutline" color="primary" size="large"></ion-icon>
              </ion-avatar>
              <ion-label>
                <h2><ion-text color="primary" class="text-bold">{{ website.value }}</ion-text></h2>
                <p>{{ website.type }}</p>
              </ion-label>
            </ion-item>
          </ion-item-group>

          <ion-item-group v-if="contact.addresses.length">
            <ion-item-divider>
              <ion-label>Address</ion-label>
            </ion-item-divider>

            <ion-item v-for="address in contact.addresses" :key="address._id">
              <ion-avatar slot="start">
                <ion-icon :src="locationOutline" color="primary" size="large"></ion-icon>
              </ion-avatar>
              <ion-label>
                <h2><ion-text color="primary" class="text-bold" v-html="nl2br(address.value)"></ion-text></h2>

                <p>{{ address.type }}</p>
              </ion-label>
            </ion-item>
          </ion-item-group>


          <ion-item-group v-if="contact.notes">
            <ion-item-divider>
              <ion-label>Notes</ion-label>
            </ion-item-divider>

            <ion-item>
              <ion-label>
                <h4 v-html="nl2br(contact.notes)"></h4>
              </ion-label>
            </ion-item>
          </ion-item-group>

          <ion-item-divider/>

          <ion-item button :detail="false" @click="addToContacts">
            <span>Add to phone contacts</span>
          </ion-item>

          <ion-item-divider/>

          <ion-item button :detail="false" @click="deleteContact">
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
  IonLabel,
  IonItemGroup,
  IonIcon,
  IonButtons,
  IonItemDivider,
  IonButton,
  IonText,
  IonAvatar
} from '@ionic/vue';
import { alertController, toastController } from '@ionic/vue';
import { defineComponent, ref } from 'vue';
import {callOutline, mailOutline, linkOutline, locationOutline, businessOutline, call, mail, link, location} from 'ionicons/icons';
import ContactService from "@/service/ContactService";
import { useRouter, useRoute } from 'vue-router'
import {Contact, ContactName, ContactOrganization, ContactField, ContactAddress, Contacts, ContactFindOptions} from "@ionic-native/contacts";
import { InAppBrowser } from '@ionic-native/in-app-browser'

export default defineComponent({
  name: 'View',
  components: {
    IonContent,
    IonHeader,
    IonPage,
    IonTitle,
    IonToolbar, IonList, IonItem, IonIcon, IonButton, IonButtons, IonItemDivider, IonLabel, IonItemGroup, IonText, IonAvatar
  },

  setup() {
    const route = useRoute();
    const router = useRouter();

    const contact = ref(null);
    const contactId = ref(null);

    const contactService = new ContactService();

    contactService.get(route.params.id)
        .then((data) => {
          contact.value = data;
          contactId.value = route.params.id;
        })
        .catch(_ => router.back());

    const getInitials = (name) => {
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

    const loadContact = async () => {
      contactService.get(route.params.id)
          .then((data) => {
            contact.value = data;
            contactId.value = route.params.id;
          })
          .catch(_ => router.back());
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

                    return router.go(-1);
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

    const goBack = () => {
      router.back();
    }

    const openExternalLink = (url, e) => {
      e.preventDefault();
      if (!(url.startsWith('http://') || url.startsWith('https://'))) {
        url = 'http://' + url;
      }

      InAppBrowser.create(url, '_system', 'location=yes')

      return false;
    }

    const nl2br = (str) => {
      if (typeof str === 'undefined' || str === null) {
        return '';
      }
      return (str + '').replace(/([^>\r\n]?)(\r\n|\n\r|\r|\n)/g, '$1' + '<br>' + '$2');
    }

    const findContactWithName = async (firstName, lastName) => {
      const options = new ContactFindOptions(firstName, true, ["id", "name"]);

      const contacts = new Contacts();
      const res = await contacts.find(['name.givenName', 'name.formatted'], options);

      const found = res.find(v =>  v.name.formatted.trim() === (firstName + ' ' + lastName).trim())

      if (!found) {
        throw new Error();
      }

      return found;
    }

    const addToContacts = async () => {
      const ctx = contact.value;

      try {
        await findContactWithName(ctx.firstName, ctx.lastName);
        const alert = await alertController
            .create({
              header: 'Contact Already Exists',
              message: 'Another contact exists with same name.',
              buttons: [{ text: "OK" }]
            });
        return alert.present();
      } catch (e) {
        //
      }

      const cnt = new Contact();
      cnt.name = new ContactName(null, ctx.lastName, ctx.firstName);

      if (ctx.company || ctx.title) {
        cnt.organizations = [new ContactOrganization( null, ctx.company, null, ctx.title)];
      }

      cnt.phoneNumbers = [];
      ctx.numbers.forEach(v => {
        cnt.phoneNumbers.push(new ContactField(v.type, v.value));
      });

      cnt.emails = [];
      ctx.emails.forEach(v => {
        cnt.emails.push(new ContactField(v.type, v.value))
      });

      cnt.urls = [];
      ctx.websites.forEach(v => {
        cnt.urls.push(new ContactField(v.type, v.value))
      })

      cnt.addresses = [];
      ctx.addresses.forEach(v => {
        cnt.addresses.push(new ContactAddress(true, v.type, v.value))
      })

      if (ctx.notes) {
        cnt.note = ctx.notes;
      }

      if (ctx.image) {
        cnt.photos = [new ContactField('base64', ctx.image, true)]
      }

      let toast = null;
      try {
        await cnt.save();

        toast = await toastController.create({ message: "Business card added to contacts", duration: 3000, color: "dark" })
      } catch (e) {
        toast = await toastController.create({ message: "Business card added to contacts", duration: 4000, color: "dark" })
      }

      return toast.present();
    }

    return {
      deleteContact,
      addToContacts,
      loadContact,

      contact,
      contactId,

      goBack,
      openExternalLink,
      nl2br,
      getInitials,

      callOutline,
      mailOutline,
      linkOutline,
      locationOutline,
      businessOutline,
      call,
      mail,
      link,
      location
    }
  },

  watch: {
    $route(to, from) {
      if (to.name === 'View') {
        this.loadContact();
      }
    },
  },

  methods: {
  },
});
</script>

<style lang="scss" scoped>
.text-bold {
  font-weight: bold;
}

.delete-contact-button {
  text-align: center; color: var(--ion-color-danger); width: 100%
}

.contact-info {
  display: block;
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
