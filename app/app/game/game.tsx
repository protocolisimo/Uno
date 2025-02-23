import { BLACK, OTHER_COLORS, WHITE } from '@/constants/Colors';
import { typography } from '@/constants/Typography';
import React, { useEffect } from 'react';
import { View, Text, StyleSheet, SafeAreaView, Image } from 'react-native';
import deckImage from '../../assets/images/deck.png';
import Card from '@/components/Card';
import { Button } from '@/components/Button';
import Player from '@/components/Player';

function Game({ gameState, id, handleDrawCard, handlePlayCard, onLeave }) {

  const { discardedPile, players, deck, currentPlayer } = gameState

  const playCard = (cardIndex: number) => {
    handlePlayCard(cardIndex);
  };

  const drawCard = () => {
    handleDrawCard();
  };

  useEffect(() => {
    console.log('Game component mounted');
    return () => {
      console.log('Game component unmounted, calling onLeave');
      onLeave();
    };
  }, []);

  const thePlayer = players.find((player) => player.id === id);

  return (
    <SafeAreaView>
      <View style={styles.topBarWrapper}>
        <View style={styles.playersWrapper}>
          {players.map((player) => player.id !== thePlayer?.id && (
            <Player stringUnderAvatar={player.hand.length.toString()} active={player.id === players?.[currentPlayer]?.id} />
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
          {players[currentPlayer]?.id === id && 'Your turn'}
        </Text>
      </View>
      <View style={styles.pile}>
        {discardedPile.map(((card, index) => (
          <View style={[
            styles.pileCardWrapper,
            {
              transform: [
                { rotate: `${(index % 5) * 5 - 10}deg` },
                { translateX: (index % 3) * 4 - 6 },
                { translateY: (index % 3) * 2 - 4 }
              ],
              zIndex: index,
            },
          ]}>
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
        <View>
          {/* // uno button */}
        </View>
        <View>
          <Player stringUnderAvatar='You' active={id === players?.[currentPlayer]?.id} />
        </View>
        <View>
          <Button text="Draw" onPress={drawCard} />
        </View>
      </View>
    </SafeAreaView >
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