import { BLACK, OTHER_COLORS, WHITE } from '@/constants/Colors';
import { typography } from '@/constants/Typography';
import React, { useState } from 'react';
import { View, Text, TextInput, StyleSheet, SafeAreaView, Button, Alert } from 'react-native';
import deckImage from '@/assets/images/deck.png';
import Card from '@/components/Card';
import Player from '@/components/Player';

function RegisterScreen({ succsesHandler }) {
  const [userName, setUserName] = useState('');

  const handleRegister = async () => {
    try {
      const response = await fetch('http://localhost:3500/sigin', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ userName }),
      });

      const result = await response.json();

      if (response.ok) {
        succsesHandler(result.data.user);
      } else {
        Alert.alert('Error', result.message || 'Something went wrong');
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to register');
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.form}>
        <Text style={styles.label}>Username</Text>
        <TextInput
          style={styles.input}
          value={userName}
          onChangeText={setUserName}
          placeholder="Enter your username"
        />
        <Button title="Register" onPress={handleRegister} />
      </View>
    </SafeAreaView>
  );
}

export default RegisterScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    padding: 16,
  },
  form: {
    marginBottom: 24,
  },
  label: {
    marginBottom: 8,
    fontSize: 16,
  },
  input: {
    height: 40,
    borderColor: '#ccc',
    borderWidth: 1,
    marginBottom: 16,
    paddingHorizontal: 8,
  },
});