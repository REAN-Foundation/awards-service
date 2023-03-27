import { Participant } from '../../models/awards/participant.model';
import { ParticipantBadge } from '../../models/awards/participant.badge.model';
import { Badge } from '../../models/awards/badge.model';
import { ParticipantBadgeResponseDto, ParticipantCreateModel, ParticipantResponseDto, ParticipantSearchFilters, ParticipantSearchResults, ParticipantUpdateModel } from '../../../domain.types/awards/participant.domain.types';
import { logger } from '../../../logger/logger';
import { ErrorHandler } from '../../../common/handlers/error.handler';
import { Source } from '../../../database/database.connector';
import { FindManyOptions, Like, Repository } from 'typeorm';
import { ParticipantMapper } from '../../mappers/awards/participant.mapper';
import { Client } from '../../models/client/client.model';
import { BaseService } from '../base.service';
import { uuid } from '../../../domain.types/miscellaneous/system.types';
import { StringUtils } from '../../../common/utilities/string.utils';
import { Context } from '../../models/engine/context.model';
import { ContextType } from '../../../domain.types/engine/engine.enums';

///////////////////////////////////////////////////////////////////////

export class ParticipantService extends BaseService {

    //#region Repositories

    _participantRepository: Repository<Participant> = Source.getRepository(Participant);

    _clientRepository: Repository<Client> = Source.getRepository(Client);

    _contextRepository: Repository<Context> = Source.getRepository(Context);

    _participantBadgeRepository: Repository<ParticipantBadge> = Source.getRepository(ParticipantBadge);

    _badgeRepository: Repository<Badge> = Source.getRepository(Badge);

    //#endregion

    public create = async (createModel: ParticipantCreateModel)
        : Promise<ParticipantResponseDto> => {

        const client = await this._clientRepository.findOne({
            where : {
                id : createModel.ClientId
            }
        });
        if (!client) {
            ErrorHandler.throwNotFoundError('Client cannot be found');
        }
        const participant = this._participantRepository.create({
            ReferenceId     : createModel.ReferenceId,
            Client          : client,
            Prefix          : createModel.Prefix,
            FirstName       : createModel.FirstName,
            LastName        : createModel.LastName,
            CountryCode     : createModel.CountryCode,
            Phone           : createModel.Phone,
            Email           : createModel.Email,
            Gender          : createModel.Gender,
            BirthDate       : createModel.BirthDate,
            ProfileImageUrl : createModel.ProfileImageUrl,
            OnboardingDate  : createModel.OnboardingDate ?? new Date(),
        });
        var record = await this._participantRepository.save(participant);

        //Keep person context for this participant
        const context = this._contextRepository.create({
            Type: ContextType.Person,
            ReferenceId : createModel.ReferenceId,
            Participant : record,
        })
        const contextRecord = await this._contextRepository.save(context);
        logger.info(JSON.stringify(contextRecord, null, 2));

        return ParticipantMapper.toResponseDto(record);
    };

    public getById = async (id: uuid): Promise<ParticipantResponseDto> => {
        try {
            var participant = await this._participantRepository.findOne({
                where : {
                    id : id
                }
            });
            return ParticipantMapper.toResponseDto(participant);
        } catch (error) {
            logger.error(error.message);
            ErrorHandler.throwInternalServerError(error.message, 500);
        }
    };

    public search = async (filters: ParticipantSearchFilters)
        : Promise<ParticipantSearchResults> => {
        try {
            var search = this.getSearchModel(filters);
            var { search, pageIndex, limit, order, orderByColumn } = this.addSortingAndPagination(search, filters);
            const [list, count] = await this._participantRepository.findAndCount(search);
            const searchResults = {
                TotalCount     : count,
                RetrievedCount : list.length,
                PageIndex      : pageIndex,
                ItemsPerPage   : limit,
                Order          : order === 'DESC' ? 'descending' : 'ascending',
                OrderedBy      : orderByColumn,
                Items          : list.map(x => ParticipantMapper.toResponseDto(x)),
            };
            return searchResults;
        } catch (error) {
            logger.error(error.message);
            ErrorHandler.throwDbAccessError('DB Error: Unable to search records!', error);
        }
    };

