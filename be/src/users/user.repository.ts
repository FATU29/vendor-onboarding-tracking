export interface UserRecord {
  id: string;
  name: string;
}

/** Injection token for the user persistence port. */
export const USER_REPOSITORY = Symbol('USER_REPOSITORY');

/** Database operations required by the application user services. */
export interface UserRepository {
  upsertByName(name: string): Promise<void>;
  findAll(): Promise<UserRecord[]>;
  findById(id: string): Promise<UserRecord | null>;
}
