/* eslint-disable @typescript-eslint/naming-convention */
export type AnalyticsEvent = 'page_view' | 'select_content';
export type AnalyticsScreenName =
  | 'Register'
  | 'Sign In'
  | 'Reset Password'
  | 'Account'
  | 'Welcome'
  | 'Forms'
  | 'All Sites'
  | 'My Sites'
  | 'Staff'
  | 'Reports'
  | 'Mapped Reports'
  | 'Saved Forms'
  | 'Fleet'
  | 'Summaries'
  | 'Bulk Upload'
  | 'Sales Chat'
  | 'Support Chat'
  | 'Add a guard'
  | 'Add a site'
  | 'Add a user';

export type AnalyticsScreenClass =
| 'RegisterPage'
| 'SignInPage'
| 'ResetPasswordPage'
| 'AccountPage'
| 'WelcomePage'
| 'FormsPage'
| 'AllSitesPage'
| 'MySitesPage'
| 'StaffPage'
| 'ReportsPage'
| 'MappedReportsPage'
| 'SavedFormsPage'
| 'FleetPage'
| 'SummariesPage'
| 'BulkUploadPage'
| 'SalesChatPage'
| 'SupportChatPage'
| 'AddGuardPage'
| 'AddSitePage'
| 'AddUserPage';

export type AnalyticsContentType = 'ContentAdded';
export interface AnalyticsScreenView {
  screen_name?: AnalyticsScreenName;
  screen_class?: AnalyticsScreenClass;
  content_type?: AnalyticsContentType;
  item_id?: string;
}
