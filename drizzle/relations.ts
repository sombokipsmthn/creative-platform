import { relations } from "drizzle-orm/relations";
import { users, galleryWatermarkPresets, videoProcessingQueue, galleries, galleryPhotos, clients, projects, creatorServices, galleryCollections, creatorBusinessProfiles, creatorProfiles, invoices, quotes, quoteItems, invoiceItems, paymentSchedules, paymentTermAmendments, galleryAccessSessions, galleryPhotoActions, contracts, contractTemplates, galleryComments, galleryApprovals, contractEvents, galleryDownloadPresets, sessions, galleryDownloads, accounts, passkeys, creatorPortfolios, paymentAuditEvents, payments, projectMedia, studioEvents, calendarEvents, expenses, galleryWatermarks, creatorGalleryDefaults, creatorWorkspaceBranding, creatorEmailTemplates, creatorNotificationPreferences, creatorIntegrations, creatorBranding, entitlements, subscriptionPlans, subscriptions } from "./schema";

export const galleryWatermarkPresetsRelations = relations(galleryWatermarkPresets, ({one}) => ({
	user: one(users, {
		fields: [galleryWatermarkPresets.creatorId],
		references: [users.id]
	}),
}));

export const usersRelations = relations(users, ({many}) => ({
	galleryWatermarkPresets: many(galleryWatermarkPresets),
	videoProcessingQueues: many(videoProcessingQueue),
	galleries: many(galleries),
	creatorServices: many(creatorServices),
	creatorBusinessProfiles: many(creatorBusinessProfiles),
	clients: many(clients),
	creatorProfiles: many(creatorProfiles),
	invoices: many(invoices),
	quotes: many(quotes),
	paymentSchedules: many(paymentSchedules),
	paymentTermAmendments: many(paymentTermAmendments),
	contracts: many(contracts),
	contractTemplates: many(contractTemplates),
	sessions: many(sessions),
	accounts: many(accounts),
	passkeys: many(passkeys),
	creatorPortfolios: many(creatorPortfolios),
	paymentAuditEvents_actorId: many(paymentAuditEvents, {
		relationName: "paymentAuditEvents_actorId_users_id"
	}),
	paymentAuditEvents_creatorId: many(paymentAuditEvents, {
		relationName: "paymentAuditEvents_creatorId_users_id"
	}),
	projectMedias: many(projectMedia),
	projects: many(projects),
	studioEvents: many(studioEvents),
	calendarEvents: many(calendarEvents),
	expenses: many(expenses),
	creatorGalleryDefaults: many(creatorGalleryDefaults),
	creatorWorkspaceBrandings: many(creatorWorkspaceBranding),
	payments: many(payments),
	creatorEmailTemplates: many(creatorEmailTemplates),
	creatorNotificationPreferences: many(creatorNotificationPreferences),
	creatorIntegrations: many(creatorIntegrations),
	creatorBrandings: many(creatorBranding),
	entitlements: many(entitlements),
	subscriptions: many(subscriptions),
}));

export const videoProcessingQueueRelations = relations(videoProcessingQueue, ({one}) => ({
	user: one(users, {
		fields: [videoProcessingQueue.creatorId],
		references: [users.id]
	}),
	gallery: one(galleries, {
		fields: [videoProcessingQueue.galleryId],
		references: [galleries.id]
	}),
	galleryPhoto: one(galleryPhotos, {
		fields: [videoProcessingQueue.photoId],
		references: [galleryPhotos.id]
	}),
}));

export const galleriesRelations = relations(galleries, ({one, many}) => ({
	videoProcessingQueues: many(videoProcessingQueue),
	client: one(clients, {
		fields: [galleries.clientId],
		references: [clients.id]
	}),
	user: one(users, {
		fields: [galleries.creatorId],
		references: [users.id]
	}),
	project: one(projects, {
		fields: [galleries.projectId],
		references: [projects.id]
	}),
	galleryCollections: many(galleryCollections),
	galleryPhotos: many(galleryPhotos),
	galleryAccessSessions: many(galleryAccessSessions),
	galleryPhotoActions: many(galleryPhotoActions),
	galleryComments: many(galleryComments),
	galleryApprovals: many(galleryApprovals),
	galleryDownloadPresets: many(galleryDownloadPresets),
	galleryDownloads: many(galleryDownloads),
	galleryWatermarks: many(galleryWatermarks),
}));

