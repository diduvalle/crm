-- =====================================================================
--  CRM - OS TRES TESTES QUE VIVIAM NO GOOGLE FORMS
-- =====================================================================
--  As perguntas sao as dos formularios, lidas dos proprios links e
--  copiadas tal e qual - incluindo a ordem, as seccoes e as opcoes.
--
--  DUAS DIFERENCAS, as duas de proposito:
--
--  1. A pergunta "Nome" nao existe. O link do teste e pessoal, por isso
--     o teste ja sabe quem esta a responder.
--  2. O verdadeiro/falso deixa de ser "caixas de selecao" (o Google nao
--     tem tipo V/F e obrigava a esse truque, no qual se podia marcar
--     Verdadeiro E Falso ao mesmo tempo). Passa a ser um tipo proprio.
--
--  A CHAVE DE CORRECAO NAO VEM DO GOOGLE - ele nao a publica. A que esta
--  aqui foi escrita a mao e os testes nascem com "chave por confirmar":
--  o Repo nao deixa aplicar nenhum deles a uma turma enquanto nao a
--  confirmares, pergunta a pergunta.
--
--  Idempotente: correr duas vezes nao duplica (procura pelo titulo).
--  Precisa do 09-testes.sql corrido antes.
-- =====================================================================

-- ---------------------------------------------------------------------
-- Exercício 01 - CRM Analytics  (12 perguntas, 12 pontos)
-- ---------------------------------------------------------------------
do $$
declare v uuid;
begin
  select id into v from public.testes where titulo = 'Exercício 01 - CRM Analytics';
  if v is not null then return; end if;
  insert into public.testes(titulo, descricao, modulo, chave_ok)
    values ('Exercício 01 - CRM Analytics', 'Doze perguntas de escolha múltipla sobre os conceitos base de um CRM.', '10868', false) returning id into v;
  insert into public.teste_itens(teste_id, ordem, tipo, enunciado, ajuda, opcoes, certa, pontos) values
    (v, 0, 'escolha', '1 - Qual a principal função de um CRM?', '', '["Gerir stocks","Automatizar tarefas administrativas","Gerir relacionamentos com os clientes","Criar campanhas de marketing"]'::jsonb, '2'::jsonb, 1),
    (v, 1, 'escolha', '2 - Qual das seguintes opções é um benefício de um CRM?', '', '["Aumento dos custos operacionais da empresa","Dificuldade em acompanhar o histórico com o cliente","Melhoria na organização e centralização das informações dos clientes","Diminuição da satisfação dos clientes"]'::jsonb, '2'::jsonb, 1),
    (v, 2, 'escolha', '3 - O que significa o termo "funil de vendas"?', '', '["Um tipo de gráfico utilizado nas finanças","Um processo que representa as estapas de uma venda","Uma ferramenta para medir a satisfação do cliente","Um tipo de relatório financeiro"]'::jsonb, '1'::jsonb, 1),
    (v, 3, 'escolha', '4 - Qual a importância de segmentar a base de clientes?', '', '["Permitir a criação de campanhas personalizadas","Facilitar a gestão dos contactos","Aumentar o número de leads","Todas as opções anteriores"]'::jsonb, '3'::jsonb, 1),
    (v, 4, 'escolha', '5 - Qual a principal diferença entre uma lead e um cliente?', '', '["Uma lead é um contacto qualificado, enquanto um cliente já realizou uma compra","Uma lead é um contacto não qualificado, enquanto um cliente já realizou uma compra","Uma lead é um cliente em potencial, enquanto um cliente já realizou uma compra","Não há diferença entre lead e cliente"]'::jsonb, '2'::jsonb, 1),
    (v, 5, 'escolha', '6 - Qual a importância de acompanhar os KPI num CRM?', '', '["Avaliar o desempenho da equipa de vendas","Identificar oportunidades de melhoria","Tomar decisões estratégicas mais assertivas","Todas as opções anteriores"]'::jsonb, '3'::jsonb, 1),
    (v, 6, 'escolha', '7 - O que é um ticket?', '', '["Um tipo de relatório financeiro","Uma unidade de medida utilizada nas vendas","Um pedido de suporte ou serviço por parte de um cliente.","Uma campanha de marketing"]'::jsonb, '2'::jsonb, 1),
    (v, 7, 'escolha', '8 - Qual das seguintes opções NÃO é um exemplo de um KPI comum num CRM?', '', '["Taxa de conversão","Tempo médio de resposta a um ticket","Número de produtos em stock","Valor médio do pedido"]'::jsonb, '2'::jsonb, 1),
    (v, 8, 'escolha', '9 - Qual a importância da integração do CRM com outras ferramentas?', '', '["Permitir a automatização de processos","Melhorar a eficiência e produtividade","Ter uma visão mais completa do cliente","Todas as opções anteriores"]'::jsonb, '3'::jsonb, 1),
    (v, 9, 'escolha', '10 - Qual a importância da análise de dados num CRM?', '', '["Identificar tendências e padrões de comportamento dos clientes","Tomar decisões mais estratégicas","Melhorar a experiência do cliente","Todas as opções anteriores"]'::jsonb, '3'::jsonb, 1),
    (v, 10, 'escolha', '11 - Qual a principal diferença entre um CRM operacional e um CRM analítico?', '', '["O CRM operacional é utilizado para automatizar tarefas, enquanto o CRM analítico é utilizado para analisar dados","O CRM operacional é utilizado para gerir o relacionamento com clientes, enquanto o CRM analítico é utilizado para gerir o relacionamento com fornecedores","Não há diferença entre CRM operacional e CRM analítico","Ambos são utilizados para gerir o relacionamento com fornecedores."]'::jsonb, '0'::jsonb, 1),
    (v, 11, 'escolha', '12 - Qual a importância de investir em formação para os colaboradores que utilizam o CRM?', '', '["Garantir a implementação do sistema e o máximo aproveitamento dos seus recursos","Reduzir a curva de aprendizagem","Alinhar as ações dos colaboradores com as estratégias da empresa","Todas as opções anteriores"]'::jsonb, '3'::jsonb, 1);
