import { Button, StyleSheet, Text, View } from 'react-native'
import React, { useEffect } from 'react'
import { Slot } from 'expo-router'
import { TouchableOpacity } from 'react-native';

type PlayerType = {id: string, hand: {color: string, value: string}[]}

const App = () => {
  const COLORS = ['green', 'yellow', 'red', 'blue']
  const SPECIAL_CARDS = ['skip', 'draw_2', 'reverse']
  const WILD_CARDS = ['wild', 'wild_draw_4']

  const mocCard1 = {
    color: 'red',
    value: '2'
  }
  const mocCard2 = {
    color: 'blue',
    value: '6'
  }
  const mocCard3 = {
    color: 'yellow',
    value: 'reverse'
  }

  const mocCard4 = {
    color: 'wild',
    value: 'wild'
  }

  const mocPlayer1 = {
    id: 'asdasd',
    hand: [mocCard2, mocCard4]
  }

  const mocPlayer2 = {
    id: 'asdasd123',
    hand: [mocCard1, mocCard3]
  }

  type CardType = {color: string, value: string}

  type gameType = {
    deck: CardType[],
    started: boolean,
    currentPile: CardType[],
    players: PlayerType[],
    currentPlayerId: string,
    gameDirrection: number

  }
  
  let game: gameType = {
    deck: [],
    started: false,
    currentPile: [],
    players: [mocPlayer1, mocPlayer2],
    currentPlayerId: 'asdasd',
    gameDirrection: 1,
  };

  const getNewShuffledDeck = () => {
    let cards: CardType[] = [];

    COLORS.forEach((color: string) => {
      for (let i = 0; i <= 9; i++) {
        cards.push({color, value: i.toString()})
      }

      SPECIAL_CARDS.forEach(item => {
        cards.push({color, value: item})
      })
      SPECIAL_CARDS.forEach(item => {
        cards.push({color, value: item})
      })
    })

    WILD_CARDS.forEach((item) => {
      cards.push({color: 'wild', value: item})
    })
    WILD_CARDS.forEach((item) => {
      cards.push({color: 'wild', value: item})
    })

    return cards
  }

  const getNextPlayer = ({currentPlayerId,game}: {currentPlayerId: string, game: gameType}) => {
    if (game.players.findIndex(player => player.id === currentPlayerId) === game.players.length) {
      return game.players[0]
    } 
    return game.players[game.players.findIndex(player => player.id === currentPlayerId) + 1]
  }

  const nextTurn = ({game}: {game: gameType}) => {
    game.currentPlayerId = getNextPlayer({currentPlayerId: game.currentPlayerId, game}).id
  }

  const isPlayable = ({topCard, playedCard}: {topCard: CardType, playedCard: CardType}) => {
    return playedCard.color === topCard.color || playedCard.value === topCard.value || playedCard.color === 'wild' || topCard.value === 'wild'
  }

  const nextPlayerDraw = ({drawAmount, game}: {drawAmount: number, game: gameType}) => {
    const nextPlayer = getNextPlayer({currentPlayerId: game.currentPlayerId, game});
    const topCard = game.deck.pop();

    if (topCard) {
        for (let i = 0; i <= drawAmount; i++) {
           nextPlayer.hand.push(topCard)
        }
      } else {
        console.log('no cards in deck left');
      }
  }

  const handleSkipTurn = ({game}: {game: gameType}) => {
    const nextPlayerId = getNextPlayer({currentPlayerId: game.currentPlayerId, game}).id;
    const playerAfterNextPlayer = getNextPlayer({currentPlayerId: nextPlayerId, game});

    game.currentPlayerId = playerAfterNextPlayer.id
  }

  const handleCardPlay = ({playedCard, game}: {playedCard: CardType, game: gameType}) => {
    if (isPlayable({playedCard, topCard: game.currentPile[game.currentPile.length - 1]})) {
      if (playedCard.value === 'skip') {
        handleSkipTurn({game})
      }

      if (playedCard.value === 'draw_2') {
        nextPlayerDraw({drawAmount: 2, game})
      }

      if (playedCard.value === 'wild_draw_4') {
        nextPlayerDraw({drawAmount: 4, game})
        handleSkipTurn({game})
      }

      game.currentPile.push(playedCard)
    }
  }

  const currentPlayerDraw = ({drawAmount, game}: {drawAmount: number, game: gameType}) => {
    const currentPlayer = game.players[game.players.findIndex(player => player.id === game.currentPlayerId)];
    const topCard = game.deck.pop();

    if (topCard) {
        for (let i = 0; i <= drawAmount; i++) {
          currentPlayer.hand.push(topCard)
        }
      } else {
        console.log('no cards in deck left');
  }

  const drawCard = () => {
    currentPlayerDraw({drawAmount: 1, game})
    nextTurn({game});
  }

  // card applayer


  useEffect(() => {
    game.started = true;
    game.deck = getNewShuffledDeck();
  }, [])


  
  

  return (
    <>
        {game.players[1].hand.map((card) => (
          <TouchableOpacity onPress={() => handleCardPlay({playedCard: card, game})}>
            <>
            <Text style={{backgroundColor: card.color === 'wild' ? 'black': card.color}}>
                {card.value}
            </Text>
            </>
          </TouchableOpacity>
          
        ))}
        {/* <Slot /> */}
    </>
  )
}
}

export default App;