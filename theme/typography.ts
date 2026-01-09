import { Platform, TextStyle } from 'react-native';

const fontConfig = {
    web: {
        regular: {
            fontFamily: 'Inter-Regular',
            fontWeight: '400' as TextStyle['fontWeight'],
        },
        medium: {
            fontFamily: 'Inter-Medium',
            fontWeight: '500' as TextStyle['fontWeight'],
        },
        bold: {
            fontFamily: 'Inter-Bold',
            fontWeight: '700' as TextStyle['fontWeight'],
        },
    },
    ios: {
        regular: {
            fontFamily: 'Inter-Regular',
            fontWeight: '400' as TextStyle['fontWeight'],
        },
        medium: {
            fontFamily: 'Inter-SemiBold',
            fontWeight: '600' as TextStyle['fontWeight'],
        },
        bold: {
            fontFamily: 'Inter-Bold',
            fontWeight: '700' as TextStyle['fontWeight'],
        },
    },
    android: {
        regular: {
            fontFamily: 'Inter-Regular',
            fontWeight: '400' as TextStyle['fontWeight'],
        },
        medium: {
            fontFamily: 'Inter-SemiBold',
            fontWeight: '600' as TextStyle['fontWeight'],
        },
        bold: {
            fontFamily: 'Inter-Bold',
            fontWeight: '700' as TextStyle['fontWeight'],
        },
    },
};

export const typography = {
    fontFamily: 'Inter-Regular',
    header: {
        fontSize: 24,
        fontFamily: 'Inter-Bold',
        fontWeight: '700' as TextStyle['fontWeight'],
    },
    subheader: {
        fontSize: 18,
        fontFamily: 'Inter-SemiBold',
        fontWeight: '600' as TextStyle['fontWeight'],
    },
    body: {
        fontSize: 16,
        fontFamily: 'Inter-Regular',
        fontWeight: '400' as TextStyle['fontWeight'],
    },
    caption: {
        fontSize: 12,
        fontFamily: 'Inter-Regular',
        fontWeight: '400' as TextStyle['fontWeight'],
    },
    button: {
        fontSize: 16,
        fontFamily: 'Inter-Bold',
        fontWeight: '700' as TextStyle['fontWeight'],
    },
};
