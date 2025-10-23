import { NbChatMessageFile } from "@nebular/theme";
import { IChatMessage } from "./common";

export class MessageSchema {
    // set message(arg0: { text: any; date: Date; reply: boolean; type: string; files: any; user: { name: string; avatar: string; }; quote: string; latitude: number; longitude: number; }) {
    //     throw new Error("Method not implemented.");
    // }
    public text: string = '';
    public date: Date = new Date();
    public reply: boolean = false;
    public type: string = 'text';
    public files!: NbChatMessageFile[];
    public user!: {
        name: string;
        avatar: string;
    };
    public name: string = '';
    public avatar: string = '';
    public quote: string = '';
    public latitude: number = 0;
    public longitude: number = 0;

    setMessage(message: IChatMessage) {
        this.text = message.text;
        this.date = message.date;
        this.reply = message.reply;
        this.type = message.type;
        this.files = message.files;
        this.user = message.user;
        this.quote = message.quote;
        this.latitude = message.latitude;
        this.longitude = message.longitude;
    }

    setServerMessage(response: any) {
        console.log('Received message from server:', response); 
        this.text = response?.data.messages[response.data.messages.length - 1].kwargs.content || 'Unable to process your request, kindly refresh the page and try again.';
        this.date = response.date;
        this.reply = false;
        this.type = "text";
        this.files = [];
        this.user = { name: 'AI', avatar: 'assets/images/bot.png' };
        this.quote = response?.quote;
        this.latitude = response?.latitude;
        this.longitude = response?.longitude;
    }

    getMessage(): IChatMessage {
        return {
            text: this.text,
            date: this.date,
            reply: this.reply,
            type: this.type,
            files: this.files,
            user: this.user,
            quote: this.quote,
            latitude: this.latitude,
            longitude: this.longitude
        };
    }
} 