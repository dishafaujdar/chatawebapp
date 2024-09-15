import { Kafka, Producer } from "kafkajs";
import fs from "fs";
import  path from "path";
import prismaClient from "./prisma";
import * as dotenv from 'dotenv';
dotenv.config(); 


const kafka = new Kafka({
    brokers : [process.env.KAFKA_BROKER as string],
    ssl :{
        ca : [fs.readFileSync(path.resolve("./ca.pem"),"utf-8")],
    },
    sasl: {
        username: process.env.KAFKA_username as string,
        password: process.env.KAFKA_password as string,
        mechanism: "plain",
    }
});

let producer: null | Producer = null;

export async function createProducet() {
    if(producer) return producer;   

    const _producer = kafka.producer();
    await _producer.connect();
    producer = _producer;
    return producer;
}

export async function ProduceMessage(message: string) {
    const producer = await createProducet();
    await producer.send({
        messages: [{ key:`message-${Date.now()}`, value: message }],
        topic : "MESSAGE"
    })
    return true;
}

export async function Startconsumer() {
    const consumer = kafka.consumer({ groupId: 'default'});
    await consumer.connect();
    await consumer.subscribe({topic: "MESSAGE", fromBeginning: true});

    await consumer.run({
        autoCommit: true,
        eachMessage: async ({message,pause})=>{
            if(!message.value) return;
            console.log(`new msg recieved..`)
            try {
                await prismaClient.messages.create({
                    data:{
                        text : message.value?.toString(),
                    }
                });
            } catch (error) {
                console.log("something is wrong"),
                pause();
                setTimeout(()=>{consumer.resume([{topic: 'message'}])}, 60*1000)
                
            }
        }
    })
    
}

export default Kafka;