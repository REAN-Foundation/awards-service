import express from 'express';
import {
    TypesController
} from './types.controller';

///////////////////////////////////////////////////////////////////////////////////

export const register = (app: express.Application): void => {

    const router = express.Router();
    const controller = new TypesController();

    router.get('/role-types', controller.getRoleTypes);
    router.get('/event-types', controller.getEventTypes);
    router.get('/event-action-types', controller.getEventActionTypes);
    router.get('/context-types', controller.getContextTypes);
    router.get('/condition-operator-types', controller.getConditionOperatorTypes);
    router.get('/logical-operator-types', controller.getLogicalOperatorTypes);
    router.get('/composite-operator-types', controller.getCompositeOperatorTypes);
    router.get('/mathematical-operator-types', controller.getMathematicalOperatorTypes);
    router.get('/operand-data-types', controller.getOperandDataTypes);
    router.get('/execution-status-types', controller.getExecutionStatusTypes);
    router.get('/data-action-types', controller.getDataActionTypes);
    router.get('/input-source-types', controller.getInputSourceTypes);
    router.get('/output-source-types', controller.getOutputSourceTypes);
    router.get('/group-activity-types', controller.getGroupActivityTypes);
    router.get('/reward-points-status-types', controller.getRewardPointsStatusTypes);

    app.use('/api/v1/types', router);
};
