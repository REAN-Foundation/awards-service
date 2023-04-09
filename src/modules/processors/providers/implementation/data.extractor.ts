import { uuid } from "../../../../domain.types/miscellaneous/system.types";
import { IDataExtractor } from "../../interfaces/data.extractor.interface";
import { Repository } from "typeorm";
import { FactsSource } from '../../../fact.extractors/facts.db.connector';
import { Source } from '../../../../database/database.connector';
import { MedicationFact } from '../../../fact.extractors/models/medication.fact.model';
import { BadgeFact } from '../../../fact.extractors/models/bedge.facts.model';
import { Context } from "../../../../database/models/engine/context.model";
import { logger } from "../../../../logger/logger";
import { ErrorHandler } from "../../../../common/handlers/error.handler";

//////////////////////////////////////////////////////////////////////

export class DataExtractor implements IDataExtractor {

    //#region Repositories

    _medicationRepository: Repository<MedicationFact> = FactsSource.getRepository(MedicationFact);

    _badgeRepository: Repository<BadgeFact> = FactsSource.getRepository(BadgeFact);

    _contextRepository: Repository<Context> = Source.getRepository(Context);

    //#endregion

    extractData = async (contextId: uuid, subject: any): Promise<any[]> => {
        const context = await this.getContextById(contextId);
        const recordType = subject.RecordType;

        if (recordType === 'Medication') {
            return await this.extractMedicationData(context, {});            
        }
        else if (recordType === 'Badge') {
            const filters = {
                BadgeCategory: subject.BadgeCategory,
                BadgeName: subject.BadgeName,
            };
            return await this.extractBadgeData(context, filters);   
        }
        
        ErrorHandler.throwNotFoundError(`Data extractor not found for record type.`);
    };

    extractFacts = async (contextId: uuid, subject: any): Promise<any[]> => {
        let data = [];
        const context = await this.getContextById(contextId);

        return data;
    };

    //#region Private methods

    public getContextById = async (id: uuid): Promise<Context> => {
        try {
            var context = await this._contextRepository.findOne({
                where : {
                    id : id
                },
            });
            return context;
        } catch (error) {
            logger.error(error.message);
        }
    };

    private extractMedicationData = async (context: Context, filters: any) => {

            // const records = await this._medicationRepository.find({
            //     where: {
            //         ContextReferenceId: contextReferenceId
            //     }
            // });
            // const filtered = records.filter(x => x.Taken === false);
            // const transformed = filtered.map(x => {
            //     return {
            //         MedicationId : x.MedicationId,
            //         RecordDate : new Date(x.RecrodDateStr)
            //     };
            // });
            // return transformed;

        const records = await this._medicationRepository
            .createQueryBuilder()
            .select('medicationFact')
            .from(MedicationFact, 'medicationFact')
            .where("medicationFact.ContextReferenceId = :id", { id: context.ReferenceId })
            .groupBy('RecrodDateStr')
            .getRawMany();

        const transformed = records.map(x => {
            return {
                MedicationId: x.MedicationId,
                RecordDate: new Date(x.RecrodDateStr)
            };
        });
        return transformed;
    };

    private extractBadgeData = async (context: Context, filters: any) => {

        // const records = await this._medicationRepository.find({
        //     where: {
        //         ContextReferenceId: contextReferenceId
        //     }
        // });
        // const filtered = records.filter(x => x.Taken === false);
        // const transformed = filtered.map(x => {
        //     return {
        //         MedicationId : x.MedicationId,
        //         RecordDate : new Date(x.RecrodDateStr)
        //     };
        // });
        // return transformed;

        const records = await this._medicationRepository
            .createQueryBuilder()
            .select('medicationFact')
            .from(MedicationFact, 'medicationFact')
            .where("medicationFact.ContextReferenceId = :id", { id: context.ReferenceId })
            .groupBy('RecrodDateStr')
            .getRawMany();

        const transformed = records.map(x => {
            return {
                MedicationId: x.MedicationId,
                RecordDate: new Date(x.RecrodDateStr)
            };
        });
        return transformed;
    };

    //#endregion

}
