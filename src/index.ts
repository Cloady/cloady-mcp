#!/usr/bin/env node
/**
 * MCP Server generated from OpenAPI spec for cloady-mcp v0.5.0
 */

// Load environment variables from .env file
import dotenv from 'dotenv';
dotenv.config();

import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
  type Tool,
  type CallToolResult,
  type CallToolRequest
} from "@modelcontextprotocol/sdk/types.js";

import { z, ZodError } from 'zod';
import { jsonSchemaToZod } from 'json-schema-to-zod';
import axios, { type AxiosRequestConfig, type AxiosError } from 'axios';

/**
 * Type definition for JSON objects
 */
type JsonObject = Record<string, any>;

/**
 * Interface for MCP Tool Definition
 */
interface McpToolDefinition {
    name: string;
    description: string;
    inputSchema: any;
    method: string;
    pathTemplate: string;
    executionParameters: { name: string, in: string }[];
    requestBodyContentType?: string;
    securityRequirements: any[];
    tags?: string[];
    deprecated?: boolean;
}

/**
 * Server configuration
 */
export const SERVER_NAME = "cloady-mcp";
export const SERVER_VERSION = "0.5.0";
// Base URL for the API, can be set via environment variable or determined from OpenAPI spec
export const API_BASE_URL = process.env.API_BASE_URL || "https://cloady.com";
console.error("API_BASE_URL is set to:", API_BASE_URL);

/**
 * MCP Server instance
 */
const server = new Server(
    { name: SERVER_NAME, version: SERVER_VERSION },
    { capabilities: { tools: {} } }
);

/**
 * Map of tool definitions by name
 */
