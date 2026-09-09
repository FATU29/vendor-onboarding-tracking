export const APP_SETTING_REPOSITORY = Symbol('APP_SETTING_REPOSITORY');

export const VENDOR_STUCK_THRESHOLD_DAYS_SETTING = 'vendor_stuck_threshold_days';

/** Persistence port for numeric application settings. */
export interface AppSettingRepository {
  findInteger(key: string): Promise<number | null>;
  updateInteger(key: string, value: number): Promise<boolean>;
}
