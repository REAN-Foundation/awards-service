import { ContextType } from "../engine/engine.types";
import {
    BaseSearchFilters,
    BaseSearchResults
} from "../miscellaneous/base.search.types";
import {
    uuid
} from "../miscellaneous/system.types";

//////////////////////////////////////////////////////////////

export interface RewardPointsRedemptionCreateModel {
    ContextId           : uuid;
    RedeemedPointsCount : number;
    ModeOfRedemption   ?: string;
    RedemptionPurpose  ?: string;
    Message            ?: string;
    RedemptionDate     ?: Date;
}

export interface RewardPointsRedemptionUpdateModel {
    ModeOfRedemption  ?: string;
    RedemptionPurpose ?: string;
    Message           ?: string;
}

export interface RewardPointsRedemptionResponseDto {
    id                 : uuid;
    RedeemedPointsCount: number;
    ModeOfRedemption   : string;
    RedemptionPurpose  : string;
    Message            : string;
    RedemptionDate     : Date;
    Context: {
        id          : uuid;
        ReferenceId : uuid;
        Type        : ContextType;
        Participant?: {
            id        : uuid;
            FirstName?: string;
            LastName ?: string;
        };
        ParticipantGroup ?: {
            id          : uuid;
            Name        : string;
            Description?: string;
        };
    };
    CreatedAt: Date;
    UpdatedAt: Date;
}

export interface RewardPointsRedemptionSearchFilters extends BaseSearchFilters {
    ContextId ?  : uuid;
}

export interface RewardPointsRedemptionSearchResults extends BaseSearchResults {
    Items: RewardPointsRedemptionResponseDto[];
}
