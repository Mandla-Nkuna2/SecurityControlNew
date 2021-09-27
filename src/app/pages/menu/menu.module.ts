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
      { path: 'forms', loadChildren: () => import('../forms/forms.module').then(m => m.FormsPageModule) },
      { path: 'my-account', loadChildren: () => import('../my-account/my-account.module').then(m => m.MyAccountPageModule) },
      { path: 'forms', loadChildren: () => import('../forms/forms.module').then(m => m.FormsPageModule) },
      { path: 'sites', loadChildren: () => import('../sites/sites.module').then(m => m.SitesPageModule) },
      { path: 'staff', loadChildren: () => import('../staff/staff.module').then(m => m.StaffPageModule) },
      { path: 'reports', loadChildren: () => import('../reports/reports.module').then(m => m.ReportsPageModule) },
      { path: 'saved-forms', loadChildren: () => import('../saved-forms/saved-forms.module').then(m => m.SavedFormsPageModule) },
      { path: 'support', loadChildren: () => import('../support/support.module').then(m => m.SupportPageModule) },
      { path: 'site-visit/:id', loadChildren: () => import('../site-visit/site-visit.module').then(m => m.SiteVisitPageModule) },
      { path: 'training-form/:id', loadChildren: () => import('../training-form/training-form.module').then(m => m.TrainingFormPageModule) },
      { path: 'uniform-order/:id', loadChildren: () => import('../uniform-order/uniform-order.module').then(m => m.UniformOrderPageModule) },
      { path: 'vehicle-inspection/:id', loadChildren: () => import('../vehicle-inspection/vehicle-inspection.module').then(m => m.VehicleInspectionPageModule) },
      { path: 'crime-incident-report/:id', loadChildren: () => import('../crime-incident-report/crime-incident-report.module').then(m => m.CrimeIncidentReportPageModule) },
      { path: 'incident-notification/:id', loadChildren: () => import('../incident-notification/incident-notification.module').then(m => m.IncidentNotificationPageModule) },
      { path: 'risk-assessment/:id', loadChildren: () => import('../risk-assessment/risk-assessment.module').then(m => m.RiskAssessmentPageModule) },
      { path: 'general-incident-report/:id', loadChildren: () => import('../general-incident-report/general-incident-report.module').then(m => m.GeneralIncidentReportPageModule) },
      { path: 'leave-application/:id', loadChildren: () => import('../leave-application/leave-application.module').then(m => m.LeaveApplicationPageModule) },
      { path: 'disciplinary-report/:id', loadChildren: () => import('../disciplinary-report/disciplinary-report.module').then(m => m.DisciplinaryReportPageModule) },
      { path: 'meeting-report/:id', loadChildren: () => import('../meeting-report/meeting-report.module').then(m => m.MeetingReportPageModule) },
      { path: 'client-instruction/:id', loadChildren: () => import('../client-instruction/client-instruction.module').then(m => m.ClientInstructionPageModule) },
      { path: 'ob-entry/:id', loadChildren: () => import('../ob-entry/ob-entry.module').then(m => m.ObEntryPageModule) },
      { path: 'tenant-visit/:id', loadChildren: () => import('../tenant-visit/tenant-visit.module').then(m => m.TenantVisitPageModule) },
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
      { path: 'pnp-visit/:id', loadChildren: () => import('../pnp-visit/pnp-visit.module').then(m => m.PnpVisitPageModule) },
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
      { path: 'transparency-report/:id', loadChildren: () => import('../transparency-report/transparency-report.module').then(m => m.TransparencyReportPageModule) },
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
      { path: 'work-order-form', loadChildren: () => import('../work-order-form/work-order-form.module').then(m => m.WorkOrderFormPageModule) },
      { path: 'job-card', loadChildren: () => import('../job-card/job-card.module').then(m => m.JobCardPageModule) },
      { path: 'work-orders', loadChildren: () => import('../work-orders/work-orders.module').then(m => m.WorkOrdersPageModule) },
      { path: 'aod/:id', loadChildren: () => import('../aod/aod.module').then(m => m.AodPageModule) },
      { path: 'emp-performance-form/:id', loadChildren: () => import('../emp-performance-form/emp-performance-form.module').then(m => m.EmpPerformanceFormPageModule) },
      { path: 'ncr/:id', loadChildren: () => import('../ncr/ncr.module').then(m => m.NcrPageModule) },
      { path: 'equipment-inventory/:id', loadChildren: () => import('../equipment-inventory/equipment-inventory.module').then(m => m.EquipmentInventoryPageModule) },
      { path: 'incident-report/:id', loadChildren: () => import('../incident-report/incident-report.module').then(m => m.IncidentReportPageModule) },
      {
        path: 'appeal/:id',
        loadChildren: () => import('../appeal/appeal.module').then(m => m.AppealPageModule)
      },
      {
        path: 'site-temperature/:id',
        loadChildren: () => import('../site-temperature/site-temperature.module').then(m => m.SiteTemperaturePageModule)
      },
      {
        path: 'performance-appraisal/:id',
        loadChildren: () => import('../performance-appraisal/performance-appraisal.module').then(m => m.PerformanceAppraisalPageModule)
      },
      {
        path: 'fence-inspection/:id',
        loadChildren: () => import('../fence-inspection/fence-inspection.module').then(m => m.FenceInspectionPageModule)
      },
      {
        path: 'grievance/:id',
        loadChildren: () => import('../grievance/grievance.module').then(m => m.GrievancePageModule)
      },
      {
        path: 'polygraph/:id',
        loadChildren: () => import('../polygraph/polygraph.module').then(m => m.PolygraphPageModule)
      },
      {
        path: 'pay-query/:id',
        loadChildren: () => import('../pay-query/pay-query.module').then(m => m.PayQueryPageModule)
      },
      {
        path: 'resignation/:id',
        loadChildren: () => import('../resignation/resignation.module').then(m => m.ResignationPageModule)
      },
      {
        path: 'injury/:id',
        loadChildren: () => import('../injury/injury.module').then(m => m.InjuryPageModule)
      },
      {
        path: 'fire/:id',
        loadChildren: () => import('../fire/fire.module').then(m => m.FirePageModule)
      },
      {
        path: 'gas-explosion/:id',
        loadChildren: () => import('../gas-explosion/gas-explosion.module').then(m => m.GasExplosionPageModule)
      },
      {
        path: 'extinguisher-checklist/:id',
        loadChildren: () => import('../extinguisher-checklist/extinguisher-checklist.module').then(m => m.ExtinguisherChecklistPageModule)
      },
      {
        path: 'theft/:id',
        loadChildren: () => import('../theft/theft.module').then(m => m.TheftPageModule)
      },
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
        path: 'forms-test',
        loadChildren: () => import('../forms-test/forms-test.module').then(m => m.FormsPageModule)
      },{
        path: 'chat-sales',
        loadChildren: () => import('../chat-sales/chat-sales.module').then( m => m.ChatSalesPageModule)
      }
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
    RouterModule.forChild(routes)
  ],
  declarations: [MenuPage]
})
export class MenuPageModule { }
