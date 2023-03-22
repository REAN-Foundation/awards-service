import {
    BaseSearchFilters,
    BaseSearchResults
} from "../miscellaneous/base.search.types";
import {
    uuid
} from "../miscellaneous/system.types";
import { ContextType } from "./enums";

//////////////////////////////////////////////////////////////

export interface SchemaInstanceCreateModel {
    SchemaId  : uuid;
    ContextId : uuid;
}

export interface SchemaInstanceUpdateModel {
    SchemaId  ?: uuid;
    ContextId ?: uuid;
}

export interface SchemaInstanceResponseDto {
    id         : uuid;
    Schema     : {
        id         : uuid;
        Name       : string;
        Description: string;
        Client     : {
            id  : uuid;
            Name: string;
        }
    };
    Context     : {
        id          : uuid;
        ReferenceId : uuid;
        Type        : ContextType;
        Participant?: {
            id         : uuid;
            ReferenceId: uuid;
            Prefix     : string;
            FirstName  : string;
            LastName   : string;
        };
        ParticipantGroup ?: {
            id         : uuid;
            Name       : string;
            Description: string;
        };
    };
    RootNode : {
        id: uuid;
        Name: string;
    };
    CurrentNode : {
        id: uuid;
        Name: string;
    };
    CreatedAt: Date;
    UpdatedAt: Date;
}

export interface SchemaInstanceSearchFilters extends BaseSearchFilters {
    SchemaId  ?: uuid;
    ContextId ?: uuid;
}

export interface SchemaInstanceSearchResults extends BaseSearchResults {
    Items: SchemaInstanceResponseDto[];
}
