import type { Recipe, User } from '@/types/models';

export const DEMO_USER: User = {
  id: 'user-demo-1',
  name: 'Chef Marina Oliveira',
  email: 'chef@minhareceita.com.br',
  createdAt: '2026-10-15T12:00:00.000Z',
};

export const SEED_RECIPES: Recipe[] = [
  {
    id: 'rec-sobrecoxa-ervas',
    userId: DEMO_USER.id,
    title: 'Sobrecoxa Assada com Ervas e Limão Siciliano',
    description:
      'Sobrecoxas douradas e suculentas marinadas com manteiga de ervas frescas, alho confitado e raspas de limão siciliano.',
    category: 'aves',
    imageUrl:
      'https://images.unsplash.com/photo-1598103442097-8b74394b95c6?auto=format&fit=crop&w=1200&q=80',
    prepInfo: {
      prepTime: '50 min',
      servings: '4 porções',
      difficulty: 'Fácil',
    },
    ingredients: [
      '1 kg de sobrecoxa de frango com pele',
      '3 colheres (sopa) de manteiga em ponto de pomada',
      'Raspas e suco de 1 limão siciliano',
      '4 dentes de alho amassados',
      '2 ramos de alecrim fresco picado',
      '1 colher (chá) de páprica defumada',
      'Sal e pimenta-do-reino moída na hora a gosto',
      '2 colheres (sopa) de azeite extravirgem',
    ],
    instructions: [
      'Preaqueça o forno a 200 °C e unte levemente uma assadeira ampla com azeite.',
      'Misture a manteiga, o alho, o alecrim, a páprica, as raspas de limão, sal e pimenta até formar uma pasta aromática.',
      'Seque bem as sobrecoxas com papel-toalha e espalhe a pasta por baixo e por cima da pele.',
      'Regue com o suco de limão siciliano e disponha as peças com a pele voltada para cima.',
      'Asse por 40 a 45 minutos até a pele ficar bem dourada e crocante, regando com o próprio caldo na metade do tempo.',
    ],
    createdAt: '2026-11-10T14:20:00.000Z',
    updatedAt: '2026-11-10T14:20:00.000Z',
  },
  {
    id: 'rec-salmao-maracuja',
    userId: DEMO_USER.id,
    title: 'Salmão Grelhado ao Molho de Maracujá',
    description:
      'Postas de salmão seladas com pele crocante servidas com redução agridoce de maracujá fresco e toque de gengibre.',
    category: 'peixes',
    imageUrl:
      'https://images.unsplash.com/photo-1467003909585-2f8a72700288?auto=format&fit=crop&w=1200&q=80',
    prepInfo: {
      prepTime: '30 min',
      servings: '2 porções',
      difficulty: 'Médio',
    },
    ingredients: [
      '2 postas altas de salmão (aprox. 200 g cada)',
      'Polpa de 2 maracujás frescos',
      '1 colher (sopa) de mel',
      '1 colher (chá) de gengibre fresco ralado',
      '1 colher (sopa) de manteiga gelada',
      '1 colher (sopa) de azeite de oliva',
      'Sal marinho e pimenta branca a gosto',
      'Cebolinha picada para finalizar',
    ],
    instructions: [
      'Tempere as postas de salmão com sal e pimenta branca minutos antes de levar à frigideira.',
      'Aqueça o azeite em frigideira antiaderente e grelhe o salmão com a pele para baixo por 4 minutos sem mexer.',
      'Vire cuidadosamente e cozinhe por mais 2 a 3 minutos para manter o centro suculento. Reserve aquecido.',
      'Na mesma frigideira, adicione a polpa de maracujá, o mel e o gengibre e reduza em fogo baixo por 3 minutos.',
      'Desligue o fogo, incorpore a manteiga gelada emulsionando o molho e sirva sobre o salmão finalizado com cebolinha.',
    ],
    createdAt: '2026-11-14T18:10:00.000Z',
    updatedAt: '2026-11-14T18:10:00.000Z',
  },
  {
    id: 'rec-lombo-abacaxi',
    userId: DEMO_USER.id,
    title: 'Lombo Suíno Caramelizado com Abacaxi',
    description:
      'Lombo suíno assado lentamente em marinada cítrica com açúcar mascavo, especiarias e fatias de abacaxi grelhado.',
    category: 'suina',
    imageUrl:
      'https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=1200&q=80',
    prepInfo: {
      prepTime: '1h 15 min',
      servings: '6 porções',
      difficulty: 'Médio',
    },
    ingredients: [
      '1,2 kg de lombo suíno limpo',
      '6 fatias de abacaxi pérola',
      '2 colheres (sopa) de açúcar mascavo',
      '2 colheres (sopa) de mostarda dijon',
      '150 ml de suco de laranja natural',
      '3 dentes de alho picados',
      '1 colher (chá) de tomilho seco',
      'Sal e pimenta-do-reino a gosto',
    ],
    instructions: [
      'Misture o suco de laranja, a mostarda, o açúcar mascavo, o alho, o tomilho, sal e pimenta.',
      'Deixe o lombo marinar nessa mistura por pelo menos 30 minutos na geladeira.',
      'Transfira para uma assadeira com as fatias de abacaxi ao redor, cubra com papel-alumínio e asse a 190 °C por 45 minutos.',
      'Retire o alumínio, regue a carne com o líquido da assadeira e asse por mais 20 minutos até caramelizar.',
      'Deixe descansar 10 minutos antes de fatiar e sirva acompanhado do abacaxi dourado.',
    ],
    createdAt: '2026-11-16T11:30:00.000Z',
    updatedAt: '2026-11-16T11:30:00.000Z',
  },
  {
    id: 'rec-escondidinho-vegetal',
    userId: DEMO_USER.id,
    title: 'Escondidinho 100% Vegetal de Mandioquinha',
    description:
      'Purê aveludado de mandioquinha com leite de coco cobrindo um refogado aromático de cogumelos e ervas.',
    category: 'vegetal',
    imageUrl:
      'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?auto=format&fit=crop&w=1200&q=80',
    prepInfo: {
      prepTime: '45 min',
      servings: '4 porções',
      difficulty: 'Fácil',
    },
    ingredients: [
      '700 g de mandioquinha (batata-baroa) descascada',
      '300 g de cogumelos paris ou shitake fatiados',
      '1 cebola roxa picada em cubos pequenos',
      '100 ml de leite de coco culinário',
      '2 colheres (sopa) de azeite de oliva',
      '1 colher (sopa) de molho shoyu',
      'Noz-moscada ralada, sal e salsinha picada a gosto',
      '2 colheres (sopa) de farinha de castanha ou pão ralado para gratinar',
    ],
    instructions: [
      'Cozinhe a mandioquinha em água fervente com sal até ficar macia, escorra e amasse ainda quente.',
      'Incorpore o leite de coco, 1 colher de azeite e a noz-moscada ao purê até obter textura cremosa.',
      'Em outra panela, refogue a cebola no azeite restante, junte os cogumelos e o shoyu até dourarem e secarem o excesso de líquido.',
      'Monte em um refratário colocando o refogado na base, cobrindo com o purê e polvilhando a farinha de castanha.',
      'Leve ao forno a 200 °C por 15 minutos até formar crosta dourada e sirva com salsinha fresca.',
    ],
    createdAt: '2026-11-19T16:45:00.000Z',
    updatedAt: '2026-11-19T16:45:00.000Z',
  },
  {
    id: 'rec-pao-rustico',
    userId: DEMO_USER.id,
    title: 'Pão Caseiro Rústico de Alecrim e Flor de Sal',
    description:
      'Pão artesanal de casca crocante e miolo macio, perfumado com azeite extravirgem, alecrim fresco e flor de sal.',
    category: 'paes',
    imageUrl:
      'https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&w=1200&q=80',
    prepInfo: {
      prepTime: '1h 40 min',
      servings: '8 fatias',
      difficulty: 'Médio',
    },
    ingredients: [
      '500 g de farinha de trigo tipo 1',
      '320 ml de água morna',
      '10 g de fermento biológico seco instantâneo',
      '3 colheres (sopa) de azeite extravirgem',
      '1 colher (chá) de açúcar',
      '1 colher (chá) de sal refinado',
      '1 ramo de alecrim fresco debulhado',
      'Flor de sal para finalizar antes de assar',
    ],
    instructions: [
      'Misture a água morna, o fermento e o açúcar e aguarde 5 minutos até espumar levemente.',
      'Adicione a farinha, o sal e 2 colheres de azeite, sovando por 8 a 10 minutos até obter massa lisa e elástica.',
      'Cubra com pano limpo e deixe crescer por 50 minutos ou até dobrar de volume.',
      'Modele em formato rústico sobre assadeira enfarinhada, faça cortes superficiais, regue com o azeite restante e distribua o alecrim e a flor de sal.',
      'Asse em forno preaquecido a 220 °C por 25 a 30 minutos até dourar uniformemente.',
    ],
    createdAt: '2026-11-21T09:15:00.000Z',
    updatedAt: '2026-11-21T09:15:00.000Z',
  },
];