    public update = async (id: uuid, model: ParticipantUpdateModel)
        : Promise<ParticipantResponseDto> => {
        try {
            const participant = await this._participantRepository.findOne({
                where : {
                    id : id
                }
            });
            if (!participant) {
                ErrorHandler.throwNotFoundError('participant not found!');
            }
            //Participant code is not modifiable
            //Use renew key to update ApiKey, ValidFrom and ValidTill

            if (model.Prefix != null) {
                participant.Prefix = model.Prefix;
            }
            if (model.FirstName != null) {
                participant.FirstName = StringUtils.hash(model.FirstName);
            }
            if (model.LastName != null) {
                participant.LastName = StringUtils.hash(model.LastName);
            }
            if (model.CountryCode != null) {
                participant.CountryCode = model.CountryCode;
            }
            if (model.Phone != null) {
                participant.Phone = model.Phone;
            }
            if (model.Email != null) {
                participant.Email = model.Email;
            }
            if (model.Gender != null) {
                participant.Gender = model.Gender;
            }
            if (model.BirthDate != null) {
                participant.BirthDate = model.BirthDate;
            }
            if (model.ProfileImageUrl != null) {
                participant.ProfileImageUrl = model.ProfileImageUrl;
            }
            var record = await this._participantRepository.save(participant);
            return ParticipantMapper.toResponseDto(record);
        } catch (error) {
            logger.error(error.message);
            ErrorHandler.throwInternalServerError(error.message, 500);
        }
    };

    public delete = async (id: string): Promise<boolean> => {
        try {
            var record = await this._participantRepository.findOne({
                where : {
                    id : id
                }
            });
            var result = await this._participantRepository.remove(record);
            return result != null;
        } catch (error) {
            logger.error(error.message);
            ErrorHandler.throwInternalServerError(error.message, 500);
        }
    };

    
    public awardBadge = async (id: string, badgeId: uuid, reason: string, acquiredDate = new Date())
        : Promise<ParticipantBadge> => {
        try {
            var participant = await this._participantRepository.findOne({
                where : {
                    id : id
                }
            });
            var badge = await this._badgeRepository.findOne({
                where : {
                    id : badgeId
                }
            });
            var participantBadge = await this._participantBadgeRepository.create({
                Participant: participant,
                Badge: badge,
                AcquiredDate: acquiredDate,
                Reason : reason
            });
            var record = await this._participantBadgeRepository.save(participantBadge);
            return record;
        } catch (error) {
            logger.error(error.message);
            ErrorHandler.throwInternalServerError(error.message, 500);
        }
    };

    public getBadges = async (id: string): Promise<ParticipantBadgeResponseDto[]> => {
        try {
            const search: FindManyOptions<ParticipantBadge> = {
                relations : {
                },
                where : {
                    Participant : {
                        id : id
                    }
                },
                select: {
                    Badge : {
                        id         : true,
                        Name       : true,
                        Description: true,
                        Category   : {
                            id      : true,
                            Name    : true,
                            ImageUrl: true,
                        },
                        ImageUrl: true,
                    },
                    AcquiredDate: true,
                    Reason      : true,
                    CreatedAt : true,
                }
            };
            const list = await this._participantBadgeRepository.find(search);
            const participantBadges = list.map(x => {
                return {
                    ParticipantId: id,
                    Badge: {
                        id : x.Badge.id,
                        Name: x.Badge.Name,
                        Description : x.Badge.Description,
                        Category: {
                            id: x.Badge.Category.id,
                            Name: x.Badge.Category.Name,
                            ImageUrl: x.Badge.Category.ImageUrl,
                        },
                        ImageUrl : x.Badge.ImageUrl,
                    },
                    AcquiredDate: x.AcquiredDate,
                    Reason: x.Reason,
                    CreatedAt: x.CreatedAt
                }
            });
            return participantBadges;
        } catch (error) {
            logger.error(error.message);
            ErrorHandler.throwInternalServerError(error.message, 500);
        }
    };

    //#region Privates

    private getSearchModel = (filters: ParticipantSearchFilters) => {

        var search : FindManyOptions<Participant> = {
            relations : {
            },
            where : {
            },
            select : {
                id              : true,
                Prefix          : true,
                FirstName       : true,
                LastName        : true,
                CountryCode     : true,
                Phone           : true,
                Email           : true,
                ProfileImageUrl : true,
            }
        };

        if (filters.Phone) {
            search.where['Phone'] = filters.Phone;
        }
        if (filters.Email) {
            search.where['Email'] = filters.Email;
        }
        if (filters.Name) {
            search.where = [
                { FirstName: Like(`%${filters.Name}%`) },
                { LastName: Like(`%${filters.Name}%`) }
            ];
        }

        return search;
    };

    //#endregion

}
