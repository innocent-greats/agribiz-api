import { User } from "src/users/entities/user.entity";
import { Entity, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, DeleteDateColumn, Column, ManyToOne, OneToMany } from "typeorm";
import { ServiceProvider } from "../../service-providers/entities/service-provider.entity";
import { BeautyService, BeautyProduct } from "../../service-providers/entities/services.entity";

@Entity()
export class Order {
  @PrimaryGeneratedColumn('uuid')
  id: string;
  @CreateDateColumn()
  orderDate: Date;
  @CreateDateColumn()
  createdDate: Date;
  @UpdateDateColumn()
  updatedDate: Date;
  @DeleteDateColumn()
  deletedDate: Date;
  @Column({ nullable: true })
  orderTrackerHash: string;
  @Column({ nullable: true })
  orderStatus: string; // service specific status
  @Column({ nullable: true })
  orderType: string; // service specific status
  @Column({ nullable: true })
  updatedStatus: string;
  @Column({ nullable: true })
  updatedStatusMessage: string; // service specific status
  @Column({ nullable: true })
  providerID: string; // service
  @ManyToOne(() => ServiceProvider, (provider: ServiceProvider) => provider.orders)
  provider: ServiceProvider;
  @ManyToOne(() => User, (customer: User) => customer.orders)
  customer: User;
  @OneToMany(() => OrderLine, (orderLines: OrderLine) => orderLines.order)
  orderLines: OrderLine[];
}
@Entity()
export class OrderLine {
  @PrimaryGeneratedColumn('uuid')
  orderLineID: string;
  @CreateDateColumn()
  orderDate: Date;
  @CreateDateColumn()
  createdDate: Date;
  @UpdateDateColumn()
  updatedDate: Date;
  @DeleteDateColumn()
  deletedDate: Date;
  @ManyToOne(() => Order, (order: Order) => order.orderLines)
  order: Order;
  @ManyToOne(() => BeautyService, (beautyService: BeautyService) => beautyService.orders)
  service: BeautyService;
  @ManyToOne(() => BeautyProduct, (beautyProduct: BeautyProduct) => beautyProduct.orders)
  product: BeautyProduct;
  @Column({ nullable: true })
  beautyProductID: string;
  @Column({ nullable: true, default: 0 })
  quantity: number;
  @Column({ nullable: true, default: 0 })
  weight: number;
  @Column({ nullable: true, default: 0 })
  discount: number;
  @Column({ nullable: true, default: 0 })
  vat: number;
  @Column({ nullable: true, default: 0 })
  amount: number;
  @Column({ nullable: true, default: 0 })
  total: number;
}