const toolDefinitionMap: Map<string, McpToolDefinition> = new Map([

  ["getMe", {
    name: "getMe",
    description: `Get the authenticated user`,
    inputSchema: {"type":"object","properties":{}},
    method: "get",
    pathTemplate: "/api/me",
    executionParameters: [],
    requestBodyContentType: undefined,
    securityRequirements: [{"cloady":[]}],
    tags: [],
    deprecated: false
  }],
  ["listRegions", {
    name: "listRegions",
    description: `List available regions`,
    inputSchema: {"type":"object","properties":{}},
    method: "get",
    pathTemplate: "/api/regions",
    executionParameters: [],
    requestBodyContentType: undefined,
    securityRequirements: [{"cloady":[]}],
    tags: [],
    deprecated: false
  }],
  ["listWorkspaces", {
    name: "listWorkspaces",
    description: `List workspaces for the authenticated user`,
    inputSchema: {"type":"object","properties":{}},
    method: "get",
    pathTemplate: "/api/workspaces",
    executionParameters: [],
    requestBodyContentType: undefined,
    securityRequirements: [{"cloady":[]}],
    tags: [],
    deprecated: false
  }],
  ["createWorkspace", {
    name: "createWorkspace",
    description: `Create a workspace (requires full scope)`,
    inputSchema: {"type":"object","properties":{"requestBody":{"type":"object","properties":{"name":{"type":"string","minLength":1,"maxLength":60},"slug":{"type":"string","maxLength":40,"pattern":"^[a-z0-9][a-z0-9-]*$"},"hues":{"type":"array","prefixItems":[{"type":"integer","minimum":0,"exclusiveMaximum":360},{"type":"integer","minimum":0,"exclusiveMaximum":360}]},"tier":{"type":"string","minLength":1},"iconUrl":{"type":"string","maxLength":8000000},"paymentMethodId":{"type":"string","maxLength":255,"pattern":"^pm_"}},"required":["name","slug","hues","tier"],"description":"The JSON request body."}}},
    method: "post",
    pathTemplate: "/api/workspaces",
    executionParameters: [],
    requestBodyContentType: "application/json",
    securityRequirements: [{"cloady":[]}],
    tags: [],
    deprecated: false
  }],
  ["getWorkspace", {
    name: "getWorkspace",
    description: `Get a workspace by slug`,
    inputSchema: {"type":"object","properties":{"workspaceSlug":{"type":"string"}},"required":["workspaceSlug"]},
    method: "get",
    pathTemplate: "/api/workspaces/{workspaceSlug}",
    executionParameters: [{"name":"workspaceSlug","in":"path"}],
    requestBodyContentType: undefined,
    securityRequirements: [{"cloady":[]}],
    tags: [],
    deprecated: false
  }],
  ["deleteWorkspace", {
    name: "deleteWorkspace",
    description: `Delete a workspace (requires full scope)`,
    inputSchema: {"type":"object","properties":{"workspaceSlug":{"type":"string"}},"required":["workspaceSlug"]},
    method: "delete",
    pathTemplate: "/api/workspaces/{workspaceSlug}",
    executionParameters: [{"name":"workspaceSlug","in":"path"}],
    requestBodyContentType: undefined,
    securityRequirements: [{"cloady":[]}],
    tags: [],
    deprecated: false
  }],
  ["updateWorkspace", {
    name: "updateWorkspace",
    description: `Update a workspace (requires full scope)`,
    inputSchema: {"type":"object","properties":{"workspaceSlug":{"type":"string"},"requestBody":{"type":"object","properties":{"name":{"type":"string","minLength":1,"maxLength":60},"slug":{"type":"string","maxLength":40,"pattern":"^[a-z0-9][a-z0-9-]*$"},"hues":{"type":"array","prefixItems":[{"type":"integer","minimum":0,"exclusiveMaximum":360},{"type":"integer","minimum":0,"exclusiveMaximum":360}]},"iconUrl":{"anyOf":[{"type":"string","maxLength":8000000},{"type":"null"}]},"paymentMethodId":{"anyOf":[{"type":"string","maxLength":255,"pattern":"^pm_"},{"type":"null"}]}},"description":"The JSON request body."}},"required":["workspaceSlug"]},
    method: "patch",
    pathTemplate: "/api/workspaces/{workspaceSlug}",
    executionParameters: [{"name":"workspaceSlug","in":"path"}],
    requestBodyContentType: "application/json",
    securityRequirements: [{"cloady":[]}],
    tags: [],
    deprecated: false
  }],
  ["inspectSource", {
    name: "inspectSource",
    description: `Inspect a source and preview its template`,
    inputSchema: {"type":"object","properties":{"workspaceSlug":{"type":"string"},"requestBody":{"type":"object","properties":{"source":{"oneOf":[{"type":"object","properties":{"type":{"type":"string","const":"git"},"repoUrl":{"type":"string","minLength":1,"maxLength":500},"branch":{"type":"string","maxLength":255},"subdir":{"type":"string","maxLength":255},"autoDeploy":{"type":"boolean"},"branchTracking":{"type":"object","properties":{"mode":{"type":"string","enum":["off","all","match"]},"pattern":{"type":"string","maxLength":255}},"required":["mode"]}},"required":["type","repoUrl"]},{"type":"object","properties":{"type":{"type":"string","const":"upload"},"uploadId":{"type":"string","format":"uuid","pattern":"^([0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[1-8][0-9a-fA-F]{3}-[89abAB][0-9a-fA-F]{3}-[0-9a-fA-F]{12}|00000000-0000-0000-0000-000000000000|ffffffff-ffff-ffff-ffff-ffffffffffff)$"},"subdir":{"type":"string","maxLength":255}},"required":["type"]},{"type":"object","properties":{"type":{"type":"string","const":"catalog"},"name":{"type":"string","minLength":1,"maxLength":80}},"required":["type","name"]}],"type":"object"},"env":{"type":"string","enum":["production","preview","development"]}},"required":["source"],"description":"The JSON request body."}},"required":["workspaceSlug"]},
    method: "post",
    pathTemplate: "/api/workspaces/{workspaceSlug}/inspect",
    executionParameters: [{"name":"workspaceSlug","in":"path"}],
    requestBodyContentType: "application/json",
    securityRequirements: [{"cloady":[]}],
    tags: [],
    deprecated: false
  }],
  ["deployApp", {
    name: "deployApp",
    description: `Deploy an app from a git repository or upload`,
    inputSchema: {"type":"object","properties":{"workspaceSlug":{"type":"string"},"requestBody":{"type":"object","properties":{"name":{"type":"string","minLength":1,"maxLength":80},"region":{"type":"string","minLength":1},"env":{"type":"string","enum":["production","preview","development"]},"source":{"oneOf":[{"type":"object","properties":{"type":{"type":"string","const":"git"},"repoUrl":{"type":"string","minLength":1,"maxLength":500},"branch":{"type":"string","maxLength":255},"subdir":{"type":"string","maxLength":255},"autoDeploy":{"type":"boolean"},"branchTracking":{"type":"object","properties":{"mode":{"type":"string","enum":["off","all","match"]},"pattern":{"type":"string","maxLength":255}},"required":["mode"]}},"required":["type","repoUrl"]},{"type":"object","properties":{"type":{"type":"string","const":"upload"},"uploadId":{"type":"string","format":"uuid","pattern":"^([0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[1-8][0-9a-fA-F]{3}-[89abAB][0-9a-fA-F]{3}-[0-9a-fA-F]{12}|00000000-0000-0000-0000-000000000000|ffffffff-ffff-ffff-ffff-ffffffffffff)$"},"subdir":{"type":"string","maxLength":255}},"required":["type"]},{"type":"object","properties":{"type":{"type":"string","const":"catalog"},"name":{"type":"string","minLength":1,"maxLength":80}},"required":["type","name"]}],"type":"object"},"port":{"type":"number","exclusiveMinimum":0,"maximum":65535},"values":{"type":"object","propertyNames":{"type":"string"},"additionalProperties":{}},"buildCmd":{"type":"string","maxLength":2000},"startCmd":{"type":"string","maxLength":2000},"autoDeploy":{"type":"boolean"},"scale":{"type":"object","properties":{"cpu":{"type":"number","minimum":0.5,"maximum":4,"multipleOf":0.25},"memory":{"type":"number","minimum":0.5,"maximum":4,"multipleOf":0.25},"volumes":{"type":"object","propertyNames":{"type":"string","minLength":1,"maxLength":30},"additionalProperties":{"type":"integer","minimum":1,"maximum":4096}}},"required":["cpu","memory"]}},"required":["region","source"],"description":"The JSON request body."}},"required":["workspaceSlug"]},
    method: "post",
    pathTemplate: "/api/workspaces/{workspaceSlug}/deploy",
    executionParameters: [{"name":"workspaceSlug","in":"path"}],
    requestBodyContentType: "application/json",
    securityRequirements: [{"cloady":[]}],
    tags: [],
    deprecated: false
  }],
  ["deleteApp", {
    name: "deleteApp",
    description: `Delete an app and purge its data`,
    inputSchema: {"type":"object","properties":{"workspaceSlug":{"type":"string"},"appSlug":{"type":"string"},"env":{"type":"string","enum":["production","preview","development"]},"region":{"type":"string"}},"required":["workspaceSlug","appSlug"]},
    method: "delete",
    pathTemplate: "/api/workspaces/{workspaceSlug}/apps/{appSlug}",
    executionParameters: [{"name":"workspaceSlug","in":"path"},{"name":"appSlug","in":"path"},{"name":"env","in":"query"},{"name":"region","in":"query"}],
    requestBodyContentType: undefined,
    securityRequirements: [{"cloady":[]}],
    tags: [],
    deprecated: false
  }],
  ["updateApp", {
    name: "updateApp",
    description: `Update an app (name / status / version)`,
    inputSchema: {"type":"object","properties":{"workspaceSlug":{"type":"string"},"appSlug":{"type":"string"},"env":{"type":"string","enum":["production","preview","development"]},"region":{"type":"string"},"requestBody":{"type":"object","properties":{"name":{"type":"string","minLength":1,"maxLength":80},"slug":{"type":"string","minLength":1,"maxLength":24,"pattern":"^[a-z0-9][a-z0-9-]*$"},"status":{"type":"string","enum":["running","degraded","stopped","error"]},"branch":{"type":"string","minLength":1,"maxLength":255},"tracking":{"type":"object","properties":{"mode":{"type":"string","enum":["off","all","match"]},"pattern":{"type":"string","maxLength":255}},"required":["mode"]},"autoDeploy":{"type":"boolean"},"scale":{"type":"object","properties":{"cpu":{"type":"number","minimum":0.5,"maximum":4,"multipleOf":0.25},"memory":{"type":"number","minimum":0.5,"maximum":4,"multipleOf":0.25},"volumes":{"type":"object","propertyNames":{"type":"string","minLength":1,"maxLength":30},"additionalProperties":{"type":"integer","minimum":1,"maximum":4096}}},"required":["cpu","memory"]}},"description":"The JSON request body."}},"required":["workspaceSlug","appSlug"]},
    method: "patch",
    pathTemplate: "/api/workspaces/{workspaceSlug}/apps/{appSlug}",
    executionParameters: [{"name":"workspaceSlug","in":"path"},{"name":"appSlug","in":"path"},{"name":"env","in":"query"},{"name":"region","in":"query"}],
    requestBodyContentType: "application/json",
    securityRequirements: [{"cloady":[]}],
    tags: [],
    deprecated: false
  }],
  ["redeployApp", {
    name: "redeployApp",
    description: `Redeploy an app (refresh code + roll pods)`,
    inputSchema: {"type":"object","properties":{"workspaceSlug":{"type":"string"},"appSlug":{"type":"string"},"env":{"type":"string","enum":["production","preview","development"]},"region":{"type":"string"}},"required":["workspaceSlug","appSlug"]},
    method: "post",
    pathTemplate: "/api/workspaces/{workspaceSlug}/apps/{appSlug}/redeploy",
    executionParameters: [{"name":"workspaceSlug","in":"path"},{"name":"appSlug","in":"path"},{"name":"env","in":"query"},{"name":"region","in":"query"}],
    requestBodyContentType: undefined,
    securityRequirements: [{"cloady":[]}],
    tags: [],
    deprecated: false
  }],
  ["createSshSession", {
    name: "createSshSession",
    description: `Create a short-lived SSH session credential for a running container`,
    inputSchema: {"type":"object","properties":{"workspaceSlug":{"type":"string"},"appSlug":{"type":"string"},"env":{"type":"string","enum":["production","preview","development"]},"region":{"type":"string"},"requestBody":{"type":"object","properties":{"component":{"type":"string","minLength":1}},"required":["component"],"description":"The JSON request body."}},"required":["workspaceSlug","appSlug"]},
    method: "post",
    pathTemplate: "/api/workspaces/{workspaceSlug}/apps/{appSlug}/ssh/session",
    executionParameters: [{"name":"workspaceSlug","in":"path"},{"name":"appSlug","in":"path"},{"name":"env","in":"query"},{"name":"region","in":"query"}],
    requestBodyContentType: "application/json",
    securityRequirements: [{"cloady":[]}],
    tags: [],
    deprecated: false
  }],
  ["execCommand", {
    name: "execCommand",
    description: `Run a one-off shell command in a running container (kubernetes exec)`,
    inputSchema: {"type":"object","properties":{"workspaceSlug":{"type":"string"},"appSlug":{"type":"string"},"env":{"type":"string","enum":["production","preview","development"]},"region":{"type":"string"},"requestBody":{"type":"object","properties":{"component":{"type":"string","minLength":1},"command":{"type":"string","minLength":1,"maxLength":100000},"cwd":{"type":"string","maxLength":4096},"stdin":{"type":"string","maxLength":1048576},"timeoutMs":{"type":"number","minimum":1000,"maximum":300000}},"required":["component","command"],"description":"The JSON request body."}},"required":["workspaceSlug","appSlug"]},
    method: "post",
    pathTemplate: "/api/workspaces/{workspaceSlug}/apps/{appSlug}/exec",
    executionParameters: [{"name":"workspaceSlug","in":"path"},{"name":"appSlug","in":"path"},{"name":"env","in":"query"},{"name":"region","in":"query"}],
    requestBodyContentType: "application/json",
    securityRequirements: [{"cloady":[]}],
    tags: [],
    deprecated: false
  }],
  ["listBackups", {
    name: "listBackups",
    description: `List an app's backups and its backup settings`,
    inputSchema: {"type":"object","properties":{"workspaceSlug":{"type":"string"},"appSlug":{"type":"string"},"env":{"type":"string","enum":["production","preview","development"]},"region":{"type":"string"}},"required":["workspaceSlug","appSlug"]},
    method: "get",
    pathTemplate: "/api/workspaces/{workspaceSlug}/apps/{appSlug}/backups",
    executionParameters: [{"name":"workspaceSlug","in":"path"},{"name":"appSlug","in":"path"},{"name":"env","in":"query"},{"name":"region","in":"query"}],
    requestBodyContentType: undefined,
    securityRequirements: [{"cloady":[]}],
    tags: [],
    deprecated: false
  }],
  ["updateBackups", {
    name: "updateBackups",
    description: `Turn managed backups on or off and set the daily window`,
    inputSchema: {"type":"object","properties":{"workspaceSlug":{"type":"string"},"appSlug":{"type":"string"},"env":{"type":"string","enum":["production","preview","development"]},"region":{"type":"string"},"requestBody":{"type":"object","properties":{"enabled":{"type":"boolean"},"window":{"type":"string","enum":["12","16","20","auto","00","04","08"]}},"description":"The JSON request body."}},"required":["workspaceSlug","appSlug"]},
    method: "patch",
    pathTemplate: "/api/workspaces/{workspaceSlug}/apps/{appSlug}/backups",
    executionParameters: [{"name":"workspaceSlug","in":"path"},{"name":"appSlug","in":"path"},{"name":"env","in":"query"},{"name":"region","in":"query"}],
    requestBodyContentType: "application/json",
    securityRequirements: [{"cloady":[]}],
    tags: [],
    deprecated: false
  }],
  ["restoreBackup", {
    name: "restoreBackup",
    description: `Overwrites the app's current volume contents with the snapshot. There is no undo.`,
    inputSchema: {"type":"object","properties":{"workspaceSlug":{"type":"string"},"appSlug":{"type":"string"},"backupId":{"type":"string"},"env":{"type":"string","enum":["production","preview","development"]},"region":{"type":"string"}},"required":["workspaceSlug","appSlug","backupId"]},
    method: "post",
    pathTemplate: "/api/workspaces/{workspaceSlug}/apps/{appSlug}/backups/{backupId}/restore",
    executionParameters: [{"name":"workspaceSlug","in":"path"},{"name":"appSlug","in":"path"},{"name":"backupId","in":"path"},{"name":"env","in":"query"},{"name":"region","in":"query"}],
    requestBodyContentType: undefined,
    securityRequirements: [{"cloady":[]}],
    tags: [],
    deprecated: false
  }],
  ["listBranches", {
    name: "listBranches",
    description: `Fetched live from GitHub; empty for apps whose source is not git. \`current\` is the branch the app deploys from.`,
    inputSchema: {"type":"object","properties":{"workspaceSlug":{"type":"string"},"appSlug":{"type":"string"},"env":{"type":"string","enum":["production","preview","development"]},"region":{"type":"string"}},"required":["workspaceSlug","appSlug"]},
    method: "get",
    pathTemplate: "/api/workspaces/{workspaceSlug}/apps/{appSlug}/branches",
    executionParameters: [{"name":"workspaceSlug","in":"path"},{"name":"appSlug","in":"path"},{"name":"env","in":"query"},{"name":"region","in":"query"}],
    requestBodyContentType: undefined,
    securityRequirements: [{"cloady":[]}],
    tags: [],
    deprecated: false
  }],
  ["rollbackDeploy", {
    name: "rollbackDeploy",
    description: `Needs a running, build-backed app whose target image is still in the registry. Restarts every service in the instance, database included.`,
    inputSchema: {"type":"object","properties":{"workspaceSlug":{"type":"string"},"appSlug":{"type":"string"},"deployId":{"type":"string"},"env":{"type":"string","enum":["production","preview","development"]},"region":{"type":"string"}},"required":["workspaceSlug","appSlug","deployId"]},
    method: "post",
    pathTemplate: "/api/workspaces/{workspaceSlug}/apps/{appSlug}/deploys/{deployId}/rollback",
    executionParameters: [{"name":"workspaceSlug","in":"path"},{"name":"appSlug","in":"path"},{"name":"deployId","in":"path"},{"name":"env","in":"query"},{"name":"region","in":"query"}],
    requestBodyContentType: undefined,
    securityRequirements: [{"cloady":[]}],
    tags: [],
    deprecated: false
  }],
  ["getVolumeKeys", {
    name: "getVolumeKeys",
    description: `Credentials are derived, not stored, so they are stable for the volume and need no rotation step. \`volume\` is a name from listVolumes.`,
    inputSchema: {"type":"object","properties":{"workspaceSlug":{"type":"string"},"appSlug":{"type":"string"},"volume":{"type":"string"},"env":{"type":"string","enum":["production","preview","development"]},"region":{"type":"string"}},"required":["workspaceSlug","appSlug","volume"]},
    method: "get",
    pathTemplate: "/api/workspaces/{workspaceSlug}/apps/{appSlug}/keys",
    executionParameters: [{"name":"workspaceSlug","in":"path"},{"name":"appSlug","in":"path"},{"name":"volume","in":"query"},{"name":"env","in":"query"},{"name":"region","in":"query"}],
    requestBodyContentType: undefined,
    securityRequirements: [{"cloady":[]}],
    tags: [],
    deprecated: false
  }],
  ["getDbCredentials", {
    name: "getDbCredentials",
    description: `Read from the running pod's resolved environment at call time, so the container is the source of truth rather than the template. \`component\` is a compose service running a database.`,
    inputSchema: {"type":"object","properties":{"workspaceSlug":{"type":"string"},"appSlug":{"type":"string"},"component":{"type":"string"},"env":{"type":"string","enum":["production","preview","development"]},"region":{"type":"string"}},"required":["workspaceSlug","appSlug","component"]},
    method: "get",
    pathTemplate: "/api/workspaces/{workspaceSlug}/apps/{appSlug}/db/credentials",
    executionParameters: [{"name":"workspaceSlug","in":"path"},{"name":"appSlug","in":"path"},{"name":"component","in":"query"},{"name":"env","in":"query"},{"name":"region","in":"query"}],
    requestBodyContentType: undefined,
    securityRequirements: [{"cloady":[]}],
    tags: [],
    deprecated: false
  }],
  ["getDbSchema", {
    name: "getDbSchema",
    description: `List a database component's schemas and tables`,
    inputSchema: {"type":"object","properties":{"workspaceSlug":{"type":"string"},"appSlug":{"type":"string"},"component":{"type":"string"},"schema":{"type":"string"},"env":{"type":"string","enum":["production","preview","development"]},"region":{"type":"string"}},"required":["workspaceSlug","appSlug","component"]},
    method: "get",
    pathTemplate: "/api/workspaces/{workspaceSlug}/apps/{appSlug}/db/schema",
    executionParameters: [{"name":"workspaceSlug","in":"path"},{"name":"appSlug","in":"path"},{"name":"component","in":"query"},{"name":"schema","in":"query"},{"name":"env","in":"query"},{"name":"region","in":"query"}],
    requestBodyContentType: undefined,
    securityRequirements: [{"cloady":[]}],
    tags: [],
    deprecated: false
  }],
  ["runDbQuery", {
    name: "runDbQuery",
    description: `Runs over a real protocol driver, not a shell, and executes whatever is sent — including writes and DDL. Redis and MongoDB take their own command syntax rather than SQL.`,
    inputSchema: {"type":"object","properties":{"workspaceSlug":{"type":"string"},"appSlug":{"type":"string"},"env":{"type":"string","enum":["production","preview","development"]},"region":{"type":"string"},"requestBody":{"type":"object","properties":{"component":{"type":"string","minLength":1},"sql":{"type":"string","minLength":1,"maxLength":100000},"schema":{"type":"string"}},"required":["component","sql"],"description":"The JSON request body."}},"required":["workspaceSlug","appSlug"]},
    method: "post",
    pathTemplate: "/api/workspaces/{workspaceSlug}/apps/{appSlug}/db/query",
    executionParameters: [{"name":"workspaceSlug","in":"path"},{"name":"appSlug","in":"path"},{"name":"env","in":"query"},{"name":"region","in":"query"}],
    requestBodyContentType: "application/json",
    securityRequirements: [{"cloady":[]}],
    tags: [],
    deprecated: false
  }],
  ["getGitOverview", {
    name: "getGitOverview",
    description: `Reads the repository inside the running container by pod exec, so it is ground truth rather than the deploy record. Returns \`{ok:false, reason}\` when the app has no repo, no pod, or no git.`,
    inputSchema: {"type":"object","properties":{"workspaceSlug":{"type":"string"},"appSlug":{"type":"string"},"limit":{"type":"number"},"env":{"type":"string","enum":["production","preview","development"]},"region":{"type":"string"}},"required":["workspaceSlug","appSlug"]},
    method: "get",
    pathTemplate: "/api/workspaces/{workspaceSlug}/apps/{appSlug}/git",
    executionParameters: [{"name":"workspaceSlug","in":"path"},{"name":"appSlug","in":"path"},{"name":"limit","in":"query"},{"name":"env","in":"query"},{"name":"region","in":"query"}],
    requestBodyContentType: undefined,
    securityRequirements: [{"cloady":[]}],
    tags: [],
    deprecated: false
  }],
  ["runGitAction", {
    name: "runGitAction",
    description: `One action per call: discard, stage, unstage, commit, checkout, merge, rebase, revert, cherry, pull or push. Commits live in the container and die with it unless pushed.`,
    inputSchema: {"type":"object","properties":{"workspaceSlug":{"type":"string"},"appSlug":{"type":"string"},"env":{"type":"string","enum":["production","preview","development"]},"region":{"type":"string"},"requestBody":{"oneOf":[{"type":"object","properties":{"action":{"type":"string","const":"discard"},"paths":{"minItems":1,"maxItems":500,"type":"array","items":{"type":"string"}}},"required":["action","paths"]},{"type":"object","properties":{"action":{"type":"string","const":"commit"},"message":{"type":"string","minLength":1,"maxLength":4000},"paths":{"maxItems":500,"type":"array","items":{"type":"string"}}},"required":["action","message"]},{"type":"object","properties":{"action":{"type":"string","const":"checkout"},"branch":{"type":"string","minLength":1,"maxLength":255},"create":{"type":"boolean"}},"required":["action","branch"]},{"type":"object","properties":{"action":{"type":"string","const":"stage"},"paths":{"minItems":1,"maxItems":500,"type":"array","items":{"type":"string"}}},"required":["action","paths"]},{"type":"object","properties":{"action":{"type":"string","const":"unstage"},"paths":{"minItems":1,"maxItems":500,"type":"array","items":{"type":"string"}}},"required":["action","paths"]},{"type":"object","properties":{"action":{"type":"string","const":"merge"},"branch":{"type":"string","minLength":1,"maxLength":255}},"required":["action","branch"]},{"type":"object","properties":{"action":{"type":"string","const":"rebase"},"branch":{"type":"string","minLength":1,"maxLength":255}},"required":["action","branch"]},{"type":"object","properties":{"action":{"type":"string","const":"revert"},"sha":{"type":"string","minLength":4,"maxLength":40}},"required":["action","sha"]},{"type":"object","properties":{"action":{"type":"string","const":"cherry"},"sha":{"type":"string","minLength":4,"maxLength":40}},"required":["action","sha"]},{"type":"object","properties":{"action":{"type":"string","const":"pull"}},"required":["action"]},{"type":"object","properties":{"action":{"type":"string","const":"push"}},"required":["action"]}],"type":"object","description":"The JSON request body."}},"required":["workspaceSlug","appSlug"]},
    method: "post",
    pathTemplate: "/api/workspaces/{workspaceSlug}/apps/{appSlug}/git",
    executionParameters: [{"name":"workspaceSlug","in":"path"},{"name":"appSlug","in":"path"},{"name":"env","in":"query"},{"name":"region","in":"query"}],
    requestBodyContentType: "application/json",
    securityRequirements: [{"cloady":[]}],
    tags: [],
    deprecated: false
  }],
  ["getGitDiff", {
    name: "getGitDiff",
    description: `With no \`sha\`, diffs the working tree. \`path\` narrows it to one file. Large patches come back with \`truncated: true\`.`,
    inputSchema: {"type":"object","properties":{"workspaceSlug":{"type":"string"},"appSlug":{"type":"string"},"sha":{"type":"string"},"path":{"type":"string"},"env":{"type":"string","enum":["production","preview","development"]},"region":{"type":"string"}},"required":["workspaceSlug","appSlug"]},
    method: "get",
    pathTemplate: "/api/workspaces/{workspaceSlug}/apps/{appSlug}/git/diff",
    executionParameters: [{"name":"workspaceSlug","in":"path"},{"name":"appSlug","in":"path"},{"name":"sha","in":"query"},{"name":"path","in":"query"},{"name":"env","in":"query"},{"name":"region","in":"query"}],
    requestBodyContentType: undefined,
    securityRequirements: [{"cloady":[]}],
    tags: [],
    deprecated: false
  }],
  ["streamAppStatus", {
    name: "streamAppStatus",
    description: `Returns one status frame. Sending \`Accept: text/event-stream\` instead follows the status live, a frame every five seconds, which never completes on its own.`,
    inputSchema: {"type":"object","properties":{"workspaceSlug":{"type":"string"},"appSlug":{"type":"string"},"env":{"type":"string","enum":["production","preview","development"]},"region":{"type":"string"}},"required":["workspaceSlug","appSlug"]},
    method: "get",
    pathTemplate: "/api/workspaces/{workspaceSlug}/apps/{appSlug}/status",
    executionParameters: [{"name":"workspaceSlug","in":"path"},{"name":"appSlug","in":"path"},{"name":"env","in":"query"},{"name":"region","in":"query"}],
    requestBodyContentType: undefined,
    securityRequirements: [{"cloady":[]}],
    tags: [],
    deprecated: false
  }],
  ["streamAppMetrics", {
    name: "streamAppMetrics",
    description: `Returns one metrics reading; \`network\` and \`requestsPerSec\` are null until a second sample exists, so they are null on a one-shot read. Sending \`Accept: text/event-stream\` instead follows usage live, a frame every five seconds, which never completes on its own.`,
    inputSchema: {"type":"object","properties":{"workspaceSlug":{"type":"string"},"appSlug":{"type":"string"},"env":{"type":"string","enum":["production","preview","development"]},"region":{"type":"string"}},"required":["workspaceSlug","appSlug"]},
    method: "get",
    pathTemplate: "/api/workspaces/{workspaceSlug}/apps/{appSlug}/metrics",
    executionParameters: [{"name":"workspaceSlug","in":"path"},{"name":"appSlug","in":"path"},{"name":"env","in":"query"},{"name":"region","in":"query"}],
    requestBodyContentType: undefined,
    securityRequirements: [{"cloady":[]}],
    tags: [],
    deprecated: false
  }],
  ["streamActiveDeploy", {
    name: "streamActiveDeploy",
    description: `Returns one \`{ts, deploy}\` frame: the active deploy if one is running, otherwise the most recent, and \`deploy\` is null when the app has never deployed. Sending \`Accept: text/event-stream\` instead follows it live, a frame every two seconds, closing after one terminal frame.`,
    inputSchema: {"type":"object","properties":{"workspaceSlug":{"type":"string"},"appSlug":{"type":"string"},"env":{"type":"string","enum":["production","preview","development"]},"region":{"type":"string"}},"required":["workspaceSlug","appSlug"]},
    method: "get",
    pathTemplate: "/api/workspaces/{workspaceSlug}/apps/{appSlug}/deploys/active",
    executionParameters: [{"name":"workspaceSlug","in":"path"},{"name":"appSlug","in":"path"},{"name":"env","in":"query"},{"name":"region","in":"query"}],
    requestBodyContentType: undefined,
    securityRequirements: [{"cloady":[]}],
    tags: [],
    deprecated: false
  }],
  ["streamDeployLogs", {
    name: "streamDeployLogs",
    description: `Returns one \`{kind:"snapshot", log, status}\` frame — the whole log so far, not a delta: the stored log for a finished deploy, the live build pod's log for the in-flight one. Sending \`Accept: text/event-stream\` instead re-sends a growing snapshot every two seconds; a finished deploy sends one frame and closes, the in-flight one keeps the connection open after it ends, so close it yourself once a frame carries \`final: true\`.`,
    inputSchema: {"type":"object","properties":{"workspaceSlug":{"type":"string"},"appSlug":{"type":"string"},"deployId":{"type":"string"},"env":{"type":"string","enum":["production","preview","development"]},"region":{"type":"string"}},"required":["workspaceSlug","appSlug","deployId"]},
    method: "get",
    pathTemplate: "/api/workspaces/{workspaceSlug}/apps/{appSlug}/deploys/{deployId}/logs",
    executionParameters: [{"name":"workspaceSlug","in":"path"},{"name":"appSlug","in":"path"},{"name":"deployId","in":"path"},{"name":"env","in":"query"},{"name":"region","in":"query"}],
    requestBodyContentType: undefined,
    securityRequirements: [{"cloady":[]}],
    tags: [],
    deprecated: false
  }],
  ["listDeploys", {
    name: "listDeploys",
    description: `List an app's deploys`,
    inputSchema: {"type":"object","properties":{"workspaceSlug":{"type":"string"},"appSlug":{"type":"string"},"env":{"type":"string","enum":["production","preview","development"]},"region":{"type":"string"}},"required":["workspaceSlug","appSlug"]},
    method: "get",
    pathTemplate: "/api/workspaces/{workspaceSlug}/apps/{appSlug}/deploys",
    executionParameters: [{"name":"workspaceSlug","in":"path"},{"name":"appSlug","in":"path"},{"name":"env","in":"query"},{"name":"region","in":"query"}],
    requestBodyContentType: undefined,
    securityRequirements: [{"cloady":[]}],
    tags: [],
    deprecated: false
  }],
  ["listVars", {
    name: "listVars",
    description: `List environment variables and credentials for an app`,
    inputSchema: {"type":"object","properties":{"workspaceSlug":{"type":"string"},"appSlug":{"type":"string"},"env":{"type":"string","enum":["production","preview","development"]},"region":{"type":"string"}},"required":["workspaceSlug","appSlug"]},
    method: "get",
    pathTemplate: "/api/workspaces/{workspaceSlug}/apps/{appSlug}/vars",
    executionParameters: [{"name":"workspaceSlug","in":"path"},{"name":"appSlug","in":"path"},{"name":"env","in":"query"},{"name":"region","in":"query"}],
    requestBodyContentType: undefined,
    securityRequirements: [{"cloady":[]}],
    tags: [],
    deprecated: false
  }],
  ["createVar", {
    name: "createVar",
    description: `Create a new environment variable or credential`,
    inputSchema: {"type":"object","properties":{"workspaceSlug":{"type":"string"},"appSlug":{"type":"string"},"env":{"type":"string","enum":["production","preview","development"]},"region":{"type":"string"},"requestBody":{"type":"object","properties":{"key":{"type":"string","maxLength":80,"pattern":"^[A-Z_][A-Z0-9_]*$"},"value":{"type":"string","maxLength":4096},"isSecret":{"type":"boolean"}},"required":["key","value"],"description":"The JSON request body."}},"required":["workspaceSlug","appSlug"]},
    method: "post",
    pathTemplate: "/api/workspaces/{workspaceSlug}/apps/{appSlug}/vars",
    executionParameters: [{"name":"workspaceSlug","in":"path"},{"name":"appSlug","in":"path"},{"name":"env","in":"query"},{"name":"region","in":"query"}],
    requestBodyContentType: "application/json",
    securityRequirements: [{"cloady":[]}],
    tags: [],
    deprecated: false
  }],
  ["importVars", {
    name: "importVars",
    description: `Bulk-create environment variables, skipping keys already set`,
    inputSchema: {"type":"object","properties":{"workspaceSlug":{"type":"string"},"appSlug":{"type":"string"},"env":{"type":"string","enum":["production","preview","development"]},"region":{"type":"string"},"requestBody":{"type":"object","properties":{"entries":{"minItems":1,"maxItems":500,"type":"array","items":{"type":"object","properties":{"key":{"type":"string","maxLength":80},"value":{"type":"string","maxLength":4096},"isSecret":{"type":"boolean"}},"required":["key","value"]}}},"required":["entries"],"description":"The JSON request body."}},"required":["workspaceSlug","appSlug"]},
    method: "post",
    pathTemplate: "/api/workspaces/{workspaceSlug}/apps/{appSlug}/vars/import",
    executionParameters: [{"name":"workspaceSlug","in":"path"},{"name":"appSlug","in":"path"},{"name":"env","in":"query"},{"name":"region","in":"query"}],
    requestBodyContentType: "application/json",
    securityRequirements: [{"cloady":[]}],
    tags: [],
    deprecated: false
  }],
  ["deleteVar", {
    name: "deleteVar",
    description: `Delete an environment variable or credential`,
    inputSchema: {"type":"object","properties":{"workspaceSlug":{"type":"string"},"appSlug":{"type":"string"},"varId":{"type":"string"},"env":{"type":"string","enum":["production","preview","development"]},"region":{"type":"string"}},"required":["workspaceSlug","appSlug","varId"]},
    method: "delete",
    pathTemplate: "/api/workspaces/{workspaceSlug}/apps/{appSlug}/vars/{varId}",
    executionParameters: [{"name":"workspaceSlug","in":"path"},{"name":"appSlug","in":"path"},{"name":"varId","in":"path"},{"name":"env","in":"query"},{"name":"region","in":"query"}],
    requestBodyContentType: undefined,
    securityRequirements: [{"cloady":[]}],
    tags: [],
    deprecated: false
  }],
  ["updateVar", {
    name: "updateVar",
    description: `Update an environment variable or credential value`,
    inputSchema: {"type":"object","properties":{"workspaceSlug":{"type":"string"},"appSlug":{"type":"string"},"varId":{"type":"string"},"env":{"type":"string","enum":["production","preview","development"]},"region":{"type":"string"},"requestBody":{"type":"object","properties":{"value":{"type":"string","maxLength":4096},"isSecret":{"type":"boolean"}},"description":"The JSON request body."}},"required":["workspaceSlug","appSlug","varId"]},
    method: "patch",
    pathTemplate: "/api/workspaces/{workspaceSlug}/apps/{appSlug}/vars/{varId}",
    executionParameters: [{"name":"workspaceSlug","in":"path"},{"name":"appSlug","in":"path"},{"name":"varId","in":"path"},{"name":"env","in":"query"},{"name":"region","in":"query"}],
    requestBodyContentType: "application/json",
    securityRequirements: [{"cloady":[]}],
    tags: [],
    deprecated: false
  }],
  ["revealVar", {
    name: "revealVar",
    description: `Reveal the decrypted value of a secret variable`,
    inputSchema: {"type":"object","properties":{"workspaceSlug":{"type":"string"},"appSlug":{"type":"string"},"varId":{"type":"string"},"env":{"type":"string","enum":["production","preview","development"]},"region":{"type":"string"}},"required":["workspaceSlug","appSlug","varId"]},
    method: "get",
    pathTemplate: "/api/workspaces/{workspaceSlug}/apps/{appSlug}/vars/{varId}/reveal",
    executionParameters: [{"name":"workspaceSlug","in":"path"},{"name":"appSlug","in":"path"},{"name":"varId","in":"path"},{"name":"env","in":"query"},{"name":"region","in":"query"}],
    requestBodyContentType: undefined,
    securityRequirements: [{"cloady":[]}],
    tags: [],
    deprecated: false
  }],
  ["listAppDomains", {
    name: "listAppDomains",
    description: `List all domains for an app in a workspace`,
    inputSchema: {"type":"object","properties":{"workspaceSlug":{"type":"string"},"appSlug":{"type":"string"},"env":{"type":"string","enum":["production","preview","development"]},"region":{"type":"string"}},"required":["workspaceSlug","appSlug"]},
    method: "get",
    pathTemplate: "/api/workspaces/{workspaceSlug}/apps/{appSlug}/domains",
    executionParameters: [{"name":"workspaceSlug","in":"path"},{"name":"appSlug","in":"path"},{"name":"env","in":"query"},{"name":"region","in":"query"}],
    requestBodyContentType: undefined,
    securityRequirements: [{"cloady":[]}],
    tags: [],
    deprecated: false
  }],
  ["createDomain", {
    name: "createDomain",
    description: `Create a new domain for an app`,
    inputSchema: {"type":"object","properties":{"workspaceSlug":{"type":"string"},"appSlug":{"type":"string"},"env":{"type":"string","enum":["production","preview","development"]},"region":{"type":"string"},"requestBody":{"type":"object","properties":{"host":{"type":"string","pattern":"^(?:[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?\\.)+[a-z]{2,}$"},"isPrimary":{"type":"boolean"},"redirectTo":{"anyOf":[{"type":"string","pattern":"^(?:[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?\\.)+[a-z]{2,}$"},{"type":"null"}]},"port":{"anyOf":[{"type":"integer","exclusiveMinimum":0,"maximum":65535},{"type":"null"}]}},"required":["host"],"description":"The JSON request body."}},"required":["workspaceSlug","appSlug"]},
    method: "post",
    pathTemplate: "/api/workspaces/{workspaceSlug}/apps/{appSlug}/domains",
    executionParameters: [{"name":"workspaceSlug","in":"path"},{"name":"appSlug","in":"path"},{"name":"env","in":"query"},{"name":"region","in":"query"}],
    requestBodyContentType: "application/json",
    securityRequirements: [{"cloady":[]}],
    tags: [],
    deprecated: false
  }],
  ["deleteDomain", {
    name: "deleteDomain",
    description: `Delete a domain from an app`,
    inputSchema: {"type":"object","properties":{"workspaceSlug":{"type":"string"},"appSlug":{"type":"string"},"domainId":{"type":"string"},"env":{"type":"string","enum":["production","preview","development"]},"region":{"type":"string"}},"required":["workspaceSlug","appSlug","domainId"]},
    method: "delete",
    pathTemplate: "/api/workspaces/{workspaceSlug}/apps/{appSlug}/domains/{domainId}",
    executionParameters: [{"name":"workspaceSlug","in":"path"},{"name":"appSlug","in":"path"},{"name":"domainId","in":"path"},{"name":"env","in":"query"},{"name":"region","in":"query"}],
    requestBodyContentType: undefined,
    securityRequirements: [{"cloady":[]}],
    tags: [],
    deprecated: false
  }],
  ["updateDomain", {
    name: "updateDomain",
    description: `Update a domain configuration`,
    inputSchema: {"type":"object","properties":{"workspaceSlug":{"type":"string"},"appSlug":{"type":"string"},"domainId":{"type":"string"},"env":{"type":"string","enum":["production","preview","development"]},"region":{"type":"string"},"requestBody":{"type":"object","properties":{"redirectTo":{"anyOf":[{"type":"string","pattern":"^(?:[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?\\.)+[a-z]{2,}$"},{"type":"null"}]}},"description":"The JSON request body."}},"required":["workspaceSlug","appSlug","domainId"]},
    method: "patch",
    pathTemplate: "/api/workspaces/{workspaceSlug}/apps/{appSlug}/domains/{domainId}",
    executionParameters: [{"name":"workspaceSlug","in":"path"},{"name":"appSlug","in":"path"},{"name":"domainId","in":"path"},{"name":"env","in":"query"},{"name":"region","in":"query"}],
    requestBodyContentType: "application/json",
    securityRequirements: [{"cloady":[]}],
    tags: [],
    deprecated: false
  }],
  ["listCertStatuses", {
    name: "listCertStatuses",
    description: `List TLS certificate statuses for app domains`,
    inputSchema: {"type":"object","properties":{"workspaceSlug":{"type":"string"},"appSlug":{"type":"string"},"env":{"type":"string","enum":["production","preview","development"]},"region":{"type":"string"}},"required":["workspaceSlug","appSlug"]},
    method: "get",
    pathTemplate: "/api/workspaces/{workspaceSlug}/apps/{appSlug}/domains/certs",
    executionParameters: [{"name":"workspaceSlug","in":"path"},{"name":"appSlug","in":"path"},{"name":"env","in":"query"},{"name":"region","in":"query"}],
    requestBodyContentType: undefined,
    securityRequirements: [{"cloady":[]}],
    tags: [],
    deprecated: false
  }],
  ["readServiceLogs", {
    name: "readServiceLogs",
    description: `Returns the last 200 log lines of one container as \`{container, state, logs}\`; \`state\` is \`no-pod\` when nothing is running. \`serviceName\` is a compose service, or \`clone\` / \`build\` for an in-flight deploy's init steps. Sending \`Accept: text/event-stream\` instead follows the log live as server-sent events, one bare \`data:\` frame per line, which never completes on its own.`,
    inputSchema: {"type":"object","properties":{"workspaceSlug":{"type":"string"},"appSlug":{"type":"string"},"serviceName":{"type":"string"},"env":{"type":"string","enum":["production","preview","development"]},"region":{"type":"string"}},"required":["workspaceSlug","appSlug","serviceName"]},
    method: "get",
    pathTemplate: "/api/workspaces/{workspaceSlug}/apps/{appSlug}/services/{serviceName}/logs",
    executionParameters: [{"name":"workspaceSlug","in":"path"},{"name":"appSlug","in":"path"},{"name":"serviceName","in":"path"},{"name":"env","in":"query"},{"name":"region","in":"query"}],
    requestBodyContentType: undefined,
    securityRequirements: [{"cloady":[]}],
    tags: [],
    deprecated: false
  }],
  ["getAppServices", {
    name: "getAppServices",
    description: `List all services in an app instance`,
    inputSchema: {"type":"object","properties":{"workspaceSlug":{"type":"string"},"appSlug":{"type":"string"},"env":{"type":"string","enum":["production","preview","development"]},"region":{"type":"string"}},"required":["workspaceSlug","appSlug"]},
    method: "get",
    pathTemplate: "/api/workspaces/{workspaceSlug}/apps/{appSlug}/services",
    executionParameters: [{"name":"workspaceSlug","in":"path"},{"name":"appSlug","in":"path"},{"name":"env","in":"query"},{"name":"region","in":"query"}],
    requestBodyContentType: undefined,
    securityRequirements: [{"cloady":[]}],
    tags: [],
    deprecated: false
  }],
  ["createAppDeploy", {
    name: "createAppDeploy",
    description: `Trigger a new deployment for an app`,
    inputSchema: {"type":"object","properties":{"workspaceSlug":{"type":"string"},"appSlug":{"type":"string"},"env":{"type":"string","enum":["production","preview","development"]},"region":{"type":"string"},"requestBody":{"type":"object","properties":{"commitMsg":{"type":"string","maxLength":2000},"sha":{"type":"string","maxLength":64},"author":{"type":"string","maxLength":80}},"description":"The JSON request body."}},"required":["workspaceSlug","appSlug"]},
    method: "post",
    pathTemplate: "/api/workspaces/{workspaceSlug}/apps/{appSlug}/deploy",
    executionParameters: [{"name":"workspaceSlug","in":"path"},{"name":"appSlug","in":"path"},{"name":"env","in":"query"},{"name":"region","in":"query"}],
    requestBodyContentType: "application/json",
    securityRequirements: [{"cloady":[]}],
    tags: [],
    deprecated: false
  }],
  ["listVolumes", {
    name: "listVolumes",
    description: `List volumes for an app instance`,
    inputSchema: {"type":"object","properties":{"workspaceSlug":{"type":"string"},"appSlug":{"type":"string"},"env":{"type":"string","enum":["production","preview","development"]},"region":{"type":"string"}},"required":["workspaceSlug","appSlug"]},
    method: "get",
    pathTemplate: "/api/workspaces/{workspaceSlug}/apps/{appSlug}/volumes",
    executionParameters: [{"name":"workspaceSlug","in":"path"},{"name":"appSlug","in":"path"},{"name":"env","in":"query"},{"name":"region","in":"query"}],
    requestBodyContentType: undefined,
    securityRequirements: [{"cloady":[]}],
    tags: [],
    deprecated: false
  }],
  ["transferApp", {
    name: "transferApp",
    description: `Transfer an app to another workspace`,
    inputSchema: {"type":"object","properties":{"workspaceSlug":{"type":"string"},"appSlug":{"type":"string"},"env":{"type":"string","enum":["production","preview","development"]},"region":{"type":"string"},"requestBody":{"type":"object","properties":{"targetWorkspaceSlug":{"type":"string","minLength":1,"maxLength":80}},"required":["targetWorkspaceSlug"],"description":"The JSON request body."}},"required":["workspaceSlug","appSlug"]},
    method: "post",
    pathTemplate: "/api/workspaces/{workspaceSlug}/apps/{appSlug}/transfer",
    executionParameters: [{"name":"workspaceSlug","in":"path"},{"name":"appSlug","in":"path"},{"name":"env","in":"query"},{"name":"region","in":"query"}],
    requestBodyContentType: "application/json",
    securityRequirements: [{"cloady":[]}],
    tags: [],
    deprecated: false
  }],
  ["createS3Session", {
    name: "createS3Session",
    description: `The credentials are derived and expire on their own; \`access: "write"\` needs the developer role. Buckets are named \`<instance id without dashes>-<volume>\`.`,
    inputSchema: {"type":"object","properties":{"workspaceSlug":{"type":"string"},"requestBody":{"type":"object","properties":{"access":{"default":"read","type":"string","enum":["read","write"]}},"description":"The JSON request body."}},"required":["workspaceSlug"]},
    method: "post",
    pathTemplate: "/api/workspaces/{workspaceSlug}/s3/session",
    executionParameters: [{"name":"workspaceSlug","in":"path"}],
    requestBodyContentType: "application/json",
    securityRequirements: [{"cloady":[]}],
    tags: [],
    deprecated: false
  }],
  ["endS3Session", {
    name: "endS3Session",
    description: `End the caller's S3 session`,
    inputSchema: {"type":"object","properties":{"workspaceSlug":{"type":"string"}},"required":["workspaceSlug"]},
    method: "delete",
    pathTemplate: "/api/workspaces/{workspaceSlug}/s3/session",
    executionParameters: [{"name":"workspaceSlug","in":"path"}],
    requestBodyContentType: undefined,
    securityRequirements: [{"cloady":[]}],
    tags: [],
    deprecated: false
  }],
  ["getWorkspaceBilling", {
    name: "getWorkspaceBilling",
    description: `Get workspace billing info`,
    inputSchema: {"type":"object","properties":{"workspaceSlug":{"type":"string"}},"required":["workspaceSlug"]},
    method: "get",
    pathTemplate: "/api/workspaces/{workspaceSlug}/billing",
    executionParameters: [{"name":"workspaceSlug","in":"path"}],
    requestBodyContentType: undefined,
    securityRequirements: [{"cloady":[]}],
    tags: [],
    deprecated: false
  }],
  ["changeBillingPlan", {
    name: "changeBillingPlan",
    description: `Change workspace billing tier`,
    inputSchema: {"type":"object","properties":{"workspaceSlug":{"type":"string"},"requestBody":{"type":"object","properties":{"tier":{"type":"string","minLength":1}},"required":["tier"],"description":"The JSON request body."}},"required":["workspaceSlug"]},
    method: "post",
    pathTemplate: "/api/workspaces/{workspaceSlug}/billing/plan",
    executionParameters: [{"name":"workspaceSlug","in":"path"}],
    requestBodyContentType: "application/json",
    securityRequirements: [{"cloady":[]}],
    tags: [],
    deprecated: false
  }],
  ["listWorkspaceMembers", {
    name: "listWorkspaceMembers",
    description: `List workspace members`,
    inputSchema: {"type":"object","properties":{"workspaceSlug":{"type":"string"}},"required":["workspaceSlug"]},
    method: "get",
    pathTemplate: "/api/workspaces/{workspaceSlug}/members",
    executionParameters: [{"name":"workspaceSlug","in":"path"}],
    requestBodyContentType: undefined,
    securityRequirements: [{"cloady":[]}],
    tags: [],
    deprecated: false
  }],
  ["listWorkspaceInvitations", {
    name: "listWorkspaceInvitations",
    description: `List pending workspace invitations`,
    inputSchema: {"type":"object","properties":{"workspaceSlug":{"type":"string"}},"required":["workspaceSlug"]},
    method: "get",
    pathTemplate: "/api/workspaces/{workspaceSlug}/invitations",
    executionParameters: [{"name":"workspaceSlug","in":"path"}],
    requestBodyContentType: undefined,
    securityRequirements: [{"cloady":[]}],
    tags: [],
    deprecated: false
  }],
  ["createWorkspaceInvitation", {
    name: "createWorkspaceInvitation",
    description: `Send workspace invitation`,
    inputSchema: {"type":"object","properties":{"workspaceSlug":{"type":"string"},"requestBody":{"type":"object","properties":{"email":{"type":"string","format":"email","pattern":"^(?!\\.)(?!.*\\.\\.)([A-Za-z0-9_'+\\-\\.]*)[A-Za-z0-9_+-]@([A-Za-z0-9][A-Za-z0-9\\-]*\\.)+[A-Za-z]{2,}$"},"role":{"type":"string","enum":["owner","admin","developer","viewer"]}},"required":["email"],"description":"The JSON request body."}},"required":["workspaceSlug"]},
    method: "post",
    pathTemplate: "/api/workspaces/{workspaceSlug}/invitations",
    executionParameters: [{"name":"workspaceSlug","in":"path"}],
    requestBodyContentType: "application/json",
    securityRequirements: [{"cloady":[]}],
    tags: [],
    deprecated: false
  }],
  ["revokeWorkspaceInvitation", {
    name: "revokeWorkspaceInvitation",
    description: `Revoke workspace invitation`,
    inputSchema: {"type":"object","properties":{"workspaceSlug":{"type":"string"},"invitationId":{"type":"string"}},"required":["workspaceSlug","invitationId"]},
    method: "delete",
    pathTemplate: "/api/workspaces/{workspaceSlug}/invitations/{invitationId}",
    executionParameters: [{"name":"workspaceSlug","in":"path"},{"name":"invitationId","in":"path"}],
    requestBodyContentType: undefined,
    securityRequirements: [{"cloady":[]}],
    tags: [],
    deprecated: false
  }],
  ["transferWorkspaceOwnership", {
    name: "transferWorkspaceOwnership",
    description: `Transfer workspace ownership`,
    inputSchema: {"type":"object","properties":{"workspaceSlug":{"type":"string"},"requestBody":{"type":"object","properties":{"targetUserId":{"type":"string","minLength":1,"maxLength":80}},"required":["targetUserId"],"description":"The JSON request body."}},"required":["workspaceSlug"]},
    method: "post",
    pathTemplate: "/api/workspaces/{workspaceSlug}/transfer",
    executionParameters: [{"name":"workspaceSlug","in":"path"}],
    requestBodyContentType: "application/json",
    securityRequirements: [{"cloady":[]}],
    tags: [],
    deprecated: false
  }],
  ["listWorkspaceDomains", {
    name: "listWorkspaceDomains",
    description: `List all domains in workspace`,
    inputSchema: {"type":"object","properties":{"workspaceSlug":{"type":"string"}},"required":["workspaceSlug"]},
    method: "get",
    pathTemplate: "/api/workspaces/{workspaceSlug}/domains",
    executionParameters: [{"name":"workspaceSlug","in":"path"}],
    requestBodyContentType: undefined,
    securityRequirements: [{"cloady":[]}],
    tags: [],
    deprecated: false
  }],
  ["listWorkspaceVolumes", {
    name: "listWorkspaceVolumes",
    description: `List storage volumes in workspace`,
    inputSchema: {"type":"object","properties":{"workspaceSlug":{"type":"string"},"env":{"type":"string","enum":["production","preview","development"]},"region":{"type":"string"}},"required":["workspaceSlug"]},
    method: "get",
    pathTemplate: "/api/workspaces/{workspaceSlug}/volumes",
    executionParameters: [{"name":"workspaceSlug","in":"path"},{"name":"env","in":"query"},{"name":"region","in":"query"}],
    requestBodyContentType: undefined,
    securityRequirements: [{"cloady":[]}],
    tags: [],
    deprecated: false
  }],
  ["listWorkspaceIntegrations", {
    name: "listWorkspaceIntegrations",
    description: `List workspace integrations and provider status`,
    inputSchema: {"type":"object","properties":{"workspaceSlug":{"type":"string"}},"required":["workspaceSlug"]},
    method: "get",
    pathTemplate: "/api/workspaces/{workspaceSlug}/integrations",
    executionParameters: [{"name":"workspaceSlug","in":"path"}],
    requestBodyContentType: undefined,
    securityRequirements: [{"cloady":[]}],
    tags: [],
    deprecated: false
  }],
  ["linkGithubIntegration", {
    name: "linkGithubIntegration",
    description: `Link GitHub installation to workspace`,
    inputSchema: {"type":"object","properties":{"workspaceSlug":{"type":"string"},"requestBody":{"type":"object","properties":{"installationId":{"type":"string","minLength":1,"maxLength":40}},"required":["installationId"],"description":"The JSON request body."}},"required":["workspaceSlug"]},
    method: "post",
    pathTemplate: "/api/workspaces/{workspaceSlug}/integrations/github",
    executionParameters: [{"name":"workspaceSlug","in":"path"}],
    requestBodyContentType: "application/json",
    securityRequirements: [{"cloady":[]}],
    tags: [],
    deprecated: false
  }],
  ["disconnectGithubIntegration", {
    name: "disconnectGithubIntegration",
    description: `Disconnect GitHub integration from workspace`,
    inputSchema: {"type":"object","properties":{"workspaceSlug":{"type":"string"}},"required":["workspaceSlug"]},
    method: "delete",
    pathTemplate: "/api/workspaces/{workspaceSlug}/integrations/github",
    executionParameters: [{"name":"workspaceSlug","in":"path"}],
    requestBodyContentType: undefined,
    securityRequirements: [{"cloady":[]}],
    tags: [],
    deprecated: false
  }],
  ["listGithubRepos", {
    name: "listGithubRepos",
    description: `Search GitHub repositories`,
    inputSchema: {"type":"object","properties":{"workspaceSlug":{"type":"string"},"q":{"type":"string"},"limit":{"type":"number"},"installationId":{"type":"string"}},"required":["workspaceSlug"]},
    method: "get",
    pathTemplate: "/api/workspaces/{workspaceSlug}/integrations/github/repos",
    executionParameters: [{"name":"workspaceSlug","in":"path"},{"name":"q","in":"query"},{"name":"limit","in":"query"},{"name":"installationId","in":"query"}],
    requestBodyContentType: undefined,
    securityRequirements: [{"cloady":[]}],
    tags: [],
    deprecated: false
  }],
  ["listTokens", {
    name: "listTokens",
    description: `List the authenticated user's API tokens`,
    inputSchema: {"type":"object","properties":{}},
    method: "get",
    pathTemplate: "/api/me/tokens",
    executionParameters: [],
    requestBodyContentType: undefined,
    securityRequirements: [{"cloady":[]}],
    tags: [],
    deprecated: false
  }],
  ["createToken", {
    name: "createToken",
    description: `Create a new API token for the current user`,
    inputSchema: {"type":"object","properties":{"requestBody":{"type":"object","properties":{"name":{"type":"string","minLength":1,"maxLength":80},"scope":{"type":"string","enum":["full","deploy","read"],"default":"full"},"expires":{"default":"never","type":"string","enum":["never","30d","90d","1y"]}},"required":["name"],"description":"The JSON request body."}}},
    method: "post",
    pathTemplate: "/api/me/tokens",
    executionParameters: [],
    requestBodyContentType: "application/json",
    securityRequirements: [{"cloady":[]}],
    tags: [],
    deprecated: false
  }],
  ["revokeToken", {
    name: "revokeToken",
    description: `Revoke an API token`,
    inputSchema: {"type":"object","properties":{"id":{"type":"string"}},"required":["id"]},
    method: "delete",
    pathTemplate: "/api/me/tokens/{id}",
    executionParameters: [{"name":"id","in":"path"}],
    requestBodyContentType: undefined,
    securityRequirements: [{"cloady":[]}],
    tags: [],
    deprecated: false
  }],
  ["getAccountBilling", {
    name: "getAccountBilling",
    description: `Get account billing information including payment methods and invoices`,
    inputSchema: {"type":"object","properties":{}},
    method: "get",
    pathTemplate: "/api/me/billing",
    executionParameters: [],
    requestBodyContentType: undefined,
    securityRequirements: [{"cloady":[]}],
    tags: [],
    deprecated: false
  }],
  ["startCardSetup", {
    name: "startCardSetup",
    description: `Returns a \`clientSecret\` that Stripe's payment element exchanges for a saved card in the browser. The secret alone cannot charge anything or read existing cards, and it is scoped to the caller's own Stripe customer.`,
    inputSchema: {"type":"object","properties":{}},
    method: "post",
    pathTemplate: "/api/me/billing/payment-method",
    executionParameters: [],
    requestBodyContentType: undefined,
    securityRequirements: [{"cloady":[]}],
    tags: [],
    deprecated: false
  }],
  ["getUserBillingState", {
    name: "getUserBillingState",
    description: `Get user billing state (free availability and payment method status)`,
    inputSchema: {"type":"object","properties":{}},
    method: "get",
    pathTemplate: "/api/me/billing-state",
    executionParameters: [],
    requestBodyContentType: undefined,
    securityRequirements: [{"cloady":[]}],
    tags: [],
    deprecated: false
  }],
  ["getNotificationPreferences", {
    name: "getNotificationPreferences",
    description: `Get notification preferences for the current user`,
    inputSchema: {"type":"object","properties":{}},
    method: "get",
    pathTemplate: "/api/me/notifications",
    executionParameters: [],
    requestBodyContentType: undefined,
    securityRequirements: [{"cloady":[]}],
    tags: [],
    deprecated: false
  }],
  ["updateNotificationPreferences", {
    name: "updateNotificationPreferences",
    description: `Update notification preferences for the current user`,
    inputSchema: {"type":"object","properties":{"requestBody":{"type":"object","properties":{"deploys":{"type":"boolean"},"incidents":{"type":"boolean"},"billing":{"type":"boolean"},"weekly":{"type":"boolean"},"product":{"type":"boolean"}},"description":"The JSON request body."}}},
    method: "patch",
    pathTemplate: "/api/me/notifications",
    executionParameters: [],
    requestBodyContentType: "application/json",
    securityRequirements: [{"cloady":[]}],
    tags: [],
    deprecated: false
  }],
  ["checkPassword", {
    name: "checkPassword",
    description: `Read the account's sign-in security state`,
    inputSchema: {"type":"object","properties":{}},
    method: "get",
    pathTemplate: "/api/me/security",
    executionParameters: [],
    requestBodyContentType: undefined,
    securityRequirements: [{"cloady":[]}],
    tags: [],
    deprecated: false
  }],
  ["updatePassword", {
    name: "updatePassword",
    description: `Update or set the password for the current user`,
    inputSchema: {"type":"object","properties":{"requestBody":{"type":"object","properties":{"currentPassword":{"type":"string"},"newPassword":{"type":"string","minLength":12,"maxLength":200}},"required":["newPassword"],"description":"The JSON request body."}}},
    method: "post",
    pathTemplate: "/api/me/security",
    executionParameters: [],
    requestBodyContentType: "application/json",
    securityRequirements: [{"cloady":[]}],
    tags: [],
    deprecated: false
  }],
  ["listTickets", {
    name: "listTickets",
    description: `List support tickets for the current user`,
    inputSchema: {"type":"object","properties":{}},
    method: "get",
    pathTemplate: "/api/me/tickets",
    executionParameters: [],
    requestBodyContentType: undefined,
    securityRequirements: [{"cloady":[]}],
    tags: [],
    deprecated: false
  }],
  ["createTicket", {
    name: "createTicket",
    description: `Create a new support ticket`,
    inputSchema: {"type":"object","properties":{"requestBody":{"type":"object","properties":{"subject":{"type":"string","minLength":1,"maxLength":160},"topic":{"default":"general","type":"string","minLength":1,"maxLength":40},"body":{"type":"string","minLength":1,"maxLength":8000}},"required":["subject","body"],"description":"The JSON request body."}}},
    method: "post",
    pathTemplate: "/api/me/tickets",
    executionParameters: [],
    requestBodyContentType: "application/json",
    securityRequirements: [{"cloady":[]}],
    tags: [],
    deprecated: false
  }],
  ["getTicket", {
    name: "getTicket",
    description: `Get a single support ticket with all messages`,
    inputSchema: {"type":"object","properties":{"id":{"type":"string"}},"required":["id"]},
    method: "get",
    pathTemplate: "/api/me/tickets/{id}",
    executionParameters: [{"name":"id","in":"path"}],
    requestBodyContentType: undefined,
    securityRequirements: [{"cloady":[]}],
    tags: [],
    deprecated: false
  }],
  ["updateTicket", {
    name: "updateTicket",
    description: `Update ticket status or mark as read`,
    inputSchema: {"type":"object","properties":{"id":{"type":"string"},"requestBody":{"type":"object","properties":{"status":{"type":"string","enum":["open","resolved"]},"read":{"type":"boolean","const":true}},"description":"The JSON request body."}},"required":["id"]},
    method: "patch",
    pathTemplate: "/api/me/tickets/{id}",
    executionParameters: [{"name":"id","in":"path"}],
    requestBodyContentType: "application/json",
    securityRequirements: [{"cloady":[]}],
    tags: [],
    deprecated: false
  }],
  ["addTicketMessage", {
    name: "addTicketMessage",
    description: `Add a message to a support ticket`,
    inputSchema: {"type":"object","properties":{"id":{"type":"string"},"requestBody":{"type":"object","properties":{"body":{"type":"string","minLength":1,"maxLength":8000}},"required":["body"],"description":"The JSON request body."}},"required":["id"]},
    method: "post",
    pathTemplate: "/api/me/tickets/{id}/messages",
    executionParameters: [{"name":"id","in":"path"}],
    requestBodyContentType: "application/json",
    securityRequirements: [{"cloady":[]}],
    tags: [],
    deprecated: false
  }],
  ["verifyPhone", {
    name: "verifyPhone",
    description: `Confirm a phone number with the code that was sent`,
    inputSchema: {"type":"object","properties":{"requestBody":{"type":"object","properties":{"phone":{"type":"string","minLength":7,"maxLength":20},"code":{"type":"string","minLength":6,"maxLength":6,"pattern":"^\\d{6}$"}},"required":["phone","code"],"description":"The JSON request body."}}},
    method: "put",
    pathTemplate: "/api/me/security/phone",
    executionParameters: [],
    requestBodyContentType: "application/json",
    securityRequirements: [{"cloady":[]}],
    tags: [],
    deprecated: false
  }],
  ["startPhoneVerification", {
    name: "startPhoneVerification",
    description: `Send a verification code to a phone number`,
    inputSchema: {"type":"object","properties":{"requestBody":{"type":"object","properties":{"phone":{"type":"string","minLength":7,"maxLength":20}},"required":["phone"],"description":"The JSON request body."}}},
    method: "post",
    pathTemplate: "/api/me/security/phone",
    executionParameters: [],
    requestBodyContentType: "application/json",
    securityRequirements: [{"cloady":[]}],
    tags: [],
    deprecated: false
  }],
  ["setMfa", {
    name: "setMfa",
    description: `Enabling it requires a verified phone number.`,
    inputSchema: {"type":"object","properties":{"requestBody":{"type":"object","properties":{"mfaEnabled":{"type":"boolean"}},"required":["mfaEnabled"],"description":"The JSON request body."}}},
    method: "patch",
    pathTemplate: "/api/me/security/phone",
    executionParameters: [],
    requestBodyContentType: "application/json",
    securityRequirements: [{"cloady":[]}],
    tags: [],
    deprecated: false
  }],
  ["streamTicketMessages", {
    name: "streamTicketMessages",
    description: `Returns one frame. Sending \`Accept: text/event-stream\` instead follows the thread live, every 2.5 seconds, which stops only when the ticket disappears.`,
    inputSchema: {"type":"object","properties":{"id":{"type":"string"}},"required":["id"]},
    method: "get",
    pathTemplate: "/api/me/tickets/{id}/stream",
    executionParameters: [{"name":"id","in":"path"}],
    requestBodyContentType: undefined,
    securityRequirements: [{"cloady":[]}],
    tags: [],
    deprecated: false
  }],
  ["checkWorkspaceSlug", {
    name: "checkWorkspaceSlug",
    description: `Returns the slug that would actually be used; \`suffixed\` is true when the requested one was taken and a numeric suffix was added.`,
    inputSchema: {"type":"object","properties":{"slug":{"type":"string"}},"required":["slug"]},
    method: "get",
    pathTemplate: "/api/slug-check",
    executionParameters: [{"name":"slug","in":"query"}],
    requestBodyContentType: undefined,
    securityRequirements: [{"cloady":[]}],
    tags: [],
    deprecated: false
  }],
  ["listTemplates", {
    name: "listTemplates",
    description: `List all available application templates`,
    inputSchema: {"type":"object","properties":{}},
    method: "get",
    pathTemplate: "/api/templates",
    executionParameters: [],
    requestBodyContentType: undefined,
    securityRequirements: [{"cloady":[]}],
    tags: [],
    deprecated: false
  }],
  ["listTiers", {
    name: "listTiers",
    description: `List all available service tiers`,
    inputSchema: {"type":"object","properties":{}},
    method: "get",
    pathTemplate: "/api/tiers",
    executionParameters: [],
    requestBodyContentType: undefined,
    securityRequirements: [{"cloady":[]}],
    tags: [],
    deprecated: false
  }],
  ["getPricing", {
    name: "getPricing",
    description: `Get public pricing information for all tiers`,
    inputSchema: {"type":"object","properties":{}},
    method: "get",
    pathTemplate: "/api/billing/pricing",
    executionParameters: [],
    requestBodyContentType: undefined,
    securityRequirements: [{"cloady":[]}],
    tags: [],
    deprecated: false
  }],
  ["getInvitation", {
    name: "getInvitation",
    description: `Get invitation details by token`,
    inputSchema: {"type":"object","properties":{"token":{"type":"string"}},"required":["token"]},
    method: "get",
    pathTemplate: "/api/invitations/{token}",
    executionParameters: [{"name":"token","in":"path"}],
    requestBodyContentType: undefined,
    securityRequirements: [{"cloady":[]}],
    tags: [],
    deprecated: false
  }],
  ["acceptInvitation", {
    name: "acceptInvitation",
    description: `Accept a workspace invitation`,
    inputSchema: {"type":"object","properties":{"token":{"type":"string"}},"required":["token"]},
    method: "post",
    pathTemplate: "/api/invitations/{token}/accept",
    executionParameters: [{"name":"token","in":"path"}],
    requestBodyContentType: undefined,
    securityRequirements: [{"cloady":[]}],
    tags: [],
    deprecated: false
  }],
  ["declineInvitation", {
    name: "declineInvitation",
    description: `Decline a workspace invitation`,
    inputSchema: {"type":"object","properties":{"token":{"type":"string"}},"required":["token"]},
    method: "post",
    pathTemplate: "/api/invitations/{token}/decline",
    executionParameters: [{"name":"token","in":"path"}],
    requestBodyContentType: undefined,
    securityRequirements: [{"cloady":[]}],
    tags: [],
    deprecated: false
  }],
]);

