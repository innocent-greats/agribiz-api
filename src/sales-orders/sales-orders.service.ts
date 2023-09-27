import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { PlaceOrderSocketDTO } from 'src/users/dto/create-user.input';
import { UsersService } from 'src/users/users.service';
import { Repository } from 'typeorm';
import { Order, OrderLine } from './entities/order.entity';
import { CommodityManagersService } from 'src/commodity-manager/commodity-manager.service';
import { ServiceProvidersService } from 'src/service-providers/service-providers.service';
import { ServiceProvider } from 'src/service-providers/entities/service-provider.entity';

@Injectable()
export class SalesOrdersService {
  constructor(
    @InjectRepository(Order)
    private readonly orderRepository: Repository<Order>,
    @InjectRepository(OrderLine)
    private readonly orderLineRepository: Repository<OrderLine>,
    @InjectRepository(ServiceProvider)
    private serviceProviderRepository: Repository<ServiceProvider>,
    private readonly usersService: UsersService, 
    private readonly commodityManagersService: CommodityManagersService,

  ) { }

  async getAllAccountOrdersByStatus(request: any) {
    console.log('getOrdersByAccountIDAndServiceInRequestStatus Request')
    // console.log(request)
    const orders = await this.orderRepository.find(
      { where: { customer: request.servingAccountID, id: request.servingStatus, updatedStatus: 'false' } })

    // console.log('orders')
    // console.log(orders)
    return { status: 200, data: { orders }, err: null }
  }
  async findOrderByCustomerOrVendorId(userID: string): Promise<Order> {
    const queryBuilder = this.orderRepository.createQueryBuilder('order');

    // Join with the Customer and Vendor relations
    queryBuilder
      .leftJoinAndSelect('order.customer', 'customer')
      .leftJoinAndSelect('order.provider', 'provider')
      .leftJoinAndSelect('order.offerItem', 'offerItem')
      .leftJoinAndSelect('offerItem.images', 'images');

    // Use OR to match either customer or provider userID
    queryBuilder.where('customer.userID = :userID OR provider.userID = :userID', { userID });

    // Execute the query and return the results
    const order = await queryBuilder.getOne();
    // console.log('@getAccountOrders orders', order)
    return order;
  }
  async findOrderByID(id: string): Promise<Order> {
    const queryBuilder = this.orderRepository.createQueryBuilder('order');

    // Join with the Customer and Vendor relations
    queryBuilder
      .leftJoinAndSelect('order.customer', 'customer')
      .leftJoinAndSelect('order.provider', 'provider')
      .leftJoinAndSelect('provider.user', 'user')
      .leftJoinAndSelect('order.orderLines', 'orderLines')
      .leftJoinAndSelect('orderLines.service', 'service')
      .leftJoinAndSelect('service.images', 'images');

    // Use OR to match either customer or provider id
    queryBuilder.where('order.id = :id', { id });

    // Execute the query and return the results
    const orders = await queryBuilder.getOne();
    // console.log('@getAccountOrders orders', orders)
    return orders;
  }
  async findOrdersByCustomerOrVendorId(userID: string): Promise<Order[]> {
    const queryBuilder = this.orderRepository.createQueryBuilder('order');

    // Join with the Customer and Vendor relations
    queryBuilder
      .leftJoinAndSelect('order.customer', 'customer')
      .leftJoinAndSelect('order.provider', 'provider')
      .leftJoinAndSelect('provider.user', 'user')
      .leftJoinAndSelect('order.orderLines', 'orderLines')
      .leftJoinAndSelect('orderLines.service', 'service')
      .leftJoinAndSelect('service.images', 'images');

    // Use OR to match either customer or provider userID
    queryBuilder.where('customer.userID = :userID OR user.userID = :userID', { userID });

    // Execute the query and return the results
    const orders = await queryBuilder.getMany();
    // console.log('@getAccountOrders orders', orders)
    return orders;
  }

  async requestWarehouseService(orderDTO: PlaceOrderSocketDTO
    ) {
      const client = await this.usersService.findOneByUserID(orderDTO.clientID)
      const provider = await this.fetchProviderAccountByID(orderDTO.providerID)
      const commodity = await this.commodityManagersService.getCommodityByID(orderDTO.commodityID)
      console.log('provider', provider)
  
      const newOrder = {
        customer: client,
        provider: provider,
        orderStatus: orderDTO.orderType,
      }
      const newOrderSchema = this.orderRepository.create(newOrder);
      const orderItem = await this.orderRepository.save(newOrderSchema);
  
      // let order = await this.orderRepository.findOne({
      //   where: { id: orderItem.id },
      //   relations: { provider: true, customer: true }
      // })
      const orderRes = await this.findOrderByID(orderItem.id) 

      const newOrderLine = {
        weight: orderDTO.commodityWeight,
        commodity: commodity,
        commodityID: commodity.id,
        order: orderRes
      }
      const newOrderLineSchema = this.orderLineRepository.create(newOrderLine);
      const orderLineItem = await this.orderLineRepository.save(newOrderLineSchema);
      let orderlines = await this.orderLineRepository.find({
        where: { orderLineID: orderLineItem.orderLineID },
        relations: { order: true, commodity: true, service:true }
      })
      orderRes.orderLines = orderlines
    
      // return;
      return orderRes;
    }

    // QUIRIES
    async fetchProviderAccountByID(
      userID: string,
    ): Promise<ServiceProvider> {
      console.log('fetch Provider by userID',userID)
      const queryBuilder =
        this.serviceProviderRepository.createQueryBuilder('serviceProvider');
      // Join with the Customer and Vendor relations
      queryBuilder
        .leftJoinAndSelect('serviceProvider.user', 'user')
        // .leftJoinAndSelect('serviceProvider.orders', 'orders')
        .leftJoinAndSelect('serviceProvider.services', 'services')
        .leftJoinAndSelect('serviceProvider.catalogs', 'catalogs');
      // Use OR to match either customer or provider userID
      queryBuilder.where('user.userID = :userID', {
        userID,
      });
  
      // Execute the query and return the results
      const serviceProvider = await queryBuilder.getOne();
  
      console.log('@serviceProvider', serviceProvider);
      return serviceProvider;
    }
}
