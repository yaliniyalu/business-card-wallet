#Business Card Wallet

This app scans the business cards and add it to the app wallet, or you can export it to your phones contact.

This is the Ionic Vue - Capacitor app

To run:

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
