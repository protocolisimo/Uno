import React, { useEffect } from 'react';
import { View, Button, Text, TouchableOpacity, StyleSheet } from 'react-native';

function Game({ gameState, id, handleDrawCard, handlePlayCard, onLeave }) {

  // useEffect(() => {
  //   return () => onLeave
  // }, [])

  const playCard = (cardIndex: number) => {
    handlePlayCard(cardIndex);
  };

  const drawCard = () => {
    handleDrawCard();
  };

  return (
    <View style={styles.container}>
      <Text>{id}</Text>
      <View style={{ position: 'relative', width: '100%', height: 100 }}>
        {gameState.discardedPile.map((card, i) => (
          <View
            key={i}
            style={{
              position: 'absolute',
              backgroundColor: card.color === 'wild' ? 'black' : card.color,
              padding: 10,
              margin: 5,
            }}
          >
            <Text style={{ color: 'black', fontSize: 30 }}>{card.type}</Text>
          </View>
        ))}
      </View>

      {gameState.players.map((player, index) => (
        <View key={player.id} style={{ margin: 10 }}>
          <Text>{`Player ${index + 1}`}</Text>
          <View style={{ flexDirection: 'row' }}>
            {player.hand.map((card, i) => (
              <TouchableOpacity
                key={i}
                onPress={() => {
                  if (index === gameState.currentPlayer) playCard(i);
                }}
                style={{
                  backgroundColor: card.color === 'wild' ? 'black' : card.color,
                  padding: 10,
                  margin: 5,
                }}
              >
                <Text style={{ color: 'black', fontSize: 30 }}>{card.type}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      ))}

      <Button title="Draw Card" onPress={drawCard} />

    </View>
  );
};

export default Game;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});