/**
 * Security schemes from the OpenAPI spec
 */
const securitySchemes =   {
    "cloady": {
      "type": "http",
      "scheme": "bearer",
      "description": "Personal API token (cldy_…)"
    }
  };


server.setRequestHandler(ListToolsRequestSchema, async () => {
  const toolsForClient: Tool[] = Array.from(toolDefinitionMap.values()).map(def => ({
    name: def.name,
    description: def.description,
    inputSchema: def.inputSchema
  }));
  return { tools: toolsForClient };
});


server.setRequestHandler(CallToolRequestSchema, async (request: CallToolRequest): Promise<CallToolResult> => {
  const { name: toolName, arguments: toolArgs } = request.params;
  const toolDefinition = toolDefinitionMap.get(toolName);
  if (!toolDefinition) {
    console.error(`Error: Unknown tool requested: ${toolName}`);
    return { content: [{ type: "text", text: `Error: Unknown tool requested: ${toolName}` }] };
  }
  return await executeApiTool(toolName, toolDefinition, toolArgs ?? {}, securitySchemes);
});



/**
 * Type definition for cached OAuth tokens
 */
interface TokenCacheEntry {
    token: string;
    expiresAt: number;
}

/**
 * Declare global __oauthTokenCache property for TypeScript
 */
declare global {
    var __oauthTokenCache: Record<string, TokenCacheEntry> | undefined;
}

