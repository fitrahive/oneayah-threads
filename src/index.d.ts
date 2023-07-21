declare module 'bun' {
  interface BunFile {
    json: () => Promise<any>
  }
}
