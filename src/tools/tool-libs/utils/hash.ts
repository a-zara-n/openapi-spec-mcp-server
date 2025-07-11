/**
 * @fileoverview Hash calculation utilities
 * @description Provides functions for calculating file content hashes
 * @since 1.0.0
 */

import { createHash } from "crypto";

/**
 * Calculate SHA-256 hash of string content
 * @param content - Content to hash
 * @returns SHA-256 hash in hexadecimal format
 */
export function calculateContentHash(content: string): string {
    return createHash("sha256").update(content, "utf8").digest("hex");
}

/**
 * Calculate short hash (first 16 characters of SHA-256)
 * @param content - Content to hash
 * @returns Short hash for display purposes
 */
export function calculateShortHash(content: string): string {
    return calculateContentHash(content).substring(0, 16);
}

/**
 * Compare two hashes for equality
 * @param hash1 - First hash
 * @param hash2 - Second hash
 * @returns True if hashes are equal
 */
export function compareHashes(hash1: string | null, hash2: string): boolean {
    if (!hash1) return false;
    return hash1 === hash2;
}

/**
 * Validate hash format (64 character hexadecimal string for SHA-256)
 * @param hash - Hash to validate
 * @returns True if hash format is valid
 */
export function isValidHash(hash: string): boolean {
    return /^[a-f0-9]{64}$/i.test(hash);
}
