import { Button, StyleSheet, Text, View } from 'react-native'
import React, { useEffect, useState } from 'react'
import { SafeAreaView } from 'react-native-safe-area-context'
import { TouchableOpacity } from 'react-native'

type ColorType = 'green' | 'yellow' | 'red' | 'blue' | 'wild'
type CardType = {color: ColorType, type: string}
type PlayerType = {id: string, hand: CardType[]}


function guidGenerator() {
  var S4 = function() {
     return (((1+Math.random())*0x10000)|0).toString(16).substring(1);
  };

  return (S4()+S4()+"-"+S4()+"-"+S4()+"-"+S4()+"-"+S4()+S4()+S4());
}

const RootLayout = () => {
  const COLORS: ColorType[] = ['green', 'yellow', 'red', 'blue']
  const SPECIAL_CARDS = ['skip', 'draw_2', 'reverse']
  const WILD_CARDS = ['wild', 'draw_4']

  const [deck, setDeck] = useState<CardType[]>();
  const [discardedPile, setDiscardedPile] = useState<CardType[]>([]);
  const [players, setPlayers] = useState<PlayerType[]>([])
  const [currentPlayer, setCurrentPlayer] = useState(0)
  const [game, setGame] = useState(false)
  const [gameDirection, setGameDirection] = useState(1)

  // set up the deck (the Deck will come from the BE)
  useEffect(() => {
    setDeck((() => {
      let newDeck: CardType[] = []

      COLORS.forEach((color) => {
        for (let i = 0; i <= 9; i++) {
            newDeck.push({color, type: `${i}`})
        }
        SPECIAL_CARDS.forEach(type => {
          newDeck.push({color, type})
        })
      })

      for (let i = 0; i < 4; i++) {
        WILD_CARDS.forEach(type => {
          newDeck.push({color: 'wild', type})
        })
      }

      newDeck = newDeck.map(value => ({ value, sort: Math.random() }))
      .sort((a, b) => a.sort - b.sort)
      .map(({ value }) => value)

      return newDeck
    }))    
  }, [])

  // set up the players (prbl should be redone)
  useEffect(() => {
    if (deck && deck?.length === 60) {
      const theDeck = [...deck];

      const firstSevenCards = theDeck.splice(0, 7);
      const nextSevenCards = theDeck.splice(0, 7);
      const newSevenCards = theDeck.splice(0, 7);
      
      setPlayers([
        {id: guidGenerator(), hand: firstSevenCards},
        {id: guidGenerator(), hand: nextSevenCards},
        {id: guidGenerator(), hand: newSevenCards}
      ])

      setDeck(theDeck)
      
    }

    setGame(true)
  }, [deck])

  useEffect(() => {
    if (game && deck && deck.length <= 0) {
        setGame(false)
        alert('game over')
    }
    players.forEach(({hand}) => {
      if (hand.length <= 0) {
        alert('game over')
      }
      
    })
  }, [deck, players])

  const isPlayable = (card: CardType, topCard: CardType) => {
    return discardedPile.length === 0 || card.color === topCard?.color || card.type === topCard?.type || card.color === 'wild' || topCard?.color === 'wild'
  }

  const setNextPlayer = () => {
    setCurrentPlayer((prev) => {
      return (prev + gameDirection + players.length) % players.length;
    });
  }

  const drawCard = (playerIndex: number) => {
    const newPlayers = [...players];
    const player = newPlayers[playerIndex]

    setDeck((prevDeck) => {
    if (prevDeck && prevDeck.length > 0) {
      const newDeck = [...prevDeck];
      const cardFromTopOfTheDeck = newDeck.pop();

      if (cardFromTopOfTheDeck) {
        player.hand.push(cardFromTopOfTheDeck);
        setPlayers(newPlayers);
      }

      return newDeck; // Return the updated deck
    }
    return prevDeck; // If the deck is empty, return it unchanged
  });
  }

  const playCardEffect = (playerIndex: number, card: CardType) => {
    // let nextPlayer = playerIndex + 1;
    // if (nextPlayer > players.length - 1) nextPlayer = 0

    if (card.type === 'skip') {
      // does not work
      setCurrentPlayer((prev) => {
        const nextPlayer = (prev + gameDirection + players.length) % players.length;
        return (nextPlayer + gameDirection + players.length) % players.length;
      });

    } else if (card.type === 'draw_2') {
      setCurrentPlayer((prev) => {
        const nextPlayer = (prev + gameDirection + players.length) % players.length;
        for (let i = 0; i >= 2; i++ ) {
          drawCard(nextPlayer)
        }
        return (nextPlayer + gameDirection + players.length) % players.length;
      });
      
      
      
    }  else if (card.type === 'draw_4') {
      setCurrentPlayer((prev) => {
        const nextPlayer = (prev + gameDirection + players.length) % players.length;
        for (let i = 0; i >= 4; i++ ) {
          drawCard(nextPlayer)
        }

        return (nextPlayer + gameDirection + players.length) % players.length;
      });
      
      
    } else if (card.type === 'reverse') {
      setGameDirection((prevDirection) => {
          const newDirection = prevDirection * -1

          setCurrentPlayer((prevPlayer) => {
            const nextPlayer = (prevPlayer + newDirection + players.length) % players.length;
            return nextPlayer;
          });

          return newDirection
      })
    } else {
      setNextPlayer()
    }
  }

  const handleMove = (cardIndex: number) => {
    const newPlayers = [...players];
    const player = newPlayers[currentPlayer]
    const deckTopCard = discardedPile[discardedPile.length - 1];
    const card = player.hand[cardIndex]
      
    if (player && isPlayable(card, deckTopCard)) {
      
      player.hand.splice(cardIndex , 1)
      
      setPlayers(newPlayers)
      setDiscardedPile([...discardedPile, card])
      playCardEffect(currentPlayer, card)
    }
    else {
      console.log('not playeble');
    }
  }

  const getCardRotation = (indexOfaCard: number) => {
      if (indexOfaCard % 2) {
        return - indexOfaCard
      }

      if (indexOfaCard % 3) {
        return indexOfaCard * 1.7
      }

      if (indexOfaCard % 4) {
        return - indexOfaCard * 1.4
      }
      return indexOfaCard
  }

  return (
    <View style={styles.container}>
      {discardedPile.map((card, index) => (
      <View
        key={index}
        style={{
            borderRadius: 15,
            width: 100,
            height: 150,
            padding: 10,
            backgroundColor: card.color === 'wild' ? 'black': card.color,
            position: 'absolute',
            top: 0,
            transform: `rotate(${getCardRotation(index)}deg)`
          }}
      >
      <Text style={{backgroundColor: '#fff'}}>
        {discardedPile[discardedPile.length - 1].type}
      </Text>
    </View>
      ))}
      <br />
      {players && players.map((player) => (
        <View key={player.id} style={{backgroundColor: player.id === players[currentPlayer].id ? '#deffde' : 'tranparent'}}>
          <Text >{player.id}</Text>
          < br />
          <View style={{
            marginBottom: 10,
            flexDirection: 'row',
            flexWrap: 'wrap',
            gap: 10
          }}>
          {player.hand.map(({type, color}, index) => (
          <TouchableOpacity
            key={`${index}-${type}-${color}`}
            onPress={() => {
              if (player.id === players[currentPlayer].id) {
                handleMove(index)
              }
            }}
            style={{
              backgroundColor: color === 'wild' ? 'black': color,
              padding: 10,
              width: 70,
              height: 30}}
          >
            <Text style={{backgroundColor: '#fff'}}>{type}</Text>
          </TouchableOpacity>
        ))}
          </View>
          
        </View>
        
      ))}  
      <Button
        onPress={() => {
          drawCard(currentPlayer)
          setNextPlayer()
        }}
        title='Draw' /> 
    </View>
  )
}

export default RootLayout

const styles = StyleSheet.create({
    container: {
        flex: 1,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        position: 'relative'
    }
})