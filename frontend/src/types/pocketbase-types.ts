/**
* This file was @generated using pocketbase-typegen
*/

import type PocketBase from 'pocketbase'
import type { RecordService } from 'pocketbase'

export const Collections = {
	Authorigins: "_authOrigins",
	Externalauths: "_externalAuths",
	Mfas: "_mfas",
	Otps: "_otps",
	Superusers: "_superusers",
	Clients: "clients",
	Configs: "configs",
	Invoices: "invoices",
	InvoicesProducts: "invoices_products",
	Invoicestates: "invoicestates",
	Measureunits: "measureunits",
	ProductTypes: "product_types",
	Products: "products",
	Roles: "roles",
	Users: "users",
	VInvoices: "v_invoices",
	XDeleted: "x_deleted",
} as const
export type Collections = typeof Collections[keyof typeof Collections]

// Alias types for improved usability
export type IsoDateString = string
export type IsoAutoDateString = string & { readonly autodate: unique symbol }
export type RecordIdString = string
export type FileNameString = string & { readonly filename: unique symbol }
export type HTMLString = string

type ExpandType<T> = unknown extends T
	? T extends unknown
		? { expand?: unknown }
		: { expand: T }
	: { expand: T }

// System fields
export type BaseSystemFields<T = unknown> = {
	id: RecordIdString
	collectionId: string
	collectionName: Collections
} & ExpandType<T>

export type AuthSystemFields<T = unknown> = {
	email: string
	emailVisibility: boolean
	username: string
	verified: boolean
} & BaseSystemFields<T>

// Record types for each collection

export type AuthoriginsRecord = {
	collectionRef: string
	created: IsoAutoDateString
	fingerprint: string
	id: string
	recordRef: string
	updated: IsoAutoDateString
}

export type ExternalauthsRecord = {
	collectionRef: string
	created: IsoAutoDateString
	id: string
	provider: string
	providerId: string
	recordRef: string
	updated: IsoAutoDateString
}

export type MfasRecord = {
	collectionRef: string
	created: IsoAutoDateString
	id: string
	method: string
	recordRef: string
	updated: IsoAutoDateString
}

export type OtpsRecord = {
	collectionRef: string
	created: IsoAutoDateString
	id: string
	password: string
	recordRef: string
	sentTo?: string
	updated: IsoAutoDateString
}

export type SuperusersRecord = {
	created: IsoAutoDateString
	email: string
	emailVisibility?: boolean
	id: string
	password: string
	tokenKey: string
	updated: IsoAutoDateString
	verified?: boolean
}

export type ClientsRecord = {
	address?: string
	created: IsoAutoDateString
	created_by?: RecordIdString
	deleted?: IsoDateString
	deleted_by?: RecordIdString
	id: string
	name: string
	phone?: string
	updated: IsoAutoDateString
	updated_by?: RecordIdString
}

export type ConfigsRecord = {
	company?: string
	created: IsoAutoDateString
	id: string
	retrieve_last_price?: boolean
	updated: IsoAutoDateString
}

export type InvoicesRecord = {
	client: RecordIdString
	created: IsoAutoDateString
	created_by?: RecordIdString
	date: IsoDateString
	deleted?: IsoDateString
	deleted_by?: RecordIdString
	discount?: number
	id: string
	state: RecordIdString
	total?: number
	updated: IsoAutoDateString
	updated_by?: RecordIdString
}

export type InvoicesProductsRecord = {
	amount?: number
	created: IsoAutoDateString
	created_by?: RecordIdString
	deleted?: IsoDateString
	deleted_by?: RecordIdString
	discount?: number
	id: string
	invoice: RecordIdString
	product: RecordIdString
	total?: number
	unit_price?: number
	updated: IsoAutoDateString
	updated_by?: RecordIdString
}

export type InvoicestatesRecord = {
	created: IsoAutoDateString
	id: string
	name?: string
	updated: IsoAutoDateString
}

export type MeasureunitsRecord = {
	created: IsoAutoDateString
	created_by?: RecordIdString
	deleted?: IsoDateString
	deleted_by?: RecordIdString
	id: string
	name?: string
	updated: IsoAutoDateString
	updated_by?: RecordIdString
}

export type ProductTypesRecord = {
	created: IsoAutoDateString
	id: string
	name?: string
	updated: IsoAutoDateString
}

export type ProductsRecord = {
	created: IsoAutoDateString
	created_by?: RecordIdString
	deleted?: IsoDateString
	deleted_by?: RecordIdString
	id: string
	measure_unit: RecordIdString
	name: string
	product_type: RecordIdString[]
	unit_price?: number
	updated: IsoAutoDateString
	updated_by?: RecordIdString
}

export type RolesRecord = {
	created: IsoAutoDateString
	created_by?: RecordIdString
	deleted?: IsoDateString
	deleted_by?: RecordIdString
	id: string
	name: string
	updated: IsoAutoDateString
	updated_by?: RecordIdString
}

export type UsersRecord = {
	created: IsoAutoDateString
	email?: string
	emailVisibility?: boolean
	id: string
	password: string
	role: RecordIdString
	tokenKey: string
	updated: IsoAutoDateString
	username: string
	verified?: boolean
}

export type VInvoicesRecord<Tclient = unknown, Tinvoice_products = unknown> = {
	client?: null | Tclient
	created: IsoAutoDateString
	date: IsoDateString
	deleted?: IsoDateString
	discount?: number
	id: string
	invoice_products?: null | Tinvoice_products
	state?: string
	total?: number
	updated: IsoAutoDateString
}

export type XDeletedRecord<Trecord = unknown> = {
	collection?: string
	created: IsoAutoDateString
	deleted_by?: RecordIdString
	id: string
	record?: null | Trecord
	updated: IsoAutoDateString
}

