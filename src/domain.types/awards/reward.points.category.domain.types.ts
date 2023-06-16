import {
    BaseSearchFilters,
    BaseSearchResults
} from "../miscellaneous/base.search.types";
import {
    uuid
} from "../miscellaneous/system.types";

//////////////////////////////////////////////////////////////

export interface RewardPointsCategoryCreateModel {
    ClientId     : uuid;
    Name         : string;
    Description? : string;
    ImageUrl     : string;
}

export interface RewardPointsCategoryUpdateModel {
    ClientId?    : uuid;
    Name?        : string;
    Description? : string;
    ImageUrl?    : string;
}

export interface RewardPointsCategoryResponseDto {
    id         : uuid;
    Name       : string;
    Description: string;
    ImageUrl   : string;
    Client: {
        id  : uuid;
        Name: string;
        Code: string;
    };
    CreatedAt: Date;
    UpdatedAt: Date;
}

export interface RewardPointsCategorySearchFilters extends BaseSearchFilters {
    Name ?       : string;
    ClientId ?   : uuid;
}

export interface RewardPointsCategorySearchResults extends BaseSearchResults {
    Items: RewardPointsCategoryResponseDto[];
}
