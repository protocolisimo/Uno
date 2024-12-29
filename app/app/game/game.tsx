import React, { useEffect, useState } from 'react';
import { View, Button, Text, TouchableOpacity, StyleSheet } from 'react-native';
import io from 'socket.io-client';

const socket = io('http://localhost:3500');

const Game = () => {
  const [gameState, setGameState] = useState({
    players: [],
    deck: [],
    discardedPile: [],
    currentPlayer: 0,
    gameDirection: 1,
  });
  const [id, setId] = useState('')

  useEffect(() => {
    socket.on('gameState', (state) => {
      setGameState(state);
    });

    socket.on('connect_error', (err) => {
      console.log('Connection error:', err.message);
    });

    return () => {
      socket.off('gameState');
    };
  }, []);

  useEffect(() => {
    if (socket !== null) {
      socket.emit('joinGame', socket.id)
      setId(socket.id)
    }
  }, [socket])

  const playCard = (cardIndex: number) => {

    socket.emit('playCard', {
      playerId: gameState.players[gameState.currentPlayer].id,
      cardIndex,
    });
  };

  const drawCard = () => {
    socket.emit('drawCard', gameState.players[gameState.currentPlayer].id);
  };

  console.log({socket})

  return (
    <View style={styles.container}>
      <Text>{id}setDeck{socket?.id      }</Text>
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