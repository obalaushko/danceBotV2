import { HydrateFlavor } from '@grammyjs/hydrate';
import { Context, SessionFlavor } from 'grammy';
import {
    type Conversation,
    type ConversationFlavor,
} from '@grammyjs/conversations';
import { FileFlavor } from '@grammyjs/files';

/**
 * Represents the possible actions for the dance bot.
 * It can be one of the following:
 * - 'Role': Represents an action related to roles.
 * - 'Notifications': Represents an action related to notifications.
 * - 'TotalLessons': Represents an action related to total lessons.
 * - 'UsedLessons': Represents an action related to used lessons.
 * - null: Represents no action.
 * @deprecated
 */
export type Action =
    | 'Role'
    | 'Notifications'
    | 'TotalLessons'
    | 'UsedLessons'
    | null;

export interface SessionData {
    editedUserId: number | null;
    editedActions: Action;
    spamCounter: number;
    blackList: number[];
}
export type SessionContext = Context & SessionFlavor<SessionData>;
export type HydrateContext = HydrateFlavor<SessionContext>;
export type FileContext = FileFlavor<HydrateContext>;
export type BotContext = FileContext & ConversationFlavor;
export type ConverstaionContext = Conversation<BotContext>;
