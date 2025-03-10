import cardImages from '../constants/CardImages';
import React from 'react';
import { Image, StyleSheet, TouchableOpacity } from 'react-native';

export type Card = {
    color: string;
    type: string;
}

type CardProps = {
    card: Card
    onPress?: () => void;
}

const Card = ({ card, onPress }: CardProps) => {
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