/**
 * Acquires an OAuth2 token using client credentials flow
 * 
 * @param schemeName Name of the security scheme
 * @param scheme OAuth2 security scheme
 * @returns Acquired token or null if unable to acquire
 */
async function acquireOAuth2Token(schemeName: string, scheme: any): Promise<string | null | undefined> {
    try {
        // Check if we have the necessary credentials (resolved per-scheme at runtime)
        const clientId = process.env[`OAUTH_CLIENT_ID_${schemeName.replace(/[^a-zA-Z0-9]/g, '_').toUpperCase()}`];
        const clientSecret = process.env[`OAUTH_CLIENT_SECRET_${schemeName.replace(/[^a-zA-Z0-9]/g, '_').toUpperCase()}`];
        const scopes = process.env[`OAUTH_SCOPES_${schemeName.replace(/[^a-zA-Z0-9]/g, '_').toUpperCase()}`];

        if (!clientId || !clientSecret) {
            console.error(`Missing client credentials for OAuth2 scheme '${schemeName}'`);
            return null;
        }
        
        // Initialize token cache if needed
        if (typeof global.__oauthTokenCache === 'undefined') {
            global.__oauthTokenCache = {};
        }
        
        // Check if we have a cached token
        const cacheKey = `${schemeName}_${clientId}`;
        const cachedToken = global.__oauthTokenCache[cacheKey];
        const now = Date.now();
        
        if (cachedToken && cachedToken.expiresAt > now) {
            console.error(`Using cached OAuth2 token for '${schemeName}' (expires in ${Math.floor((cachedToken.expiresAt - now) / 1000)} seconds)`);
            return cachedToken.token;
        }
        
        // Determine token URL based on flow type
        let tokenUrl = '';
        if (scheme.flows?.clientCredentials?.tokenUrl) {
            tokenUrl = scheme.flows.clientCredentials.tokenUrl;
            console.error(`Using client credentials flow for '${schemeName}'`);
        } else if (scheme.flows?.password?.tokenUrl) {
            tokenUrl = scheme.flows.password.tokenUrl;
            console.error(`Using password flow for '${schemeName}'`);
        } else {
            console.error(`No supported OAuth2 flow found for '${schemeName}'`);
            return null;
        }
        
        // Prepare the token request
        let formData = new URLSearchParams();
        formData.append('grant_type', 'client_credentials');
        
        // Add scopes if specified
        if (scopes) {
            formData.append('scope', scopes);
        }

        console.error(`Requesting OAuth2 token from ${tokenUrl}`);

        // Make the token request
        const response = await axios({
            method: 'POST',
            url: tokenUrl,
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
                'Authorization': `Basic ${Buffer.from(`${clientId}:${clientSecret}`).toString('base64')}`
            },
            data: formData.toString()
        });
        
        // Process the response
        if (response.data?.access_token) {
            const token = response.data.access_token;
            const expiresIn = response.data.expires_in || 3600; // Default to 1 hour
            
            // Cache the token
            global.__oauthTokenCache[cacheKey] = {
                token,
                expiresAt: now + (expiresIn * 1000) - 60000 // Expire 1 minute early
            };
            
            console.error(`Successfully acquired OAuth2 token for '${schemeName}' (expires in ${expiresIn} seconds)`);
            return token;
        } else {
            console.error(`Failed to acquire OAuth2 token for '${schemeName}': No access_token in response`);
            return null;
        }
    } catch (error: unknown) {
        const errorMessage = error instanceof Error ? error.message : String(error);
        console.error(`Error acquiring OAuth2 token for '${schemeName}':`, errorMessage);
        return null;
    }
}


