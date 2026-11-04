// Build settings. Official Nuvio Cloud connection details are public client configuration.
// Optional per-build overrides can be supplied in web/js/config.local.js (ignored by git).

const config = {
  /** The official Nuvio account service, available immediately after installation. */
  officialServer: {
    backendUrl: 'https://api.nuvio.tv',
    publishableKey: 'sb_publishable_1Clq8rlTVACkdcZuqr6_AD__xUUC_EN',
  },
  /** A TMDB key to use when the user hasn't entered their own. */
  tmdbApiKey: '',
  /**
   * The Trakt API app this build signs in with ({ clientId, clientSecret }, from
   * trakt.tv/oauth/applications), or null to ask for one in Settings. apiUrl only changes for
   * testing against tools/dev-trakt-server.mjs.
   */
  trakt: null,
};

try {
  const local = await import('./config.local.js');
  Object.assign(config, local.default || {});
} catch {
  // No local config in this build.
}

export default config;
