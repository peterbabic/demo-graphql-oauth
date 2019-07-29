import "reflect-metadata"
import { Field, ObjectType } from "type-graphql"
import { BaseEntity, BeforeInsert, Column, Entity, PrimaryGeneratedColumn } from "typeorm"
import * as argon2 from "../utils/argon2"

@ObjectType()
@Entity()
export class User extends BaseEntity {
    @PrimaryGeneratedColumn()
    id!: number

    @Field()
    @Column()
    email: string = ""

    @Column()
    password: string = ""

    @BeforeInsert()
    async hashPassword() {
        this.password = await argon2.hashIncludingOptions(this.password)
    }
}
