import { Context, SessionFlavor } from 'grammy';
import {
    type Conversation,
    type ConversationFlavor,
} from '@grammyjs/conversations';

export type Action =
    | 'Role'
    | 'Notifications'
    | 'TotalLessons'
    | 'UsedLessons'
    | null;

interface SessionData {
    editedUserId: number | null;
    editedActions: Action;
}
export type SessionContext = Context & SessionFlavor<SessionData>;
export type BotContext = SessionContext & ConversationFlavor;
export type ConverstaionContext = Conversation<BotContext>;