/**
 * Executes an API tool with the provided arguments
 * 
 * @param toolName Name of the tool to execute
 * @param definition Tool definition
 * @param toolArgs Arguments provided by the user
 * @param allSecuritySchemes Security schemes from the OpenAPI spec
 * @returns Call tool result
 */
async function executeApiTool(
    toolName: string,
    definition: McpToolDefinition,
    toolArgs: JsonObject,
    allSecuritySchemes: Record<string, any>
): Promise<CallToolResult> {
  try {
    // Validate arguments against the input schema
    let validatedArgs: JsonObject;
    try {
        const zodSchema = getZodSchemaFromJsonSchema(definition.inputSchema, toolName);
        const argsToParse = (typeof toolArgs === 'object' && toolArgs !== null) ? toolArgs : {};
        validatedArgs = zodSchema.parse(argsToParse);
    } catch (error: unknown) {
        if (error instanceof ZodError) {
            const validationErrorMessage = `Invalid arguments for tool '${toolName}': ${error.errors.map(e => `${e.path.join('.')} (${e.code}): ${e.message}`).join(', ')}`;
            return { content: [{ type: 'text', text: validationErrorMessage }] };
        } else {
             const errorMessage = error instanceof Error ? error.message : String(error);
             return { content: [{ type: 'text', text: `Internal error during validation setup: ${errorMessage}` }] };
        }
    }

    // Prepare URL, query parameters, headers, and request body
    let urlPath = definition.pathTemplate;
    const queryParams: Record<string, any> = {};
    const headers: Record<string, string> = { 'Accept': 'application/json' };
    let requestBodyData: any = undefined;

    // Apply parameters to the URL path, query, or headers
    definition.executionParameters.forEach((param) => {
        const value = validatedArgs[param.name];
        if (typeof value !== 'undefined' && value !== null) {
            if (param.in === 'path') {
                urlPath = urlPath.replace(`{${param.name}}`, encodeURIComponent(String(value)));
            }
            else if (param.in === 'query') {
                queryParams[param.name] = value;
            }
            else if (param.in === 'header') {
                headers[param.name.toLowerCase()] = String(value);
            }
        }
    });

    // Ensure all path parameters are resolved
    if (urlPath.includes('{')) {
        throw new Error(`Failed to resolve path parameters: ${urlPath}`);
    }
    
    // Construct the full URL
    const requestUrl = API_BASE_URL ? `${API_BASE_URL}${urlPath}` : urlPath;

    // Handle request body if needed
    if (definition.requestBodyContentType && typeof validatedArgs['requestBody'] !== 'undefined') {
        requestBodyData = validatedArgs['requestBody'];
        headers['content-type'] = definition.requestBodyContentType;
    }

    // Apply security requirements if available
    // Security requirements use OR between array items and AND within each object
    const appliedSecurity = definition.securityRequirements?.find(req => {
        // Try each security requirement (combined with OR)
        return Object.entries(req).every(([schemeName, scopesArray]) => {
            const scheme = allSecuritySchemes[schemeName];
            if (!scheme) return false;
            
            // API Key security (header, query, cookie)
            if (scheme.type === 'apiKey') {
                return !!process.env[`API_KEY_${schemeName.replace(/[^a-zA-Z0-9]/g, '_').toUpperCase()}`];
            }
            
            // HTTP security (basic, bearer)
            if (scheme.type === 'http') {
                if (scheme.scheme?.toLowerCase() === 'bearer') {
                    return !!process.env[`BEARER_TOKEN_${schemeName.replace(/[^a-zA-Z0-9]/g, '_').toUpperCase()}`];
                }
                else if (scheme.scheme?.toLowerCase() === 'basic') {
                    // Username is sufficient; an empty password is valid per RFC 7617 (issue #66)
                    return process.env[`BASIC_USERNAME_${schemeName.replace(/[^a-zA-Z0-9]/g, '_').toUpperCase()}`] != null;
                }
            }
            
            // OAuth2 security
            if (scheme.type === 'oauth2') {
                // Check for pre-existing token
                if (process.env[`OAUTH_TOKEN_${schemeName.replace(/[^a-zA-Z0-9]/g, '_').toUpperCase()}`]) {
                    return true;
                }
                
                // Check for client credentials for auto-acquisition
                if (process.env[`OAUTH_CLIENT_ID_${schemeName.replace(/[^a-zA-Z0-9]/g, '_').toUpperCase()}`] &&
                    process.env[`OAUTH_CLIENT_SECRET_${schemeName.replace(/[^a-zA-Z0-9]/g, '_').toUpperCase()}`]) {
                    // Verify we have a supported flow
                    if (scheme.flows?.clientCredentials || scheme.flows?.password) {
                        return true;
                    }
                }
                
                return false;
            }
            
            // OpenID Connect
            if (scheme.type === 'openIdConnect') {
                return !!process.env[`OPENID_TOKEN_${schemeName.replace(/[^a-zA-Z0-9]/g, '_').toUpperCase()}`];
            }
            
            return false;
        });
    });

    // If we found matching security scheme(s), apply them
    if (appliedSecurity) {
        // Apply each security scheme from this requirement (combined with AND)
        for (const [schemeName, scopesArray] of Object.entries(appliedSecurity)) {
            const scheme = allSecuritySchemes[schemeName];
            
            // API Key security
            if (scheme?.type === 'apiKey') {
                const apiKey = process.env[`API_KEY_${schemeName.replace(/[^a-zA-Z0-9]/g, '_').toUpperCase()}`];
                if (apiKey) {
                    if (scheme.in === 'header') {
                        headers[scheme.name.toLowerCase()] = apiKey;
                        console.error(`Applied API key '${schemeName}' in header '${scheme.name}'`);
                    }
                    else if (scheme.in === 'query') {
                        queryParams[scheme.name] = apiKey;
                        console.error(`Applied API key '${schemeName}' in query parameter '${scheme.name}'`);
                    }
                    else if (scheme.in === 'cookie') {
                        // Add the cookie, preserving other cookies if they exist
                        headers['cookie'] = `${scheme.name}=${apiKey}${headers['cookie'] ? `; ${headers['cookie']}` : ''}`;
                        console.error(`Applied API key '${schemeName}' in cookie '${scheme.name}'`);
                    }
                }
            } 
            // HTTP security (Bearer or Basic)
            else if (scheme?.type === 'http') {
                if (scheme.scheme?.toLowerCase() === 'bearer') {
                    const token = process.env[`BEARER_TOKEN_${schemeName.replace(/[^a-zA-Z0-9]/g, '_').toUpperCase()}`];
                    if (token) {
                        headers['authorization'] = `Bearer ${token}`;
                        console.error(`Applied Bearer token for '${schemeName}'`);
                    }
                } 
                else if (scheme.scheme?.toLowerCase() === 'basic') {
                    const username = process.env[`BASIC_USERNAME_${schemeName.replace(/[^a-zA-Z0-9]/g, '_').toUpperCase()}`];
                    const password = process.env[`BASIC_PASSWORD_${schemeName.replace(/[^a-zA-Z0-9]/g, '_').toUpperCase()}`];
                    // Empty password is valid per RFC 7617 (issue #66); only username is required.
                    if (username != null) {
                        headers['authorization'] = `Basic ${Buffer.from(`${username}:${password ?? ''}`).toString('base64')}`;
                        console.error(`Applied Basic authentication for '${schemeName}'`);
                    }
                }
            }
            // OAuth2 security
            else if (scheme?.type === 'oauth2') {
                // First try to use a pre-provided token
                let token = process.env[`OAUTH_TOKEN_${schemeName.replace(/[^a-zA-Z0-9]/g, '_').toUpperCase()}`];
                
                // If no token but we have client credentials, try to acquire a token
                if (!token && (scheme.flows?.clientCredentials || scheme.flows?.password)) {
                    console.error(`Attempting to acquire OAuth token for '${schemeName}'`);
                    token = (await acquireOAuth2Token(schemeName, scheme)) ?? '';
                }
                
                // Apply token if available
                if (token) {
                    headers['authorization'] = `Bearer ${token}`;
                    console.error(`Applied OAuth2 token for '${schemeName}'`);
                    
                    // List the scopes that were requested, if any
                    const scopes = scopesArray as string[];
                    if (scopes && scopes.length > 0) {
                        console.error(`Requested scopes: ${scopes.join(', ')}`);
                    }
                }
            }
            // OpenID Connect
            else if (scheme?.type === 'openIdConnect') {
                const token = process.env[`OPENID_TOKEN_${schemeName.replace(/[^a-zA-Z0-9]/g, '_').toUpperCase()}`];
                if (token) {
                    headers['authorization'] = `Bearer ${token}`;
                    console.error(`Applied OpenID Connect token for '${schemeName}'`);
                    
                    // List the scopes that were requested, if any
                    const scopes = scopesArray as string[];
                    if (scopes && scopes.length > 0) {
                        console.error(`Requested scopes: ${scopes.join(', ')}`);
                    }
                }
            }
        }
    } 
    // Log warning if security is required but not available
    else if (definition.securityRequirements?.length > 0) {
        // First generate a more readable representation of the security requirements
        const securityRequirementsString = definition.securityRequirements
            .map(req => {
                const parts = Object.entries(req)
                    .map(([name, scopesArray]) => {
                        const scopes = scopesArray as string[];
                        if (scopes.length === 0) return name;
                        return `${name} (scopes: ${scopes.join(', ')})`;
                    })
                    .join(' AND ');
                return `[${parts}]`;
            })
            .join(' OR ');
            
        console.warn(`Tool '${toolName}' requires security: ${securityRequirementsString}, but no suitable credentials found.`);
    }
    

    // Prepare the axios request configuration
    const config: AxiosRequestConfig = {
      method: definition.method.toUpperCase(),
      url: requestUrl,
      params: queryParams,
      headers: headers,
      // Serialize array query params as comma-separated values (issue #41)
      paramsSerializer: (params: Record<string, any>) => {
        const search = new URLSearchParams();
        for (const [key, value] of Object.entries(params)) {
          if (value === undefined || value === null) continue;
          search.append(key, Array.isArray(value) ? value.join(',') : String(value));
        }
        return search.toString();
      },
      ...(requestBodyData !== undefined && { data: requestBodyData }),
    };

    // Log request info to stderr (doesn't affect MCP output)
    console.error(`Executing tool "${toolName}": ${config.method} ${config.url}`);

    // Execute the request
    const response = await axios(config);

    // Process and format the response
    let responseText = '';
    // Coerce header value to string before lowercasing (issue #65)
    const contentType = String(response.headers['content-type'] ?? '').toLowerCase();
    
    // Handle JSON responses
    if (contentType.includes('application/json') && typeof response.data === 'object' && response.data !== null) {
         try { 
             responseText = JSON.stringify(response.data, null, 2); 
         } catch (e) { 
             responseText = "[Stringify Error]"; 
         }
    } 
    // Handle string responses
    else if (typeof response.data === 'string') { 
         responseText = response.data; 
    }
    // Handle other response types
    else if (response.data !== undefined && response.data !== null) { 
         responseText = String(response.data); 
    }
    // Handle empty responses
    else { 
         responseText = `(Status: ${response.status} - No body content)`; 
    }
    
    // Return formatted response
    return { 
        content: [ 
            { 
                type: "text", 
                text: `API Response (Status: ${response.status}):\n${responseText}` 
            } 
        ], 
    };

  } catch (error: unknown) {
    // Handle errors during execution
    let errorMessage: string;
    
    // Format Axios errors specially
    if (axios.isAxiosError(error)) { 
        errorMessage = formatApiError(error); 
    }
    // Handle standard errors
    else if (error instanceof Error) { 
        errorMessage = error.message; 
    }
    // Handle unexpected error types
    else { 
        errorMessage = 'Unexpected error: ' + String(error); 
    }
    
    // Log error to stderr
    console.error(`Error during execution of tool '${toolName}':`, errorMessage);
    
    // Return error message to client
    return { content: [{ type: "text", text: errorMessage }] };
  }
}


