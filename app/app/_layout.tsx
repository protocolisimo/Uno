import { StyleSheet, SafeAreaView } from 'react-native'
import React, { useEffect, useState } from 'react'
import Game from './game/game'
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import IndexLayout from './index'
import WaitingScreen from './game/waiting_screen';
import { io } from 'socket.io-client';
import { useFonts } from 'expo-font';
import { SplashScreen } from 'expo-router';

// ToDo: fix the fonts
// ToDo: fix types

SplashScreen.preventAutoHideAsync();

const RootLayout = () => {
  const [fontsLoaded, error] = useFonts({
    "Helvetica": require("../assets/fonts/HelveticaBold.ttf"),
  });

  useEffect(() => {
    if (error) throw error;

    if (fontsLoaded) SplashScreen.hideAsync()
  }, [fontsLoaded, error])

  const Stack = createNativeStackNavigator();

  const [gameState, setGameState] = useState({
    players: [],
    deck: [],
    discardedPile: [],
    currentPlayer: 0,
    gameDirection: 1,
  });

  const [id, setId] = useState<string | undefined>();


  // const socket = io('https://uno-server-cat3.onrender.com');
  const socket = io('http://localhost:3500');


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

  return (
    <Stack.Navigator>
      <Stack.Screen name="index" options={{ headerShown: false }} component={IndexLayout} />
      <Stack.Screen
        name="game"
        options={{ headerShown: false }}
        component={() => (
          <Game
            // onLeave={() => {
            //   socket.disconnect();
            //   setId(undefined)
            //   setGameState({
            //     players: [],
            //     deck: [],
            //     discardedPile: [],
            //     currentPlayer: 0,
            //     gameDirection: 1,
            //   })
            // }}
            gameState={gameState}
            id={id}
            handleDrawCard={() => {
              socket.emit('drawCard', id)
            }}
            handlePlayCard={(cardIndex) => {
              socket.emit('playCard', {
                  playerId: id,
                  cardIndex,
              }, (response) => {
                
                  if (!response.success) {
                      alert(response.message || 'Invalid move');
                  }
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