import { Repository } from "typeorm";
import { FactsSource } from '../../../../fact.extractors/facts.db.connector';
import { Source } from '../../../../../database/database.connector';
import { MedicationFact } from '../../../../fact.extractors/models/medication.fact.model';
import { Context } from "../../../../../database/models/engine/context.model";
import { DataExtractionInputParams, OutputParams, ProcessorResult } from '../../../../../domain.types/engine/engine.types';
import { IExtractor } from "./extractor.interface";
import { RewardPoints } from "../../../../../database/models/awards/reward.points.model";

//////////////////////////////////////////////////////////////////////

export class RewardPointsDataExtractor  implements IExtractor {

    //#region Repositories

    _rewardPointsRepository: Repository<RewardPoints> = Source.getRepository(RewardPoints);

    _contextRepository: Repository<Context> = Source.getRepository(Context);

    //#endregion
    
    public extract = async (
        context: Context,
        inputParams: DataExtractionInputParams,
        outputParams: OutputParams) => {

        const filters = {};
        filters['RecordType'] = inputParams.RecordType;
        if (inputParams.Filters) {
            for (var f of inputParams.Filters) {
                filters[f.Key] = f.Value;
            }
        }

        const records = await this._rewardPointsRepository.find({
            where: {
                Context: {
                    ReferenceId: context.ReferenceId,
                },
                Category: {
                    Name: filters['RewardPointsCategory'],
                },
            },
            relations: {
                Context: {
                  Participant: true,
                  Group: true,
                },
                Category: true,
            },
        });

        var refined = [];
        for (var r of records) {
            var metadata = JSON.parse(r.Key);
            var id = r.id;
            var start = (new Date(metadata.start)).toISOString().split('T')[0];
            var end = (new Date(metadata.end)).toISOString().split('T')[0];
            var key = `(${start})-(${end})`; //-(${r.RewardPoints.Name})
            refined.push({ id, start, end, key });
        }
        
        const result: ProcessorResult = {
            Success : true,
            Tag     : outputParams.OutputTag,
            Data    : refined
        };

        return result;
    };

}
