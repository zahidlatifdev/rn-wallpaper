import { PermissionsAndroid, Alert, Linking, Platform } from 'react-native';

export const requestStoragePermission = async () => {
    try {
        let permissionGranted = false;
        const androidVersion = parseInt(Platform.Version as string, 10); // Get the Android version as an integer

        if (androidVersion >= 33) {
            // Request permissions for Android 13 and above (API level 33+)
            const requestedPermissions = [
                PermissionsAndroid.PERMISSIONS.READ_MEDIA_IMAGES,
                PermissionsAndroid.PERMISSIONS.READ_MEDIA_VIDEO,
                PermissionsAndroid.PERMISSIONS.READ_MEDIA_AUDIO,
            ];

            const results = await PermissionsAndroid.requestMultiple(requestedPermissions);
            permissionGranted = Object.values(results).some(result => result === PermissionsAndroid.RESULTS.GRANTED);
        } else if (androidVersion <= 32) {
            // Request permissions for Android 11 to 13 (API level 30-32)
            const requestedPermissions = [
                PermissionsAndroid.PERMISSIONS.READ_EXTERNAL_STORAGE,
                PermissionsAndroid.PERMISSIONS.MANAGE_EXTERNAL_STORAGE,
            ];

            const results = await PermissionsAndroid.request(
                PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE,
            );
            console.log(results);

            permissionGranted = results === PermissionsAndroid.RESULTS.GRANTED;
        } else {
            openSettingsAlert(); // Open settings alert if the Android version is unsupported
        }

        if (permissionGranted) {
            return true; // Return true if permissions are granted
        } else {
            openSettingsAlert(); // Open settings alert if permissions are denied
            return false; // Return false if permissions are denied
        }
    } catch (err) {
        console.warn(err); // Log any errors
        return false; // Return false in case of error
    }
};

export const openSettingsAlert = () => {
    Alert.alert('Required permission.', 'Storage permission required to download the data', [
        {
            text: 'Cancel',
            onPress: () => console.log('Cancel Pressed'), // Log when Cancel is pressed
            style: 'cancel',
        },
        {
            text: 'Go To Settings',
            onPress: () => openAppSettings() // Open app settings when "Go To Settings" is pressed
        },
    ]);
};

const openAppSettings = () => {
    if (Platform.OS === 'ios') {
        Linking.openURL('app-settings:'); // Open iOS app settings
    } else {
        Linking.openSettings(); // Open Android app settings
    }
};