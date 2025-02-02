import React from 'react';
import { View, StyleSheet, SafeAreaView, FlatList, Text } from 'react-native';
import { Button } from '../../components/Button'

function WaitingScreen({ players, clickHandler }) {
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

      <Button text="Waiting_screen" onPress={clickHandler} />

    </SafeAreaView>
  );
};

export default WaitingScreen;

const styles = StyleSheet.create({
  container: {},
});