export const galleryPhotosRelations = relations(galleryPhotos, ({one, many}) => ({
	videoProcessingQueues: many(videoProcessingQueue),
	galleryCollection: one(galleryCollections, {
		fields: [galleryPhotos.collectionId],
		references: [galleryCollections.id]
	}),
	gallery: one(galleries, {
		fields: [galleryPhotos.galleryId],
		references: [galleries.id]
	}),
	galleryPhotoActions: many(galleryPhotoActions),
	galleryComments: many(galleryComments),
	galleryDownloads: many(galleryDownloads),
}));

export const clientsRelations = relations(clients, ({one, many}) => ({
	galleries: many(galleries),
	user: one(users, {
		fields: [clients.creatorId],
		references: [users.id]
	}),
	invoices: many(invoices),
	quotes: many(quotes),
	paymentSchedules: many(paymentSchedules),
	galleryAccessSessions: many(galleryAccessSessions),
	contracts: many(contracts),
	galleryApprovals: many(galleryApprovals),
	projects: many(projects),
	studioEvents: many(studioEvents),
	calendarEvents: many(calendarEvents),
	payments: many(payments),
}));

export const projectsRelations = relations(projects, ({one, many}) => ({
	galleries: many(galleries),
	paymentSchedules: many(paymentSchedules),
	contracts: many(contracts),
	projectMedias: many(projectMedia),
	client: one(clients, {
		fields: [projects.clientId],
		references: [clients.id]
	}),
	user: one(users, {
		fields: [projects.creatorId],
		references: [users.id]
	}),
	studioEvents: many(studioEvents),
	calendarEvents: many(calendarEvents),
	expenses: many(expenses),
}));

export const creatorServicesRelations = relations(creatorServices, ({one}) => ({
	user: one(users, {
		fields: [creatorServices.creatorId],
		references: [users.id]
	}),
}));

export const galleryCollectionsRelations = relations(galleryCollections, ({one, many}) => ({
	gallery: one(galleries, {
		fields: [galleryCollections.galleryId],
		references: [galleries.id]
	}),
	galleryPhotos: many(galleryPhotos),
}));

export const creatorBusinessProfilesRelations = relations(creatorBusinessProfiles, ({one}) => ({
	user: one(users, {
		fields: [creatorBusinessProfiles.userId],
		references: [users.id]
	}),
}));

export const creatorProfilesRelations = relations(creatorProfiles, ({one}) => ({
	user: one(users, {
		fields: [creatorProfiles.userId],
		references: [users.id]
	}),
}));

export const invoicesRelations = relations(invoices, ({one, many}) => ({
	client: one(clients, {
		fields: [invoices.clientId],
		references: [clients.id]
	}),
	user: one(users, {
		fields: [invoices.creatorId],
		references: [users.id]
	}),
	quote: one(quotes, {
		fields: [invoices.quoteId],
		references: [quotes.id]
	}),
	invoiceItems: many(invoiceItems),
	paymentSchedules: many(paymentSchedules),
	paymentTermAmendments: many(paymentTermAmendments),
	payments_invoiceId: many(payments, {
		relationName: "payments_invoiceId_invoices_id"
	}),
}));

export const quotesRelations = relations(quotes, ({one, many}) => ({
	invoices: many(invoices),
	client: one(clients, {
		fields: [quotes.clientId],
		references: [clients.id]
	}),
	user: one(users, {
		fields: [quotes.creatorId],
		references: [users.id]
	}),
	quoteItems: many(quoteItems),
	contracts: many(contracts),
}));

export const quoteItemsRelations = relations(quoteItems, ({one}) => ({
	quote: one(quotes, {
		fields: [quoteItems.quoteId],
		references: [quotes.id]
	}),
}));

export const invoiceItemsRelations = relations(invoiceItems, ({one}) => ({
	invoice: one(invoices, {
		fields: [invoiceItems.invoiceId],
		references: [invoices.id]
	}),
}));

export const paymentSchedulesRelations = relations(paymentSchedules, ({one}) => ({
	client: one(clients, {
		fields: [paymentSchedules.clientId],
		references: [clients.id]
	}),
	user: one(users, {
		fields: [paymentSchedules.creatorId],
		references: [users.id]
	}),
	invoice: one(invoices, {
		fields: [paymentSchedules.invoiceId],
		references: [invoices.id]
	}),
	project: one(projects, {
		fields: [paymentSchedules.projectId],
		references: [projects.id]
	}),
}));

export const paymentTermAmendmentsRelations = relations(paymentTermAmendments, ({one}) => ({
	user: one(users, {
		fields: [paymentTermAmendments.creatorId],
		references: [users.id]
	}),
	invoice: one(invoices, {
		fields: [paymentTermAmendments.invoiceId],
		references: [invoices.id]
	}),
}));

