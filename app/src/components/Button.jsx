import { Text, TouchableOpacity, StyleSheet } from 'react-native'
import { typography } from '../constants/Typography'
import { COLORS, WHITE } from '../constants/Colors';

export const Button = ({ type, color, text, onPress }) => {
    return (
        <TouchableOpacity onPress={onPress} style={styles.buttonWrapper}>
            <Text style={styles.textStyles}>
                {text}
            </Text>
        </TouchableOpacity>
    )
}

const styles = StyleSheet.create({
    textStyles: {
        ...typography.HELVETICA.Text1,
        color: WHITE,
        textAlign: 'center'
    },
    buttonWrapper: {
        borderRadius: 37,
        paddingTop: 11,
        paddingBottom: 11,
        backgroundColor: COLORS.primary,
        justifyContent: 'center'
    }
});