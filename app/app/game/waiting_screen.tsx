import React from 'react';
import { View, Button, StyleSheet } from 'react-native';

function WaitingScreen () {
  return (
    <View style={styles.container}>
      

      <Button title="Waiting_screen"/>

    </View>
  );
};

export default WaitingScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});