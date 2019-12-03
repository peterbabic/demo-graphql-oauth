import "reflect-metadata"
import { Field, ObjectType } from "type-graphql"
import { BaseEntity, BeforeInsert, Column, Entity, PrimaryGeneratedColumn } from "typeorm"
import { hashPassword } from "./auth"

@ObjectType()
@Entity()
export class User extends BaseEntity {
    @Field()
    @PrimaryGeneratedColumn()
    id!: number

    @Field()
    @Column()
    email: string = ""

    @Column()
    password: string = ""

    @Column()
    tokenVersion: number = 0

    @BeforeInsert()
    async hashPassword() {
        this.password = await hashPassword(this.password)
    }

    async invalidateTokens() {
        this.tokenVersion += 1
        await this.save()
    }
}
