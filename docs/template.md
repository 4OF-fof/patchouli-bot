# コマンド実装テンプレート

## ディレクトリ構成

```
src/commands/<command-name>/
  index.ts        # Command 定義 (名前、説明、トリガー登録)
  execute*.ts     # ハンドラ実装 (1つまたは複数)
```

## 型システム

### コンテキスト型一覧

| 型 | トリガー | 固有フィールド |
|---|---|---|
| `SlashContext` | スラッシュコマンド | `interaction: ChatInputCommandInteraction` |
| `UserContextMenuContext` | ユーザー右クリックメニュー | `interaction: UserContextMenuCommandInteraction`, `targetUser: User` |
| `MessageContextMenuContext` | メッセージ右クリックメニュー | `interaction: MessageContextMenuCommandInteraction`, `message: Message` |
| `MessageContext` | キーワード一致 | `message: Message` |

全コンテキスト共通フィールド (`BaseContext`):
- `executor: User` - コマンド実行者
- `reply(options)` - 返信ヘルパー (interaction/message の差異を吸収)

### ハンドラの引数型の選び方

- **全トリガー共通**の処理 → `BaseContext` を使用 (`executor` と `reply` のみアクセス可能)
- **特定トリガー専用**の処理 → 個別の型 (`SlashContext` 等) を使用

`BaseContext` を使えば、そのコンテキストに存在しないフィールドへのアクセスはコンパイルエラーになる。

## Command 定義 (`index.ts`)

```typescript
import type { Command } from "../../types";
import { executeExample } from "./executeExample.js";

export const example: Command = {
  name: "example",
  description: "コマンドの説明",

  // 有効にするトリガーだけ定義する。未定義のトリガーでは実行されない。
  slash:          { execute: executeExample },
  userContext:    { execute: executeExample },
  messageContext: { execute: executeExample },
  message:        { keywords: ["example"], execute: executeExample },
};
```

## ハンドラ実装パターン

### 全トリガー共通

```typescript
import type { BaseContext } from "../../types";

export const executeExample = async (ctx: BaseContext) => {
  await ctx.reply({ content: `実行者: ${ctx.executor.username}` });
};
```

### 特定トリガー専用

```typescript
import type { UserContextMenuContext } from "../../types";

export const executeUserInfo = async (ctx: UserContextMenuContext) => {
  await ctx.reply({
    content: `対象ユーザー: ${ctx.targetUser.username}`,
  });
};
```

### トリガーごとに異なるハンドラを割り当てる

```typescript
import type { Command } from "../../types";
import { executeSlash } from "./executeSlash.js";
import { executeFromMessage } from "./executeFromMessage.js";

export const example: Command = {
  name: "example",
  description: "コマンドの説明",
  slash:   { execute: executeSlash },
  message: { keywords: ["example"], execute: executeFromMessage },
};
```

## コマンドの登録

`src/commands/index.ts` の `commandList` 配列に追加する。
配列内の順序がメッセージ系コマンド (message) のマッチ優先度になる。

```typescript
import { example } from "./example";

export const commandList: Command[] = [ping, example];
```

## テスト

テストでは `BaseContext` や各コンテキスト型に合わせたモックを作成する。

```typescript
import { describe, it, expect, vi } from "vitest";
import { executeExample } from "../../src/commands/example/executeExample.js";

describe("executeExample", () => {
  it("should reply", async () => {
    const mockReply = vi.fn().mockResolvedValue(undefined);
    const ctx = {
      executor: { username: "testuser" },
      reply: mockReply,
    } as any;

    await executeExample(ctx);

    expect(mockReply).toHaveBeenCalledWith({
      content: "実行者: testuser",
    });
  });
});
```
