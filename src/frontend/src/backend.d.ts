import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export type SongName = string;
export type CompositionId = bigint;
export interface UserProfile {
    name: string;
}
export enum UserRole {
    admin = "admin",
    user = "user",
    guest = "guest"
}
export interface backendInterface {
    assignCallerUserRole(user: Principal, role: UserRole): Promise<void>;
    deleteComposition(compositionId: CompositionId): Promise<void>;
    getCallerUserProfile(): Promise<UserProfile | null>;
    getCallerUserRole(): Promise<UserRole>;
    getUserProfile(user: Principal): Promise<UserProfile | null>;
    isCallerAdmin(): Promise<boolean>;
    listCompositions(): Promise<Array<[SongName, CompositionId]>>;
    loadComposition(compositionId: CompositionId): Promise<Uint8Array>;
    saveCallerUserProfile(profile: UserProfile): Promise<void>;
    saveComposition(name: SongName, composerData: Uint8Array): Promise<CompositionId>;
}
