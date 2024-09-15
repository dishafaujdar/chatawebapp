import {Server} from 'socket.io';
import { Redis } from 'ioredis';
import { ProduceMessage } from './kafka';
import * as dotenv from 'dotenv';
dotenv.config(); 

const pub = new Redis({
    host: process.env.REDIS_HOST as string,
    port: parseInt(process.env.REDIS_PORT || '16519'),
    username: process.env.REDIS_USERNAME as string,
    password: process.env.REDIS_PASSWORD as string,
});

const sub = new Redis({
    host: process.env.REDIS_HOST as string,
    port: parseInt(process.env.REDIS_PORT || '16519'),
    username: process.env.REDIS_USERNAME as string,
    password: process.env.REDIS_PASSWORD as string,
});


class Socketservice {
    private _io : Server
    constructor(){
        console.log("init socket servise...");
        this._io = new Server({
            cors : {
                allowedHeaders: ["*"],
                origin: "*"
            }
        });
        sub.subscribe('MESSAGE');
    }
    public initListener(){
        console.log("Initalize socket listners👂...");
        const io = this._io;
        io.on('connect', (socket)=>{
            console.log("new connection has been made with id: ", socket.id);
        
            socket.on('event:message',async ({message}:{message : String})=>{
                console.log("new msg recieved: ", message); 
                await pub.publish("MESSAGE", JSON.stringify({ message }));
            });
        });

        sub.on('message', async (channel , message)=>{
                if(channel == 'MESSAGE'){
                    io.emit("message", message);
                }
                await ProduceMessage(message);
                console.log("message produce to kafka broker");
        })
    }
    get io(){
        return this._io;
    }
};
export default Socketservice;