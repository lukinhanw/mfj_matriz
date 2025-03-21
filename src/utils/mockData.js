// Mock data para avaliações

// Mock de avaliações
export const mockAssessments = [
	{
		id: 1,
		positionId: 1,
		position: { id: 1, name: 'Desenvolvedor Front-end' },
		questions: [
			{ id: 1, text: 'Você conhece os princípios de design responsivo?', courses: [1, 2] },
			{ id: 2, text: 'Possui experiência com frameworks JavaScript?', courses: [3, 4] },
			{ id: 3, text: 'Tem conhecimento em acessibilidade web?', courses: [5] },
			{ id: 4, text: 'Já trabalhou com controle de versão?', courses: [6] },
			{ id: 5, text: 'Conhece boas práticas de SEO?', courses: [7] }
		],
		mandatoryCourses: [1, 3, 6]
	},
	{
		id: 2,
		positionId: 2,
		position: { id: 2, name: 'Desenvolvedor Back-end' },
		questions: [
			{ id: 6, text: 'Possui experiência com bancos de dados relacionais?', courses: [8, 9] },
			{ id: 7, text: 'Já implementou APIs RESTful?', courses: [10] },
			{ id: 8, text: 'Conhece princípios de segurança em aplicações web?', courses: [11, 12] },
			{ id: 9, text: 'Tem experiência com microsserviços?', courses: [13] }
		],
		mandatoryCourses: [8, 10, 11]
	},
	{
		id: 3,
		positionId: 3,
		position: { id: 3, name: 'Designer UX/UI' },
		questions: [
			{ id: 10, text: 'Domina ferramentas de design como Figma ou Adobe XD?', courses: [14, 15] },
			{ id: 11, text: 'Conhece princípios de usabilidade?', courses: [16] },
			{ id: 12, text: 'Já realizou pesquisas com usuários?', courses: [17] },
			{ id: 13, text: 'Tem experiência com design systems?', courses: [18, 19] }
		],
		mandatoryCourses: [14, 16, 17]
	}
];

// Mock de posições/cargos
export const mockPositions = [
	{ id: 1, name: 'Desenvolvedor Front-end' },
	{ id: 2, name: 'Desenvolvedor Back-end' },
	{ id: 3, name: 'Designer UX/UI' },
	{ id: 4, name: 'Gerente de Projetos' },
	{ id: 5, name: 'Analista de Dados' }
];

// Mock de cursos
export const mockCourses = [
	{ id: 1, title: 'HTML5 Avançado' },
	{ id: 2, title: 'CSS Grid e Flexbox' },
	{ id: 3, title: 'React.js Fundamentos' },
	{ id: 4, title: 'Vue.js na Prática' },
	{ id: 5, title: 'Acessibilidade Web' },
	{ id: 6, title: 'Git e GitHub' },
	{ id: 7, title: 'SEO para Desenvolvedores' },
	{ id: 8, title: 'SQL e MySQL' },
	{ id: 9, title: 'MongoDB Essencial' },
	{ id: 10, title: 'Construindo APIs com Node.js' },
	{ id: 11, title: 'Segurança em Aplicações Web' },
	{ id: 12, title: 'Autenticação e Autorização' },
	{ id: 13, title: 'Arquitetura de Microsserviços' },
	{ id: 14, title: 'Figma para Designers' },
	{ id: 15, title: 'Adobe XD Masterclass' },
	{ id: 16, title: 'Princípios de UX Design' },
	{ id: 17, title: 'Pesquisa com Usuários' },
	{ id: 18, title: 'Design Systems' },
	{ id: 19, title: 'Design Thinking' }
];

// Mock da avaliação do usuário
export const mockUserAssessment = {
	id: 1,
	cargo: 'Desenvolvedor Front-end',
	avaliacao: [
		{ id: 1, text: 'Você conhece os princípios de design responsivo?' },
		{ id: 2, text: 'Possui experiência com frameworks JavaScript?' },
		{ id: 3, text: 'Tem conhecimento em acessibilidade web?' },
		{ id: 4, text: 'Já trabalhou com controle de versão?' },
		{ id: 5, text: 'Conhece boas práticas de SEO?' }
	]
};

// Função para gerar um ID único
export const generateId = () => {
	return Math.floor(Math.random() * 10000) + 1;
}; 