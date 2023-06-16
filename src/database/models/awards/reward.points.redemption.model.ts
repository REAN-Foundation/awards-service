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

////////////////////////////////////////////////////////////////////////

@Entity({ name: 'reward_points_redemptions' })
export class RewardPointsRedemption {

    @PrimaryGeneratedColumn('uuid')
    id : string;

    @ManyToOne(()=> Context)
    @JoinColumn()
    Context : Context;

    @Column({ type: 'varchar', length: 256, nullable: true })
    ModeOfRedemption : string;

    @Column({ type: 'integer', nullable: false, default: 0 })
    RedeemedPointsCount : number;

    @Column({ type: 'varchar', length: 512, nullable: false })
    RedemptionPurpose : string;

    @Column({ type: 'varchar', length: 256, nullable: false })
    Message : string;

    @Column({ type: 'date', nullable: false })
    RedemptionDate : Date;

    @CreateDateColumn()
    CreatedAt : Date;

    @UpdateDateColumn()
    UpdatedAt : Date;

    @DeleteDateColumn()
    DeletedAt : Date;

}
