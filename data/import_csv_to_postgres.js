const csv = require('csv-parse');
const fs = require('fs');
const pgp = require('pg-promise')();
const readline = require('readline');
const transform = require('stream-transform').transform

const CSV_DIR = './E_saude/'
const BATCH_SIZE = 100000

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

const capitalize = (str, lower = false) => (lower ? str.toLowerCase() : str).replace(/(?:^|\s|["'([{])+\S/g, match => match.toUpperCase());

/** Utils */

const Format = {
    string: (str) => `'${str.replace(/'/g,"''")}'`,
    date: (str, def='NULL') => {
        if (str) {
            const teste = `'${str.replace(/^(\d{2})\/(\d{2})\/(\d{4})\s(\d{2}):(\d{2}):(\d{2})$/, '$3-$2-$1')}'`
            return teste;
        } 
        else return def;
    },
    int: (str) => str == '' ? 0: str
}

class Parser {
    constructor(tag, table, rowCallback) {
        console.log(`[ ${table} ]`);
        this.table = table;
        this.rowCallback = rowCallback;
        let files = fs.readdirSync(CSV_DIR);
        this.files = files.filter(file => {
            if (!file.includes(tag)) return false;
            return true;
        })

        this.rows = [];
        this.r = 0;
    }

    // Parse a CSV file into database using stream pipes
    async parse(file) {
        console.log(`\tparsing...`);
        return new Promise((resolve) => {
            
            const stream = fs.createReadStream(CSV_DIR+'/'+file);
            const parser = csv.parse({delimiter:';'});
            const writer = transform((row, callback) => {
                if(row[0] != 'Data do Atendimento')
                    this.rows.push(row);
                this.r++;
                if (this.rows.length < BATCH_SIZE) callback();
                else this.save(callback);
            }, { parallel: 1 });
            
            stream.pipe(parser).pipe(writer)
            writer.on('finish', () => { 
                console.log(`\t${this.r}`);
                if (this.rows.length) this.save(resolve);
                else resolve();
            });
        })
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
        descricao_cid: row[12] ? Format.string(row[12]): 'null'
    }]).run();
}

step1();
