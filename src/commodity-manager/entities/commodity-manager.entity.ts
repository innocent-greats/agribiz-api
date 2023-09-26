import { Subscription, User } from "src/users/entities/user.entity";
import { Entity, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, DeleteDateColumn, JoinColumn, OneToOne, Column, OneToMany, ManyToOne } from "typeorm";
import { Order } from "src/sales-orders/entities/order.entity";
import { Portfolio } from "./portfolio.entity";

@Entity()
export class CommodityManager {
    @PrimaryGeneratedColumn('uuid')
    id: string;
    @CreateDateColumn()
    createdDate: Date;
    @UpdateDateColumn()
    updatedDate: Date;
    @DeleteDateColumn()
    deletedDate: Date;
    @Column({ nullable: true })
    email?: string;
    @Column({ nullable: true })
    phone: string;
    @Column({ nullable: true })
    city: string;
    @Column({ nullable: true })
    country: string;
    @Column({ nullable: true })
    streetAddress: string;
    @Column({ nullable: true })
    portfolioUrl: string;
    @Column({ nullable: true })
    facebookUrl: string;
    @Column({ nullable: true })
    xUrl: string;
    @Column({ nullable: true })
    linkedInUrl: string;
    @Column({ nullable: true })
    instagramUrl: string;
    @JoinColumn({ name: 'userID' })
    @OneToOne(() => User)
    user: User
    @Column({ nullable: true })
    adminUserID: string;
    @Column({ nullable: true })
    accountType: string;
    @Column({ nullable: true })
    specialization: string;
    @Column({ nullable: true })
    serviceType: string;
    @Column({ nullable: true })
    tradingName: string;
    @Column({ nullable: true })
    businessDescription: string;
    @Column({ nullable: true })
    shortTermGoals: string;
    @Column({ nullable: true })
    longTermGoals: string;
    @Column({ nullable: true })
    businessStage: string;
    @Column({ nullable: true })
    businessRegistrationNumber: string;
    @Column({ nullable: true })
    targetMarketCountry: string;
    @OneToMany(() => Order, (order: Order) => order.provider)
    orders: Order[];
    @OneToMany(() => Portfolio, (catalog: Portfolio) => catalog.manager)
    portfolios: Portfolio[];
    @OneToMany(() => Subscription, (subscription: Subscription) => subscription.profile)
    subscriptions: Subscription[];
  }
