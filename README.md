# @cloady/mcp

Local [MCP](https://modelcontextprotocol.io) server for [Cloady](https://cloady.com) — gives AI assistants the whole Cloady API as tools: workspaces, apps, deploys, environment variables, domains, volumes, members, integrations, billing and support tickets.

Generated from Cloady's OpenAPI contract, so every REST operation is a tool named after its operation id (`listVars`, `createVar`, `deployApp`, `execCommand`). It runs over stdio and calls `https://cloady.com` with your API token.

## Setup

For the OAuth-based Claude plugin, see [Cloady for Claude](./plugin). It connects to the hosted MCP endpoint without installing the npm server or copying an API token. The setup below is for the separate local stdio package.

Create an API token in the dashboard under **Account → API tokens**.

### Claude Code

```sh
claude mcp add cloady -e BEARER_TOKEN_CLOADY=cldy_… -- npx -y @cloady/mcp
```

### Claude Desktop / Cursor / any MCP client

```json
{
  "mcpServers": {
    "cloady": {
      "command": "npx",
      "args": ["-y", "@cloady/mcp"],
      "env": { "BEARER_TOKEN_CLOADY": "cldy_…" }
    }
  }
}
```

`API_BASE_URL` overrides the target if you run Cloady elsewhere.

## Tools

One per API operation. Arguments are the operation's path parameters, query parameters and body fields flattened into one object, so `createVar` takes `workspaceSlug`, `appSlug`, `env`, `region`, `key`, `value` and `isSecret`.

The token's scope (`read` / `deploy` / `full`) and your workspace role are enforced by the API on every call, exactly as they are for the dashboard and the SDKs.

## Docs

Full reference at [cloady.com/docs](https://cloady.com/docs).

## Distribution

This repository contains the source and build already published as `@cloady/mcp@0.5.0` on npm, plus directory packaging. Run `npm install` and `npm start`. The Cursor plugin uses the pinned npm release. MCPB bundles include production dependencies.

## Privacy Policy

This local server forwards tool arguments to the Cloady API using your configured API token. See [Cloady Privacy Policy](https://cloady.com/privacy) for data handling and contact information. Use the minimum necessary token scope; write tools can change or delete resources.

The 0.5.1 desktop bundle adds tool titles and conservative read/write annotations to the 0.5.0 API implementation. The Cursor configuration continues to use the published npm 0.5.0 release.
