import { HydrateFlavor } from '@grammyjs/hydrate';
import { Context, SessionFlavor } from 'grammy';
import {
    type Conversation,
    type ConversationFlavor,
} from '@grammyjs/conversations';
import { FileFlavor } from '@grammyjs/files';

export interface SessionData {
    spamCounter: number;
}
export type SessionContext = Context & SessionFlavor<SessionData>;
export type HydrateContext = HydrateFlavor<SessionContext>;
export type FileContext = FileFlavor<HydrateContext>;
export type BotContext = FileContext & ConversationFlavor;
export type ConverstaionContext = Conversation<BotContext>;
