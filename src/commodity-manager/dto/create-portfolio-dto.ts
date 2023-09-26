export class CreatePortfolioDTO{
    authToken: string;
    portfolioType?: string;
    name?: string;
    description?: string;
    managerUserID: string;
}