/**
 * Main function to start the server
 */
async function main() {
// Set up stdio transport
  try {
    const transport = new StdioServerTransport();
    await server.connect(transport);
    console.error(`${SERVER_NAME} MCP Server (v${SERVER_VERSION}) running on stdio${API_BASE_URL ? `, proxying API at ${API_BASE_URL}` : ''}`);
  } catch (error) {
    console.error("Error during server startup:", error);
    process.exit(1);
  }
}

/**
 * Cleanup function for graceful shutdown
 */
async function cleanup() {
    console.error("Shutting down MCP server...");
    process.exit(0);
}

// Register signal handlers
process.on('SIGINT', cleanup);
process.on('SIGTERM', cleanup);

// Start the server
main().catch((error) => {
  console.error("Fatal error in main execution:", error);
  process.exit(1);
});

/**
 * Formats API errors for better readability
 * 
 * @param error Axios error
 * @returns Formatted error message
 */
function formatApiError(error: AxiosError): string {
    let message = 'API request failed.';
    if (error.response) {
        message = `API Error: Status ${error.response.status} (${error.response.statusText || 'Status text not available'}). `;
        const responseData = error.response.data;
        const MAX_LEN = 200;
        if (typeof responseData === 'string') { 
            message += `Response: ${responseData.substring(0, MAX_LEN)}${responseData.length > MAX_LEN ? '...' : ''}`; 
        }
        else if (responseData) { 
            try { 
                const jsonString = JSON.stringify(responseData); 
                message += `Response: ${jsonString.substring(0, MAX_LEN)}${jsonString.length > MAX_LEN ? '...' : ''}`; 
            } catch { 
                message += 'Response: [Could not serialize data]'; 
            } 
        }
        else { 
            message += 'No response body received.'; 
        }
    } else if (error.request) {
        message = 'API Network Error: No response received from server.';
        if (error.code) message += ` (Code: ${error.code})`;
    } else { 
        message += `API Request Setup Error: ${error.message}`; 
    }
    return message;
}

/**
 * Converts a JSON Schema to a Zod schema for runtime validation
 * 
 * @param jsonSchema JSON Schema
 * @param toolName Tool name for error reporting
 * @returns Zod schema
 */
function getZodSchemaFromJsonSchema(jsonSchema: any, toolName: string): z.ZodTypeAny {
    if (typeof jsonSchema !== 'object' || jsonSchema === null) { 
        return z.object({}).passthrough(); 
    }
    try {
        const zodSchemaString = jsonSchemaToZod(jsonSchema);
        const zodSchema = eval(zodSchemaString);
        if (typeof zodSchema?.parse !== 'function') { 
            throw new Error('Eval did not produce a valid Zod schema.'); 
        }
        return zodSchema as z.ZodTypeAny;
    } catch (err: any) {
        console.error(`Failed to generate/evaluate Zod schema for '${toolName}':`, err);
        return z.object({}).passthrough();
    }
}
