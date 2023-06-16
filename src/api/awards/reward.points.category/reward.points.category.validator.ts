import joi from 'joi';
import express from 'express';
import {
    RewardPointsCategoryCreateModel,
    RewardPointsCategoryUpdateModel,
    RewardPointsCategorySearchFilters } from '../../../domain.types/awards/reward.points.category.domain.types';
import {
    ErrorHandler
} from '../../../common/handlers/error.handler';
import BaseValidator from '../../base.validator';

///////////////////////////////////////////////////////////////////////////////////////////////

export class RewardPointsCategoryValidator extends BaseValidator {

    public validateCreateRequest = async (request: express.Request)
        : Promise<RewardPointsCategoryCreateModel> => {
        try {
            const schema = joi.object({
                ClientId    : joi.string().uuid().required(),
                Name        : joi.string().max(32).required(),
                Description : joi.string().max(256).optional(),
                ImageUrl    : joi.string().max(1024).uri().required(),
            });
            await schema.validateAsync(request.body);
            return {
                Name        : request.body.Name,
                ClientId    : request.body.ClientId,
                Description : request.body.Description ?? null,
                ImageUrl    : request.body.ImageUrl
            };
        } catch (error) {
            ErrorHandler.handleValidationError(error);
        }
    };

    public validateUpdateRequest = async (request: express.Request)
        : Promise<RewardPointsCategoryUpdateModel> => {
        try {
            const schema = joi.object({
                ClientId    : joi.string().uuid().optional(),
                Name        : joi.string().max(32).optional(),
                Description : joi.string().max(256).optional(),
                ImageUrl    : joi.string().max(1024).uri().optional(),
            });
            await schema.validateAsync(request.body);
            return {
                Name        : request.body.Name ?? null,
                ClientId    : request.body.ClientId ?? null,
                Description : request.body.Description ?? null,
                ImageUrl    : request.body.ImageUrl ?? null
            };
        } catch (error) {
            ErrorHandler.handleValidationError(error);
        }
    };

    public validateSearchRequest = async (request: express.Request)
        : Promise<RewardPointsCategorySearchFilters> => {
        try {
            const schema = joi.object({
                clientId : joi.string().uuid().optional(),
                name     : joi.string().max(64).optional(),
            });
            await schema.validateAsync(request.query);
            const filters = this.getSearchFilters(request.query);
            return filters;
        } catch (error) {
            ErrorHandler.handleValidationError(error);
        }
    };

    private getSearchFilters = (query): RewardPointsCategorySearchFilters => {

        var filters = {};

        var name = query.name ? query.name : null;
        if (name != null) {
            filters['Name'] = name;
        }
        var clientId = query.clientId ? query.clientId : null;
        if (clientId != null) {
            filters['ClientId'] = clientId;
        }

        return filters;
    };

}
