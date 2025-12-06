import { NbChatMessageFile } from "@nebular/theme";
import { IChatMessage } from "./common";

type PartialChatMessage = Partial<IChatMessage>;

export class MessageSchema {
    // set message(arg0: { text: any; date: Date; reply: boolean; type: string; files: any; user: { name: string; avatar: string; }; quote: string; latitude: number; longitude: number; }) {
    //     throw new Error("Method not implemented.");
    // }
    public text: string = '';
    public date: Date = new Date();
    public reply: boolean = false;
    public type: string = 'text';
    public files!: NbChatMessageFile[] | undefined;
    public user!: {
        name: string;
        avatar: string;
    };
    public name: string = '';
    public avatar: string = '';
    public quote: string = '';
    public latitude: number = 0;
    public longitude: number = 0;
    public chatMessage: IChatMessage | undefined;

    setMessage(message: IChatMessage | PartialChatMessage) {
        this.text = message.text;
        this.date = message.date || new Date();
        this.reply = true;
        this.type = 'text';
        this.files = message.files;
        this.user = {
        name: 'Creator',
        avatar: 'assets/images/admin.png',
      };
        this.quote = message.quote || '';
        this.latitude = message.latitude || 0;
        this.longitude = message.longitude || 0;
    }

    setServerMessage(response: any) {
        console.log('Received message from server:', response);
        if (response.data && response.data.supervisorMesssage.length !== 0) {
            this.text = response.data && response.data.supervisorMesssage[response.data.supervisorMesssage.length - 1].kwargs.content
        } else {
            this.text = 'Unable to process your request, kindly refresh the page and try again.';
        }
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
            files: this.files || [],
            user: this.user,
            quote: this.quote,
            latitude: this.latitude,
            longitude: this.longitude
        };
    }
} 