end $$;

-- ---------------------------------------------------------------------
-- Avaliação final - 10868  (25 perguntas, 20 pontos)
-- ---------------------------------------------------------------------
do $$
declare v uuid;
begin
  select id into v from public.testes where titulo = 'Avaliação final - 10868';
  if v is not null then return; end if;
  insert into public.testes(titulo, descricao, modulo, chave_ok)
    values ('Avaliação final - 10868', 'Escolha múltipla, desenvolvimento e verdadeiro/falso. Vinte pontos.', '10868', false) returning id into v;
  insert into public.teste_itens(teste_id, ordem, tipo, enunciado, ajuda, opcoes, certa, pontos) values
    (v, 0, 'seccao', '1ª Parte', 'Escolha Múltipla', '[]'::jsonb, null, 0),
    (v, 1, 'escolha', '1. Qual das seguintes opções melhor define um CRM?', '', '["a) Um software utilizado exclusivamente para gerir o relacionamento com fornecedores.","b) Uma ferramenta para automatizar tarefas administrativas da empresa.","c) Um sistema que gere todas as interações de uma empresa com os clientes.","d) Um software para controlar o inventário de produtos."]'::jsonb, '2'::jsonb, 1),
    (v, 2, 'escolha', '2. Qual é a principal vantagem de utilizar um CRM?', '', '["a) Reduzir os custos de produção.","b) Melhorar o relacionamento com os clientes.","c) Aumentar o número de fornecedores.","d) Simplificar o processo de recrutamento."]'::jsonb, '1'::jsonb, 1),
    (v, 3, 'escolha', '3. Qual das seguintes métricas não está diretamente relacionada ao CRM?', '', '["a) Taxa de conversão.","b) Custo de aquisição de cliente.","c) Retorno sobre o investimento.","d) Índice de rotatividade de colaboradores."]'::jsonb, '3'::jsonb, 1),
    (v, 4, 'escolha', '4. Qual das seguintes funcionalidades não é comum num CRM?', '', '["a) Gestão de contatos.","b) Automação de marketing.","c) Gestão de projetos.","d) Análise de dados."]'::jsonb, '2'::jsonb, 1),
    (v, 5, 'escolha', '5. Qual é a principal diferença entre um CRM operacional e um CRM analítico?', '', '["a) O CRM operacional foca em automatizar tarefas, enquanto o CRM analítico fornece insights sobre os dados.","b) O CRM operacional é utilizado pelas vendas, enquanto o CRM analítico é utilizado pelo marketing.","c) O CRM operacional é mais caro que o CRM analítico.","d) Não há diferença entre os dois."]'::jsonb, '0'::jsonb, 1),
    (v, 6, 'escolha', '6. Qual das seguintes afirmações sobre a segmentação de clientes num CRM é falsa?', '', '["a) A segmentação permite personalizar a comunicação com os clientes.","b) A segmentação pode ser feita com base em dados demográficos, comportamentais e geográficos.","c) A segmentação dificulta a criação de campanhas de marketing mais eficazes.","d) A segmentação permite identificar os clientes mais valiosos."]'::jsonb, '2'::jsonb, 1),
    (v, 7, 'escolha', '7. Qual é a importância do marketing relacional num CRM?', '', '["a) Fortalecer o relacionamento com os clientes e aumentar a fidelização.","b) Reduzir os custos de produção.","c) Aumentar o número de produtos oferecidos.","d) Simplificar a gestão do inventário."]'::jsonb, '0'::jsonb, 1),
    (v, 8, 'escolha', '8. Qual das seguintes opções não é um benefício da automatização de marketing num CRM?', '', '["a) Aumento da produtividade.","b) Personalização das mensagens.","c) Redução do tempo gasto em tarefas repetitivas.","d) Diminuição do número de leads qualificados."]'::jsonb, '3'::jsonb, 1),
    (v, 9, 'escolha', '9. Qual é o papel da análise de dados num CRM?', '', '["a) Identificar tendências de mercado e comportamento dos clientes.","b) Automatizar o envio de e-mails.","c) Gerir o inventário de produtos.","d) Agendar reuniões com os clientes."]'::jsonb, '0'::jsonb, 1),
    (v, 10, 'escolha', '10. Qual das seguintes afirmações sobre a implementação de um CRM é verdadeira?', '', '["a) A implementação de um CRM é um processo rápido e simples.","b) A implementação de um CRM não requer treino.","c) O sucesso da implementação de um CRM depende da participação de todos os departamentos.","d) A implementação de um CRM não exige uma mudança cultural na empresa."]'::jsonb, '2'::jsonb, 1),
    (v, 11, 'seccao', '2ª Parte', 'Desenvolvimento', '[]'::jsonb, null, 0),
    (v, 12, 'aberta', 'Com base nos principais componentes de um CRM e as suas vantagens. Relaciona com os desafios de implementação.', '', '[]'::jsonb, null, 1),
    (v, 13, 'aberta', 'Desenvolve o tema da Hiperpersonalização e a sua importância.', '', '[]'::jsonb, null, 1),
    (v, 14, 'aberta', 'Qual a relação entre Marketing Relacional e um CRM?', '', '[]'::jsonb, null, 1),
    (v, 15, 'aberta', 'Porque é fundamental analisar e tomar decisões com base nos dados?', '', '[]'::jsonb, null, 1),
    (v, 16, 'aberta', 'Fidelização, porque consideramos como o grande objetivo prático de utilizar um CRM?', '', '[]'::jsonb, null, 1),
    (v, 17, 'seccao', '3ª Parte', 'Verdadeiro / Falso', '[]'::jsonb, null, 0),
    (v, 18, 'vf', '1 - A segmentação demográfica considera fatores como idade, género e localização geográfica dos clientes.', '', '[]'::jsonb, 'true'::jsonb, 0.5),
    (v, 19, 'vf', '2 - O marketing relacional foca em estabelecer relações duradouras com os clientes, visando a fidelização e a retenção.', '', '[]'::jsonb, 'true'::jsonb, 0.5),
    (v, 20, 'vf', '3 - O Lifetime Value (LTV) mede o valor total que um cliente gera para a empresa durante todo o seu relacionamento.', '', '[]'::jsonb, 'true'::jsonb, 0.5),
    (v, 21, 'vf', '4 - A taxa de churn mede o número de novos clientes adquiridos num determinado período.', '', '[]'::jsonb, 'false'::jsonb, 0.5),
    (v, 22, 'vf', '5 - A análise de dados pode identificar padrões de comportamento dos clientes, auxiliando na criação de campanhas de marketing mais eficazes.', '', '[]'::jsonb, 'true'::jsonb, 0.5),
    (v, 23, 'vf', '6 - O marketing relacional é mais eficaz em empresas que vendem produtos e serviços de baixo valor agregado.', '', '[]'::jsonb, 'false'::jsonb, 0.5),
    (v, 24, 'vf', '7 - A personalização da comunicação com os clientes é um dos pilares do marketing relacional.', '', '[]'::jsonb, 'true'::jsonb, 0.5),
    (v, 25, 'vf', '8 - A fidelização de clientes é um processo estático que não requer acompanhamento contínuo.', '', '[]'::jsonb, 'false'::jsonb, 0.5),
    (v, 26, 'vf', '9 - A fidelização de clientes está diretamente ligada à redução dos custos de aquisição de novos clientes.', '', '[]'::jsonb, 'true'::jsonb, 0.5),
    (v, 27, 'vf', '10 - Um CRM pode auxiliar na criação de campanhas de marketing personalizadas para cada etapa do ciclo de vida do cliente.', '', '[]'::jsonb, 'true'::jsonb, 0.5);
