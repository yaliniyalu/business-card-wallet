# Business Card Wallet

This app scans the business cards and add it to the app wallet, or you can export it to your phones contact.

This is the Ionic Vue - Capacitor app

### Internal Working:
1. Capture or select the business card
2. Imge is converted to text using ml-kit
3. The text is send to server. Server code is in [this repo](https://github.com/yaliniyalu/business-card-wallet-api)
	1. The text is proceesed from expert.ai api.
	2. The json from expert.ai is analysed to select or predict name, company, title/job, address, email, phone number and web address.
	3. Response is sent to the app.
4. App displays the output from the server.
5. When user clicks Save it is saved in sqlite database.
6. When user click add to contacts (View Page) the entry is added to phone contacts.


### To run:

Change the server url in `src/config.ts`

```shell
ionic cap add android
```

```shell
cordova-res android --skip-config --copy
```

```shell
ionic cap sync
```

Move `android/capacitor-cordova-android-plugins/src/main/by` to `android/capacitor-cordova-android-plugins/src/main/java`

Build the android app using android studio