export const galleryAccessSessionsRelations = relations(galleryAccessSessions, ({one, many}) => ({
	client: one(clients, {
		fields: [galleryAccessSessions.clientId],
		references: [clients.id]
	}),
	gallery: one(galleries, {
		fields: [galleryAccessSessions.galleryId],
		references: [galleries.id]
	}),
	galleryPhotoActions: many(galleryPhotoActions),
	galleryComments: many(galleryComments),
	galleryDownloads: many(galleryDownloads),
}));

export const galleryPhotoActionsRelations = relations(galleryPhotoActions, ({one}) => ({
	gallery: one(galleries, {
		fields: [galleryPhotoActions.galleryId],
		references: [galleries.id]
	}),
	galleryPhoto: one(galleryPhotos, {
		fields: [galleryPhotoActions.photoId],
		references: [galleryPhotos.id]
	}),
	galleryAccessSession: one(galleryAccessSessions, {
		fields: [galleryPhotoActions.sessionId],
		references: [galleryAccessSessions.id]
	}),
}));

export const contractsRelations = relations(contracts, ({one, many}) => ({
	client: one(clients, {
		fields: [contracts.clientId],
		references: [clients.id]
	}),
	user: one(users, {
		fields: [contracts.creatorId],
		references: [users.id]
	}),
	project: one(projects, {
		fields: [contracts.projectId],
		references: [projects.id]
	}),
	quote: one(quotes, {
		fields: [contracts.quoteId],
		references: [quotes.id]
	}),
	contractTemplate: one(contractTemplates, {
		fields: [contracts.templateId],
		references: [contractTemplates.id]
	}),
	contractEvents: many(contractEvents),
}));

export const contractTemplatesRelations = relations(contractTemplates, ({one, many}) => ({
	contracts: many(contracts),
	user: one(users, {
		fields: [contractTemplates.creatorId],
		references: [users.id]
	}),
}));

export const galleryCommentsRelations = relations(galleryComments, ({one}) => ({
	gallery: one(galleries, {
		fields: [galleryComments.galleryId],
		references: [galleries.id]
	}),
	galleryPhoto: one(galleryPhotos, {
		fields: [galleryComments.photoId],
		references: [galleryPhotos.id]
	}),
	galleryAccessSession: one(galleryAccessSessions, {
		fields: [galleryComments.sessionId],
		references: [galleryAccessSessions.id]
	}),
}));

export const galleryApprovalsRelations = relations(galleryApprovals, ({one}) => ({
	client: one(clients, {
		fields: [galleryApprovals.clientId],
		references: [clients.id]
	}),
	gallery: one(galleries, {
		fields: [galleryApprovals.galleryId],
		references: [galleries.id]
	}),
}));

export const contractEventsRelations = relations(contractEvents, ({one}) => ({
	contract: one(contracts, {
		fields: [contractEvents.contractId],
		references: [contracts.id]
	}),
}));

export const galleryDownloadPresetsRelations = relations(galleryDownloadPresets, ({one, many}) => ({
	gallery: one(galleries, {
		fields: [galleryDownloadPresets.galleryId],
		references: [galleries.id]
	}),
	galleryDownloads: many(galleryDownloads),
}));

export const sessionsRelations = relations(sessions, ({one}) => ({
	user: one(users, {
		fields: [sessions.userId],
		references: [users.id]
	}),
}));

export const galleryDownloadsRelations = relations(galleryDownloads, ({one}) => ({
	gallery: one(galleries, {
		fields: [galleryDownloads.galleryId],
		references: [galleries.id]
	}),
	galleryPhoto: one(galleryPhotos, {
		fields: [galleryDownloads.photoId],
		references: [galleryPhotos.id]
	}),
	galleryDownloadPreset: one(galleryDownloadPresets, {
		fields: [galleryDownloads.presetId],
		references: [galleryDownloadPresets.id]
	}),
	galleryAccessSession: one(galleryAccessSessions, {
		fields: [galleryDownloads.sessionId],
		references: [galleryAccessSessions.id]
	}),
}));

export const accountsRelations = relations(accounts, ({one}) => ({
	user: one(users, {
		fields: [accounts.userId],
		references: [users.id]
	}),
}));

export const passkeysRelations = relations(passkeys, ({one}) => ({
	user: one(users, {
		fields: [passkeys.userId],
		references: [users.id]
	}),
}));

export const creatorPortfoliosRelations = relations(creatorPortfolios, ({one}) => ({
	user: one(users, {
		fields: [creatorPortfolios.userId],
		references: [users.id]
	}),
}));

