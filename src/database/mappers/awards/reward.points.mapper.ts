import { RewardPoints } from '../../models/awards/reward.points.model';
import {
    RewardPointsResponseDto
} from '../../../domain.types/awards/reward.points.domain.types';

///////////////////////////////////////////////////////////////////////////////////

export class RewardPointsMapper {

    static toResponseDto = (record: RewardPoints): RewardPointsResponseDto => {
        if (record == null) {
            return null;
        }
        const dto: RewardPointsResponseDto = {
            id       : record.id,
            Category : {
                id          : record.Category.id,
                Name        : record.Category.Name,
                Description : record.Category.Description,
                ImageUrl    : record.Category.ImageUrl,
            },
            Context : {
                id          : record.Context.id,
                ReferenceId : record.Context.ReferenceId,
                Type        : record.Context.Type,
                Participant : record.Context.Participant ? {
                    id        : record.Context.Participant.id,
                    FirstName : record.Context.Participant.FirstName,
                    LastName  : record.Context.Participant.LastName,
                } : null,
                ParticipantGroup : record.Context.Group ? {
                    id          : record.Context.Group.id,
                    Name        : record.Context.Group.Name,
                    Description : record.Context.Group.Description,
                } : null,
            },
            PointsCount         : record.PointsCount,
            Key                 : record.Key,
            RewardReason        : record.RewardReason,
            RewardDate          : record.RewardDate,
            IsBonus             : record.IsBonus,
            BonusSchemaCode     : record.BonusSchemaCode,
            BonusReason         : record.BonusReason,
            RedemptionExpiresOn : record.RedemptionExpiresOn,
            Status              : record.Status,
            CreatedAt           : record.CreatedAt,
            UpdatedAt           : record.UpdatedAt,
        };
        return dto;
    };

}