// Response types include system fields and match responses from the PocketBase API
export type AuthoriginsResponse<Texpand = unknown> = Required<AuthoriginsRecord> & BaseSystemFields<Texpand>
export type ExternalauthsResponse<Texpand = unknown> = Required<ExternalauthsRecord> & BaseSystemFields<Texpand>
export type MfasResponse<Texpand = unknown> = Required<MfasRecord> & BaseSystemFields<Texpand>
export type OtpsResponse<Texpand = unknown> = Required<OtpsRecord> & BaseSystemFields<Texpand>
export type SuperusersResponse<Texpand = unknown> = Required<SuperusersRecord> & AuthSystemFields<Texpand>
export type ClientsResponse<Texpand = unknown> = Required<ClientsRecord> & BaseSystemFields<Texpand>
export type ConfigsResponse<Texpand = unknown> = Required<ConfigsRecord> & BaseSystemFields<Texpand>
export type InvoicesResponse<Texpand = unknown> = Required<InvoicesRecord> & BaseSystemFields<Texpand>
export type InvoicesProductsResponse<Texpand = unknown> = Required<InvoicesProductsRecord> & BaseSystemFields<Texpand>
export type InvoicestatesResponse<Texpand = unknown> = Required<InvoicestatesRecord> & BaseSystemFields<Texpand>
export type MeasureunitsResponse<Texpand = unknown> = Required<MeasureunitsRecord> & BaseSystemFields<Texpand>
export type ProductTypesResponse<Texpand = unknown> = Required<ProductTypesRecord> & BaseSystemFields<Texpand>
export type ProductsResponse<Texpand = unknown> = Required<ProductsRecord> & BaseSystemFields<Texpand>
export type RolesResponse<Texpand = unknown> = Required<RolesRecord> & BaseSystemFields<Texpand>
export type UsersResponse<Texpand = unknown> = Required<UsersRecord> & AuthSystemFields<Texpand>
export type VInvoicesResponse<Tclient = unknown, Tinvoice_products = unknown, Texpand = unknown> = Required<VInvoicesRecord<Tclient, Tinvoice_products>> & BaseSystemFields<Texpand>
export type XDeletedResponse<Trecord = unknown, Texpand = unknown> = Required<XDeletedRecord<Trecord>> & BaseSystemFields<Texpand>

// Types containing all Records and Responses, useful for creating typing helper functions

export type CollectionRecords = {
	_authOrigins: AuthoriginsRecord
	_externalAuths: ExternalauthsRecord
	_mfas: MfasRecord
	_otps: OtpsRecord
	_superusers: SuperusersRecord
	clients: ClientsRecord
	configs: ConfigsRecord
	invoices: InvoicesRecord
	invoices_products: InvoicesProductsRecord
	invoicestates: InvoicestatesRecord
	measureunits: MeasureunitsRecord
	product_types: ProductTypesRecord
	products: ProductsRecord
	roles: RolesRecord
	users: UsersRecord
	v_invoices: VInvoicesRecord
	x_deleted: XDeletedRecord
}

export type CollectionResponses = {
	_authOrigins: AuthoriginsResponse
	_externalAuths: ExternalauthsResponse
	_mfas: MfasResponse
	_otps: OtpsResponse
	_superusers: SuperusersResponse
	clients: ClientsResponse
	configs: ConfigsResponse
	invoices: InvoicesResponse
	invoices_products: InvoicesProductsResponse
	invoicestates: InvoicestatesResponse
	measureunits: MeasureunitsResponse
	product_types: ProductTypesResponse
	products: ProductsResponse
	roles: RolesResponse
	users: UsersResponse
	v_invoices: VInvoicesResponse
	x_deleted: XDeletedResponse
}

// Utility types for create/update operations

type ProcessCreateAndUpdateFields<T> = Omit<{
	// Omit AutoDate fields
	[K in keyof T as Extract<T[K], IsoAutoDateString> extends never ? K : never]: 
		// Convert FileNameString to File
		T[K] extends infer U ? 
			U extends (FileNameString | FileNameString[]) ? 
				U extends any[] ? File[] : File 
			: U
		: never
}, 'id'>

// Create type for Auth collections
export type CreateAuth<T> = {
	id?: RecordIdString
	email: string
	emailVisibility?: boolean
	password: string
	passwordConfirm: string
	verified?: boolean
} & ProcessCreateAndUpdateFields<T>

// Create type for Base collections
export type CreateBase<T> = {
	id?: RecordIdString
} & ProcessCreateAndUpdateFields<T>

// Update type for Auth collections
export type UpdateAuth<T> = Partial<
	Omit<ProcessCreateAndUpdateFields<T>, keyof AuthSystemFields>
> & {
	email?: string
	emailVisibility?: boolean
	oldPassword?: string
	password?: string
	passwordConfirm?: string
	verified?: boolean
}

// Update type for Base collections
export type UpdateBase<T> = Partial<
	Omit<ProcessCreateAndUpdateFields<T>, keyof BaseSystemFields>
>

// Get the correct create type for any collection
export type Create<T extends keyof CollectionResponses> =
	CollectionResponses[T] extends AuthSystemFields
		? CreateAuth<CollectionRecords[T]>
		: CreateBase<CollectionRecords[T]>

// Get the correct update type for any collection
export type Update<T extends keyof CollectionResponses> =
	CollectionResponses[T] extends AuthSystemFields
		? UpdateAuth<CollectionRecords[T]>
		: UpdateBase<CollectionRecords[T]>

// Type for usage with type asserted PocketBase instance
// https://github.com/pocketbase/js-sdk#specify-typescript-definitions

export type TypedPocketBase = {
	collection<T extends keyof CollectionResponses>(
		idOrName: T
	): RecordService<CollectionResponses[T]>
} & PocketBase
