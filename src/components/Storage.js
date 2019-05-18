import { AsyncStorage } from "react-native"

export default class Storage {
    async saveItem(item, selectedValue) {
        try {
            await AsyncStorage.setItem(item, selectedValue);
            return true;
        } catch (error) {
            console.error('AsyncStorage error: ' + error.message);
        }
        return false;
    }

    async getItem(item) {
        try {
            const value = await AsyncStorage.getItem(item);
            if (value !== null) {
                return value;
            }
        } catch (error) {
            console.error('AsyncStorage error: ' + error.message);
        }
        return null;
    }

    async deleteItem(item) {
        try {
            await AsyncStorage.removeItem(item);
            return true;
        } catch (error) {
            console.log('AsyncStorage error: ' + error.message);
        }
        return false;
    }
}