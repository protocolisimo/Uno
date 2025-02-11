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
        origin: ['*', 'http://localhost:8081'], // Replace with actual client URL
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
        if (this.players.length < 2) return; // Prevents endless loop if only one player

        let newIndex = (this.currentPlayer + this.gameDirection + this.players.length) % this.players.length;
        
        while (!this.players[newIndex] || this.players[newIndex].disconnected) {
            newIndex = (newIndex + this.gameDirection + this.players.length) % this.players.length;
        }

        this.currentPlayer = newIndex;
    }

    drawCard(playerId) {
        if (this.deck.length === 0) this.refillDeck();
        if (this.deck.length === 0) return; // If still empty after trying to refill

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

        // Validate the move
        if (topCard && card.color !== 'wild' && card.color !== topCard.color && card.type !== topCard.type) {
            return false; // Invalid move
        }

        currentPlayer.hand.splice(cardIndex, 1);
        this.discardedPile.push(card);
        this.applyCardEffect(card);
        this.nextTurn();
        return true;
    }

    applyCardEffect(card) {
        if (card.type === 'skip') {
            this.nextTurn();
        } else if (card.type === 'draw_2') {
            const nextPlayer = this.players[(this.currentPlayer + this.gameDirection + this.players.length) % this.players.length];
            for (let i = 0; i < 2; i++) this.drawCard(nextPlayer.id);
            this.nextTurn();
        } else if (card.type === 'draw_4') {
            const nextPlayer = this.players[(this.currentPlayer + this.gameDirection + this.players.length) % this.players.length];
            for (let i = 0; i < 4; i++) this.drawCard(nextPlayer.id);
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

    socket.on('playCard', ({ cardIndex, playerId }, callback) => {
        if (!gameState.playCard(playerId, cardIndex)) {
            callback({ success: false, message: 'Invalid move!' });
            return;
        }
        io.emit('gameState', gameState);
        callback({ success: true });
    });

    socket.on('drawCard', (playerId, callback) => {
        if (gameState.players[gameState.currentPlayer]?.id !== playerId) {
            callback({ success: false, message: 'Not your turn!' });
            return;
        }
        gameState.drawCard(playerId);
        gameState.nextTurn();
        io.emit('gameState', gameState);
        callback({ success: true });
    });

    socket.on('disconnect', () => {
        console.log(`Player disconnected: ${socket.id}`);
        gameState.players = gameState.players.filter(player => player.id !== socket.id);

        if (gameState.players.length === 0) {
            Object.assign(gameState, new Game());
        } else {
            if (!gameState.players.find(player => player.id === gameState.players[gameState.currentPlayer]?.id)) {
                gameState.nextTurn();
            }
        }

        io.emit('gameState', gameState);
    });
});

// Start Server
httpServer.listen(3500, () => console.log('Server running on port 3500'));