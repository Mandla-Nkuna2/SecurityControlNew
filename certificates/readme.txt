Android Signing:

jarsigner -verbose -sigalg SHA1withRSA -digestalg SHA1 -keystore certificates/sec_control.keystore "PATH_TO\app-release-unsigned.apk" ALIAS_NAME
zipalign -v 4  "PATH_TO\app-release-unsigned.apk" "myAppName.apk"
alias = alias_name
password = S29217352

// For Mac: source ~/.bash_profile
