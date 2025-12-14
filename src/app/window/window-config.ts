import { Signal, WritableSignal } from '@angular/core';

export interface WindowConfig<T = any> {
  id: string;
  title: string;
  data?: T;
  contentComponent: any;
  isMinimized: WritableSignal<boolean>;
  isMaximized: WritableSignal<boolean>;
  placeholder: string;
  maximizedStyles?: { [key: string]: string }; 
  // Add more state properties like position, zIndex, etc.
}