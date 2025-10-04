import { NbChatMessageFile } from "@nebular/theme";

export interface IChatMessage {
   text: any; 
   date: Date;
   reply: boolean;
   type: string;
   files: NbChatMessageFile[];
   user: {  
      name: string;
      avatar: string;
   };
   quote: string;
   latitude: number;
   longitude: number;
}