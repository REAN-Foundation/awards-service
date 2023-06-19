import { Context } from '../../models/engine/context.model';
import { RewardPoints } from '../../models/awards/reward.points.model';
import { RewardPointsCategory } from '../../../database/models/awards/reward.points.category.model';
import { logger } from '../../../logger/logger';
import { ErrorHandler } from '../../../common/handlers/error.handler';
import { Source } from '../../database.connector';
import { FindManyOptions, Repository } from 'typeorm';
import { RewardPointsMapper } from '../../mappers/awards/reward.points.mapper';
import { BaseService } from '../base.service';
import { uuid } from '../../../domain.types/miscellaneous/system.types';
import {
    GroupLeaderBoardResponseDto,
    ParticipantGroupRewardPointsResponseDto,
    ParticipantRewardPointsResponseDto,
    RewardPointsCreateModel,
    RewardPointsResponseDto,
    RewardPointsSearchFilters,
    RewardPointsSearchResults,
    RewardPointsUpdateModel
} from '../../../domain.types/awards/reward.points.domain.types';
import { RewardPointsStatus } from '../../../domain.types/engine/engine.types';
import { Participant } from '../../../database/models/awards/participant.model';
import { ParticipantGroup } from '../../../database/models/awards/participant.group.model';

///////////////////////////////////////////////////////////////////////

export class RewardPointsService extends BaseService {

    //#region Repositories

    _contextRepository: Repository<Context> = Source.getRepository(Context);

    _rewardPointsRepository: Repository<RewardPoints> = Source.getRepository(RewardPoints);

    _categoryRepository: Repository<RewardPointsCategory> = Source.getRepository(RewardPointsCategory);

    _participantRepository: Repository<Participant> = Source.getRepository(Participant);

    _participantGroupRepository: Repository<ParticipantGroup> = Source.getRepository(ParticipantGroup);

    //#endregion

    public create = async (createModel: RewardPointsCreateModel)
        : Promise<RewardPointsResponseDto> => {

        const context = await this.getContext(createModel.ContextId);
        const category = await this.getCategory(createModel.CategoryId);

        const points = this._rewardPointsRepository.create({
            Context             : context,
            Category            : category,
            RewardReason        : createModel.RewardReason,
            PointsCount         : createModel.PointsCount,
            IsBonus             : createModel.IsBonus,
            BonusSchemaCode     : createModel.BonusSchemaCode,
            BonusReason         : createModel.BonusReason,
            RedemptionExpiresOn : createModel.RedemptionExpiresOn,
            Status              : RewardPointsStatus.Active,
            RewardDate          : createModel.RewardDate ?? new Date(),
        });
        var record = await this._rewardPointsRepository.save(points);
        return RewardPointsMapper.toResponseDto(record);
    };

    public getById = async (id: uuid): Promise<RewardPointsResponseDto> => {
        try {
            var points = await this._rewardPointsRepository.findOne({
                where : {
                    id : id
                },
                relations : {
                    Category : true,
                    Context  : {
                        Participant : true,
                        Group       : true
                    }
                }
            });
            return RewardPointsMapper.toResponseDto(points);
        } catch (error) {
            logger.error(error.message);
            ErrorHandler.throwInternalServerError(error.message, 500);
        }
    };

    public search = async (filters: RewardPointsSearchFilters)
        : Promise<RewardPointsSearchResults> => {
        try {
            var search = this.getSearchModel(filters);
            var { search, pageIndex, limit, order, orderByColumn } = this.addSortingAndPagination(search, filters);
            const [list, count] = await this._rewardPointsRepository.findAndCount(search);
            const searchResults = {
                TotalCount     : count,
                RetrievedCount : list.length,
                PageIndex      : pageIndex,
                ItemsPerPage   : limit,
                Order          : order === 'DESC' ? 'descending' : 'ascending',
                OrderedBy      : orderByColumn,
                Items          : list.map(x => RewardPointsMapper.toResponseDto(x)),
            };
            return searchResults;
        } catch (error) {
            logger.error(error.message);
            ErrorHandler.throwDbAccessError('DB Error: Unable to search records!', error);
        }
    };

    public update = async (id: uuid, model: RewardPointsUpdateModel)
        : Promise<RewardPointsResponseDto> => {
        try {
            const points = await this._rewardPointsRepository.findOne({
                where : {
                    id : id
                }
            });
            if (!points) {
                ErrorHandler.throwNotFoundError('Badge category not found!');
            }

            if (model.ContextId != null) {
                const context = await this.getContext(model.ContextId);
                points.Context = context;
            }
            if (model.RewardReason != null) {
                points.RewardReason = model.RewardReason;
            }
            if (model.BonusReason != null) {
                points.BonusReason = model.BonusReason;
            }
            if (model.PointsCount != null) {
                points.PointsCount = model.PointsCount;
            }
            if (model.IsBonus != null) {
                points.IsBonus = model.IsBonus;
            }
            if (model.BonusSchemaCode != null) {
                points.BonusSchemaCode = model.BonusSchemaCode;
            }
            if (model.RedemptionExpiresOn != null) {
                points.RedemptionExpiresOn = model.RedemptionExpiresOn;
            }
            if (model.Status != null) {
                points.Status = model.Status;
            }

            var record = await this._rewardPointsRepository.save(points);
            return RewardPointsMapper.toResponseDto(record);
        } catch (error) {
            logger.error(error.message);
            ErrorHandler.throwInternalServerError(error.message, 500);
        }
    };

