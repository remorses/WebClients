export interface CreateDriveShare {
    AddressID: string;
    RootLinkID: string;
    Name: string;
    Type?: number; // TODO: UNUSED - remove it when BE removes it
    PermissionsMask: number;
    ShareKey: string;
    SharePassphrase: string;
    SharePassphraseSignature: string;
    PassphraseKeyPacket: string;
    NameKeyPacket: string;
}

export interface UserShareResult {
    Shares: ShareMetaShort[];
}

export interface ShareMetaShort {
    ShareID: string;
    Type: number;
    LinkID: string;
    Locked: boolean;
    VolumeID: string;
    Creator: string;
    PermissionsMask: 0;
    Flags: number;
    BlockSize: number;
    PossibleKeyPackets?: { KeyPacket: string }[];
    VolumeSoftDeleted: boolean;
}

export interface ShareMeta extends ShareMetaShort {
    Key: string;
    Passphrase: string;
    PassphraseSignature: string;
    AddressID: string;
    RootLinkRecoveryPassphrase?: string;
}

export enum ShareFlags {
    MainShare = 1,
}
