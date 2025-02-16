import { StyleSheet, SafeAreaView } from 'react-native'
import React, { useEffect, useState, useRef } from 'react'
import Game from './game/game'
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import IndexLayout from './index'
import WaitingScreen from './game/waiting_screen';
import io from 'socket.io-client';
import { useFonts } from 'expo-font';
import { SplashScreen } from 'expo-router';
import RegisterScreen from './game/register';
import { navigate } from 'expo-router/build/global-state/routing';

SplashScreen.preventAutoHideAsync();

const RootLayout = () => {
  const Stack = createNativeStackNavigator();

  const [rooms, setRooms] = useState([]);
  const [roomName, setRoomName] = useState<string | null>();

  const [gameState, setGameState] = useState({
    players: [],
    deck: [],
    discardedPile: [],
    currentPlayer: 0,
    gameDirection: 1,
  });

  const [id, setId] = useState();


  // const socket = io('https://uno-server-cat3.onrender.com');
  const socket = useRef();

  const connect = () => {
    socket.current = io("http://localhost:3500");
    socket?.current?.on('connected', (playerId, roomsList) => {
      console.log('connected', playerId, roomsList);
      setId(playerId)
    });
    socket?.current?.emit('getRooms')
    socket?.current?.on('rooms', (roomsList) => {
      setRooms(roomsList)
    });
    socket?.current?.on('gameState', (state) => {
      console.log('asdasdsdasdasd', state)
      setGameState(state);
    });
  }


  return (
    <Stack.Navigator>
      <Stack.Screen name="index" options={{ headerShown: false }} component={({ navigation }) => <IndexLayout onclick={() => {
        connect();
        navigation.navigate('waiting_screen')
      }} />} />
      <Stack.Screen
        name="game"
        options={{ headerShown: false }}
        component={() => (
          <Game
            // onLeave={() => {
            // }}
            gameState={gameState}
            id={id}
            handleDrawCard={() => {
              socket.current.emit('drawCard', { playerId: id, roomName })
            }}
            handlePlayCard={(cardIndex: number) => {
              socket.current.emit('playCard', {
                playerId: id,
                cardIndex,
                roomName
              });
            }}
          />
        )}
      />
      <Stack.Screen
        name='register'
        options={{ headerShown: false }}
        component={({ navigation }) => (
          <RegisterScreen
            succsesHandler={() => {
              console.log('success');

              navigation.navigate('waiting_screen')
            }}
          />
        )}
      />
      <Stack.Screen
        name="waiting_screen"
        options={{ headerShown: false }}
        component={({ navigation }) => (
          <>
            {/* <button onClick={() => socket.current.emit('joinRoom', 'test', () => {
                setRoomName('test');
                navigation.navigate('game');
              })}>join to test room</button>
          <button onClick={() => socket.current.emit('getState')}>getState</button> */}
            <WaitingScreen
              joinHandler={(room) => {
                console.log({ room });

                socket.current.emit('joinRoom', room, () => {
                  setRoomName(room)
                  navigation.navigate('game')
                });

              }}
              createHandler={(room) => {
                console.log({ room });

                socket.current.emit('createRoom', room, () => socket.current.emit('joinRoom', room, () => {
                  setRoomName(room)
                  navigation.navigate('game')
                }));

              }}
              rooms={Object.keys(rooms)}
            />
          </>
        )}
      />
    </Stack.Navigator>
  )
}

export default RootLayout

const styles = StyleSheet.create({})