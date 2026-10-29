/**
 * ElizaOS Plugin Types & Interfaces
 */

export interface Memory {
  id?: string;
  userId?: string;
  agentId?: string;
  createdAt?: number;
  content: {
    text: string;
    action?: string;
    source?: string;
    url?: string;
    inReplyTo?: string;
    attachments?: any[];
    [key: string]: any;
  };
  embedding?: number[];
  roomId?: string;
  unique?: boolean;
}

export interface State {
  [key: string]: any;
}

export interface HandlerCallback {
  (response: { text: string; action?: string; content?: any }): void | Promise<void>;
}

export interface IAgentRuntime {
  getSetting(key: string): string | undefined;
  composeState?(message: Memory, additionalKeys?: any): Promise<State>;
  updateRecentMessageState?(state: State): Promise<State>;
  [key: string]: any;
}

export interface ActionExample {
  user: string;
  content: {
    text: string;
    action?: string;
    [key: string]: any;
  };
}

export interface Action {
  name: string;
  similes: string[];
  description: string;
  validate: (runtime: IAgentRuntime, message: Memory, state?: State) => Promise<boolean>;
  handler: (
    runtime: IAgentRuntime,
    message: Memory,
    state?: State,
    options?: any,
    callback?: HandlerCallback
  ) => Promise<boolean | any>;
  examples: ActionExample[][];
}

export interface Provider {
  name?: string;
  get: (runtime: IAgentRuntime, message: Memory, state?: State) => Promise<string | null>;
}

export interface Plugin {
  name: string;
  description: string;
  actions: Action[];
  providers: Provider[];
  evaluators?: any[];
  services?: any[];
}