end $$;

-- ---------------------------------------------------------------------
-- Avaliação final - 10870  (25 perguntas, 20 pontos)
-- ---------------------------------------------------------------------
do $$
declare v uuid;
begin
  select id into v from public.testes where titulo = 'Avaliação final - 10870';
  if v is not null then return; end if;
  insert into public.testes(titulo, descricao, modulo, chave_ok)
    values ('Avaliação final - 10870', 'Escolha múltipla, desenvolvimento e verdadeiro/falso. Vinte pontos.', '10870', false) returning id into v;
  insert into public.teste_itens(teste_id, ordem, tipo, enunciado, ajuda, opcoes, certa, pontos) values
    (v, 0, 'seccao', '1ª Parte', 'Escolha Múltipla', '[]'::jsonb, null, 0),
    (v, 1, 'escolha', '1. O que significa RGPD?', '', '["(a) Regulamento Geral de Proteção de Dados","(b) Regulamento Geral de Privacidade de Dados","(c) Regulamento Global de Proteção de Dados","(d) Regulamento Geral de Partilha de Dados"]'::jsonb, '0'::jsonb, 1),
    (v, 2, 'escolha', '2. Qual o principal objetivo do RGPD?', '', '["(a) Proteger os dados das empresas","(b) Proteger os dados dos cidadãos da União Europeia","(c) Regular o uso de dados na internet","(d) Estabelecer regras para o tratamento de dados em todo o mundo"]'::jsonb, '1'::jsonb, 1),
    (v, 3, 'escolha', '3. Quem é o responsável por garantir o cumprimento do RGPD?', '', '["(a) O departamento de marketing","(b) O encarregado de proteção de dados","(c) O departamento de recursos humanos","(d) O diretor executivo"]'::jsonb, '1'::jsonb, 1),
    (v, 4, 'escolha', '4. O que é um dado pessoal, de acordo com o RGPD?', '', '["(a) Qualquer informação que possa identificar uma pessoa singular","(b) Apenas o nome e o endereço de uma pessoa","(c) Informações financeiras de uma pessoa","(d) Dados de navegação na internet"]'::jsonb, '0'::jsonb, 1),
    (v, 5, 'escolha', '5. O que é o consentimento, de acordo com o RGPD?', '', '["(a) Uma autorização para o tratamento de dados","(b) Uma manifestação de vontade livre, específica, informada e inequívoca do titular dos dados","(c) Um acordo verbal para o tratamento de dados","(d) Uma permissão automática para o tratamento de dados"]'::jsonb, '1'::jsonb, 1),
    (v, 6, 'escolha', '6. Em que situações o tratamento de dados é considerado lícito, mesmo sem o consentimento do titular?', '', '["(a) Quando o tratamento é necessário para cumprir uma obrigação legal","(b) Quando o tratamento é necessário para proteger os interesses vitais do titular dos dados","(c) Quando o tratamento é necessário para a execução de um contrato","(d) Todas as alternativas anteriores"]'::jsonb, '3'::jsonb, 1),
    (v, 7, 'escolha', '7. O que é o direito ao esquecimento?', '', '["(a) O direito do titular dos dados de solicitar a eliminação dos seus dados pessoais","(b) O direito do titular dos dados de retificar os seus dados pessoais","(c) O direito do titular dos dados de acessar os seus dados pessoais","(d) O direito do titular dos dados de portar os seus dados pessoais"]'::jsonb, '0'::jsonb, 1),
    (v, 8, 'escolha', '8. O que deve ser feito em caso de violação de dados?', '', '["(a) Notificar a autoridade de controle e, em alguns casos, o titular dos dados","(b) Investigar a causa da violação","(c) Adotar medidas para mitigar os danos","(d) Todas as alternativas anteriores"]'::jsonb, '3'::jsonb, 1),
    (v, 9, 'escolha', '9. Quem é a autoridade de controlo para questões relacionadas ao RGPD?', '', '["(a) A Comissão Nacional de Proteção de Dados (CNPD)","(b) A Autoridade Nacional de Segurança de Informação (ANSI)","(c) A Direção-Geral de Proteção de Dados (DGPDP)","(d) A Agência para a Modernização Administrativa (AMA)"]'::jsonb, '0'::jsonb, 1),
    (v, 10, 'escolha', '10. O RGPD aplica-se a empresas estabelecidas fora da União Europeia?', '', '["(a) Não, o RGPD aplica-se apenas a empresas estabelecidas na UE","(b) Sim, o RGPD aplica-se a empresas estabelecidas fora da UE que tratam dados de residentes na UE","(c) Sim, o RGPD aplica-se a todas as empresas do mundo","(d) Depende do tipo de dados que a empresa trata"]'::jsonb, '1'::jsonb, 1),
    (v, 11, 'seccao', '2ª Parte', 'Desenvolvimento', '[]'::jsonb, null, 0),
    (v, 12, 'aberta', 'Uma empresa de marketing recolhe dados dos utilizadores através de um formulário online, incluindo nome, email, idade e interesses. Como deve a empresa garantir o cumprimento do princípio da minimização de dados?', '', '[]'::jsonb, null, 1),
    (v, 13, 'aberta', 'Um Personal Trainer recolhe dados do treino dos seus alunos. A portabilidade desses dados, deve ser assegurada?', '', '[]'::jsonb, null, 1),
    (v, 14, 'aberta', 'Uma empresa de seguros utiliza algoritmos de IA para analisar dados de clientes e ajudar na tomada de decisão. Que cuidados deve ter, de modo que o tratamento de dados seja justo e não discriminatório?', '', '[]'::jsonb, null, 1),
    (v, 15, 'aberta', 'Um pequeno negócio local recolhe dados dos clientes para enviar promoções e novidades. Mesmo com recursos limitados, como deve assegurar a proteção de dados?', '', '[]'::jsonb, null, 1),
    (v, 16, 'aberta', 'Uma unidade hoteleira armazena o histórico dos telefonemas dos hóspedes. Como deve lidar com solicitações dessa informação garantindo o cumprimento do RGPD e a proteção da privacidade?', '', '[]'::jsonb, null, 1),
    (v, 17, 'seccao', '3ª Parte', 'Verdadeiro / Falso', '[]'::jsonb, null, 0),
    (v, 18, 'vf', '1. O consentimento do titular dos dados não é necessário para o tratamento de dados pessoais.', '', '[]'::jsonb, 'false'::jsonb, 0.5),
    (v, 19, 'vf', '2. Dados como nome, email e telefone são considerados dados pessoais.', '', '[]'::jsonb, 'true'::jsonb, 0.5),
    (v, 20, 'vf', '3. O RGPD exige que as empresas tenham um DPO em todos os casos.', '', '[]'::jsonb, 'false'::jsonb, 0.5),
    (v, 21, 'vf', '4. O RGPD não prevê coimas para o não cumprimento das regras de proteção de dados.', '', '[]'::jsonb, 'false'::jsonb, 0.5),
    (v, 22, 'vf', '5. O Privacy by Design significa que a proteção de dados deve ser considerada desde a concepção de um produto ou serviço.', '', '[]'::jsonb, 'true'::jsonb, 0.5),
    (v, 23, 'vf', '6. O Privacy by Default significa que as configurações padrão de um produto ou serviço deve ser o mais protetor possível para os dados pessoais.', '', '[]'::jsonb, 'true'::jsonb, 0.5),
    (v, 24, 'vf', '7. As empresas podem partilhar dados pessoais com terceiros sem o consentimento do titular em qualquer situação.', '', '[]'::jsonb, 'false'::jsonb, 0.5),
    (v, 25, 'vf', '8. O titular dos dados tem o direito de aceder aos seus dados pessoais que são tratados por uma empresa.', '', '[]'::jsonb, 'true'::jsonb, 0.5),
    (v, 26, 'vf', '9. As empresas não precisam manter registos das atividades de tratamento de dados pessoais.', '', '[]'::jsonb, 'false'::jsonb, 0.5),
    (v, 27, 'vf', '10. O RGPD não se aplica a pequenas empresas.', '', '[]'::jsonb, 'false'::jsonb, 0.5);
end $$;

-- ---------------------------------------------------------------------
-- Conferir
-- ---------------------------------------------------------------------
--   select t.titulo, count(*) filter (where i.tipo <> 'seccao') as perguntas,
--          sum(i.pontos) filter (where i.tipo <> 'seccao') as pontos
--     from public.testes t join public.teste_itens i on i.teste_id = t.id
--    group by t.titulo;
