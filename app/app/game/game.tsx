import { BLACK, OTHER_COLORS, WHITE } from '@/constants/Colors';
import { typography } from '@/constants/Typography';
import React from 'react';
import { View, Text, StyleSheet, SafeAreaView, Image } from 'react-native';
import deckImage from '@/assets/images/deck.png';
import Card from '@/components/Card';
import { Button } from '@/components/Button';

function Game({ gameState: { discardedPile, players, deck, currentPlayer }, id, handleDrawCard, handlePlayCard }) {

  const playCard = (cardIndex: number) => {
    handlePlayCard(cardIndex);
  };

  const drawCard = () => {
    handleDrawCard();
  };

  const thePlayer = players.find((player) => player.id === id)

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
      <View style={styles.pile}>
        {discardedPile.map(((card) => (
          <View style={styles.pileCardWrapper}>
            <Card card={card} onPress={() => playCard(index)} />
          </View>
        )))}
      </View>
      <View style={styles.hand}>
        {thePlayer?.hand.map(((card, index) => (
          <Card card={card} onPress={() => playCard(index)} />
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
          <Button text="Draw" onPress={drawCard} />
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
  },

  pile: {
    height: 200,
    width: '100%',
    position: 'relative',
    alignItems: 'center',
  },
  pileCardWrapper: {
    position: 'absolute',
    transform: 'scale(1.3)',
  },
  hand: {
    flexWrap: 'wrap',
    flexDirection: 'row',
    gap: 10,
  }
})