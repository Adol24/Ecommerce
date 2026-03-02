import {
  type HomepageConfig,
  defaultHomepageConfig,
  normalizeHomepageConfig,
} from "@/lib/homepage-config"
import type { TemplateId } from "@/lib/template-config"

export { type HomepageConfig }
export type { TemplateId }

export const SETTINGS_STORAGE_KEY = "basictechshop:admin-settings"
export const APP_SETTINGS_ROW_ID = "default"

export interface StoreSettings {
  activeTemplate: TemplateId
  storeName: string
  storeEmail: string
  storePhone: string
  storeAddress: string
  storeDescription: string
  timezone: string
  currency: string
  colorTheme: string
  homepageConfig: HomepageConfig
  showOutOfStockProducts: boolean
  showStockCount: boolean
  allowProductReviews: boolean
  standardShippingCost: string
  freeShippingThreshold: string
  notifyNewOrders: boolean
  notifyFailedPayments: boolean
  notifyLowStock: boolean
  notifyNewUsers: boolean
  enableCardPayments: boolean
  enableBankTransfer: boolean
  enableDigitalWallets: boolean
  enableCashOnDelivery: boolean
}

export const defaultStoreSettings: StoreSettings = {
  activeTemplate: "tech",
  storeName: "BasicTechShop",
  storeEmail: "info@basictechshop.com",
  storePhone: "+52 55 1234 5678",
  storeAddress: "Av. Tecnologia 123, Ciudad de Mexico",
  storeDescription: "Tu tienda de tecnologia de confianza",
  timezone: "america-mexico",
  currency: "mxn",
  colorTheme: "emerald",
  homepageConfig: defaultHomepageConfig,
  showOutOfStockProducts: true,
  showStockCount: true,
  allowProductReviews: true,
  standardShippingCost: "15",
  freeShippingThreshold: "200",
  notifyNewOrders: true,
  notifyFailedPayments: true,
  notifyLowStock: true,
  notifyNewUsers: false,
  enableCardPayments: true,
  enableBankTransfer: true,
  enableDigitalWallets: true,
  enableCashOnDelivery: false,
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null
}

function readString(
  source: Record<string, unknown>,
  key: keyof StoreSettings,
  fallback: string
): string {
  const value = source[key]
  return typeof value === "string" ? value : fallback
}

function readBoolean(
  source: Record<string, unknown>,
  key: keyof StoreSettings,
  fallback: boolean
): boolean {
  const value = source[key]
  return typeof value === "boolean" ? value : fallback
}

export function normalizeStoreSettings(value: unknown): StoreSettings {
  if (!isRecord(value)) {
    return { ...defaultStoreSettings }
  }

  const activeTemplate: TemplateId = "tech"

  return {
    activeTemplate,
    storeName: readString(value, "storeName", defaultStoreSettings.storeName),
    storeEmail: readString(value, "storeEmail", defaultStoreSettings.storeEmail),
    storePhone: readString(value, "storePhone", defaultStoreSettings.storePhone),
    storeAddress: readString(value, "storeAddress", defaultStoreSettings.storeAddress),
    storeDescription: readString(value, "storeDescription", defaultStoreSettings.storeDescription),
    timezone: readString(value, "timezone", defaultStoreSettings.timezone),
    currency: readString(value, "currency", defaultStoreSettings.currency),
    colorTheme: readString(value, "colorTheme", defaultStoreSettings.colorTheme),
    homepageConfig: normalizeHomepageConfig(value.homepageConfig),
    showOutOfStockProducts: readBoolean(
      value,
      "showOutOfStockProducts",
      defaultStoreSettings.showOutOfStockProducts
    ),
    showStockCount: readBoolean(value, "showStockCount", defaultStoreSettings.showStockCount),
    allowProductReviews: readBoolean(
      value,
      "allowProductReviews",
      defaultStoreSettings.allowProductReviews
    ),
    standardShippingCost: readString(
      value,
      "standardShippingCost",
      defaultStoreSettings.standardShippingCost
    ),
    freeShippingThreshold: readString(
      value,
      "freeShippingThreshold",
      defaultStoreSettings.freeShippingThreshold
    ),
    notifyNewOrders: readBoolean(value, "notifyNewOrders", defaultStoreSettings.notifyNewOrders),
    notifyFailedPayments: readBoolean(
      value,
      "notifyFailedPayments",
      defaultStoreSettings.notifyFailedPayments
    ),
    notifyLowStock: readBoolean(value, "notifyLowStock", defaultStoreSettings.notifyLowStock),
    notifyNewUsers: readBoolean(value, "notifyNewUsers", defaultStoreSettings.notifyNewUsers),
    enableCardPayments: readBoolean(
      value,
      "enableCardPayments",
      defaultStoreSettings.enableCardPayments
    ),
    enableBankTransfer: readBoolean(
      value,
      "enableBankTransfer",
      defaultStoreSettings.enableBankTransfer
    ),
    enableDigitalWallets: readBoolean(
      value,
      "enableDigitalWallets",
      defaultStoreSettings.enableDigitalWallets
    ),
    enableCashOnDelivery: readBoolean(
      value,
      "enableCashOnDelivery",
      defaultStoreSettings.enableCashOnDelivery
    ),
  }
}

export function mergeStoreSettings(
  base: StoreSettings,
  patch: Partial<StoreSettings> | unknown
): StoreSettings {
  if (!isRecord(patch)) {
    return { ...base }
  }
  return normalizeStoreSettings({ ...base, ...patch })
}

