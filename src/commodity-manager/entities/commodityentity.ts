import { Entity, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, DeleteDateColumn, Column, ManyToOne, OneToMany, JoinColumn, OneToOne } from "typeorm";
import { OrderLine } from "src/sales-orders/entities/order.entity";
import { Portfolio } from "./portfolio.entity";

@Entity()
export class Commodity {
    @PrimaryGeneratedColumn('uuid')
    id :  string;
    @CreateDateColumn()
    createdDate: Date;
    @UpdateDateColumn()
    updatedDate: Date;
    @DeleteDateColumn()
    deletedDate: Date;
    @Column({nullable: true})
    name:string 
    @Column({nullable: true})
    price : number;
    @Column({nullable: true})
    description : string; 
    @Column({nullable: true})
    category:string 
    @Column({nullable: true})
    providerID :  string;
    @Column({nullable: true})
    portfolioID :  string;
    @Column({nullable: true})
    portfolioName :  string;
    @Column({nullable: true})
    tradeStatus : string; 
    @ManyToOne(() => Portfolio, (catalog: Portfolio) => catalog.commodities)
    portfolio: Portfolio;
    @OneToMany(() => OrderLine, (order: OrderLine) => order.service)
    orders: OrderLine[];
    @OneToMany(() => CommodityImage, (images: CommodityImage) => images.commodity)
    images: CommodityImage[];
    
}



@Entity()
export class CommodityImage {
  @PrimaryGeneratedColumn('uuid')
  imageID :  string;
  @Column()
  filename: string;
  @Column()
  path: string;
  @Column()
  mimetype: string;
  @ManyToOne(() => Commodity, (product: Commodity) => product.images)
  public commodity: Commodity;

}