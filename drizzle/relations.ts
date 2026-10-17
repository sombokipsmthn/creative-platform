import { relations } from "drizzle-orm/relations";
import { users, galleries, clients, projects, creatorBusinessProfiles, creatorServices, galleryCollections, galleryPhotos, creatorProfiles, invoices, quotes, quoteItems, invoiceItems, contractTemplates, contracts, contractEvents, galleryAccessSessions, galleryPhotoActions, galleryComments, galleryApprovals, galleryWatermarks, galleryDownloadPresets, galleryDownloads } from "./schema";

export const galleriesRelations = relations(galleries, ({one, many}) => ({
	user: one(users, {
		fields: [galleries.creatorId],
		references: [users.id]
	}),
	client: one(clients, {
		fields: [galleries.clientId],
		references: [clients.id]
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
	galleryWatermarks: many(galleryWatermarks),
	galleryDownloadPresets: many(galleryDownloadPresets),
	galleryDownloads: many(galleryDownloads),
}));

export const usersRelations = relations(users, ({many}) => ({
	galleries: many(galleries),
	creatorBusinessProfiles: many(creatorBusinessProfiles),
	creatorServices: many(creatorServices),
	clients: many(clients),
	creatorProfiles: many(creatorProfiles),
	invoices: many(invoices),
	quotes: many(quotes),
	projects: many(projects),
	contractTemplates: many(contractTemplates),
	contracts: many(contracts),
}));

export const clientsRelations = relations(clients, ({one, many}) => ({
	galleries: many(galleries),
	user: one(users, {
		fields: [clients.creatorId],
		references: [users.id]
	}),
	invoices: many(invoices),
	quotes: many(quotes),
	projects: many(projects),
	contracts: many(contracts),
	galleryAccessSessions: many(galleryAccessSessions),
	galleryApprovals: many(galleryApprovals),
}));

export const projectsRelations = relations(projects, ({one, many}) => ({
	galleries: many(galleries),
	user: one(users, {
		fields: [projects.creatorId],
		references: [users.id]
	}),
	client: one(clients, {
		fields: [projects.clientId],
		references: [clients.id]
	}),
	contracts: many(contracts),
}));

export const creatorBusinessProfilesRelations = relations(creatorBusinessProfiles, ({one}) => ({
	user: one(users, {
		fields: [creatorBusinessProfiles.userId],
		references: [users.id]
	}),
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

export const galleryPhotosRelations = relations(galleryPhotos, ({one, many}) => ({
	gallery: one(galleries, {
		fields: [galleryPhotos.galleryId],
		references: [galleries.id]
	}),
	galleryCollection: one(galleryCollections, {
		fields: [galleryPhotos.collectionId],
		references: [galleryCollections.id]
	}),
	galleryPhotoActions: many(galleryPhotoActions),
	galleryComments: many(galleryComments),
	galleryDownloads: many(galleryDownloads),
}));

export const creatorProfilesRelations = relations(creatorProfiles, ({one}) => ({
	user: one(users, {
		fields: [creatorProfiles.userId],
		references: [users.id]
	}),
}));

export const invoicesRelations = relations(invoices, ({one, many}) => ({
	user: one(users, {
		fields: [invoices.creatorId],
		references: [users.id]
	}),
	client: one(clients, {
		fields: [invoices.clientId],
		references: [clients.id]
	}),
	quote: one(quotes, {
		fields: [invoices.quoteId],
		references: [quotes.id]
	}),
	invoiceItems: many(invoiceItems),
}));

export const quotesRelations = relations(quotes, ({one, many}) => ({
	invoices: many(invoices),
	user: one(users, {
		fields: [quotes.creatorId],
		references: [users.id]
	}),
	client: one(clients, {
		fields: [quotes.clientId],
		references: [clients.id]
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

export const contractTemplatesRelations = relations(contractTemplates, ({one, many}) => ({
	user: one(users, {
		fields: [contractTemplates.creatorId],
		references: [users.id]
	}),
	contracts: many(contracts),
}));

export const contractEventsRelations = relations(contractEvents, ({one}) => ({
	contract: one(contracts, {
		fields: [contractEvents.contractId],
		references: [contracts.id]
	}),
}));

export const contractsRelations = relations(contracts, ({one, many}) => ({
	contractEvents: many(contractEvents),
	user: one(users, {
		fields: [contracts.creatorId],
		references: [users.id]
	}),
	client: one(clients, {
		fields: [contracts.clientId],
		references: [clients.id]
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
}));

export const galleryAccessSessionsRelations = relations(galleryAccessSessions, ({one, many}) => ({
	gallery: one(galleries, {
		fields: [galleryAccessSessions.galleryId],
		references: [galleries.id]
	}),
	client: one(clients, {
		fields: [galleryAccessSessions.clientId],
		references: [clients.id]
	}),
	galleryPhotoActions: many(galleryPhotoActions),
	galleryComments: many(galleryComments),
	galleryDownloads: many(galleryDownloads),
}));

export const galleryPhotoActionsRelations = relations(galleryPhotoActions, ({one}) => ({
	galleryAccessSession: one(galleryAccessSessions, {
		fields: [galleryPhotoActions.sessionId],
		references: [galleryAccessSessions.id]
	}),
	gallery: one(galleries, {
		fields: [galleryPhotoActions.galleryId],
		references: [galleries.id]
	}),
	galleryPhoto: one(galleryPhotos, {
		fields: [galleryPhotoActions.photoId],
		references: [galleryPhotos.id]
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
	gallery: one(galleries, {
		fields: [galleryApprovals.galleryId],
		references: [galleries.id]
	}),
	client: one(clients, {
		fields: [galleryApprovals.clientId],
		references: [clients.id]
	}),
}));

export const galleryWatermarksRelations = relations(galleryWatermarks, ({one}) => ({
	gallery: one(galleries, {
		fields: [galleryWatermarks.galleryId],
		references: [galleries.id]
	}),
}));

export const galleryDownloadPresetsRelations = relations(galleryDownloadPresets, ({one, many}) => ({
	gallery: one(galleries, {
		fields: [galleryDownloadPresets.galleryId],
		references: [galleries.id]
	}),
	galleryDownloads: many(galleryDownloads),
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