import { HttpClientModule } from '@angular/common/http';
import { NgModule } from '@angular/core';
import { ComponentsModule } from '../../components/components.module';
import { PopoverComponent } from '../../components/popover/popover.component';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Routes, RouterModule } from '@angular/router';

import { IonicModule } from '@ionic/angular';

import { MenuPage } from './menu.page';

const routes: Routes = [
  {
    path: '',
    component: MenuPage,
    children: [
      { path: 'welcome', loadChildren: () => import('../welcome/welcome.module').then(m => m.WelcomePageModule) },
      { path: 'my-account', loadChildren: () => import('../my-account/my-account.module').then(m => m.MyAccountPageModule) },
      { path: 'sites', loadChildren: () => import('../sites/sites.module').then(m => m.SitesPageModule) },
      { path: 'staff', loadChildren: () => import('../staff/staff.module').then(m => m.StaffPageModule) },
      { path: 'reports', loadChildren: () => import('../reports/reports.module').then(m => m.ReportsPageModule) },
      { path: 'saved-forms', loadChildren: () => import('../saved-forms/saved-forms.module').then(m => m.SavedFormsPageModule) },
      { path: 'support', loadChildren: () => import('../support/support.module').then(m => m.SupportPageModule) },
      { path: 'add-guard/:id', loadChildren: () => import('../add-guard/add-guard.module').then(m => m.AddGuardPageModule) },
      { path: 'add-guard-to-site/:id', loadChildren: () => import('../add-guard-to-site/add-guard-to-site.module').then(m => m.AddGuardToSitePageModule) },
      { path: 'ar-site-visit/:id', loadChildren: () => import('../ar-site-visit/ar-site-visit.module').then(m => m.ArSiteVisitPageModule) },
      { path: 'commercial-app', loadChildren: () => import('../commercial-app/commercial-app.module').then(m => m.CommercialAppPageModule) },
      { path: 'eagle-canyon', loadChildren: () => import('../eagle-canyon/eagle-canyon.module').then(m => m.EagleCanyonPageModule) },
      { path: 'edit-pnp-visit', loadChildren: () => import('../edit-pnp-visit/edit-pnp-visit.module').then(m => m.EditPnpVisitPageModule) },
      { path: 'edit-transparency', loadChildren: () => import('../edit-transparency/edit-transparency.module').then(m => m.EditTransparencyPageModule) },
      { path: 'edit-visit-gen', loadChildren: () => import('../edit-visit-gen/edit-visit-gen.module').then(m => m.EditVisitGenPageModule) },
      { path: 'house-agreement', loadChildren: () => import('../house-agreement/house-agreement.module').then(m => m.HouseAgreementPageModule) },
      { path: 'household-app', loadChildren: () => import('../household-app/household-app.module').then(m => m.HouseholdAppPageModule) },
      { path: 'mine-visit', loadChildren: () => import('../mine-visit/mine-visit.module').then(m => m.MineVisitPageModule) },
      { path: 'parade', loadChildren: () => import('../parade/parade.module').then(m => m.ParadePageModule) },
      { path: 'view-site/:id', loadChildren: () => import('../view-site/view-site.module').then(m => m.ViewSitePageModule) },
      { path: 'view-guard/:id', loadChildren: () => import('../view-guard/view-guard.module').then(m => m.ViewGuardPageModule) },
      { path: 'fleet', loadChildren: () => import('../fleet/fleet.module').then(m => m.FleetPageModule) },
      { path: 'vehicles/:id', loadChildren: () => import('../vehicles/vehicles.module').then(m => m.VehiclesPageModule) },
      { path: 'summaries', loadChildren: () => import('../summaries/summaries.module').then(m => m.SummariesPageModule) },
      { path: 'site-visit-summary', loadChildren: () => import('../site-visit-summary/site-visit-summary.module').then(m => m.SiteVisitSummaryPageModule) },
      { path: 'billing', loadChildren: () => import('../billing/billing.module').then(m => m.BillingPageModule) },
      { path: 'billing-breakdown', loadChildren: () => import('../billing-breakdown/billing-breakdown.module').then(m => m.BillingBreakdownPageModule) },
      { path: 'view-bill/:id', loadChildren: () => import('../view-bill/view-bill.module').then(m => m.ViewBillPageModule) },
      { path: 'setup', loadChildren: () => import('../setup/setup.module').then(m => m.SetupPageModule) },
      { path: 'update-billing', loadChildren: () => import('../update-billing/update-billing.module').then(m => m.UpdateBillingPageModule) },
      { path: 'add-email', loadChildren: () => import('../add-email/add-email.module').then(m => m.AddEmailPageModule) },
      { path: 'add-news', loadChildren: () => import('../add-news/add-news.module').then(m => m.AddNewsPageModule) },
      { path: 'bug/:id', loadChildren: () => import('../bug/bug.module').then(m => m.BugPageModule) },
      { path: 'view-user/:id', loadChildren: () => import('../view-user/view-user.module').then(m => m.ViewUserPageModule) },
      { path: 'clients', loadChildren: () => import('../clients/clients.module').then(m => m.ClientsPageModule) },
      { path: 'bugs', loadChildren: () => import('../bugs/bugs.module').then(m => m.BugsPageModule) },
      { path: 'add-site-to-user', loadChildren: () => import('../add-site-to-user/add-site-to-user.module').then(m => m.AddSiteToUserPageModule) },
      { path: 'view-user-reports', loadChildren: () => import('../view-user-reports/view-user-reports.module').then(m => m.ViewUserReportsPageModule) },
      { path: 'client-users', loadChildren: () => import('../client-users/client-users.module').then(m => m.ClientUsersPageModule) },
      { path: 'mapped-reports', loadChildren: () => import('../mapped-reports/mapped-reports.module').then(m => m.MappedReportsPageModule) },
      { path: 'map-report-details', loadChildren: () => import('../map-report-details/map-report-details.module').then(m => m.MapReportDetailsPageModule) },
      { path: 'chat', loadChildren: () => import('../chat/chat.module').then(m => m.ChatPageModule) },
      { path: 'site-visit-gen/:id', loadChildren: () => import('../site-visit-gen/site-visit-gen.module').then(m => m.SiteVisitGenPageModule) },
      { path: 'users', loadChildren: () => import('../users/users.module').then(m => m.UsersPageModule) },
      { path: 'add-site/:id', loadChildren: () => import('../add-site/add-site.module').then(m => m.AddSitePageModule) },
      { path: 'add-user/:id', loadChildren: () => import('../add-user/add-user.module').then(m => m.AddUserPageModule) },
      { path: 'my-sites', loadChildren: () => import('../my-sites/my-sites.module').then(m => m.MySitesPageModule) },
      { path: 'all-sites', loadChildren: () => import('../all-sites/all-sites.module').then(m => m.AllSitesPageModule) },
      { path: 'job-card', loadChildren: () => import('../job-card/job-card.module').then(m => m.JobCardPageModule) },
      { path: 'work-orders', loadChildren: () => import('../work-orders/work-orders.module').then(m => m.WorkOrdersPageModule) },

      {
        path: 'cost',
        loadChildren: () => import('../cost/cost.module').then(m => m.CostPageModule)
      },
      {
        path: 'pay-subscription',
        loadChildren: () => import('../pay-subscription/pay-subscription.module').then(m => m.PaySubscriptionPageModule)
      },
      {
        path: 'payfast',
        loadChildren: () => import('../payfast/payfast.module').then(m => m.PayfastPageModule)
      },
      {
        path: 'bulk-upload',
        loadChildren: () => import('../bulk-upload/bulk-upload.module').then(m => m.BulkUploadPageModule)
      },
      {
        path: 'form-menu',
        loadChildren: () => import('../form-menu/form-menu.module').then(m => m.FormMenuPageModule)
      },
      {
        path: 'form',
        loadChildren: () => import('../form/form.module').then(m => m.FormsPageModule)
      },
      {

        path: 'chat-sales',
        loadChildren: () => import('../chat-sales/chat-sales.module').then(m => m.ChatSalesPageModule)
      },
      {
        path: 'form-upload',
        loadChildren: () => import('../form-upload/form-upload.module').then(m => m.FormUploadPageModule)
      },
      {
        path: 'memberships',
        loadChildren: () => import('../memberships/memberships.module').then(m => m.MembershipsPageModule)
      },
      {
        path: 'no-access',
        loadChildren: () => import('../no-access/no-access.module').then(m => m.NoAccessPageModule)
      },
      {
        path: 'memberships-app',
        loadChildren: () => import('../memberships-app/memberships-app.module').then(m => m.MembershipsAppPageModule)
      },
    ]
  },
  {
    path: '',
    redirectTo: '/welcome',
  }
];

@NgModule({
  entryComponents: [PopoverComponent],
  imports: [
    ComponentsModule,
    CommonModule,
    FormsModule,
    IonicModule,
    HttpClientModule,
    RouterModule.forChild(routes)
  ],
  declarations: [MenuPage]
})
export class MenuPageModule { }
