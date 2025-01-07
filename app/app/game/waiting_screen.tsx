import React from 'react';
import { View, Button, StyleSheet, SafeAreaView, FlatList, Text } from 'react-native';

function WaitingScreen({ players, clickHandler }) {

  console.log({ players });


  return (
    <SafeAreaView style={styles.container}>
      <View>
        <FlatList data={players} renderItem={({item}) => (
          <View>
            <Text >
              {item.id}
            </Text>
          </View>
        )} />
      </View>

      <Button title="Waiting_screen" onPress={clickHandler} />

    </SafeAreaView>
  );
};

export default WaitingScreen;

const styles = StyleSheet.create({
  container: {},
});