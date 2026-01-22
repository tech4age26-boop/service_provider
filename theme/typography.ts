import { TextStyle } from 'react-native';



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
