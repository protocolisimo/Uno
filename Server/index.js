import { createServer } from 'http'
import { Server } from 'socket.io'



const server = createServer((req, res) => {
    // Check the request URL and method for the health check route
    if (req.url === '/health' && req.method === 'GET') {
      // Set the response status code to 200 (OK)
      res.writeHead(200, { 'Content-Type': 'application/json' });
      
      // Send a JSON response indicating the server is healthy
      res.end(JSON.stringify({ status: 'OK', message: 'Server is healthy' }));
    } else {
      // For any other route, respond with 404
      res.writeHead(404, { 'Content-Type': 'text/plain' });
      res.end('Not Found');
    }
  });
  
  // Set the server to listen on port 3000
  server.listen(3000, () => {
    console.log('Server is running on http://localhost:3000');
  });


const httpServer = new createServer()

const io = new Server(httpServer, {
    cors: {
        origin: '*',
        methods: ['GET', 'POST'],
    }
})

const COLORS = ['green', 'yellow', 'red', 'blue'];
const SPECIAL_CARDS = ['skip', 'draw_2', 'reverse'];
const WILD_CARDS = ['wild', 'draw_4'];

const getDeck = () => {
    let deck = [];

    COLORS.forEach(color => {
        for (let i = 0; i <= 9; i++) {
            deck.push({ color, type: `${i}` });
        }
        SPECIAL_CARDS.forEach(type => {
            deck.push({ color, type });
        });
    });

    for (let i = 0; i < 4; i++) {
        WILD_CARDS.forEach(type => {
            deck.push({ color: 'wild', type });
        });
    }

    return deck.map(card => ({ ...card, sort: Math.random() }))
        .sort((a, b) => a.sort - b.sort)
        .map(({ color, type }) => ({ color, type }));
};

const gameState = {
    deck: getDeck(),
    discardedPile: [],
    players: [],
    currentPlayer: 0,
    gameDirection: 1,
};

const drawCard = (playerIndex) => {
    if (gameState.deck.length === 0) {
        console.log("Deck is empty!");
        return;
    }

    const card = gameState.deck.pop();
    gameState.players[playerIndex].hand.push(card);
};

const playCardEffect = (card, playerId) => {

    if (card.type === 'skip') {
        const nextPlayerIndex = (gameState.currentPlayer + gameState.gameDirection + gameState.players.length) % gameState.players.length;
        gameState.currentPlayer = (nextPlayerIndex + gameState.gameDirection + gameState.players.length) % gameState.players.length;
    } else if (card.type === 'draw_2') {
        const nextPlayerIndex = (gameState.currentPlayer + gameState.gameDirection + gameState.players.length) % gameState.players.length;
        for (let i = 0; i < 2; i++) {
            drawCard(nextPlayerIndex);
        }
        gameState.currentPlayer = (nextPlayerIndex + gameState.gameDirection + gameState.players.length) % gameState.players.length;
    } else if (card.type === 'draw_4') {
        const nextPlayerIndex = (gameState.currentPlayer + gameState.gameDirection + gameState.players.length) % gameState.players.length;
        for (let i = 0; i < 4; i++) {
            drawCard(nextPlayerIndex);
        }
        gameState.currentPlayer = (nextPlayerIndex + gameState.gameDirection + gameState.players.length) % gameState.players.length;
    } else if (card.type === 'reverse') {
        gameState.gameDirection *= -1;
        gameState.currentPlayer = (gameState.currentPlayer + gameState.gameDirection + gameState.players.length) % gameState.players.length;
    } else {

        gameState.currentPlayer = (gameState.currentPlayer + gameState.gameDirection + gameState.players.length) % gameState.players.length;
    }
};

const players = []

io.on('connection', (socket) => {
    socket.on('getGame', () => {
        io.emit('gameState', gameState);
    })

    socket.on('joinGame', (playerId) => {

        if (!players.some(player => player.id === playerId)) {
            const player = {
                id: socket.id,
                hand: gameState.deck.splice(0, 7),
            };

            gameState.players.push(player);
        }
        io.emit('gameState', gameState);
    });

    socket.on('playCard', ({ cardIndex, playerId }) => {
        const currentPlayer = gameState.players[gameState.currentPlayer];

        if (playerId !== currentPlayer.id) {
            console.log('Not your turn!');
            return;
        }

        const card = currentPlayer.hand.splice(cardIndex, 1)[0];
        gameState.discardedPile.push(card);

        playCardEffect(card, currentPlayer.id);

        io.emit('gameState', gameState);
    });

    socket.on('drawCard', (playerId) => {
        const currentPlayer = gameState.players[gameState.currentPlayer];

        if (playerId !== currentPlayer.id) {
            console.log('Not your turn!');
            return;
        }

        drawCard(gameState.currentPlayer);
        gameState.currentPlayer = (gameState.currentPlayer + gameState.gameDirection + gameState.players.length) % gameState.players.length;

        io.emit('gameState', gameState);
    });


    socket.on('disconnect', () => {
        console.log('Player disconnected:', socket.id);

        gameState.players = gameState.players.filter(player => player.id !== socket.id);

        if (gameState.players.length === 0) {

            Object.assign(gameState, {
                deck: getDeck(),
                discardedPile: [],
                players: [],
                currentPlayer: 0,
                gameDirection: 1,
            });
        }

        io.emit('gameState', gameState);
    });
});

httpServer.listen(3500, () => console.log('connected'))