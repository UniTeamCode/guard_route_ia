CREATE DATABASE ia_healthcheck_database;

CREATE TABLE atendimentos (
    id SERIAL PRIMARY KEY,
    data_atendimento DATE,
    data_realizacao_atendimento DATE,
    data_nascimento_paciente DATE,
    sexo_paciente VARCHAR(1),
    codigo_tipo_unidade INTEGER,
    tipo_unidade VARCHAR(50),
    codigo_unidade VARCHAR(150),
    descricao_unidade VARCHAR(80),
    codigo_procedimento VARCHAR(12),
    descricao_procedimento VARCHAR(255),
    codigo_cbo VARCHAR(8),
    descricao_cbo VARCHAR(200),
    codigo_cid VARCHAR(4),
    descricao_cid VARCHAR(150),
    solicitacao_exames VARCHAR(3),
    qtde_prescrita_farmacia_curitibana INTEGER,
    qtde_dispensada_farmacia_curitibana INTEGER,
    qtde_medicamento_nao_padronizado INTEGER,
    encaminhamento_para_atendimento_especialista VARCHAR(3),
    area_de_atuacao VARCHAR(255),
    desencadeou_internamento VARCHAR(3),
    data_internamento DATE,
    estabelecimento_solicitante VARCHAR(80),
    estabelecimento_destino VARCHAR(80),
    cid_internamento VARCHAR(4),
    tratamento_domicilio VARCHAR(30),
    abastecimento_agua_domicilio VARCHAR(40),
    energia_eletrica VARCHAR(3),
    tipo_habitacao_domicilio VARCHAR(60),
    destino_lixo_domicilio VARCHAR(30),
    destino_fezes_urina_domicilio VARCHAR(30),
    qtde_comodos_domicilio INTEGER,
    servicos_procurados_em_caso_de_doenca VARCHAR(40),
    grupo_comunitario_paciente VARCHAR(40),
    meios_de_comunicacao_utilizados_domicilio VARCHAR(40),
    meios_de_transporte_utilizados_domicilio VARCHAR(40),
    municipio_paciente VARCHAR(50),
    bairro_paciente VARCHAR(72),
    nacionalidade_paciente VARCHAR(20),
    cod_usuario INTEGER,
    origem_usuario INTEGER,
    residente INTEGER,
    cod_profissional INTEGER
);

CREATE INDEX descricao_procedimento_idx ON atendimentos(descricao_procedimento);
CREATE INDEX data_atendimento_idx ON atendimentos(data_atendimento);
CREATE INDEX data_realizacao_atendimento_idx ON atendimentos(data_realizacao_atendimento);
CREATE INDEX tipo_unidade_idx ON atendimentos(tipo_unidade);
CREATE INDEX sexo_paciente_idx ON atendimentos(sexo_paciente);
