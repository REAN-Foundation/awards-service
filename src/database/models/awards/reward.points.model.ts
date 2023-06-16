import "reflect-metadata";
import {
    Column,
    Entity,
    PrimaryGeneratedColumn,
    CreateDateColumn,
    UpdateDateColumn,
    DeleteDateColumn,
    JoinColumn,
    ManyToOne,
} from 'typeorm';
import { Context } from "../engine/context.model";
import { RewardPointsCategory } from "./reward.points.category.model";
import { RewardPointsStatus } from "../../../domain.types/engine/engine.types";

////////////////////////////////////////////////////////////////////////

@Entity({ name: 'reward_points' })
export class RewardPoints {

    @PrimaryGeneratedColumn('uuid')
    id : string;

    @ManyToOne(()=> Context)
    @JoinColumn()
    Context : Context;

    @ManyToOne(() => RewardPointsCategory)
    @JoinColumn({ name: 'CategoryId' })
    Category: RewardPointsCategory;

    @Column({ type: 'varchar', length: 512, nullable: true })
    RewardReason : string;

    @Column({ type: 'integer', nullable: false, default: 1 })
    PointsCount : number;

    @Column({ type: 'boolean', nullable: false, default: false })
    IsBonus : boolean;

    @Column({ type: 'varchar', length: 64, nullable: true })
    BonusSchemaCode : string;

    @Column({ type: 'varchar', length: 256, nullable: true })
    BonusReason : string;

    @Column({ type: 'date', nullable: false })
    RedemptionExpiresOn : Date;

    @Column({ type: 'enum', enum: RewardPointsStatus, nullable: false, default: RewardPointsStatus.Active })
    Status : RewardPointsStatus;

    @Column({ type: 'date', nullable: true })
    RewardDate: Date;

    @CreateDateColumn()
    CreatedAt : Date;

    @UpdateDateColumn()
    UpdatedAt : Date;

    @DeleteDateColumn()
    DeletedAt : Date;

}
