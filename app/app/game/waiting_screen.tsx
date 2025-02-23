import React, { useEffect } from 'react';
import { View, StyleSheet, SafeAreaView, FlatList, Text } from 'react-native';
import { Button } from '@/components/Button'

function WaitingScreen({ rooms = [], joinHandler, createHandler, getRooms }) {
  // console.log(rooms);
  
  // here i'll need to ask a server for a list of the rooms,
  // or display a button which will allow the user to create a room

  console.log({rooms});
  
  
  return (
    <SafeAreaView style={styles.container}>
      <View>
        <FlatList data={rooms} renderItem={({item}) => (
          <View>
            <Text >
              {item}
            </Text>
            <Button text="Connect" onPress={() => joinHandler(item)} />
          </View>
        )} />
      </View>

      <Button text="Create room" onPress={() => createHandler(Date.now())} />
    </SafeAreaView>
  );
};

export default WaitingScreen;

const styles = StyleSheet.create({
  container: {},
});