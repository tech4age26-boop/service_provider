import { createContext, useContext } from 'react';

export const lightTheme = {
    mode: 'light',
    background: '#F8F9FA',
    cardBackground: '#FFFFFF',
    text: '#1C1C1E',
    subText: '#8E8E93',
    border: '#F0F0F0',
    iconColor: '#1C1C1E',
    tabBarBackground: '#FFFFFF',
    inputBackground: '#FFFFFF',
    tint: '#F4C430',
    success: '#2ECC71',
    tagBg: '#E8F1FF',
    tagText: '#007AFF',
};

export const darkTheme = {
    mode: 'dark',
    background: '#121212',
    cardBackground: '#1E1E1E',
    text: '#FFFFFF',
    subText: '#A1A1AA',
    border: '#333333',
    iconColor: '#FFFFFF',
    tabBarBackground: '#1E1E1E',
    inputBackground: '#2C2C2E',
    tint: '#F4C430',
    success: '#2ECC71',
    tagBg: '#1A2A40',
    tagText: '#4DA3FF',
};

export const ThemeContext = createContext({
    theme: lightTheme,
    toggleTheme: () => { },
    isDarkMode: false,
});

export function useTheme() {
    return useContext(ThemeContext);
}
