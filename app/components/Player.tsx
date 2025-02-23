import React from 'react';
import { Image, StyleSheet, TouchableOpacity, Text, View } from 'react-native';
import defaultAvatart from '@/assets/images/default-avatar.png';
import { COLORS } from '@/constants/Colors';

type PlayerProps = {
    avatarUrl?: { uri: string };
    active: boolean;
    stringUnderAvatar?: string;
    onPress?: () => void;
}

const Player = ({ avatarUrl, active, stringUnderAvatar, onPress }: PlayerProps) => {
    // console.log({active});
    
    return (
        <TouchableOpacity onPress={onPress} style={styles.wrapper}>
            <View style={[styles.avatarWrapper, active && styles.active]}>
                <Image source={avatarUrl || defaultAvatart} style={styles.avatarImage} />
            </View>
            {stringUnderAvatar && (
                <View>
                    <Text>
                        {stringUnderAvatar}
                    </Text>
                </View>
            )}
        </TouchableOpacity>
    );
};

const styles = StyleSheet.create({
    wrapper: {
        
    },
    avatarWrapper: {
        borderRadius: '50%',
        width: 95,
        height: 95,
        borderWidth: 2,
        transitionDuration: '0.2s',
        borderColor: '#EDEBFC'
    },
    active: {
        borderColor: COLORS.primary
    },
    avatarImage: {
        width: 95,
        height: 95,
    }
});

export default Player;