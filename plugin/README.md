# Cloady for Claude

Connect Claude to [Cloady](https://cloady.com) to deploy applications and databases, investigate deployment failures, inspect logs and metrics, and manage workspaces, domains, and storage. This plugin connects directly to Cloady's hosted MCP server over HTTPS. It does not install a local server, run shell hooks, or read local files automatically.

## Connect your account

Enable the plugin and authenticate with Cloady when prompted. In Claude Code, open `/mcp`, select the Cloady plugin server, and follow the authentication flow. Sign in to your Cloady account and complete any required phone verification. Choose the narrowest scope that supports your task: read, deploy, or full. You do not need to paste an API token into this plugin.

An account-level OAuth connection can access every workspace the account belongs to, subject to the selected scope and the user's role in each workspace. Use a separate account with limited workspace membership when you need isolation. Revoke the connection's token in **Cloady Account → API tokens** to stop future requests.

## Example requests

- "List my Cloady workspaces and show which applications are running."
- "Check the latest deployment and build logs for my app. Explain why it failed."
- "Show the available database templates and pricing before deploying anything."
- "Check the DNS records for my application's custom domain."

For changes, identify the intended workspace, application, environment, and region. Review the action and any resource charges before authorizing it. Write operations can deploy, restart, resize, change, or delete resources when your permissions allow them. Installing the plugin is free; hosted resources follow [Cloady pricing](https://cloady.com).

## Data handling

The plugin sends tool names, arguments, and its OAuth access token to `https://cloady.com/api/mcp`. Depending on the requested operation, arguments and results can include account and workspace metadata, application configuration, source code, logs, metrics, database content, domains, and support messages. Only submit data you are authorized to share. Tool results are returned to Claude and handled by Anthropic under its policies. Operations involving a connected repository or another service may also contact that service.

The plugin has no separate analytics, storage service, or additional network endpoint. Cloady processes and retains service records according to its [Privacy Policy](https://cloady.com/privacy), including its retention and deletion section. Disconnecting or revoking access does not delete hosted applications, service records, backups, or copies already held by Claude. Contact **hello@cloady.com** for data deletion or support.

## Documentation and support

- [Cloady](https://cloady.com)
- [MCP documentation](https://cloady.com/docs/mcp)
- [Support](https://cloady.com/support)
- [Terms of Service](https://cloady.com/terms)
- [Source repository](https://github.com/Cloady/cloady-mcp)

## Local validation

From the repository root, run `claude plugin validate ./plugin`. To try the package locally, start Claude Code with `claude --plugin-dir ./plugin` and authenticate using `/mcp`. The plugin is licensed under MIT; Cloady's hosted service is governed by its Terms of Service.