    public delete = async (id: string): Promise<boolean> => {
        try {
            var record = await this._rewardPointsRepository.findOne({
                where : {
                    id : id
                }
            });
            var result = await this._rewardPointsRepository.remove(record);
            return result != null;
        } catch (error) {
            logger.error(error.message);
            ErrorHandler.throwInternalServerError(error.message, 500);
        }
    };

    getRewardPointsForParticipant = async (participantId: uuid, fromDate: Date, toDate: Date)
    : Promise<ParticipantRewardPointsResponseDto> => {
        try {
            var participant = await this._participantRepository.findOne({
                where : {
                    id : participantId
                }
            });
            const context = await this._contextRepository.findOne({
                where : {
                    ReferenceId : participant.ReferenceId
                }
            });
            if (!context) {
                ErrorHandler.throwNotFoundError('context not found!');
            }
            if (fromDate == null) {
                //Pretty old record....:-)
                fromDate = new Date('2023-01-01');
            }
            if (toDate == null) {
                toDate = new Date();
            }

            var query = await this._rewardPointsRepository.createQueryBuilder('RewardPoints')
                .leftJoinAndSelect('RewardPoints.Category', 'Category')
                .addSelect('SUM(RewardPoints.PointsCount)', 'TotalPoints')
                .where('RewardPoints.ContextId = :contextId', { contextId: context.id })
                .andWhere('RewardPoints.Status = :status', { status: 'Active' })
                .andWhere('RewardPoints.RewardDate >= :fromDate', { fromDate: fromDate })
                .andWhere('RewardPoints.RewardDate <= :toDate', { toDate: toDate })
                .groupBy('RewardPoints.CategoryId')
                .getRawMany();

            const totalCount = query.reduce((sum, current) => sum + current.TotalPoints, 0);

            const participantRewardPoints: ParticipantRewardPointsResponseDto = {
                ParticipantId      : participantId,
                FirstName          : participant.FirstName,
                LastName           : participant.LastName,
                TotalPointsCount   : totalCount,
                CategoryWisePoints : query.map(x => {
                    return {
                        CategoryId   : x.Category.id,
                        CategoryName : x.Category.Name,
                        PointsCount  : x.TotalPoints
                    };
                })
            };
            return participantRewardPoints;

        } catch (error) {
            logger.error(error.message);
            ErrorHandler.throwInternalServerError(error.message, 500);
        }
    };

    getRewardPointsForParticipantGroup = async (groupId: uuid, fromDate: Date, toDate: Date)
    : Promise<ParticipantGroupRewardPointsResponseDto> => {
        try {
            var group = await this._participantGroupRepository.findOne({
                where : {
                    id : groupId
                }
            });
            var participantReferenceIds = group.Participants.map(x => x.ReferenceId);
            var contexts = await this._contextRepository.createQueryBuilder('Context')
                .where('Context.ReferenceId IN (:...participantReferenceIds)', { participantReferenceIds: participantReferenceIds })
                .getMany();
            var contextIds = contexts.map(x => x.id);

            if (fromDate == null) {
                //Pretty old record....:-)
                fromDate = new Date('2023-01-01');
            }
            if (toDate == null) {
                toDate = new Date();
            }

            const groupPoints = await this._rewardPointsRepository.createQueryBuilder('RewardPoints')
                .leftJoinAndSelect('RewardPoints.Category', 'Category')
                .addSelect('SUM(RewardPoints.PointsCount)', 'TotalPoints')
                .where('Context.id IN (:...contextIds)', { contextIds: contextIds })
                .andWhere('RewardPoints.Status = :status', { status: 'Active' })
                .andWhere('RewardPoints.RewardDate >= :fromDate', { fromDate: fromDate })
                .andWhere('RewardPoints.RewardDate <= :toDate', { toDate: toDate })
                .groupBy('RewardPoints.CategoryId')
                .getRawMany();

            const totalCount = groupPoints.reduce((sum, current) => sum + current.TotalPoints, 0);

            const participantRewardPoints: ParticipantGroupRewardPointsResponseDto = {
                GroupId            : groupId,
                Name               : group.Name,
                TotalPointsCount   : totalCount,
                CategoryWisePoints : groupPoints.map(x => {
                    return {
                        CategoryId   : x.Category.id,
                        CategoryName : x.Category.Name,
                        PointsCount  : x.TotalPoints
                    };
                })
            };
            return participantRewardPoints;

        } catch (error) {
            logger.error(error.message);
            ErrorHandler.throwInternalServerError(error.message, 500);
        }
    };

