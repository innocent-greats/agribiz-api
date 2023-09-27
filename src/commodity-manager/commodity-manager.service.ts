import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import SearchService from 'src/search/search.service';
import { UsersService } from 'src/users/users.service';
import { Repository } from 'typeorm';
import { Portfolio } from './entities/portfolio.entity';
import { User } from 'src/users/entities/user.entity';
import { UpdateCommodityManagerProfileDTO } from './dto/update-commodity-manager';
import { CreatePortfolioDTO } from 'src/service-providers/dto/create-catalog-dto';
import { CommodityRequestDTO, UpdateCommodityDTO } from 'src/service-providers/dto/service.dto';
import { CommodityManager } from './entities/commodity-manager.entity';
import { Commodity, CommodityImage } from './entities/commodityentity';
import { CreateFirebaseAuthUserDTO } from 'src/service-providers/dto/firebase-account.dto';

@Injectable()
export class CommodityManagersService {
  constructor(


    @InjectRepository(CommodityManager)
    private commodityManagerRepository: Repository<CommodityManager>,

    @InjectRepository(Portfolio)
    private portfolioRepository: Repository<Portfolio>,

    @InjectRepository(Commodity)
    private commodityRepository: Repository<Commodity>,

    @InjectRepository(CommodityImage)
    private commodityImageRepository: Repository<CommodityImage>,

    private readonly usersService: UsersService,
    private searchService: SearchService,
  ) {}
  async createNewCommodityManager(user: User) {
    try {
      if (user) {
        const provider = new CommodityManager();
        provider.user = user;
        provider.accountType = user.accountType;
        provider.serviceType = user.tradingAs;
        provider.tradingName = user.lastName + user.userID.substring(0, 8);
        const newProvider = await this.commodityManagerRepository.save(provider);
        return newProvider;
      }
      return null;
    } catch (error) {}
  }

  async fetchProviderAccountByAdminID(adminUserID:string): Promise<CommodityManager>{
    const queryBuilder =
      this.commodityManagerRepository.createQueryBuilder('commodityManager');

    // Join with the Customer and Vendor relations
    queryBuilder
      .leftJoinAndSelect('commodityManager.user', 'user')
      .leftJoinAndSelect('commodityManager.orders', 'orders')
      .leftJoinAndSelect('commodityManager.services', 'services')
      .leftJoinAndSelect('commodityManager.portfolios', 'portfolios');

    // Use OR to match either customer or provider userID
    queryBuilder.where('commodityManager.adminUserID = :adminUserID', { adminUserID });

    // Execute the query and return the results
    const commodityManager = await queryBuilder.getOne();

    console.log('@getAccount commodityManager', commodityManager);
    return commodityManager;
  }
  async findCommodityManagerAccountByFirebaseAuthID(
    firebaseAuthUser: CreateFirebaseAuthUserDTO,
  ): Promise<CommodityManager> {
    let user: User;
    user = await this.usersService.fetchUserDataByFirebaseAuthID(
      firebaseAuthUser.uid,
    );
    if(!user){
      user = await this.usersService.registerFirebaseUser(firebaseAuthUser)
    }
    if (user) {
      const preFetchProvider = await this.commodityManagerRepository.findOne({where:{
        adminUserID:user.userID
      }})
      if(!preFetchProvider){
        const newProvider = new CommodityManager()
        newProvider.user = user
        newProvider.adminUserID = user.userID
        newProvider.accountType = user.accountType
        await this.commodityManagerRepository.save(newProvider)
      }
      const commodityManager = await this.fetchProviderAccountByAdminID(user.userID)
      return commodityManager;
    }

  }

