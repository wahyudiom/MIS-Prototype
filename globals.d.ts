declare const __APP_BUILD_TIME__: string;

declare module '*.html?raw' {
  const content: string;
  export default content;
}
