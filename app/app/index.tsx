import { StyleSheet, View, Image, Text, Button } from 'react-native'
import React from 'react'
import { SafeAreaView } from 'react-native-safe-area-context'
import { router } from 'expo-router'

const IndexLayout = ({navigation}) => {
  return (
    <SafeAreaView>
      <View>
        <Image />
        <Text >
          Welcome to
          <Text>
            UNO Friend
          </Text>
        </Text>
        <Text >
          Uno is  a Card game you play with friends in person.
        </Text>
        <Button title='Get Started' onPress={() => navigation.navigate('waiting_screen')} />
      </View>

    </SafeAreaView>
  )
}

export default IndexLayout

const styles = StyleSheet.create({})