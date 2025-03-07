import { StyleSheet, View, Image, Text, ImageBackground, SafeAreaView } from 'react-native'
import React from 'react'
import BgImage from '../assets/images/BG.png';
import unoIcon from '../assets/images/unoIcon.png'
import { Button } from '../components/Button'
import { typography } from '../constants/Typography';
import { COLORS } from '../constants/Colors';


// todo: fix safe area view

// import DefaultImage from '../assets/image.png';
//
// const DEFAULT_IMAGE = Image.resolveAssetSource(DefaultImage).uri;
const IndexLayout = ({ onclick }) => {
  return (
    <SafeAreaView style={styles.container}>
      <ImageBackground
        source={BgImage}
        style={styles.background}
        resizeMode='cover'
      >
        <View style={styles.contentWrapper}>
          <View style={styles.iconWrapper}>
            <Image source={unoIcon} style={styles.icon} />
          </View>
          <View style={styles.titleWrapper}>
            <Text style={styles.title}>
              Welcome to
            </Text>
            <Text style={styles.secondTitle}>
              UNO Friend
            </Text>
            <Text style={styles.subtitle}>
              Uno is  a Card game you play with friends in person.
            </Text>
          </View>
          <View style={styles.buttonWrapper}>

            <Button text="Get Started" onPress={onclick} />

          </View>

        </View>


      </ImageBackground>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  background: {
    flex: 1,
  },

  contentWrapper: {
    gap: 27,
    flexGrow: 1,
    paddingLeft: 47,
    paddingRight: 47,
    paddingTop: 137,
    paddingBottom: 109,
  },

  titleWrapper: {
    gap: 23,
    flexGrow: 1,
  },
  title: typography.HELVETICA.H,
  secondTitle: { ...typography.HELVETICA.H, color: COLORS.primary },
  subtitle: typography.HELVETICA.Text2,

  buttonWrapper: {
    width: 200,
    marginHorizontal: 'auto'
  },

  iconWrapper: {
    width: 85,
    height: 85,
    marginBottom: 27,
    display: "flex",
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 17,
    backgroundColor: "#121030",
  },
  icon: {
    width: 49,
    height: 43
  }
});

export default IndexLayout