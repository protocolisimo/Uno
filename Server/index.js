import { createServer } from 'http';
import { Server } from 'socket.io';

// Create HTTP Server
const httpServer = createServer((req, res) => {
    if (req.method === 'GET' && req.url === '/checkLife') {
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ status: 'alive' }));
    } else {
        res.writeHead(404, { 'Content-Type': 'text/plain' });
        res.end('Not Found');
    }
});

// Secure CORS Configuration
const io = new Server(httpServer, {
    cors: {
        origin: ['*'], // Replace with actual client URL
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

        return deck.map(card => ({ ...card, sort: Math.random() }))
            .sort((a, b) => a.sort - b.sort)
            .map(({ color, type }) => ({ color, type }));
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
        this.currentPlayer = (this.currentPlayer + this.gameDirection + this.players.length) % this.players.length;
    }

    drawCard(playerId) {
        if (this.deck.length === 0) this.refillDeck();
        if (this.deck.length === 0) return; // If still empty after trying to refill

        const playerIndex = this.players.findIndex(player => player.id === playerId);
        if (playerIndex === -1) return;

        const card = this.deck.pop();
        this.players[playerIndex].hand.push(card);
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

        const card = currentPlayer.hand.splice(cardIndex, 1)[0];
        this.discardedPile.push(card);
        this.applyCardEffect(card);
        this.nextTurn();
        return true;
    }

    applyCardEffect(card) {
        if (card.type === 'skip') {
            this.nextTurn();
        } else if (card.type === 'draw_2') {
            const nextPlayer = (this.currentPlayer + this.gameDirection + this.players.length) % this.players.length;
            for (let i = 0; i < 2; i++) this.drawCard(this.players[nextPlayer].id);
            this.nextTurn();
        } else if (card.type === 'draw_4') {
            const nextPlayer = (this.currentPlayer + this.gameDirection + this.players.length) % this.players.length;
            for (let i = 0; i < 4; i++) this.drawCard(this.players[nextPlayer].id);
            this.nextTurn();
        } else if (card.type === 'reverse') {
            this.gameDirection *= -1;
            this.nextTurn();
        } else {
            this.nextTurn();
        }
    }
}

// Initialize Game State
const gameState = new Game();

// Socket.io Events
io.on('connection', (socket) => {
    console.log(`Player connected: ${socket.id}`);

    socket.on('getGame', () => {
        io.emit('gameState', gameState);
    });

    socket.on('joinGame', (playerId) => {
        gameState.addPlayer(socket.id);
        io.emit('gameState', gameState);
    });

    socket.on('playCard', ({ cardIndex, playerId }) => {
        if (!gameState.playCard(playerId, cardIndex)) {
            socket.emit('error', { message: 'Not your turn!' });
            return;
        }
        io.emit('gameState', gameState);
    });

    socket.on('drawCard', (playerId) => {
        if (gameState.players[gameState.currentPlayer]?.id !== playerId) {
            socket.emit('error', { message: 'Not your turn!' });
            return;
        }
        gameState.drawCard(playerId);
        gameState.nextTurn();
        io.emit('gameState', gameState);
    });

    socket.on('disconnect', () => {
        console.log(`Player disconnected: ${socket.id}`);

        gameState.players = gameState.players.filter(player => player.id !== socket.id);

        // If all players leave, reset the game
        if (gameState.players.length === 0) {
            Object.assign(gameState, new Game());
        }

        io.emit('gameState', gameState);
    });
});

// Start Server
httpServer.listen(3500, () => console.log('Server running on port 3500'));