 async updateCommodityManagerProfileByID(updateCommodityManagerProfile: UpdateCommodityManagerProfileDTO){
    let user: User;
    let provider: CommodityManager;
    user = await this.usersService.fetchUserDataByFirebaseAuthID(
      updateCommodityManagerProfile.uid,
    );
    if (user) {
       provider = await this.commodityManagerRepository.findOne({where:{
        adminUserID:user.userID
      }})
      if(!provider){
        const newProvider = new CommodityManager()
        newProvider.user = user
        newProvider.adminUserID = user.userID
        newProvider.accountType = user.accountType
        newProvider.specialization = user.specialization
        await this.commodityManagerRepository.save(newProvider)
        provider = await this.commodityManagerRepository.findOne({where:{
          adminUserID:user.userID
        }})
      }
      if (provider ) {
        provider.tradingName= updateCommodityManagerProfile.tradingName
        provider.serviceType= updateCommodityManagerProfile.serviceType
        provider.shortTermGoals= updateCommodityManagerProfile.shortTermGoals
        provider.longTermGoals= updateCommodityManagerProfile.longTermGoals
        provider.specialization= updateCommodityManagerProfile.specialization
        provider.businessStage= updateCommodityManagerProfile.businessStage
        provider.businessRegistrationNumber= updateCommodityManagerProfile.businessRegistrationNumber
        provider.businessDescription= updateCommodityManagerProfile.businessDescription
        provider.phone= updateCommodityManagerProfile.phone
        provider.email= updateCommodityManagerProfile.email
        provider.city= updateCommodityManagerProfile.city
        provider.country= updateCommodityManagerProfile.country
        provider.streetAddress= updateCommodityManagerProfile.streetAddress
        provider.portfolioUrl= updateCommodityManagerProfile.portfolioUrl
        provider.facebookUrl= updateCommodityManagerProfile.facebookUrl
        provider.xUrl= updateCommodityManagerProfile.xUrl
        provider.linkedInUrl= updateCommodityManagerProfile.linkedInUrl
        provider.instagramUrl= updateCommodityManagerProfile.instagramUrl
        await this.commodityManagerRepository.update(provider.id, provider)
      }
      const commodityManager = await this.fetchProviderAccountByAdminID(user.userID)
      return commodityManager;
    }
 }
  async createNewPortfolio(createPortfolioDTO: CreatePortfolioDTO) {
    const authenticatedUser = await this.usersService.getUserFromAuthToken(
      createPortfolioDTO.authToken,
    );
    console.log(
      'authenticationService decodeUserToken user',
      authenticatedUser,
    );
    let manager: CommodityManager;
    if (createPortfolioDTO.managerUserID) {
      manager = await this.findCommodityManagerByuserId(
        createPortfolioDTO.managerUserID,
      );
    } else {
      manager = await this.findCommodityManagerByuserId(
        authenticatedUser.userID,
      );
    }
    if (authenticatedUser && !manager) {
      manager = await this.createNewCommodityManager(authenticatedUser);
    }

    const newPortfolio = new Portfolio();
    newPortfolio.manager = manager;
    newPortfolio.portfolioType = createPortfolioDTO.portfolioType;
    newPortfolio.name = createPortfolioDTO.name;
    newPortfolio.description = createPortfolioDTO.description;
    const updatedPortfolio = await this.portfolioRepository.save(newPortfolio);
    const createdPortfolio = await this.getPortfolioByID(updatedPortfolio.id);

    console.log('updatedPortfolio', createdPortfolio);
    return {
      status: 200,
      data: JSON.stringify(createdPortfolio),
      error: null,
      errorMessage: null,
      successMessage: 'success',
    };
  }

  async createCommodityManager(user: User) {
    try {
      if (user) {
        const provider = new CommodityManager();
        provider.user = user;
        provider.accountType = user.accountType;
        provider.serviceType = user.tradingAs;
        provider.tradingName = user.lastName + user.userID.substring(0, 8);
        const newProvider = await this.commodityManagerRepository.save(provider);
        return newProvider;
      }
      return null;
    } catch (error) {}
  }

