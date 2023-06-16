import express from 'express';
import { ResponseHandler } from '../../../common/handlers/response.handler';
import { RewardPointsCategoryValidator } from './reward.points.category.validator';
import { BaseController } from '../../base.controller';
import { RewardPointsCategoryService } from '../../../database/services/awards/reward.points.category.service';
import { ErrorHandler } from '../../../common/handlers/error.handler';
import { RewardPointsCategoryCreateModel, RewardPointsCategorySearchFilters, RewardPointsCategoryUpdateModel } from '../../../domain.types/awards/reward.points.category.domain.types';
import { uuid } from '../../../domain.types/miscellaneous/system.types';

///////////////////////////////////////////////////////////////////////////////////////

export class RewardPointsCategoryController extends BaseController {

    //#region member variables and constructors

    _service: RewardPointsCategoryService = new RewardPointsCategoryService();

    _validator: RewardPointsCategoryValidator = new RewardPointsCategoryValidator();

    constructor() {
        super();
    }

    //#endregion

    create = async (request: express.Request, response: express.Response) => {
        try {
            await this.authorize('RewardPointsCategory.Create', request, response);
            var model: RewardPointsCategoryCreateModel = await this._validator.validateCreateRequest(request);
            const record = await this._service.create(model);
            if (record === null) {
                ErrorHandler.throwInternalServerError('Unable to add reward points category!');
            }
            const message = 'Reward points category added successfully!';
            return ResponseHandler.success(request, response, message, 201, record);
        } catch (error) {
            ResponseHandler.handleError(request, response, error);
        }
    };

    getById = async (request: express.Request, response: express.Response) => {
        try {
            await this.authorize('RewardPointsCategory.GetById', request, response);
            var id: uuid = await this._validator.validateParamAsUUID(request, 'id');
            const record = await this._service.getById(id);
            const message = 'Reward points category retrieved successfully!';
            return ResponseHandler.success(request, response, message, 200, record);
        } catch (error) {
            ResponseHandler.handleError(request, response, error);
        }
    };

    update = async (request: express.Request, response: express.Response) => {
        try {
            await this.authorize('RewardPointsCategory.Update', request, response);
            const id = await this._validator.validateParamAsUUID(request, 'id');
            var model: RewardPointsCategoryUpdateModel = await this._validator.validateUpdateRequest(request);
            const updatedRecord = await this._service.update(id, model);
            const message = 'Reward points category updated successfully!';
            ResponseHandler.success(request, response, message, 200, updatedRecord);
        } catch (error) {
            ResponseHandler.handleError(request, response, error);
        }
    };

    search = async (request: express.Request, response: express.Response) => {
        try {
            await this.authorize('RewardPointsCategory.Search', request, response);
            var filters: RewardPointsCategorySearchFilters = await this._validator.validateSearchRequest(request);
            const searchResults = await this._service.search(filters);
            const message = 'Reward points category records retrieved successfully!';
            ResponseHandler.success(request, response, message, 200, searchResults);
        } catch (error) {
            ResponseHandler.handleError(request, response, error);
        }
    };

    delete = async (request: express.Request, response: express.Response): Promise < void > => {
        try {
            await this.authorize('RewardPointsCategory.Delete', request, response);
            var id: uuid = await this._validator.validateParamAsUUID(request, 'id');
            const result = await this._service.delete(id);
            const message = 'Reward points category deleted successfully!';
            ResponseHandler.success(request, response, message, 200, result);
        } catch (error) {
            ResponseHandler.handleError(request, response, error);
        }
    };

}
