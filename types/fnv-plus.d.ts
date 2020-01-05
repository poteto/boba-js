/** Declaration file generated by dts-gen */
declare module 'fnv-plus' {
  type Hash = {
    dec(): string;
    hex(): string;
    str(): string;
  }

  export function fast1a32(str: string): string;

  export function fast1a32hex(str: string): string;

  export function fast1a32hexutf(str: string): string;

  export function fast1a32utf(str: string): string;

  export function fast1a52(str: string): string;

  export function fast1a52hex(str: string): string;

  export function fast1a52hexutf(str: string): string;

  export function fast1a52utf(str: string): string;

  export function fast1a64(str: string): string;

  export function fast1a64utf(str: string): string;

  export function hash(message: string, keyspace?: number): Hash;

  export function seed(seed: string): void;

  export function setKeyspace(keyspace: number): void;

  export function useUTF8(utf8: boolean): void;

  export function version(_version: string): void;
}
