import { StyleSheet, Text, View } from 'react-native'
import React from 'react'
import { Stack } from 'expo-router'
import Game from './game/game'
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import IndexLayout from './index'
import Waiting_screen from './game/waiting_screen';





const RootLayout = () => {
  const Stack = createNativeStackNavigator();

  return (
  <Stack.Navigator>
    <Stack.Screen name="index" options={{ headerShown: false }} component={IndexLayout} />
    <Stack.Screen name="game" options={{ headerShown: false }} component={Game} />
    <Stack.Screen name="waiting_screen" options={{ headerShown: false }} component={Waiting_screen} />
  </Stack.Navigator>
  )
}

export default RootLayout

const styles = StyleSheet.create({})