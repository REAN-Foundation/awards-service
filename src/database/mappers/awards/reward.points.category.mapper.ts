import { RewardPointsCategory } from '../../models/awards/reward.points.category.model';
import {
    RewardPointsCategoryResponseDto
} from '../../../domain.types/awards/reward.points.category.domain.types';

///////////////////////////////////////////////////////////////////////////////////

export class RewardPointsCategoryMapper {

    static toResponseDto = (category: RewardPointsCategory): RewardPointsCategoryResponseDto => {
        if (category == null) {
            return null;
        }
        const dto: RewardPointsCategoryResponseDto = {
            id     : category.id,
            Client : category.Client ? {
                id   : category.Client.id,
                Name : category.Client.Name,
                Code : category.Client.Code,
            } : null,
            Name        : category.Name,
            Description : category.Description,
            ImageUrl    : category.ImageUrl,
            CreatedAt   : category.CreatedAt,
            UpdatedAt   : category.UpdatedAt,
        };
        return dto;
    };

}
