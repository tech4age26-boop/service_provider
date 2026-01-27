import AsyncStorage from '@react-native-async-storage/async-storage';

const API_BASE_URL = 'https://filter-server.vercel.app';

export const fetchOrders = async () => {
    try {
        const userDataStr = await AsyncStorage.getItem('user_data');
        if (userDataStr) {
            const userData = JSON.parse(userDataStr);
            const providerId = userData.workshopId || userData.id || userData._id;

            const response = await fetch(`${API_BASE_URL}/api/provider-orders?providerId=${providerId}`);
            const result = await response.json();

            if (result.success) {
                return result.data || [];
            }
        }
        return [];
    } catch (error) {
        console.error('Fetch Orders Error:', error);
        return [];
    }
};
