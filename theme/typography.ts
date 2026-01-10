import { Platform, TextStyle } from 'react-native';

const fontConfig = {
    web: {
        regular: {
            fontFamily: 'Poppins-Regular',
            fontWeight: '400' as TextStyle['fontWeight'],
        },
        medium: {
            fontFamily: 'Poppins-Medium',
            fontWeight: '500' as TextStyle['fontWeight'],
        },
        bold: {
            fontFamily: 'Poppins-Bold',
            fontWeight: '700' as TextStyle['fontWeight'],
        },
    },
    ios: {
        regular: {
            fontFamily: 'Poppins-Regular',
            fontWeight: '400' as TextStyle['fontWeight'],
        },
        medium: {
            fontFamily: 'Poppins-SemiBold',
            fontWeight: '600' as TextStyle['fontWeight'],
        },
        bold: {
            fontFamily: 'Poppins-Bold',
            fontWeight: '700' as TextStyle['fontWeight'],
        },
    },
    android: {
        regular: {
            fontFamily: 'Poppins-Regular',
            fontWeight: '400' as TextStyle['fontWeight'],
        },
        medium: {
            fontFamily: 'Poppins-SemiBold',
            fontWeight: '600' as TextStyle['fontWeight'],
        },
        bold: {
            fontFamily: 'Poppins-Bold',
            fontWeight: '700' as TextStyle['fontWeight'],
        },
    },
};

export const typography = {
    fontFamily: 'Poppins-Regular',
    header: {
        fontSize: 24,
        fontFamily: 'Poppins-Bold',
        fontWeight: '700' as TextStyle['fontWeight'],
    },
    subheader: {
        fontSize: 18,
        fontFamily: 'Poppins-SemiBold',
        fontWeight: '600' as TextStyle['fontWeight'],
    },
    body: {
        fontSize: 16,
        fontFamily: 'Poppins-Regular',
        fontWeight: '400' as TextStyle['fontWeight'],
    },
    caption: {
        fontSize: 12,
        fontFamily: 'Poppins-Regular',
        fontWeight: '400' as TextStyle['fontWeight'],
    },
    button: {
        fontSize: 16,
        fontFamily: 'Poppins-Bold',
        fontWeight: '700' as TextStyle['fontWeight'],
    },
};
