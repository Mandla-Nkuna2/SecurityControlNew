Android Signing:

jarsigner -verbose -sigalg SHA1withRSA -digestalg SHA1 -keystore certificates/sec_control.keystore "PATH_TO\app-release-unsigned.apk" ALIAS_NAME
zipalign -v 4  "PATH_TO\app-release-unsigned.apk" "myAppName.apk"
alias = alias_name
password = S29217352

// For Mac: source ~/.bash_profile

jarsigner -verbose -sigalg SHA1withRSA -digestalg SHA1 -keystore certificates/sec_control.keystore "/Users/kathryn/desktop/sec-control-latest/platforms/android/app/build/outputs/apk/release/app-release-unsigned.apk" ALIAS_NAME
zipalign -v 4  "/Users/kathryn/desktop/sec-control-latest/platforms/android/app/build/outputs/apk/release/app-release-unsigned.apk" "sec_control_signed.apk"