    getGroupLeaderBoard = async (
        groupId: uuid,
        fromDate: Date,
        toDate: Date,
        categoryId: uuid = null //If null, then all categories are taken into account
    )
    : Promise<GroupLeaderBoardResponseDto> => {
        try {
            var group = await this._participantGroupRepository.findOne({
                where : {
                    id : groupId
                }
            });
            var participantReferenceIds = group.Participants.map(x => x.ReferenceId);
            var contexts = await this._contextRepository.createQueryBuilder('Context')
                .where('Context.ReferenceId IN (:...participantReferenceIds)', { participantReferenceIds: participantReferenceIds })
                .getMany();
            var contextIds = contexts.map(x => x.id);

            if (fromDate == null) {
                //Pretty old record....:-)
                fromDate = new Date('2023-01-01');
            }
            if (toDate == null) {
                toDate = new Date();
            }

            if (categoryId == null) {

                var temp = await this._rewardPointsRepository.createQueryBuilder('RewardPoints')
                    .leftJoinAndSelect('RewardPoints.Context', 'Context')
                    .leftJoinAndSelect('Context.Participant', 'Participant')
                    .addSelect('SUM(RewardPoints.PointsCount)', 'TotalPoints')
                    .where('Context.id IN (:...contextIds)', { contextIds: contextIds })
                    .andWhere('RewardPoints.Status = :status', { status: 'Active' })
                    .andWhere('RewardPoints.RewardDate >= :fromDate', { fromDate: fromDate })
                    .andWhere('RewardPoints.RewardDate <= :toDate', { toDate: toDate })
                    .groupBy('Context.ParticipantId')
                    .orderBy('TotalPoints', 'DESC')
                    .getRawMany();
                
                const leaderboardAcrossCategories: GroupLeaderBoardResponseDto = {
                    GroupId      : groupId,
                    Name         : group.Name,
                    FromDate     : fromDate,
                    ToDate       : toDate,
                    CategoryName : 'All',
                    LeaderBoard  : temp.map((x, i) => {
                        return {
                            ParticipantId    : x.Context.Participant.id,
                            FirstName        : x.Context.Participant.FirstName,
                            LastName         : x.Context.Participant.LastName,
                            TotalPointsCount : x.TotalPoints,
                            Rank             : i + 1
                        };
                    })
                };
                return leaderboardAcrossCategories;
            }
            else {
                const category = await this._categoryRepository.findOne({
                    where : {
                        id : categoryId
                    }
                });
                if (!category) {
                    ErrorHandler.throwNotFoundError('category not found!');
                }

                var temp = await this._rewardPointsRepository.createQueryBuilder('RewardPoints')
                    .leftJoinAndSelect('RewardPoints.Context', 'Context')
                    .leftJoinAndSelect('Context.Participant', 'Participant')
                    .leftJoinAndSelect('RewardPoints.Category', 'Category')
                    .addSelect('SUM(RewardPoints.PointsCount)', 'TotalPoints')
                    .where('Context.id IN (:...contextIds)', { contextIds: contextIds })
                    .andWhere('RewardPoints.Status = :status', { status: 'Active' })
                    .andWhere('RewardPoints.RewardDate >= :fromDate', { fromDate: fromDate })
                    .andWhere('RewardPoints.RewardDate <= :toDate', { toDate: toDate })
                    .andWhere('Category.id = :categoryId', { categoryId: categoryId })
                    .groupBy('Context.ParticipantId')
                    .addGroupBy('RewardPoints.CategoryId')
                    .orderBy('TotalPoints', 'DESC')
                    .getRawMany();

                var leaderboardforCategory: GroupLeaderBoardResponseDto = {
                    GroupId      : groupId,
                    Name         : group.Name,
                    FromDate     : fromDate,
                    ToDate       : toDate,
                    CategoryName : category.Name,
                    LeaderBoard  : temp.map((x, i) => {
                        return {
                            ParticipantId    : x.Context.Participant.id,
                            FirstName        : x.Context.Participant.FirstName,
                            LastName         : x.Context.Participant.LastName,
                            TotalPointsCount : x.TotalPoints,
                            Rank             : i + 1
                        };
                    })
                };
                return leaderboardforCategory;
            }
        } catch (error) {
            logger.error(error.message);
            ErrorHandler.throwInternalServerError(error.message, 500);
        }
    };

    //#region Privates

    private getSearchModel = (filters: RewardPointsSearchFilters) => {

        var search : FindManyOptions<RewardPoints> = {
            relations : {
                Category : true,
                Context  : {
                    Participant : true,
                    Group       : true
                }
            },
            where : {
            },
        };
        if (filters.ContextId) {
            search.where['Context'].id = filters.ContextId;
        }
        if (filters.CategoryId) {
            search.where['Category'].id = filters.CategoryId;
        }

        return search;
    };

    //#endregion

    private async getContext(contextId: uuid) {
        const context = await this._contextRepository.findOne({
            where : {
                id : contextId
            }
        });
        if (!context) {
            ErrorHandler.throwNotFoundError('Context cannot be found');
        }
        return context;
    }

    private async getCategory(categoryId: uuid) {
        const category = await this._categoryRepository.findOne({
            where : {
                id : categoryId
            }
        });
        if (!category) {
            ErrorHandler.throwNotFoundError('Category cannot be found');
        }
        return category;
    }

}
