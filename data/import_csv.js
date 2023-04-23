const csv = require('csv-parse');
const fs = require('fs/promises');
const { Transform } = require('stream');
const { promisify } = require('util');

const pgp = require('pg-promise')();
const format = require('pg-format');
const { performance } = require('perf_hooks');

const CSV_DIR = './data/';
const BATCH_SIZE = 10000;
const TAG = '2023-04-06_Sistema_E-Saude_Enfermagem_-_Base_de_Dados-2';

const cn = {
  host: 'localhost',
  port: 5432,
  database: 'ia_healthcheck_database',
  user: 'postgres',
  password: 'postgres',
  max: 1
};

const db = pgp(cn);

/** Utils */

// Capitalize first letter of each word in a given string
const capitalize = (str, lower = false) =>
  (lower ? str.toLowerCase() : str).replace(
    /(?:^|\s|["'([{])+\S/g,
    (match) => match.toUpperCase()
  );

// A collection of formatting functions
const Format = {
  string: (str) => `'${str.replace(/'/g, "''")}'`,
  date: (str, def = 'NULL') => {
    if (str) {
      // Use pg-format to format date string
      return format('to_date(%L, %L)', str, 'DD/MM/YYYY HH24:MI:SS');
    } else {
      return def;
    }
  },
  int: (str) => (str === '' ? 0 : str),
};

/** Utils */

// Class to parse CSV files and store data into the database
class Parser {
  constructor(tag, table, rowCallback) {
    console.log(`[ ${table} ]`);
    this.table = table;
    this.rowCallback = rowCallback;
    this.files = [];

    this.r = 0;
    this.rows = [];

    this.filterFiles(tag);
  }

  // Filter CSV files based on the tag
  async filterFiles(tag) {
    const files = await fs.readdir(CSV_DIR);
    for (const file of files) {
      if (file.includes(tag)) {
        this.files.push(file);
      }
    }
  }

  // Parse a single CSV file
  async parse(file) {
    console.log(`\tparsing ${file}...`);

    const stream = fs.createReadStream(`${CSV_DIR}${file}`);
    const parser = csv({ delimiter: ';' });

    // Create a transform stream to process each row of data
    const writer = new Transform({
      writableObjectMode: true,
      transform: async (row, encoding, callback) => {
        this.rows.push(row);
        this.r++;

        if (this.rows.length < BATCH_SIZE) {
          // If batch size is not reached, continue processing
          callback();
        } else {
          // If batch size is reached, save data to the database
          await this.save();
          callback();
        }
      },
    });

    // Pipe the CSV data through the parser and writer
    await promisify(stream.pipe.bind(stream))(parser).pipe(writer);
    await promisify(writer.once.bind(writer))('finish');
    console.log(`\t${this.r}`);

    if (this.rows.length) {
      // Save any remaining rows to the database
      await this.save();
    }
  }
  
  async save(cb) {
    //console.log(this.rows);
    process.stdout.write(`\t${this.r}\r`);
    
    let keys = Object.keys(this.rowCallback(this.rows[0])[0]);

    let query = `INSERT INTO ${this.table}(${keys.toString()}) VALUES `;
    query += this.rows.map(row => {
        let objs = this.rowCallback(row);
        if (!objs.length) return null;
        return objs.map(obj => `(${Object.values(obj).toString()})`).join(',');
    }).filter(r => r).join(',');

    //console.log(query);
    await db.any(query).catch(e => {
        // console.log(this.rows);
        // console.log(query);
        console.log(e);
    });
    
    this.rows = [];
    cb();
  }

  async run() {
    for (let f in this.files) {
        let file = this.files[f];
        console.log('\tfile: '+file);

        await this.parse(file);
    }
  }
}

async function step1() {
    await new Parser('2023-04-06_Sistema_E-Saude_Enfermagem_-_Base_de_Dados-2.csv', 'atendimentos', (row) => [{
        data_atendimento: Format.date(row[0]),
        data_nascimento_paciente: Format.date(row[1]),
        sexo_paciente: row[2] ? Format.string(row[2]): 'null',
        codigo_tipo_unidade: row[3] ? Format.int(row[3]): 'null',
        tipo_unidade: row[4] ? Format.string(row[4]): 'null',
        codigo_unidade: row[5] ? Format.string(row[5]): 'null',
        descricao_unidade: row[6] ? Format.string(row[6]): 'null',
        codigo_procedimento: row[7] ? Format.string(row[7]): 'null',
        descricao_procedimento: row[8] ? Format.string(row[8]): 'null',
        codigo_cbo: row[9] ? Format.string(row[9]): 'null',
        descricao_cbo: row[10] ? Format.string(row[10]): 'null',
        codigo_cid: row[11] ? Format.string(row[11]): 'null',
        descricao_cid: row[12] ? Format.string(row[12]): 'null',
        solicitacao_exames: row[13] ? Format.string(row[13]): 'null',
        qtde_prescrita_farmacia_curitibana: row[14] ? Format.int(row[14]): 'null',
        qtde_dispensada_farmacia_curitibana: row[15] ? Format.int(row[15]): 'null',
        qtde_medicamento_nao_padronizado: row[16] ? Format.int(row[16]): 'null',
        encaminhamento_para_atendimento_especialista: row[17] ? Format.string(row[17]): 'null',
        area_de_atuacao: row[18] ? Format.string(row[18]): 'null',
        desencadeou_internamento: row[19] ? Format.string(row[19]): 'null',
        data_internamento: row[20] ? Format.date(row[20]): 'null',
        estabelecimento_solicitante: row[21] ? Format.string(row[21]): 'null',
        estabelecimento_destino: row[22] ? Format.string(row[22]): 'null',
        cid_internamento: row[23] ? Format.string(row[23]): 'null',
        tratamento_domicilio: row[24] ? Format.string(row[24]): 'null',
        abastecimento_agua_domicilio: row[25] ? Format.string(row[25]): 'null',
        energia_eletrica: row[26] ? Format.string(row[26]): 'null',
        tipo_habitacao_domicilio: row[27] ? Format.string(row[27]): 'null',
        destino_lixo_domicilio: row[28] ? Format.string(row[28]): 'null',
        destino_fezes_urina_domicilio: row[29] ? Format.string(row[29]): 'null',
        qtde_comodos_domicilio: row[30] ? Format.int(row[30]): 'null',
        servicos_procurados_em_caso_de_doenca: row[31] ? Format.string(row[31]): 'null',
        grupo_comunitario_paciente: row[32] ? Format.string(row[32]): 'null',
        meios_de_comunicacao_utilizados_domicilio: row[33] ? Format.string(row[33]): 'null',
        meios_de_transporte_utilizados_domicilio: row[34] ? Format.string(row[34]): 'null',
        municipio_paciente: row[35] ? Format.string(row[35]): 'null',
        bairro_paciente: row[36] ? Format.string(row[36]): 'null',
        nacionalidade_paciente: row[37] ? Format.string(row[37]): 'null',
        cod_usuario: row[38] ? Format.int(row[38]): 'null',
        origem_usuario: row[39] ? Format.int(row[39]): 'null',
        residente: row[40] ? Format.int(row[40]): 'null',
        cod_profissional: row[41] ? Format.int(row[41]): 'null'
    }]).run();
}

step1()