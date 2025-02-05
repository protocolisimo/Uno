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


const mockedGameState = {
  "deck": [
    {
      "color": "wild",
      "type": "wild"
    },
    {
      "color": "yellow",
      "type": "2"
    },
    {
      "color": "yellow",
      "type": "3"
    },
    {
      "color": "green",
      "type": "8"
    },
    {
      "color": "blue",
      "type": "8"
    },
    {
      "color": "wild",
      "type": "draw_4"
    },
    {
      "color": "yellow",
      "type": "6"
    },
    {
      "color": "green",
      "type": "draw_2"
    },
    {
      "color": "red",
      "type": "4"
    },
    {
      "color": "green",
      "type": "5"
    },
    {
      "color": "green",
      "type": "9"
    },
    {
      "color": "wild",
      "type": "wild"
    },
    {
      "color": "red",
      "type": "2"
    },
    {
      "color": "green",
      "type": "3"
    },
    {
      "color": "red",
      "type": "7"
    },
    {
      "color": "wild",
      "type": "wild"
    },
    {
      "color": "green",
      "type": "0"
    },
    {
      "color": "green",
      "type": "7"
    },
    {
      "color": "blue",
      "type": "0"
    },
    {
      "color": "blue",
      "type": "9"
    },
    {
      "color": "green",
      "type": "6"
    },
    {
      "color": "wild",
      "type": "draw_4"
    },
    {
      "color": "yellow",
      "type": "7"
    },
    {
      "color": "yellow",
      "type": "reverse"
    },
    {
      "color": "blue",
      "type": "2"
    },
    {
      "color": "green",
      "type": "reverse"
    },
    {
      "color": "blue",
      "type": "7"
    },
    {
      "color": "red",
      "type": "reverse"
    },
    {
      "color": "red",
      "type": "8"
    },
    {
      "color": "yellow",
      "type": "draw_2"
    },
    {
      "color": "red",
      "type": "1"
    },
    {
      "color": "blue",
      "type": "reverse"
    },
    {
      "color": "red",
      "type": "6"
    },
    {
      "color": "wild",
      "type": "draw_4"
    },
    {
      "color": "wild",
      "type": "wild"
    },
    {
      "color": "blue",
      "type": "3"
    },
    {
      "color": "blue",
      "type": "5"
    },
    {
      "color": "red",
      "type": "9"
    },
    {
      "color": "red",
      "type": "draw_2"
    },
    {
      "color": "blue",
      "type": "draw_2"
    },
    {
      "color": "yellow",
      "type": "4"
    },
    {
      "color": "green",
      "type": "skip"
    },
    {
      "color": "yellow",
      "type": "8"
    },
    {
      "color": "red",
      "type": "3"
    },
    {
      "color": "blue",
      "type": "6"
    },
    {
      "color": "green",
      "type": "2"
    }
  ],
  "discardedPile": [
    {
      "color": "green",
      "type": "4"
    }
  ],
  "players": [
    {
      "id": "EDroovzFioYwStLzAAx1",
      "hand": [
        {
          "color": "red",
          "type": "5"
        },
        {
          "color": "blue",
          "type": "1"
        },
        {
          "color": "blue",
          "type": "4"
        },
        {
          "color": "blue",
          "type": "skip"
        },
        {
          "color": "yellow",
          "type": "skip"
        },
        {
          "color": "wild",
          "type": "draw_4"
        }
      ]
    }
  ],
  "currentPlayer": 1,
  "gameDirection": 1
}

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


  const socket = io('https://uno-server-cat3.onrender.com');


  useEffect(() => {
    if (!socket) {
      setGameState(mockedGameState);
    }
    socket.on('gameState', (state) => {
      setGameState(state);
    });

    socket.emit('getGame', (state) => {
      setGameState(state);
    });

    socket.on('connect_error', (err) => {
      console.log('Connection error:', err.message);
      setGameState(mockedGameState)
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