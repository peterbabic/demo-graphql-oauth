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

	@BeforeInsert()
	async hashPassword() {
		this.password = await hashPassword(this.password)
	}
}
