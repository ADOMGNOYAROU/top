// Les variables NG_APP_* sont injectées à la compilation par @angular/build:application.
// Les définir dans Vercel → Settings → Environment Variables :
//   NG_APP_API_URL         = https://votre-service.up.railway.app/api
//   NG_APP_SENTRY_DSN      = https://...@sentry.io/...
//   NG_APP_VAPID_PUBLIC_KEY = BI0...

declare const NG_APP_API_URL: string;
declare const NG_APP_SENTRY_DSN: string;
declare const NG_APP_VAPID_PUBLIC_KEY: string;

export const environment = {
  production: true,
  apiUrl: typeof NG_APP_API_URL !== 'undefined' ? NG_APP_API_URL : '',
  sentryDsn: typeof NG_APP_SENTRY_DSN !== 'undefined' ? NG_APP_SENTRY_DSN : '',
  vapidPublicKey: typeof NG_APP_VAPID_PUBLIC_KEY !== 'undefined' ? NG_APP_VAPID_PUBLIC_KEY : '',
};
