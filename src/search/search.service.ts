import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ElasticsearchService } from '@nestjs/elasticsearch';
import { BeautyService } from 'src/service-providers/entities/services.entity';
import { BeautyProductServiceSearchBody, BeautyProductServiceSearchResult, OfferItemSearchResult, ProfessionalServiceSearchBody } from 'src/sales-orders/types/offerItemSearchBody.interface';
import { ProfessionalService } from 'src/service-providers/entities/service-provider.entity';
import { Commodity } from 'src/commodity-manager/entities/commodityentity';


 
@Injectable()
export default class SearchService {
  index = 'items'
 
  constructor(
    private readonly elasticsearchService: ElasticsearchService, 
    private readonly configService: ConfigService
  ) {}
 
  public async createIndex() {
    const index = 'items'
    const checkIndex = await this.elasticsearchService.indices.exists({ index });
    // tslint:disable-next-line:early-exit
    if (checkIndex === false) {
      this.elasticsearchService.indices.create(
        {
          index,
          body: {
            mappings: {
              properties: {
                itemName: {
                  type: 'text',
                  analyzer: "edge_ngram_analyzer",
                  fields: {
                    keyword: {
                      type: 'keyword',
                      ignore_above: 256,
                    },
                  },
                },
                itemCategory: {
                      type: 'text',
                      analyzer: "edge_ngram_analyzer",
                      fields: {
                        keyword: {
                          type: 'keyword',
                          ignore_above: 256,
                        },
                  },
                },
                neighbourhood: {
                  type: 'text',
                  analyzer: "edge_ngram_analyzer",
                  fields: {
                    keyword: {
                      type: 'keyword',
                      ignore_above: 256,
                    },
                  },
                },
                city: {
                  type: 'text',
                  analyzer: "edge_ngram_analyzer",
                  fields: {
                    keyword: {
                      type: 'keyword',
                      ignore_above: 256,
                    },
                  },
                },
              },
            },
            settings: {
              analysis: {
                filter: {
                  autocomplete_filter: {
                    type: 'edge_ngram',
                    min_gram: 1,
                    max_gram: 20,
                  },
                },
                analyzer: {
                  edge_ngram_analyzer: {
                    type: "custom",
                    tokenizer: "edge_ngram_tokenizer"
                  },
                  autocomplete: {
                    type: 'custom',
                    tokenizer: 'standard',
                    filter: ['lowercase', 'autocomplete_filter'],
                  },
                },
                tokenizer: {
                  edge_ngram_tokenizer: {
                    type: "edge_ngram",
                    min_gram: 2,
                    max_gram: 10,
                    token_chars: [
                      "letter",
                      "digit"
                    ]
                  }
                }
              },
            },
          },
        },
      );
    }
  }

  async indexCommodity(commodity: Commodity) {
    return this.elasticsearchService.index<BeautyProductServiceSearchBody>({
      index: this.index,
      body: {
        id: commodity.id,
        name: commodity.name,
        category: commodity.category,
        providerID: commodity.providerID,
        city: commodity.portfolio.manager.user.city,
        neighbourhood: commodity.portfolio.manager.user.neighbourhood
      }
    })
  }

  
  async indexProfessionalService(professionalService: ProfessionalService) {
    return this.elasticsearchService.index<ProfessionalServiceSearchBody>({
      index: this.index,
      body: {
        id: professionalService.id,
        name: professionalService.name,
        category: professionalService.category,
        providerID: professionalService.providerID,
        city: professionalService.provider.city,
        country: professionalService.provider.country
      }
    })
  }
  async indexService(beautyService: BeautyService) {
    return this.elasticsearchService.index<BeautyProductServiceSearchBody>({
      index: this.index,
      body: {
        id: beautyService.id,
        name: beautyService.name,
        category: beautyService.category,
        providerID: beautyService.providerID,
        city: beautyService.catalog.manager.user.city,
        neighbourhood: beautyService.catalog.manager.user.neighbourhood
      }
    })
  }
  async searchBeautyProductService(text: any) {
    console.log('searchFor BeautyProductService textis',text)
    const body = await this.elasticsearchService.search<BeautyProductServiceSearchResult>({
      index: this.index,
      body: {
        query: {
          bool: {
             should: [
                {
                   multi_match: {
                      query: text,
                      fields: ['name', 'category', 'city','neighbourhood'],
                      boost: 2
                   }
                },
                {
                   multi_match: {
                      query: text,
                      fields: ['name', 'category', 'city','neighbourhood'],
                      boost: 1
                   }
                }
             ]
          }
       }
      }
    })
    const hits = body.hits.hits;
    const res = hits.map((item) => item._source);
    console.log('res', res)
    return res;
  }

  async search(text: any) {
    console.log('searchFor OfferItems textis',text)

    const body = await this.elasticsearchService.search<OfferItemSearchResult>({
      index: this.index,
      body: {
        query: {
          bool: {
             should: [
                {
                   multi_match: {
                      query: text,
                      fields: ['itemName', 'itemCategory', 'city','neighbourhood'],
                      boost: 2
                   }
                },
                {
                   multi_match: {
                      query: text,
                      fields: ['itemName', 'itemCategory', 'city','neighbourhood'],
                      boost: 1
                   }
                }
             ]
          }
       }
      }
    })
    console.log(body)
    const hits = body.hits.hits;
    const res = hits.map((item) => item._source);
    console.log('res', res)
    return res;
  }
}