const env = import.meta.env

export const config = {
  /** Google Apps Script web app URL that appends requests to the team's Google Sheet. */
  requestsEndpoint: (env.VITE_REQUESTS_ENDPOINT as string | undefined)?.trim() || '',
  /** Optional post-experience survey link. */
  surveyUrl: (env.VITE_SURVEY_URL as string | undefined)?.trim() || '',
  /** Optional team inbox. */
  contactEmail: (env.VITE_CONTACT_EMAIL as string | undefined)?.trim() || '',
  /** Only accept @calpoly.edu addresses on requests. */
  requireCalPolyEmail: (env.VITE_REQUIRE_CALPOLY_EMAIL ?? 'true') !== 'false',
  /** Default dates shown in the search bar (YYYY-MM-DD). Empty = no dates. */
  defaultMoveIn: '',
  defaultMoveOut: '',
}
