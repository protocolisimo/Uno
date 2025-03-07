import { createContext, ReactNode, useContext, useEffect, useRef, useState } from "react";
import { io, Socket } from "socket.io-client";


type Card = {

}


type GameState = {
    players: [],
    deck: Card[],
    discardedPile: [],
    currentPlayer: number,
    gameDirection: number,
}

export const SocketContext = createContext<{ socket: Socket, gameState: GameState, roomName: string, rooms: string[], isConected: true, is: string } | null>(null);

export const useSocket = () => useContext(SocketContext);

export const SocketProvider = ({ children }: { children: ReactNode }) => {
    const [isContected, setIsConected] = useState(false);
    const [rooms, setRooms] = useState([]);
    const [roomName, setRoomName] = useState<string | null>();

    const [gameState, setGameState] = useState({
        players: [],
        deck: [],
        discardedPile: [],
        currentPlayer: 0,
        gameDirection: 1,
    });

    const [id, setId] = useState();

    const socket = useRef<Socket | null>(null);

    useEffect(() => {
        try {
            setIsConected(false);
            socket.current = io("https://uno-server-cat3.onrender.com");
//             socket.current = io("http://localhost:3500");
            socket.current.on('connected', (playerId, roomsList) => {
                setIsConected(true);
                setId(playerId)
                setRooms(roomsList)
            });
            socket.current.emmit('getRooms', (r)=> {
                console.log({r})
                setRooms(r)
            })
            socket.current.on('rooms', (roomsList) => {
                console.log({roomsList})
                setRooms(roomsList)
            });
            socket.current.on('gameState', (state) => {
                console.log('asdasdsdasdasd', state)
                setGameState(state);
            });
        } catch (e) {
            setIsConected(false)
        }

        return () => {
            if (socket) {
                console.log("Socket disconnected");
                socket.current?.off("gameState");
                socket.current?.off("rooms");
                socket.current?.off("connected");
                socket.current?.disconnect();
            }
        };
    }, [])

    return (
        <SocketContext.Provider value={{ rooms, roomName, gameState, id, isContected, socket }}>
            {children}
        </SocketContext.Provider>
    )

}