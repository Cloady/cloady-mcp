#!/usr/bin/env node
/**
 * MCP Server generated from OpenAPI spec for cloady-mcp v0.5.0
 */
/**
 * Server configuration
 */
export declare const SERVER_NAME = "cloady-mcp";
export declare const SERVER_VERSION = "0.5.0";
export declare const API_BASE_URL: string;
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
export {};
