import { StyleSheet } from 'react-native'
import React, { useState, useRef, useEffect } from 'react'
import Game from './game/game'
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import {
  NavigationContainer,
} from '@react-navigation/native';
import IndexLayout from './index'
import WaitingScreen from './game/waiting_screen';
import RegisterScreen from './game/register';
import { SocketProvider } from '../context/socketProvider';
import { io, Socket } from "socket.io-client";

const RootLayout = () => {
  const Stack = createNativeStackNavigator();

  const [isContected, setIsConected] = useState(false);
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

  const socket = useRef<Socket | null>(null);

    const connect = () => {
      socket.current = io("https://uno-server-cat3.onrender.com");
      socket?.current?.on('connected', (playerId, roomsList) => {
        setId(playerId)
        setRooms(roomsList)
      });
      socket?.current?.emit('getRooms')
      socket?.current?.on('rooms', (roomsList) => {
        setRooms(roomsList)
      });
      socket?.current?.on('gameState', (state) => {
        setGameState(state);
      });
    }

  return (
    <NavigationContainer>
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
                  onLeave={() => {
                    console.log('onLeave');
                    socket.current.emit('leave', { playerId: id, roomName })

                  }}
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
                      socket.current.emit('createRoom', room);
                    }}
                    rooms={Object.keys(rooms)}
                  />
                </>
              )}
            />
          </Stack.Navigator>
    </NavigationContainer>
  )
}

// <Stack.Navigator>
//   <Stack.Screen name="index" options={{ headerShown: false }} component={({ navigation }) => <IndexLayout onclick={() => {
//     connect();
//     navigation.navigate('waiting_screen')
//   }} />} />
//   <Stack.Screen
//     name="game"
//     options={{ headerShown: false }}
//     component={() => (
//       <Game
//         onLeave={() => {
//           console.log('onLeave');
//           // socket.current.emit('leave', { playerId: id, roomName })

//         }}
//         gameState={gameState}
//         id={id}
//         handleDrawCard={() => {
//           socket.current.emit('drawCard', { playerId: id, roomName })
//         }}
//         handlePlayCard={(cardIndex: number) => {
//           socket.current.emit('playCard', {
//             playerId: id,
//             cardIndex,
//             roomName
//           });
//         }}
//       />
//     )}
//   />
//   <Stack.Screen
//     name='register'
//     options={{ headerShown: false }}
//     component={({ navigation }) => (
//       <RegisterScreen
//         succsesHandler={() => {
//           console.log('success');

//           navigation.navigate('waiting_screen')
//         }}
//       />
//     )}
//   />
//   <Stack.Screen
//     name="waiting_screen"
//     options={{ headerShown: false }}
//     component={({ navigation }) => (
//       <>
//         {/* <button onClick={() => socket.current.emit('joinRoom', 'test', () => {
//             setRoomName('test');
//             navigation.navigate('game');
//           })}>join to test room</button>
//       <button onClick={() => socket.current.emit('getState')}>getState</button> */}
//         <WaitingScreen
//           joinHandler={(room) => {
//             console.log({ room });

//             socket.current.emit('joinRoom', room, () => {
//               setRoomName(room)
//               navigation.navigate('game')
//             });

//           }}
//           createHandler={(room) => {
//             socket.current.emit('createRoom', room);
//           }}
//           rooms={Object.keys(rooms)}
//         />
//       </>
//     )}
//   />
// </Stack.Navigator>
export default RootLayout

const styles = StyleSheet.create({})