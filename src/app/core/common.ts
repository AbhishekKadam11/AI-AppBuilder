import { NbChatMessageFile } from "@nebular/theme";

export type TreeNode<T> = {
  data: T;
  children?: TreeNode<T>[];
};

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

type IAttribute = { type: string; label: string; icon: string, url: string };

export type NodeData = {
  appName: string;
  visible: boolean;
  label: string;
  type: string;
  description: string;
  tooltip: string;
  dataSource: Record<string, any>[];
  attribute: IAttribute;
};

export type FSEntry = {
  name: string;
  type: string;
  path: string;
};

export type IData = {
  type: string;
  label: string;
  icon: string;
};
