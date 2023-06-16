import { Client } from '../../models/client/client.model';
import { RewardPointsCategory } from '../../models/awards/reward.points.category.model';
import { logger } from '../../../logger/logger';
import { ErrorHandler } from '../../../common/handlers/error.handler';
import { Source } from '../../../database/database.connector';
import { FindManyOptions, Like, Repository } from 'typeorm';
import { RewardPointsCategoryMapper } from '../../mappers/awards/reward.points.category.mapper';
import { BaseService } from '../base.service';
import { uuid } from '../../../domain.types/miscellaneous/system.types';
import {
    RewardPointsCategoryCreateModel,
    RewardPointsCategoryResponseDto,
    RewardPointsCategorySearchFilters,
    RewardPointsCategorySearchResults,
    RewardPointsCategoryUpdateModel } from '../../../domain.types/awards/reward.points.category.domain.types';

///////////////////////////////////////////////////////////////////////

export class RewardPointsCategoryService extends BaseService {

    //#region Repositories

    _clientRepository: Repository<Client> = Source.getRepository(Client);

    _categoryRepository: Repository<RewardPointsCategory> = Source.getRepository(RewardPointsCategory);

    //#endregion

    public create = async (createModel: RewardPointsCategoryCreateModel)
        : Promise<RewardPointsCategoryResponseDto> => {

        const client = await this.getClient(createModel.ClientId);
        const category = this._categoryRepository.create({
            Client      : client,
            Name        : createModel.Name,
            Description : createModel.Description,
            ImageUrl    : createModel.ImageUrl,
        });
        var record = await this._categoryRepository.save(category);
        return RewardPointsCategoryMapper.toResponseDto(record);
    };

    public getById = async (id: uuid): Promise<RewardPointsCategoryResponseDto> => {
        try {
            var category = await this._categoryRepository.findOne({
                where : {
                    id : id
                },
                relations : {
                    Client : true
                }
            });
            return RewardPointsCategoryMapper.toResponseDto(category);
        } catch (error) {
            logger.error(error.message);
            ErrorHandler.throwInternalServerError(error.message, 500);
        }
    };

    public search = async (filters: RewardPointsCategorySearchFilters)
        : Promise<RewardPointsCategorySearchResults> => {
        try {
            var search = this.getSearchModel(filters);
            var { search, pageIndex, limit, order, orderByColumn } = this.addSortingAndPagination(search, filters);
            const [list, count] = await this._categoryRepository.findAndCount(search);
            const searchResults = {
                TotalCount     : count,
                RetrievedCount : list.length,
                PageIndex      : pageIndex,
                ItemsPerPage   : limit,
                Order          : order === 'DESC' ? 'descending' : 'ascending',
                OrderedBy      : orderByColumn,
                Items          : list.map(x => RewardPointsCategoryMapper.toResponseDto(x)),
            };
            return searchResults;
        } catch (error) {
            logger.error(error.message);
            ErrorHandler.throwDbAccessError('DB Error: Unable to search records!', error);
        }
    };

    public update = async (id: uuid, model: RewardPointsCategoryUpdateModel)
        : Promise<RewardPointsCategoryResponseDto> => {
        try {
            const category = await this._categoryRepository.findOne({
                where : {
                    id : id
                }
            });
            if (!category) {
                ErrorHandler.throwNotFoundError('RewardPoints category not found!');
            }
            //RewardPoints code is not modifiable
            //Use renew key to update ApiKey, ValidFrom and ValidTill

            if (model.ClientId != null) {
                const client = await this.getClient(model.ClientId);
                category.Client = client;
            }
            if (model.Name != null) {
                category.Name = model.Name;
            }
            if (model.Description != null) {
                category.Description = model.Description;
            }
            if (model.ImageUrl != null) {
                category.ImageUrl = model.ImageUrl;
            }
            var record = await this._categoryRepository.save(category);
            return RewardPointsCategoryMapper.toResponseDto(record);
        } catch (error) {
            logger.error(error.message);
            ErrorHandler.throwInternalServerError(error.message, 500);
        }
    };

    public delete = async (id: string): Promise<boolean> => {
        try {
            var record = await this._categoryRepository.findOne({
                where : {
                    id : id
                }
            });
            var result = await this._categoryRepository.remove(record);
            return result != null;
        } catch (error) {
            logger.error(error.message);
            ErrorHandler.throwInternalServerError(error.message, 500);
        }
    };

    //#region Privates

    private getSearchModel = (filters: RewardPointsCategorySearchFilters) => {

        var search : FindManyOptions<RewardPointsCategory> = {
            relations : {
            },
            where : {
            },
            select : {
                id     : true,
                Client : {
                    id   : true,
                    Name : true,
                    Code : true,
                },
                Name        : true,
                Description : true,
                ImageUrl    : true,
                CreatedAt   : true,
                UpdatedAt   : true,
            }
        };
        if (filters.ClientId) {
            search.where['Client'].id = filters.ClientId;
        }
        if (filters.Name) {
            search.where['Name'] = Like(`%${filters.Name}%`);
        }

        return search;
    };

    //#endregion

    private async getClient(clientId: uuid) {
        const client = await this._clientRepository.findOne({
            where : {
                id : clientId
            }
        });
        if (!client) {
            ErrorHandler.throwNotFoundError('Client cannot be found');
        }
        return client;
    }

}
