import {
  Candidate,
  Context,
  DdcCompleteItems,
  DdcEvent,
  DdcOptions,
  OnCallback,
  SourceOptions,
} from "../types.ts";
import { Denops } from "../deps.ts";

export type OnInitArguments<Params extends Record<string, unknown>> = {
  denops: Denops;
  sourceOptions: SourceOptions;
  sourceParams: Params;
};

export type OnEventArguments<Params extends Record<string, unknown>> = {
  denops: Denops;
  context: Context;
  onCallback: OnCallback;
  options: DdcOptions;
  sourceOptions: SourceOptions;
  sourceParams: Params;
};

export type OnCompleteDoneArguments<
  Params extends Record<string, unknown>,
  UserData extends unknown = unknown,
> = {
  denops: Denops;
  context: Context;
  onCallback: OnCallback;
  options: DdcOptions;
  sourceOptions: SourceOptions;
  sourceParams: Params;
  // To prevent users from accessing internal variables.
  userData: UserData;
};

export type GetCompletePositionArguments<
  Params extends Record<string, unknown>,
> = {
  denops: Denops;
  context: Context;
  onCallback: OnCallback;
  options: DdcOptions;
  sourceOptions: SourceOptions;
  sourceParams: Params;
};

export type GatherCandidatesArguments<Params extends Record<string, unknown>> =
  {
    denops: Denops;
    context: Context;
    onCallback: OnCallback;
    options: DdcOptions;
    sourceOptions: SourceOptions;
    sourceParams: Params;
    completeStr: string;
    isIncomplete?: boolean;
  };

export abstract class BaseSource<
  Params extends Record<string, unknown>,
  UserData extends unknown = unknown,
> {
  name = "";
  isBytePos = false;
  events: DdcEvent[] = [];
  isInitialized = false;

  apiVersion = 4;

  async onInit(_args: OnInitArguments<Params>): Promise<void> {}

  async onEvent(_args: OnEventArguments<Params>): Promise<void> {}

  async onCompleteDone(
    _args: OnCompleteDoneArguments<Params, UserData>,
  ): Promise<void> {}

  getCompletePosition(
    args: GetCompletePositionArguments<Params>,
  ): Promise<number> {
    const matchPos = args.context.input.search(
      new RegExp("(?:" + args.options.keywordPattern + ")$"),
    );
    const completePos = matchPos != null ? matchPos : -1;
    return Promise.resolve(completePos);
  }

  abstract gatherCandidates(
    {}: GatherCandidatesArguments<Params>,
  ): Promise<DdcCompleteItems<UserData> | Candidate<UserData>[]>;

  abstract params(): Params;
}

export function defaultSourceOptions(): SourceOptions {
  return {
    converters: [],
    dup: false,
    forceCompletionPattern: "",
    ignoreCase: false,
    isVolatile: false,
    mark: "",
    matcherKey: "",
    matchers: [],
    maxAutoCompleteLength: 80,
    maxCandidates: 500,
    maxKeywordLength: 0,
    minAutoCompleteLength: 2,
    minKeywordLength: 0,
    sorters: [],
    timeout: 2000,
  };
}

export function defaultSourceParams(): Record<string, unknown> {
  return {};
}
