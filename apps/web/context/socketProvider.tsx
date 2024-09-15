'use client';
import React, { useCallback, useContext, useEffect, useState } from "react";
import {io,Socket} from "socket.io-client";

interface SocketProviderProp {
    children?: React.ReactNode;
}

interface ISocketContext{
    sendMessage: (msg : string) => any;
    messages : string[];
}
const SocketContext = React.createContext <ISocketContext | null >(null);

export const useSocket = () =>{
    const state = useContext(SocketContext);
    if(!state) throw new Error (`state is undefined`);

    return state;
};

export const SocketProvider: React.FC <SocketProviderProp> = ({children}) => {

    const [socket , setsocket] = useState<Socket>();
    const [messages , setmessages] = useState<string[]>([]);

    const sendMessage: ISocketContext['sendMessage'] = useCallback(
        (msg)=>{
        console.log("send message ", msg);
        if(socket){
            socket.emit('event:message' , {message: msg})
        }
    },[socket]);

    const onMessageReci = useCallback((msg : string)=>{
        console.log("message recieves from server: ", msg)
        const {message} = JSON.parse(msg) as {message:string} 
        setmessages (prev => [...prev,message]);
    }, []);

    useEffect(()=>{
        const _socket = io("http://localhost:3001");
        _socket.on('message',onMessageReci);
        setsocket(_socket);

        return () => {
            _socket.disconnect();
            _socket.off('message',onMessageReci);
            setsocket(undefined)
        };
    }, []);
    return(
        <SocketContext.Provider value={{ sendMessage , messages }}>{children}</SocketContext.Provider>
    )
}