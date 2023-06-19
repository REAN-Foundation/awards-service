import { ContextType, RewardPointsStatus } from "../engine/engine.types";
import {
    BaseSearchFilters,
    BaseSearchResults
} from "../miscellaneous/base.search.types";
import {
    uuid
} from "../miscellaneous/system.types";

//////////////////////////////////////////////////////////////

export interface RewardPointsCreateModel {
    ContextId           : uuid;
    CategoryId          : uuid;
    RewardReason       ?: string;
    PointsCount        ?: number;
    IsBonus            ?: boolean;
    BonusSchemaCode    ?: string;
    BonusReason        ?: string;
    RedemptionExpiresOn?: Date;
    Status              : RewardPointsStatus;
    RewardDate         ?: Date;
}

export interface RewardPointsUpdateModel {
    ContextId          ?: uuid;
    CategoryId         ?: uuid;
    RewardReason       ?: string;
    PointsCount        ?: number;
    IsBonus            ?: boolean;
    BonusSchemaCode    ?: string;
    BonusReason        ?: string;
    RedemptionExpiresOn?: Date;
    Status             ?: RewardPointsStatus;
}

export interface RewardPointsResponseDto {
    id                  : uuid;
    PointsCount         : number;
    IsBonus             : boolean;
    BonusSchemaCode    ?: string;
    BonusReason        ?: string;
    RedemptionExpiresOn?: Date;
    Status              : RewardPointsStatus;
    RewardDate          : Date;
    RewardReason       ?: string;
    Category            : {
        id         : uuid;
        Name       : string;
        Description: string;
        ImageUrl   : string;
    };
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

export interface RewardPointsSearchFilters extends BaseSearchFilters {
    CategoryId ?: uuid;
    ContextId  ?: uuid;
}

export interface RewardPointsSearchResults extends BaseSearchResults {
    Items: RewardPointsResponseDto[];
}

export interface ParticipantRewardPointsResponseDto {
    ParticipantId      : uuid;
    FirstName         ?: string;
    LastName          ?: string;
    TotalPointsCount   : number;
    CategoryWisePoints : {
        CategoryId  : uuid;
        CategoryName: string;
        PointsCount : number;
    }[];
}

export interface ParticipantGroupRewardPointsResponseDto {
    ParticipantGroupId : uuid;
    Name              ?: string;
    TotalPointsCount   : number;
    CategoryWisePoints : {
        CategoryId  : uuid;
        CategoryName: string;
        PointsCount : number;
    }[];
}

export interface GroupLeaderBoardResponseDto {
    ParticipantGroupId : uuid;
    Name              ?: string;
    FromDate           : Date;
    ToDate             : Date;
    LeaderBoard        : {
        ParticipantId      : uuid;
        FirstName         ?: string;
        LastName          ?: string;
        TotalPointsCount   : number;
        Rank               : number;
    }[];
}