  async getServiceProvideByID(id: string): Promise<CommodityManager> {
    const queryBuilder =
      this.commodityManagerRepository.createQueryBuilder('provider');
    queryBuilder.leftJoinAndSelect('provider.user', 'user');
    queryBuilder.leftJoinAndSelect('provider.portfolios', 'portfolios');
    queryBuilder.leftJoinAndSelect('portfolios.commodities', 'commodities');
    queryBuilder.leftJoinAndSelect('commodities.images', 'images');
    queryBuilder.where('provider.id = :id', { id });
    const provider = await queryBuilder.getOne();

    if (!provider || provider === null) {
      return null;
      // throw new NotFoundException(`User with ${email} not found`);
    }
    return provider;
  }

  async createNewCommodity(
    CommodityRequestDTORequestDTO: CommodityRequestDTO,
    files: any,
  ) {
    const newUser = await this.usersService.decodeUserToken(
      CommodityRequestDTORequestDTO.authToken,
    );
    const portfolio = await this.getPortfolioByID(
      CommodityRequestDTORequestDTO.portfolioID,
    );
    console.log('portfolio', portfolio);

    const provider = await this.getServiceProvideByID(portfolio.manager.id);

    console.log('authenticationService.decodeUserToken user', newUser);
    let newFiles = [];
    const newCommodity = new Commodity();
    newCommodity.name = CommodityRequestDTORequestDTO.name;
    newCommodity.category = CommodityRequestDTORequestDTO.category;
    newCommodity.price = CommodityRequestDTORequestDTO.price;
    newCommodity.providerID = provider.id;
    newCommodity.portfolioID = portfolio.id;
    newCommodity.portfolioName = portfolio.name;
    newCommodity.portfolio = portfolio;
    newCommodity.tradeStatus = CommodityRequestDTORequestDTO.tradeStatus;
    (newCommodity.description = CommodityRequestDTORequestDTO.description),
      await Promise.all(
        files.map(async (file: LocalFileDto) => {
          const image = {
            path: file.path,
            filename: file.filename,
            mimetype: file.mimetype,
          };
          const newImageSchema = await this.commodityImageRepository.create(
            image,
          );
          const newFile = await this.commodityImageRepository.save(
            newImageSchema,
          );
          newFiles.push(newFile);
        }),
      );
    newCommodity.images = newFiles;

    console.log('newFiles', newFiles);
    newCommodity.images = newFiles;
    const updatedCommodity = await this.commodityRepository.save(
      newCommodity,
    );
    const service = await this.getCommodityByID(updatedCommodity.id);
    // }
    console.log('updatedCommodity', service);
    const indexed = await this.searchService.indexCommodity(service);
    console.log('indexed', indexed);

    return {
      status: 200,
      data: JSON.stringify(service),
      error: null,
      errorMessage: null,
      successMessage: 'success',
    };
  }

  async updateCommodity(updateCommodityDTO: UpdateCommodityDTO, files: any) {
    const oldCommodity = await this.getCommodityByID(updateCommodityDTO.id);
    let newFiles = [];

    oldCommodity.name = updateCommodityDTO.name;
    oldCommodity.category = updateCommodityDTO.category;
    oldCommodity.price = updateCommodityDTO.price;
    (oldCommodity.orders = oldCommodity.orders),
      (oldCommodity.tradeStatus = updateCommodityDTO.tradeStatus),
      (oldCommodity.description = updateCommodityDTO.description),
      await Promise.all(
        files.map(async (file: LocalFileDto) => {
          const image = {
            path: file.path,
            filename: file.filename,
            mimetype: file.mimetype,
          };
          const newImageSchema = await this.commodityImageRepository.create(
            image,
          );
          const newFile = await this.commodityImageRepository.save(
            newImageSchema,
          );
          newFiles.push(newFile);
        }),
      );
    oldCommodity.images = newFiles;

    console.log('newFiles', newFiles);
    oldCommodity.images = newFiles;
    const updatedCommodity = await this.commodityRepository.update(
      oldCommodity.id,
      oldCommodity,
    );
    const commodity = await this.getCommodityByID(oldCommodity.id);
    // }
    console.log('updatedCommodity', commodity);
    const indexed = await this.searchService.indexCommodity(commodity);
    console.log('indexed', indexed);

    return {
      status: 200,
      data: JSON.stringify(commodity),
      error: null,
      errorMessage: null,
      successMessage: 'success',
    };
  }

