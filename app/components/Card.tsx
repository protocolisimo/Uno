import cardImages from '@/constants/CardImages';
import React from 'react';
import { Image, StyleSheet, TouchableOpacity } from 'react-native';


interface CardProps {
    card: {
        color: string;
        type: string;
    }
    onPress?: () => void;
}

const Card: React.FC<CardProps> = ({ card, onPress }) => {
    const imageSource = cardImages[`${card.color}-${card.type}`] || cardImages["default"];

    return (
        <TouchableOpacity onPress={onPress} style={styles.cardContainer}>
            <Image source={imageSource} style={styles.cardImage} />
        </TouchableOpacity>
    );
};

const styles = StyleSheet.create({
    cardContainer: {
        margin: 5,
    },
    cardImage: {
        width: 60,
        height: 90,
        resizeMode: "contain",
    },
});

export default Card;