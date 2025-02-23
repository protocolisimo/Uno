import { createServer } from 'http';
import { Server } from 'socket.io';
import { userDatabase } from './db.js';

function readRequestBody(req, callback) {
    let body = '';

    req.on('data', chunk => {
        body += chunk.toString();
    });

    req.on('end', () => {
        callback(body);
    });
}

const notFoundHandler = (res) => {
    res.writeHead(404, { 'Content-Type': 'text/plain' });
    res.end('Not Found');
}

const badBodyRequest = (res) => {
    res.writeHead(400, { 'Content-Type': 'text/plain' });
    res.end('dya dya ty cho q q ?');
}

const corsHandler = (req, res) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    if (req.method === 'OPTIONS') {
        res.writeHead(204);
        res.end();
        return true;
    }
    return false;
}

const httpServer = createServer(async (req, res) => {
    await userDatabase.connect()
    if (corsHandler(req, res)) return;

    switch (req.method) {
        case 'GET':
            switch (req.url) {
                case '/checkLife':
                    res.writeHead(200, { 'Content-Type': 'application/json' });
                    return res.end(JSON.stringify({ status: 'alive' }));

                default:
                    return notFoundHandler(res);
            };

        case 'POST':
            switch (req.url) {
                case '/sigin':
                    return readRequestBody(req, async (body) => {
                        try {
                            const data = JSON.parse(body);
                            if (!data.userName) {
                                return badBodyRequest(res);
                            }
                            
                            let user = await userDatabase.get(data.userName);

                            if (!user) {
                                user = await userDatabase.insert(data.userName);
                            }

                            res.writeHead(200, { 'Content-Type': 'application/json' });
                            res.end(JSON.stringify({ status: 'success', data: {user} }));
                            
                        } catch (error) {
                            badBodyRequest(res)
                        }                
                    });

                default:
                    return notFoundHandler(res);
            };

        default:
            return notFoundHandler(res);
    }
});

const io = new Server(httpServer, {
    cors: {
        origin: ['*', 'http://localhost:8081', 'exp://192.168.0.146:8081'], // Replace with actual client URL
        methods: ['GET', 'POST'],
    }
});

const COLORS = ['green', 'yellow', 'red', 'blue'];
const SPECIAL_CARDS = ['skip', 'draw_2', 'reverse'];
const WILD_CARDS = ['wild', 'draw_4'];

class Game {
    constructor() {
        this.deck = this.createDeck();
        this.discardedPile = [];
        this.players = [];
        this.currentPlayer = 0;
        this.gameDirection = 1;
    }

    createDeck() {
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

        return deck.sort(() => Math.random() - 0.5);
    }

    addPlayer(playerId) {
        if (this.players.some(player => player.id === playerId)) return;

        const player = {
            id: playerId,
            hand: this.deck.splice(0, 7),
        };
        this.players.push(player);
    }

    nextTurn() {
        if (this.players.length < 2) return;

        let newIndex = (this.currentPlayer + this.gameDirection + this.players.length) % this.players.length;

        while (!this.players[newIndex] || this.players[newIndex].disconnected) {
            newIndex = (newIndex + this.gameDirection + this.players.length) % this.players.length;
        }

        this.currentPlayer = newIndex;
    }

    drawCard(playerId) {
        if (this.deck.length === 0) this.refillDeck();
        if (this.deck.length === 0) return;

        const player = this.players.find(player => player.id === playerId);
        if (!player) return;

        player.hand.push(this.deck.pop());
    }

    refillDeck() {
        if (this.discardedPile.length === 0) return;

        this.deck = [...this.discardedPile];
        this.discardedPile = [];
        this.deck.sort(() => Math.random() - 0.5);
    }

    playCard(playerId, cardIndex) {
        const currentPlayer = this.players[this.currentPlayer];
        if (!currentPlayer || currentPlayer.id !== playerId) return false;

        const card = currentPlayer.hand[cardIndex];
        const topCard = this.discardedPile[this.discardedPile.length - 1];
        if (topCard && topCard.color !== 'wild' && card.color !== 'wild' && card.color !== topCard.color && card.type !== topCard.type) {
            return false;
        }

        currentPlayer.hand.splice(cardIndex, 1);
        this.discardedPile.push(card);
        this.applyCardEffect(card);
        return true;
    }

    applyCardEffect(card) {
        if (card.type === 'skip') {
            this.nextTurn();
            this.nextTurn();
        } else if (card.type === 'draw_2') {
            const nextPlayer = this.players[(this.currentPlayer + this.gameDirection + this.players.length) % this.players.length];
            for (let i = 0; i < 2; i++) this.drawCard(nextPlayer.id);
            this.nextTurn();
            this.nextTurn();
        } else if (card.type === 'draw_4') {
            const nextPlayer = this.players[(this.currentPlayer + this.gameDirection + this.players.length) % this.players.length];
            for (let i = 0; i < 4; i++) this.drawCard(nextPlayer.id);
            this.nextTurn();
            this.nextTurn();
        } else if (card.type === 'reverse') {
            this.gameDirection *= -1;
            this.nextTurn();
        } else {
            this.nextTurn();
        }
    }
}

let roomsList = {
    'test': {
        roomName: 'test',
        gameState:  new Game()
    },
    'test1': {
        roomName: 'test1',
        gameState:  new Game()
    },
    'test3': {
        roomName: 'test3',
        gameState:  new Game()
    }
};

io.on('connection', (socket) => {
    socket.emit('connected', socket.id, roomsList);
    
    socket.on('createRoom', (roomName, cb) => {
        console.log(socket.id, 'createRoom', roomName)
        const game = new Game()

        roomsList[roomName] = {roomName, gameState: game};
        const gameState = roomsList[roomName].gameState;
        gameState.addPlayer(socket.id);
        io.emit('rooms', roomsList);
    });
    
    socket.on('joinRoom', (roomName, cb) => {
        console.log(socket.id, 'joinRoom', roomName)
        socket.join(roomName);
        
        const gameState = roomsList[roomName].gameState;
        gameState.addPlayer(socket.id);
        
        io.in(roomName).emit('gameState', gameState);
        cb();
    })

    socket.on('getRooms', (cb) => {
        io.emit('rooms', roomsList);
    })
    
    socket.on('playCard', ({ cardIndex, playerId, roomName }) => {
        console.log('playCard', { cardIndex, playerId, roomName })
        const gameState = roomsList[roomName].gameState

        if (!gameState.playCard(playerId, cardIndex)) {
            return;
        }
        io.in(roomName).emit('gameState', gameState);
    });

    socket.on('drawCard', ({playerId, roomName}) => {
        const gameState = roomsList[roomName].gameState;
        if (gameState.players[gameState.currentPlayer]?.id !== playerId) {
            return;
        }
        gameState.drawCard(playerId);
        gameState.nextTurn();
        io.to(roomName).emit('gameState', gameState);
    });

    socket.on('leave', ({playerId, roomName}) => {
        const gameState = roomsList?.[roomName]?.gameState;

        console.log(gameState, roomName, playerId)
        
        if (gameState?.players.length === 0) {
            delete roomsList?.[roomName]
        } else {
            if (playerId === gameState?.players[gameState.currentPlayer]?.id) {
                const filterArr = gameState?.players?.filter(player => player.id !== playerId);
                gameState.players = filterArr
                gameState.nextTurn();
            }
        }

        io.in(roomName).emit('gameState', gameState);
    });
});


httpServer.listen(3500, () => console.log('Server running on port 3500'));