  async getPortfolioByID(id: string): Promise<Portfolio> {
    const queryBuilder =
      this.portfolioRepository.createQueryBuilder('portfolio');
    queryBuilder.leftJoinAndSelect('portfolio.manager', 'manager');
    queryBuilder.leftJoinAndSelect('manager.user', 'user');
    queryBuilder.leftJoinAndSelect('portfolio.commodities', 'commodities');
    queryBuilder.where('portfolio.id = :id', { id });

    const portfolio = await queryBuilder.getOne();

    if (!portfolio || portfolio === null) {
      return null;
      // throw new NotFoundException(`User with ${email} not found`);
    }
    return portfolio;
  }

  async getPortfoliosByAccountID(accountID: string): Promise<Portfolio[]> {
    console.log('get-account-portfolios acc id', accountID);
    if (accountID) {
      console.log('userID', accountID);
      const queryBuilder =
        this.portfolioRepository.createQueryBuilder('portfolio');
      queryBuilder.leftJoinAndSelect('portfolio.manager', 'manager');
      queryBuilder.leftJoinAndSelect('manager.user', 'user');
      queryBuilder.leftJoinAndSelect('portfolio.commodities', 'commodities');
      queryBuilder.leftJoinAndSelect('commodities.images', 'images');
      queryBuilder.where('user.userID = :accountID', { accountID });

      const portfolios = await queryBuilder.getMany();

      if (!portfolios || portfolios === null) {
        return null;
        // throw new NotFoundException(`User with ${email} not found`);
      }
      return portfolios;
    }
  }
  async searchCommodityManagers(ids: any): Promise<CommodityManager[]> {
    console.log('searchCommodityManagers ids', ids);
    const queryBuilder =
      this.commodityManagerRepository.createQueryBuilder('commodityManager');
    // Join with the Customer and Vendor relations
    queryBuilder
      .leftJoinAndSelect('commodityManager.user', 'user')
      // .leftJoinAndSelect('commodityManager.orders', 'orders')
      .leftJoinAndSelect('commodityManager.portfolios', 'portfolios')
      .leftJoinAndSelect('portfolios.services', 'services')
      .leftJoinAndSelect('services.images', 'images')
      .leftJoinAndSelect('services.orders', 'orders')
      .where('commodityManager.id IN (:...ids)', { ids });
    const services = await queryBuilder.getMany();
    console.log('searchCommodityManagers services', services);

    if (!services || services === null) {
      return null;
      // throw new NotFoundException(`User with ${email} not found`);
    }
    return services;
  }

