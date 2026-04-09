/**
* This file was @generated using pocketbase-typegen
*/

import type PocketBase from 'pocketbase'
import type { RecordService } from 'pocketbase'

export enum Collections {
	Clients = "clients",
	Invoices = "invoices",
	InvoicesProducts = "invoices_products",
	Invoicestates = "invoicestates",
	Measureunits = "measureunits",
	Products = "products",
	Roles = "roles",
	Users = "users",
	VInvoices = "v_invoices",
	XDeleted = "x_deleted",
}

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

export type ClientsRecord = {
	address?: string
	created_by?: RecordIdString
	deleted?: IsoDateString
	deleted_by?: RecordIdString
	name: string
	phone?: string
	updated_by?: RecordIdString
}

export type InvoicesRecord = {
	client: RecordIdString
	created_by?: RecordIdString
	date: IsoDateString
	deleted?: IsoDateString
	deleted_by?: RecordIdString
	discount?: number
	state: RecordIdString
	total?: number
	updated_by?: RecordIdString
}

export type InvoicesProductsRecord = {
	amount?: number
	created_by?: RecordIdString
	deleted?: IsoDateString
	deleted_by?: RecordIdString
	discount?: number
	invoice: RecordIdString
	product: RecordIdString
	total?: number
	unit_price?: number
	updated_by?: RecordIdString
}

export type InvoicestatesRecord = {
	name?: string
}

export type MeasureunitsRecord = {
	created_by?: RecordIdString
	deleted?: IsoDateString
	deleted_by?: RecordIdString
	name?: string
	updated_by?: RecordIdString
}

export type ProductsRecord = {
	created_by?: RecordIdString
	deleted?: IsoDateString
	deleted_by?: RecordIdString
	measure_unit: RecordIdString
	name: string
	unit_price?: number
	updated_by?: RecordIdString
}

export type RolesRecord = {
	created_by?: RecordIdString
	deleted?: IsoDateString
	deleted_by?: RecordIdString
	name: string
	updated_by?: RecordIdString
}

export type UsersRecord = {
	role: RecordIdString
}

export type VInvoicesRecord<Tclient = unknown, Tinvoice_products = unknown> = {
	client?: null | Tclient
	date: IsoDateString
	deleted?: IsoDateString
	discount?: number
	invoice_products?: null | Tinvoice_products
	total?: number
}

export type XDeletedRecord<Trecord = unknown> = {
	collection?: string
	deleted_by?: RecordIdString
	record?: null | Trecord
}

// Response types include system fields and match responses from the PocketBase API
export type ClientsResponse<Texpand = unknown> = Required<ClientsRecord> & BaseSystemFields<Texpand>
export type InvoicesResponse<Texpand = unknown> = Required<InvoicesRecord> & BaseSystemFields<Texpand>
export type InvoicesProductsResponse<Texpand = unknown> = Required<InvoicesProductsRecord> & BaseSystemFields<Texpand>
export type InvoicestatesResponse<Texpand = unknown> = Required<InvoicestatesRecord> & BaseSystemFields<Texpand>
export type MeasureunitsResponse<Texpand = unknown> = Required<MeasureunitsRecord> & BaseSystemFields<Texpand>
export type ProductsResponse<Texpand = unknown> = Required<ProductsRecord> & BaseSystemFields<Texpand>
export type RolesResponse<Texpand = unknown> = Required<RolesRecord> & BaseSystemFields<Texpand>
export type UsersResponse<Texpand = unknown> = Required<UsersRecord> & AuthSystemFields<Texpand>
export type VInvoicesResponse<Tclient = unknown, Tinvoice_products = unknown, Texpand = unknown> = Required<VInvoicesRecord<Tclient, Tinvoice_products>> & BaseSystemFields<Texpand>
export type XDeletedResponse<Trecord = unknown, Texpand = unknown> = Required<XDeletedRecord<Trecord>> & BaseSystemFields<Texpand>

// Types containing all Records and Responses, useful for creating typing helper functions

export type CollectionRecords = {
	clients: ClientsRecord
	invoices: InvoicesRecord
	invoices_products: InvoicesProductsRecord
	invoicestates: InvoicestatesRecord
	measureunits: MeasureunitsRecord
	products: ProductsRecord
	roles: RolesRecord
	users: UsersRecord
	v_invoices: VInvoicesRecord
	x_deleted: XDeletedRecord
}

export type CollectionResponses = {
	clients: ClientsResponse
	invoices: InvoicesResponse
	invoices_products: InvoicesProductsResponse
	invoicestates: InvoicestatesResponse
	measureunits: MeasureunitsResponse
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
