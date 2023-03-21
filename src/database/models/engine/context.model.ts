import "reflect-metadata";
import { ContextType } from "../../../domain.types/engine/enums";
import {
    Column,
    Entity,
    JoinColumn,
    OneToOne,
    PrimaryGeneratedColumn,
} from 'typeorm';
import { Participant } from "../awards/participant.model";
import { ParticipantGroup } from "../awards/participant.group.model";

////////////////////////////////////////////////////////////////////////

@Entity({ name: 'contexts' })
export class Context {

    @PrimaryGeneratedColumn('uuid')
    id : string;

    @Column({ type: 'enum', enum: ContextType, nullable: false, default: ContextType.Person })
    Type : ContextType;

    @Column({ type: 'uuid', nullable: true })
    ReferenceId : string;

    @OneToOne(() => Participant, { nullable: true })
    @JoinColumn()
    Participant: Participant;

    @OneToOne(() => ParticipantGroup, { nullable: true })
    @JoinColumn()
    Group: ParticipantGroup;

}
