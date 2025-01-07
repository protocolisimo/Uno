import { StyleSheet, Text, View } from 'react-native'
import React, { useEffect, useState } from 'react'
import { Stack } from 'expo-router'
import Game from './game/game'
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import IndexLayout from './index'
import WaitingScreen from './game/waiting_screen';
import { io } from 'socket.io-client';


const RootLayout = () => {
  const Stack = createNativeStackNavigator();

  const [gameState, setGameState] = useState({
    players: [],
    deck: [],
    discardedPile: [],
    currentPlayer: 0,
    gameDirection: 1,
  });

  const [id, setId] = useState<string | undefined>();
  const socket = io('https://uno-server-cat3.onrender.com:3500');

  useEffect(() => {
    socket.on('gameState', (state) => {
      setGameState(state);
    });

    socket.emit('getGame', (state) => {
      setGameState(state);
    });

    socket.on('connect_error', (err) => {
      console.log('Connection error:', err.message);
    });

    return () => {
      socket.off('gameState');
    };
  }, []);

  console.log({gameState});



  return (
    <Stack.Navigator>
      <Stack.Screen name="index" options={{ headerShown: false }} component={IndexLayout} />
      <Stack.Screen
        name="game"
        options={{ headerShown: false }}
        component={() => (
          <Game
            onLeave={() => {
              socket.disconnect();
              setId(undefined)
              setGameState({
                players: [],
                deck: [],
                discardedPile: [],
                currentPlayer: 0,
                gameDirection: 1,
              })
            }}
            gameState={gameState}
            id={id}
            handleDrawCard={() => {
              socket.emit('drawCard', gameState.players[gameState.currentPlayer].id)
            }}
            handlePlayCard={(cardIndex: number) => {
              socket.emit('playCard', {
                playerId: gameState.players[gameState.currentPlayer].id,
                cardIndex,
              });
            }}
          />
        )}
      />
      <Stack.Screen
        name="waiting_screen"
        options={{ headerShown: false }}
        component={({ navigation }) => (
          <WaitingScreen
            clickHandler={() => {
              socket.emit('joinGame', socket.id)
              setId(socket.id)
              navigation.navigate('game')
            }}
            players={gameState.players}
          />
        )}
      />
    </Stack.Navigator>
  )
}

export default RootLayout

const styles = StyleSheet.create({})