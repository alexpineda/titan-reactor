import create from "zustand";

import { Player } from "../../common/types";

export const CHAT_INTERVAL = 4000;

let _chatIndex = 0;

export type ChatMessage = {
    content: string;
    player: Player;
    id?: number;
};

export type ChatStore = {
    chat: ChatMessage[];
    lastChatAdd: number;
    addChatMessage: (message: ChatMessage) => void;
    removeOneFromChat: () => void;
};

export const useChatStore = create<ChatStore>((set, get) => ({
    chat: [],
    lastChatAdd: Date.now(),
    addChatMessage: (msg) => {
        let chat = [...get().chat, { ...msg, id: _chatIndex++ }];
        if (chat.length > 10) {
            chat = chat.slice(1);
        }
        set({
            chat,
            lastChatAdd: Date.now(),
        });
    },
    removeOneFromChat: () => {
        if (Date.now() - get().lastChatAdd < CHAT_INTERVAL) {
            return;
        }
        set((state) => ({ chat: state.chat.slice(1) }));
    },
}));

export default () => useChatStore.getState();

