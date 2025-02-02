import { BLACK, OTHER_COLORS, WHITE } from '@/constants/Colors';
import { typography } from '@/constants/Typography';
import React from 'react';
import { View, Button, Text, TouchableOpacity, StyleSheet, SafeAreaView, Image } from 'react-native';
import deckImage from '../../assets/images/deck.png';

function Game({ gameState: { discardedPile, players, deck, currentPlayer }, id, handleDrawCard, handlePlayCard }) {

  const playCard = (cardIndex: number) => {
    handlePlayCard(cardIndex);
  };

  const drawCard = () => {
    handleDrawCard();
  };

  const thePlayer = players.find((player) => player.id === id)

  console.log(thePlayer, players[0].hand, id);
  

  return (
    <SafeAreaView>
      <View style={styles.topBarWrapper}>
        <View style={styles.playersWrapper}>
          {players.map((player) => (
            <View >
              <View style={styles.avatarWrapper}>

                <Text style={styles.avatar}>
                  {player.id[0]}{player.id[1]}
                </Text>
              </View>
              <View style={styles.handDisplayWrapper}>
                <Text>
                  {player.hand.length.toString()}
                </Text>
              </View>
            </View>
          ))}
        </View>
        <View>
          <Image source={deckImage} style={styles.deckImage} />
          <Text>
            {deck.length.toString()}
          </Text>
        </View>
      </View>
      <View>
        <Text>
          {players[currentPlayer]?.id === id ? 'Your turn' : players[currentPlayer]?.id}
        </Text>
      </View>
      <View>
        {discardedPile.map(((card) => (
          <Text>
            {card.color}
            {card.type.toString()}
          </Text>
        )))}
      </View>
      <View>
        {thePlayer?.hand.map(((card, index) => (
          <TouchableOpacity onPress={() => playCard(index)}>
            <Text>
              {card.color}
              {card.type.toString()}
            </Text>
          </TouchableOpacity>
        )))}

      </View>
      <View>
        {/* // controls */}
        <View>
          {/* // uno button */}
        </View>
        <View>
          {/* // you */}
        </View>
        <View>
          {/* // dont have it button */}
        </View>
      </View>
    </SafeAreaView>
  );
};

export default Game;

const styles = StyleSheet.create({
  topBarWrapper: {
    width: '100%',
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: 16
  },
  playersWrapper: {
    flexDirection: "row",
    gap: 12,
  },
  avatarWrapper: {
    width: 38,
    height: 38,
    borderRadius: '50%',
    borderColor: OTHER_COLORS.brightGray,
    borderWidth: 3,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: BLACK,
    marginBottom: 11,
  },
  avatar: {
    fontWeight: 'bold',
    color: WHITE
  },
  handDisplayWrapper: {
    position: "absolute",
    bottom: 2,
    height: 17,
    minWidth: 36,
    backgroundColor: WHITE,
    borderRadius: 36,
    borderWidth: 1,
    borderColor: OTHER_COLORS.brightGray,
    justifyContent: 'center',
    alignItems: 'center'
  },
  handDisplay: {
    ...typography.HELVETICA.Caption2,
    color: BLACK,
    fontWeight: "bold"
  },
  deckImage: {
    width: 47,
    height: 64
  }
});