export const paymentAuditEventsRelations = relations(paymentAuditEvents, ({one}) => ({
	user_actorId: one(users, {
		fields: [paymentAuditEvents.actorId],
		references: [users.id],
		relationName: "paymentAuditEvents_actorId_users_id"
	}),
	user_creatorId: one(users, {
		fields: [paymentAuditEvents.creatorId],
		references: [users.id],
		relationName: "paymentAuditEvents_creatorId_users_id"
	}),
	payment: one(payments, {
		fields: [paymentAuditEvents.paymentId],
		references: [payments.id]
	}),
}));

export const paymentsRelations = relations(payments, ({one, many}) => ({
	paymentAuditEvents: many(paymentAuditEvents),
	client: one(clients, {
		fields: [payments.clientId],
		references: [clients.id]
	}),
	user: one(users, {
		fields: [payments.creatorId],
		references: [users.id]
	}),
	invoice_invoiceId: one(invoices, {
		fields: [payments.invoiceId],
		references: [invoices.id],
		relationName: "payments_invoiceId_invoices_id"
	}),
}));

export const projectMediaRelations = relations(projectMedia, ({one}) => ({
	user: one(users, {
		fields: [projectMedia.creatorId],
		references: [users.id]
	}),
	project: one(projects, {
		fields: [projectMedia.projectId],
		references: [projects.id]
	}),
}));

export const studioEventsRelations = relations(studioEvents, ({one}) => ({
	client: one(clients, {
		fields: [studioEvents.clientId],
		references: [clients.id]
	}),
	user: one(users, {
		fields: [studioEvents.creatorId],
		references: [users.id]
	}),
	project: one(projects, {
		fields: [studioEvents.projectId],
		references: [projects.id]
	}),
}));

export const calendarEventsRelations = relations(calendarEvents, ({one}) => ({
	client: one(clients, {
		fields: [calendarEvents.clientId],
		references: [clients.id]
	}),
	user: one(users, {
		fields: [calendarEvents.creatorId],
		references: [users.id]
	}),
	project: one(projects, {
		fields: [calendarEvents.projectId],
		references: [projects.id]
	}),
}));

export const expensesRelations = relations(expenses, ({one}) => ({
	user: one(users, {
		fields: [expenses.creatorId],
		references: [users.id]
	}),
	project: one(projects, {
		fields: [expenses.projectId],
		references: [projects.id]
	}),
}));

export const galleryWatermarksRelations = relations(galleryWatermarks, ({one}) => ({
	gallery: one(galleries, {
		fields: [galleryWatermarks.galleryId],
		references: [galleries.id]
	}),
}));

export const creatorGalleryDefaultsRelations = relations(creatorGalleryDefaults, ({one}) => ({
	user: one(users, {
		fields: [creatorGalleryDefaults.userId],
		references: [users.id]
	}),
}));

export const creatorWorkspaceBrandingRelations = relations(creatorWorkspaceBranding, ({one}) => ({
	user: one(users, {
		fields: [creatorWorkspaceBranding.userId],
		references: [users.id]
	}),
}));

export const creatorEmailTemplatesRelations = relations(creatorEmailTemplates, ({one}) => ({
	user: one(users, {
		fields: [creatorEmailTemplates.userId],
		references: [users.id]
	}),
}));

export const creatorNotificationPreferencesRelations = relations(creatorNotificationPreferences, ({one}) => ({
	user: one(users, {
		fields: [creatorNotificationPreferences.userId],
		references: [users.id]
	}),
}));

export const creatorIntegrationsRelations = relations(creatorIntegrations, ({one}) => ({
	user: one(users, {
		fields: [creatorIntegrations.userId],
		references: [users.id]
	}),
}));

export const creatorBrandingRelations = relations(creatorBranding, ({one}) => ({
	user: one(users, {
		fields: [creatorBranding.userId],
		references: [users.id]
	}),
}));

export const entitlementsRelations = relations(entitlements, ({one}) => ({
	user: one(users, {
		fields: [entitlements.userId],
		references: [users.id]
	}),
}));

export const subscriptionsRelations = relations(subscriptions, ({one}) => ({
	subscriptionPlan: one(subscriptionPlans, {
		fields: [subscriptions.planId],
		references: [subscriptionPlans.id]
	}),
	user: one(users, {
		fields: [subscriptions.userId],
		references: [users.id]
	}),
}));

export const subscriptionPlansRelations = relations(subscriptionPlans, ({many}) => ({
	subscriptions: many(subscriptions),
}));