  async getAllCommodityManagers(): Promise<CommodityManager[]> {
    const queryBuilder =
      this.commodityManagerRepository.createQueryBuilder('commodityManager');
    // Join with the Customer and Vendor relations
    queryBuilder
      .leftJoinAndSelect('commodityManager.user', 'user')
      // .leftJoinAndSelect('commodityManager.orders', 'orders')
      .leftJoinAndSelect('commodityManager.portfolios', 'portfolios')
      .leftJoinAndSelect('portfolios.services', 'services')
      .leftJoinAndSelect('services.images', 'images')
      .leftJoinAndSelect('services.orders', 'orders');

    const services = await queryBuilder.getMany();

    if (!services || services === null) {
      return null;
      // throw new NotFoundException(`User with ${email} not found`);
    }
    return services;
  }
  async getCommodityManagers(
    accountID: string,
  ): Promise<CommodityManager[]> {
    console.log('portfolios acc id', accountID);
    if (accountID) {
      console.log('userID', accountID);
      const queryBuilder =
        this.commodityManagerRepository.createQueryBuilder('commodityManager');
      // Join with the Customer and Vendor relations
      queryBuilder
        .leftJoinAndSelect('commodityManager.user', 'user')
        // .leftJoinAndSelect('commodityManager.orders', 'orders')
        .leftJoinAndSelect('commodityManager.portfolios', 'portfolios')
        .leftJoinAndSelect('portfolios.services', 'services')
        .leftJoinAndSelect('services.images', 'images')
        .leftJoinAndSelect('services.orders', 'orders');

      const services = await queryBuilder.getMany();

      if (!services || services === null) {
        return null;
        // throw new NotFoundException(`User with ${email} not found`);
      }
      return services;
    }
  }
  async findCommodityManagerByuserId(userID: string): Promise<CommodityManager> {
    const queryBuilder =
      this.commodityManagerRepository.createQueryBuilder('manager');

    // Join with the Customer and Vendor relations
    queryBuilder
      .leftJoinAndSelect('manager.user', 'user')
      .leftJoinAndSelect('manager.orders', 'orders')
      .leftJoinAndSelect('manager.subscriptions', 'subscriptions')
      .leftJoinAndSelect('manager.portfolios', 'portfolios');

    // Use OR to match either customer or provider userID
    queryBuilder.where('user.userID = :userID', { userID });

    // Execute the query and return the results
    const manager = await queryBuilder.getOne();
    return manager;
  }


  async getCommodityByProviderID(id: string): Promise<Commodity> {
    const queryBuilder =
      this.commodityRepository.createQueryBuilder('commodity');
    queryBuilder.leftJoinAndSelect('commodity.orders', 'orders');
    queryBuilder.leftJoinAndSelect('commodity.images', 'images');
    queryBuilder.leftJoinAndSelect('commodity.portfolio', 'portfolio');
    queryBuilder.leftJoinAndSelect('portfolio.manager', 'manager');
    queryBuilder.leftJoinAndSelect('manager.user', 'user');
    queryBuilder.where('manager.id = :id', { id });
    const service = await queryBuilder.getOne();

    if (!service || service === null) {
      return null;
      // throw new NotFoundException(`User with ${email} not found`);
    }
    return service;
  }
  async getCommodities(accountID: string): Promise<Commodity[]> {
    console.log('portfolios acc id', accountID);
    if (accountID) {
      console.log('userID', accountID);
      const queryBuilder =
        this.commodityRepository.createQueryBuilder('commodity');
      queryBuilder.leftJoinAndSelect('commodity.orders', 'orders');
      queryBuilder.leftJoinAndSelect('commodity.images', 'images');
      queryBuilder.leftJoinAndSelect('commodity.portfolio', 'portfolio');
      queryBuilder.leftJoinAndSelect('portfolio.manager', 'manager');
      queryBuilder.leftJoinAndSelect('manager.user', 'user');

      const commodities = await queryBuilder.getMany();

      if (!commodities || commodities === null) {
        return null;
      }
      return commodities;
    }
  }
  async getCommodityByID(id: string): Promise<Commodity> {
    const queryBuilder =
      this.commodityRepository.createQueryBuilder('commodity');
    queryBuilder.leftJoinAndSelect('commodity.orders', 'orders');
    queryBuilder.leftJoinAndSelect('commodity.images', 'images');
    queryBuilder.leftJoinAndSelect('commodity.portfolio', 'portfolio');
    queryBuilder.leftJoinAndSelect('portfolio.manager', 'manager');
    queryBuilder.leftJoinAndSelect('manager.user', 'user');
    queryBuilder.where('commodity.id = :id', { id });
    const commodity = await queryBuilder.getOne();

    if (!commodity || commodity === null) {
      return null;
      // throw new NotFoundException(`User with ${email} not found`);
    }
    return commodity;
  }
}
