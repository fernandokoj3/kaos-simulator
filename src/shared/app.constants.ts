export const PORT: number = parseInt(process.env.PORT ?? '3000');
export const SIGTERM_SECONDS = Number(process.env.SIGTERM_SECONDS ?? 20) * 1000;
export const APP_TITLE: string = 'kaos-simulator';
